---
title: "High Availability dengan HAProxy dan Keepalived"
date: 2021-10-17T14:48:00+08:00
draft: false
toc: false
backtotop: true
tags:
- haproxy
- keepalived
- high availability
images:
- "https://imgur.com/asv7EF2.jpg"
---

Hallo semuanya, kali ini saya hendak sedikit menulis mengenaik bagaimana membuat sebuah web server yang high availability menggunakan [HAProxy](http://www.haproxy.org/) sebagai load balancer web servernya dan menggunakan keepalived sebagai fail over apabila salah satu HAProxy yang kita miliki mengalami kegagalan. Di sini kita akan menggunakan 2 buah server yang berguna sebagai load balancernya dan sebuah server yang akan berperan sebagai web servernya. Seharusnya sih untuk web servernya sendiri dibuat lebih dari satu ya agar mendapatkan high availability, tapi karena ini cuma coba-coba dan biar hemat resource dibuat satu saja.

## Spesifikasi dan Topologi

Berikut adalah topologi dan spesifikasi server yang digunakan

![](https://imgur.com/8aQMagn.jpg)

Pada topologi tersebut, masing-masing load balancer memiliki 2 buah interface yaitu enp0s8 dan 9 yang digunakan untuk terhubung dengan server web-nya dan digunakan untuk terhubung ke pengguna. Pada web server hanya butuh 1 interface saja yaitu yang digunakan untuk terhubung ke load balancer. Nantinya keepalived akan membuat sebuah IP address virtual yang digunakan untuk terhubung yang di sebuah Virtual IP. Masing-masing server memiliki spesifikasi yang sama yaitu **2048 MB memory**, **1 vCPU**, dan menggunakan **Sistem Operasi Ubuntu 20.04**. Jika teman-teman tertarik menggunakan lab yang sama bisa menggunakan vagrantfile berikut [haproxy-with-keepalived](https://github.com/kudaliar032/vagrantfile-labs/tree/main/haproxy-with-keepalived).

## Menyiapkan Web Server

Pertama-tama kita persiapkan dulu untuk web servernya, disini kita hanya butuh install web server (nginx) kemudian sudah, atau kalau mau ubah-ubah default pagenya juga boleh. Untuk memasang nginx pada ubuntu gunakan perintah berikut

```bash
sudo apt update
sudo apt install -y nginx
sudo systemctl enable --now nginx
```

Setelah itu coba akses buat memastikan saja bahwa nginx sudah terpasang dengan benar

```bash
curl localhost
```

## Setup HAProxy untuk Load Balancer

Selanjutnya mari kita mensetup HAProxy-nya dulu untuk mengirimkan traffic ke web server, pertama mari install dulu haproxynya

```bash
sudo apt update
sudo apt install -y haproxy
```

Setelah terpasang selanjutnya kita perlu mengaktifkan port forwarding dan juga menambahkan konfigurasi agar haproxy dapat listen melalui IP Address virtual yang nantinya di buat oleh keepalived. Gunakan perintah-perintah berikut

```bash
sudo sed -i 's/#net.ipv4.ip_forward=1/net.ipv4.ip_forward=1/' /etc/sysctl.conf
echo "net.ipv4.ip_nonlocal_bind=1" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

Setelah semuanya baik-baik saja, mari melanjutkan untuk menambahkan konfigurasi untuk HAProxynya

```bash
sudo vim /etc/haproxy/haproxy.cfg
```

dan tambahkan kofigurasi berikut

```
...
frontend webserverlb
  bind 172.16.0.200:80
  default_backend webserverapp
  option forwardfor

backend webserverapp
  balance roundrobin
  server webserver1 192.168.10.200:80 check
```

Lakukan pada kedua server load balancer

## Setup Keepalived pada Load Balancer Server

Selanjutnya, untuk mengaktifkan fail over pada server load balancer kita, kita perlu menginstall keepalived dan melakukan sedikit konfigurasi. Untuk memasang keepalived gunakan perintah berikut

```bash
sudo apt install -y keepalived
```

### Konfigurasi Server LB1 (Master)

Kita akan setup keepalived pada server 1 terlebih dahulu, yang mana server ini akan kita gunakan sebagai master, nah untuk untuk kita perlu menambahkan konfigurasi berikut pada `/etc/keepalived/keepalived.conf`

```
# Define the script used to check if haproxy is still working
vrrp_script chk_haproxy {
    script "/usr/bin/killall -0 haproxy"
    interval 2
    weight 2
}

# Configuration for Virtual Interface
vrrp_instance LB_VIP {
    interface enp0s9
    state MASTER        # set to BACKUP on the peer machine
    priority 101        # set to  99 on the peer machine
    virtual_router_id 51

    authentication {
        auth_type AH
        auth_pass myP@ssword	# Password for accessing vrrpd. Same on all devices
    }
    unicast_src_ip 192.168.10.101 # Private IP address of master
    unicast_peer {
        192.168.10.102		# Private IP address of the backup haproxy
   }

    # The virtual ip address shared between the two loadbalancers
    virtual_ipaddress {
        172.16.0.200
    }

    # Use the Defined Script to Check whether to initiate a fail over
    track_script {
        chk_haproxy
    }
}
```

Simpan konfigurasi tersebut, kemudian aktifkan keepalived dan haproxnya

```bash
sudo systemctl enable --now keepalived haproxy
sudo systemctl status keepalived haproxy
```

Selanjutnya cek IP address untuk memastikan IP virtual dari keepalived sudah terpasang

```bash
ip --brief addr
```

![](https://imgur.com/mlZOEyQ.jpg)

Ok, terlihat benar. Mari kita lanjutkan

### Konfigurasi Server LB2 (Slave)

Lanjut ke server LB2, sebenarnya sama saja seperti server LB1 hanya sedikit perubahan pada konfigurasinya, gunakan konfigurasi berikut

```
# Define the script used to check if haproxy is still working
vrrp_script chk_haproxy {
    script "/usr/bin/killall -0 haproxy"
    interval 2
    weight 2
}

# Configuration for Virtual Interface
vrrp_instance LB_VIP {
    interface enp0s9
    state BACKUP
    priority 100
    virtual_router_id 51

    authentication {
        auth_type AH
        auth_pass myP@ssword	# Password for accessing vrrpd. Same on all devices
    }
    unicast_src_ip 192.168.10.102 # Private IP address of backup
    unicast_peer {
        192.168.10.101		# Private IP address of the master haproxy
   }

    # The virtual ip address shared between the two loadbalancers
    virtual_ipaddress {
        172.16.0.200
    }

    # Use the Defined Script to Check whether to initiate a fail over
    track_script {
        chk_haproxy
    }
}
```

Setelah itu sama juga seperti sebelumnya, tinggal restart dan cek IP addressnya

```bash
sudo systemctl enable --now keepalived haproxy
sudo systemctl status keepalived haproxy
ip --brief addr
```

Di sini seharusnya enggak ada IP Virtualnya karena memang masih di MASTER.

## Uji Hasil Konfigurasi

Setelah semuanya selesai, mari mencoba konfigurasi yang telah kita lakukan sebelumnya. Untuk mencobanya pertama-tama coba akses saja Virtual IP dari Keepalived dan pastikan muncul halamannya

![](https://imgur.com/g6zFvfn.jpg)

Sekarang mari kita coba untuk mematikan server LB1 untuk memastikan bahwa terjadi fail over ke server backup, jika kita lihat log keepalived pada server LB2 maka disitu tertulis bahwa server LB2 telah menjadi master

![](https://imgur.com/pp1GfHv.jpg)

dan apabila webnya diakses seharusnya tidak terjadi apa-apa

![](https://imgur.com/BQmWmTs.jpg)

Jika web masih tetap bisa diakses walaupun server LB1 mati itu menandakan fail over bekerja dengan baik. Itu juga menandakan semuanya sudah berjalan dengan baik dan siap digunakan. Maka kita akhiri catatan kali ini, semoga bermanfaat untuk kita semua. Terima kasih :pray: :pray: :pray:
