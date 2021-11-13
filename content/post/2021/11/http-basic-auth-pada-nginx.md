---
title: "HTTP Basic Auth pada NGINX"
date: 2021-11-13T19:39:46+08:00
draft: false
toc: false
backtotop: true
tags:
- ""
images:
- "https://imgur.com/cUXjwgO.jpg"
---

Hallo semuanya, salah satu cara untuk mengamankan situs kita dari akses oleh orang-orang yang tidak memiliki hak adalah dengan menambahkan login, umumnya sih login dengan user dan password. Nah, untuk mengimplementasikan authentikasi pada aplikasi web sendiri ada banyak cara. Di sini saya hendak share bagaimana caranya untuk menambahkan authentikasi pada aplikasi pada sisi web servernya yaitu nginx, kita akan coba dengan metode authentikasi yang paling sederhana saja yaitu basic authentication. Langsung saja bagaimana caranya?

## Topology and Spesification

Untuk topologi enggak aneh-aneh cuma ada 1 vm, kemudian untuk spesifikasinya seperti berikut

- 1 vCPU
- 2048 MB Memory
- Sistem Operasi Rocky Linux 8.4

## Prepare Web Server

Mari pertama-tama kita menginstall web servernya dulu yaitu nginx, selain memasang nginx kita juga perlu memasang apache tools yang akan digunakan untuk mengenerate password

```bash
sudo dnf install -y nginx httpd-tools
```

Jangan lupa untuk menjalankan nginxnya

```bash
sudo systemctl enable --now nginx
```

## Creating Password File

Untuk mengenerate password file kita menggunakan perintah `htpasswd`, jika sebelumnya belum memiliki file ini maka kita perlu menambahkan parameter `-c`. Untuk tempatnya sendiri bebas ya, yang penting bisa diakses oleh nginxnya nanti

```bash
sudo htpasswd -c /etc/nginx/.htpasswd [user]
```

![](https://imgur.com/3Kmnu1s.jpg)

Sudah gitu doang, kalau mau cek isinya pake aja `cat`

## Configuring NGINX

Selanjutnya, ini dari semua ini adalah menambahkan konfigurasi pada nginx-nya. Untuk konfigurasinya sendiri kita bisa memasangnya di level location, virtualhost, atau mungkin global seperti konfigurasi nginx umumnya, sesuai kebutuhan aja. Di sini saya mencoba untuk menambahkan di level virtualhost yang default aja ya. Pertama-tama buka konfigurasinya sesuai kebutuhan, karena masih default dia ada di `/etc/nginx/nginx.conf`. Kemudian cari baris konfigurasi yang dibutuhkan

```bash
sudo vim /etc/nginx/nginx.conf
```

Setelah itu coba kita cari konfigurasi virtualhost defaultnya yang begini

![](https://imgur.com/nblIJYN.jpg)

Kemudian tambahkan baris konfigurasi ini

```nginx
auth_basic "Hey, anda harus login!";
auth_basic_user_file "/etc/nginx/.htpasswd";
```

Kalau di file konfigurasi kira-kira nanti jadi begini

![](https://imgur.com/nfkvWWr.jpg)

Jangan lupa close, simpan, test, dan restart

```bash
sudo nginx -t
sudo systemctl restart nginx
```

![](https://imgur.com/J7aFHqp.jpg)

## Test

Sampai sudah di ujung, mari kita test konfigurasi yang telah kita lakukan sebelumnya, cara mencobanya sederhana aja ya, tinggal akses alamat IP dari servernya dan :tada: :tada: :tada:

![](https://imgur.com/fjaRVXJ.jpg)

Silahkan masukan kredensial yang sudah dibuat sebelumnya

![](https://imgur.com/ooErUcG.jpg)

Tampilah halaman yang diinginkan, gimana? Mudah sekali bukan untuk mengimplementasikan basic authentication di nginx, namun perlu diingat karena ini basic ya keamanannya tidak terlalu kuat, selain itu untuk memanage usernya pun sangat sulit, karena semua ada di sebuah file. Tentunya kita butuh sesuatu yang lebih power full untuk kasus-kasus yang kompleks. Mungkin itu saja untuk kali ini, semoga bermanfaat untuk kita semua, sampai berjumpa lagi. Terima kasih :pray: :pray: :pray:
