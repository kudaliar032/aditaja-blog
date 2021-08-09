---
title: "Menjalankan Beberapa Versi PHP pada OpenLiteSpeed"
date: 2021-08-07T22:29:19+08:00
draft: false
toc: false
backtotop: true
tags:
- "openlitespeed"
- "web server"
- "php"
- "linux"
- "server"
images:
- "https://imgur.com/wa6REYW.jpg"
---

Hallo semuanya, kembali lagi bersama saya, kali ini saya akan menulis sesuatu yang ringan saja, ya walaupun semua tulisan di blog saja ringan-ringan semua ya wkwkwk :laughing: :laughing: :laughing:. Jadi ceritanya ya seperti biasa juga baru-baru ini saya nyobain untuk setup web server dengan [OpenLiteSpeed](https://openlitespeed.org/) yang mana mereka mengclaim lebih cepat dari Nginx dan Apache untuk menangani WordPress + Cache tapi saya tidak akan membahas itu ya saya cuma ingin menulis sesuatu yang sudah saya coba saja agar tidak lupa.

![](https://imgur.com/wrCnJuY.jpg)

Disini saya mencoba untuk setup web server pada OpenLiteSpeed agar dapat menjalankan 2 versi PHP sekaligus yang berbeda, misalkan versi `7.4` dan versi `8.0`. Nah, menariknya di OpenLiteSpeed ini kita akan dimudahkan dengan adanya Web UI untuk mensetting-setting servernya. Baik langsung saja tanpa banyak bacot. Eh, sebelumnya mari berkenalan dengan lingkungan lab yang akan saya gunakan

## Lingkungan Lab

- **Sistem Operasi**: Ubuntu 20.04
- **Memory**: 8GB
- **vCPU**: 4

## Langkah-langkah

- Pertama-tama silahkan install OpenLiteSpeed, disini tidak akan membahas itu, silahkan buka sendiri pada dokumentasinya pada tautan berikut [Complete Step by Step Install OpenLiteSpeed](https://openlitespeed.org/kb/step-by-step-install-ols/)

![](https://imgur.com/fdwyazp.jpg)

### Menambahkan PHP pada Server

- Login kedalam admin panel dari OpenLiteSpeed

![](https://imgur.com/ARZCfQh.jpg)

- Install dulu versi-versi PHP yang diinginkan di sini kita akan memasang versi `7.4` dan versi `8.0`
- Gunakan perintah berikut untuk menginstall 2 versi PHP tersebut, perintah-perintah berikut dijalankan menggunakan hak akses `root`

```bash
apt install lsphp74 lsphp74-common lsphp80 lsphp80-common
```

- Cek apakah sudah terinstall dengan perintah berikut, dan pastikan terdapat directory untuk versi-versi PHP yang diinginkan

```bash
ls /usr/local/lsws/
```

- Masuk kedalam menu `Server Configuration` > `External App` untuk menambahkan versi PHP-nya
- Klik tombol `+` untuk menambahkan `External App`

![](https://imgur.com/Gx56tFE.jpg)

- Pada bagian `Type` pilih yang `LiteSpeed SAPI App`

![](https://imgur.com/Cfaioaw.jpg)

- Isi `Name` sesuai selera, masukan saja sesuai dengan versi PHP-nya, untuk `Address` masukan path yang akan digunakan untuk versi PHP yang akan dipakai misalkan `uds://tmp/lshttpd/lsphp74.sock`, pada bagian `Max Connections` dengan jumlah maksimal connection yang diinginkan misalkan `50`, pada bagian `Initial Request Timeout (secs)` dengan `60`, isikan `Retry Timeout (secs)` dengan `0`, dan masukan command dengan command dari versi PHP yang diinginkan `/usr/local/lsws/lsphp74/bin/lsphp`

![](https://imgur.com/odLTm9y.jpg)

- Tambahkan juga untuk versi lainnya yaitu `8.0`, caranya sama seperti sebelumnya namun tinggal sesuaikan saja yang pada bagian `lsphp74` menjadi `lsphp80`

![](https://imgur.com/AOLeJaG.jpg)

- Setelah selesai ditambahkan silahkan restart OpenLiteSpeed

### Buat Virtual Hosts Untuk Menghandle Masing-masing Versi PHP

- Buat dulu file `php` untuk menampilkan info dari php yang menghandle
- Login ke server seperti biasa, dan buat folder dulu untuk menempatkan script `php`-nya dan masuk kedalamnya

```bash
mkdir -p /var/www/phpcheck
cd /var/www/phpcheck
```

- Buat filenya kasih nama bebas, misalkan `info.php`

```php
<?php
  phpinfo();
```

- Kemudian masuk ke dalam menu `Virtual Hosts`
- Tekan `+` untuk menambah virtual host baru
- Isi `Virtual Host Name` sesuai dengan selera misalkan `vh-lsphp74`, masukan `Virtual Host Root` dengan directory yang dibuat sebelumnya `/var/www/phpcheck/`, untuk `Config File` masukan seperti berikut `conf/vhosts/lsphp74/vhconf.conf`, untuk `Enable Scripts/ExtApps` pilih `Yes`, dan `Restrained` pilih `Yes`

![](https://imgur.com/Iu4AuME.jpg)

- Setelah tersimpan, masuk lagi kedalam virtual host yang dibuat untuk mengubah `Document Root` pada general dan menambahkan `Sciript Handler`-nya

![](https://imgur.com/20B8nER.jpg)

- Pindah ke `Script Handler` dan tekan tombol `+` untuk menambahkan yang baru, isikan `Suffixes` dengan `php`, `Handler Type` isikan dengan `LiteSpeed SAPI`, dan `Handler Name` pilih sesuai versi PHP yang harus dipilih

![](https://imgur.com/e4TZEc0.jpg)

- Lakukan juga untuk versi yang lainnya dengan cara yang sama, namun pastikan untuk versi yang digunakan sesuai dengan yang diinginkan

![](https://imgur.com/Ror22pH.jpg)

- Setelah selesai, silahkan restart OpenLiteSpeed anda

### Menambahkan Listener

- Tambahkan update listener untuk masin-masing virtual host, misalkan kita akan mengarahkan domain `lsphp74.kotakpasir.my.id` ke `PHP 7.4`, dan `lsphp80.kotakpasir.my.id` ke `PHP 8.0`
- Di sini hanya menambahkan pada listener yang sudah ada yaitu `Default`, masuk kedalam `Listeners` > `Default`, klik `+` untuk menambahkan Virtual Host baru

![](https://imgur.com/qYS6SDt.jpg)

- Setelah itu, pilih bagian `Virtual Host` dengan virtual host yang ingin digunakan, dan pada bagian `Domains` silahkan masukan dengan domain yang diinginkan misalnya `lsphp74.kotakpasir.my.id`

![](https://imgur.com/NiRtNOk.jpg)

- Lakukan juga untuk domain dan virtual host lainnya, kemudian tinggal restart OpenLiteSpeed

## Uji Hasil Konfigurasi

Setelah selesai di restart, tinggal uji hasil konfigurasi dengan mengakses domain masing-masing PHP versi dan pastikan versi PHP yang digunakan sesuai dengan yang diinginkan

### lsphp74.kotakpasir.my.id:8088/info.php

![](https://imgur.com/m3iwSA2.jpg)

### lsphp80.kotakpasir.my.id:8088/info.php

![](https://imgur.com/vdHn82p.jpg)

Tadaa :tada: :tada: :tada: dari hasil percobaan kita sudah berhasil menjalankan 2 versi PHP sekaligus pada OpenLiteSpeed, tinggal gunakan sesuai dengan kebutuhan, misalnya untuk menjalankan aplikasi PHP dengan framework Laravel, CodeIgniter, dsb. Mungkin cukup sampai di sini saja tulisan kali ini semoga dapat bermanfaat bagia kita semua, Terima kasih :pray:
