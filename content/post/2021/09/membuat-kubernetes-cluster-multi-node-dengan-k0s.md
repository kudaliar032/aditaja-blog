---
title: "Membuat Kubernetes Cluster Multi Node Dengan k0s"
date: 2021-09-17T13:47:00+08:00
draft: false
toc: false
backtotop: true
tags:
- kubernetes
- container
images:
- "https://via.placeholder.com/500x250.webp?text=please+change+this+header"
---

Hallo semuanya, semoga kita semua sehat selalu. Kali ini saya mau menulis mengenai sebuah Kubernetes Distribution yang terbilang baru ya initial releasenya sendiri November 2020 belum setahun berarti, namanya adalah [k0s](https://k0sproject.io/). k0s menawarkan deployment kubernetes yang sudah kumplit untuk menjalankan sebuah kubernetes cluster sudah termasuk container runtimenya, networknya juga sudah ada jadi mudah lah. Berikut fitur-fitur utama yang ditawarkan oleh k0s.

## Fitur Utama

- Butuh sebuah single binary saja untuk dijalankan
- Control plane yang terisolasi
- Support storage backend yang beragam, bisa etcd, SQLite, MySQL, dan PostgreSQL
- Kubernetes langsung dari hulu
- Bisa custom container runtime, defaultnya containerd
- Bisa custom container network, defaultnya kube-router
- Support x86-64 dan ARM64 dan ARMv7

Cukup dong untuk mendeploy kubernetes? Pada tulisan kali ini saya cuma membuat sebuah kubernetes cluster dengan spesifikasi 1 master dan 2 worker. Enggak pakai HA dulu, nah langsung saja

## Spesifikasi Lab

- 2 vCPU
- 2048 MB memory
- Ubuntu 20.04 LTS

Untuk gambaran topologinya kira-kira seperti ini

![](https://imgur.com/bqHzraP.jpg)

Kalau teman-teman mau coba bisa pakai vagrantfile berikut [k0s-multi-nodes](https://github.com/kudaliar032/vagrantfile-labs/tree/main/k0s-multi-nodes).

## Lab Deployment

### Hard Way

Disini kita coba pakai cara manual dulu, jadi nanti kita deploy di servernya satu-satu baru setelah itu kita coba pakai cara cepatnya, muehehe

#### Master

Pertama-tama kita remote dulu server masternya

```bash
vagrant ssh master
## atau
ssh vagrant@172.16.0.100
```

![](https://imgur.com/3kaSA1o.jpg)

Selanjutnya kita instal k0s di masternya

```bash
curl -sSLf https://get.k0s.sh | sudo sh
## jika hendak menginstal spesifik versi
curl -sSLf https://get.k0s.sh | sudo K0S_VERSION=v1.22.1+k0s.0 sh
```

![](https://imgur.com/vlJ3J3J.jpg)

Setelah instalasi selesai, kita perlu generate konfigurasinya dulu, kemudian melakukan beberapa perubahan. Gunakan perintah berikut

```bash
k0s default-config > k0s.yaml
```

Setelah itu buka dengan editor tercinta, dan lakukan perubahan pada bagian `spec.api.address`, `spec.api.sans`, dan `spec.storage.etcd.peerAddress`. Ubah value menjadi IP private kita yang digunakan untuk masing-masing node berkomunikasi, pada VM saya ipnya adalah `172.16.0.100`. Nantinya kira-kira akan menjadi seperti berikut

![](https://imgur.com/X6m3wLm.jpg)

Menjadi

![](https://imgur.com/mA0b7ie.jpg)

Setelah itu simpan, lakukan inisialisasi masternya, dan jalankan

```bash
sudo k0s install controller -c k0s.yaml
sudo k0s start
sudo k0s status
```

Nantinya kira-kira akan keluar seperti ini

![](https://imgur.com/TxqODJY.jpg)

#### Worker

Setelah master siap, selanjutnya kita berpindah ke worker, pada worker kita melakukan task yang lebih sederhana kita hanya perlu join dengan master yang telah kita buat sebelumnya.

Login ke server worker seperti sebelumnya, kemudian instal k0s bisa menggunakan metode yang sama saat di master. Setelah terinstal kita pindah ke master bentar untuk mendapatkan token yang digunakan join ke cluster, gunakan perintah

```bash
sudo k0s token create -c k0s.yaml --role=worker
```

Copy token yang ditampilkan, nantinya akan kita bawa ke worker

Kembali ke worker, dan simpan token tadi kedalam file, misalkan dengan nama `token`

```bash
echo 'tokenxxxtoken' > token
```

Setelah itu lakukan inisialisasi worker dan jalankan worker

```bash
sudo k0s install worker --token-file=token
sudo k0s start
sudo k0s status
```

![](https://imgur.com/lXfgIP2.jpg)

Setelah berhasil, coba tunggu beberapa saat karena worker akan mendownload dan membuat beberapa pod. Untuk memastikan apakah worker sudah ready atau belum dapat dilakukan dengan menjalankan perintah `kubectl get nodes`. Di sini kita dapat melakukannya di master karena sudah ada `kubectl` yang dapat kita gunakan. Jadi buka kembali server master dan jalankan

```bash
sudo k0s kubectl get nodes
```

![](https://imgur.com/0bBKhJp.jpg)

Disitu kita bisa melihat sudah ada 1 worker yang ready, kita masih punya 1 worker untuk dijoinkan maka silahkan lakukan hal yang sama seperti yang dilakukan pada worker1. Nantinya kita akan memiliki 2 buah worker seperti berikut

![](https://imgur.com/zNgYtdO.jpg)

Setelah semua berstatus ready maka cluster siap digunakan, coba saja jalankan sebuah deployment

```bash
sudo k0s kubectl create deployment web --image=nginx:alpine --replicas=6
sudo k0s kubectl get pods -o wide
```

![](https://imgur.com/pNyfR9A.jpg)

### Quick Way

Nah, setelah kita mendeploy dengan cara yang "ribet" kita akan mencoba menggunakan cara yang lebih mudah, yaitu dengan bantuan tools `k0sctl`

Pertama-tama kita harus menginstall `k0sctl` di komputer kita dulu, nantinya tools ini akan meremote server dan melakukan instalasi sesuai dengan konfigurasi yang kita masukan

Untuk menginstalnya tinggal download binary filenya kemudian tempatkan di `/usr/local/bin` misalnya. Untuk downloadnya bisa melalui link berikut [k0s releases](https://github.com/k0sproject/k0sctl/releases)

Setelah ikut kita generate dulu konfigurasinya yang kemudian akan kita modifikasi-modifikasi sedikit

```bash
k0sctl init > k0sctl.yaml
```

Setelah itu buka dengan editor tercinta, kira-kira nantinya akan berisi seperti berikut

```yaml
apiVersion: k0sctl.k0sproject.io/v1beta1
kind: Cluster
metadata:
  name: k0s-cluster
spec:
  hosts:
  - ssh:
      address: 10.0.0.1
      user: root
      port: 22
      keyPath: /Users/kudaliar/.ssh/id_rsa
    role: controller
  - ssh:
      address: 10.0.0.2
      user: root
      port: 22
      keyPath: /Users/kudaliar/.ssh/id_rsa
    role: worker
  k0s:
    version: 1.22.2+k0s.0
```

Itu semua masih default, jadi kita perlu kita ubah sedikit-sedikit seperti pada bagian `spec.hosts.[].ssh.address` menjadi IP address dari server yang kita miliki, selain itu tambahkan juga `spec.hosts.[].privateInterface`yang berisikan interface komunikasi secara private pada server. Perlu digaris bawahi disini saya menambahkan interface private karena pada VM yang dibuat memiliki lebih dari 1 interface, jia server yang digunakan hanya memiliki 1 interface tidak perlu menambahkan konfigurasi tersebut

Nantinya kira-kira konfigurasi yang kita punya akan menjadi seperti berikut


```yaml
apiVersion: k0sctl.k0sproject.io/v1beta1
kind: Cluster
metadata:
  name: k0s-cluster
spec:
  hosts:
  - ssh:
      address: 172.16.0.100
      user: vagrant
      port: 22
      keyPath: /Users/kudaliar/.ssh/id_rsa
    role: controller
    privateInterface: enp0s8
  - ssh:
      address: 172.16.0.101
      user: vagrant
      port: 22
      keyPath: /Users/kudaliar/.ssh/id_rsa
    role: worker
    privateInterface: enp0s8
  - ssh:
      address: 172.16.0.102
      user: vagrant
      port: 22
      keyPath: /Users/kudaliar/.ssh/id_rsa
    role: worker
    privateInterface: enp0s8
  k0s:
    version: 1.22.2+k0s.0
```

Setelah semuanya ok, kita hanya perlu menjalankan deployment menggunakan perintah

```bash
k0sctl apply -c k0s.yaml
```

Tunggu beberapa saat, hingga deployment selesai dengan sempurna

![](https://imgur.com/ukLtfwA.jpg)

Kalau semuanya sudah selesai, nantinya kira-kira akan muncul seperti berikut

![](https://imgur.com/a7ofIFc.jpg)

Sampai sini deployment sudah selesai, seharusnya kita sudah bisa terhubung dengan cluster yang kita buat. Untuk mendapatkan konfigurasinya kita bisa menggunakan perintah

```bash
k0sctl kubeconfig > k0s-config.yaml
```

Untuk load konfigurasi tersebut bisa kita masukan ke variable `ENV` dulu saja

```bash
export KUBECONFIG=$(pwd)/k0s-config.yaml
```

Nantinya kira-kira seperti ini

![](https://imgur.com/QfqlrFj.jpg)

Selesai sudah, silahkan digunakan sesuai dengan kebutuhan. Semoga bermanfaat, babay...
