---
title: Cara Menambahkan Device di GNS3 dari VMware
date: 2017-08-21
draft: false
toc: false
backtotop: true
tags:
- gns3
- jaringan
- vmware
images:
- https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/headers/5_kbd62z.webp
---

Assalamualaikum, selamat malam semuanya. Alhamdulillah saya bisa mendapatkan peringkat 2 di IDN Competition 2017 yang diadain online gak menduga banget coyy hahaha. Terimakasih sebelumnya untuk team saya untuk semuanya yang udah support. Dan kali ini saya ingin membuat tutorial bagaimana cara menambahkan Device di GNS3 dari VMware ya. Karena saya liat-liat banyak temen2 yang masih bingung gimana cara nambahkannya, makanya saya mau share ini. Hal-hal yang harus dipersiapkan sebelumnya antara lain sebagai berikut:

## Prasyarat

- VMware, saya pakai VMware Workstation 12.
- GNS3, saya pakai versi 2.0.3
- OS yang sudah di instal pada VMware, disini saya mencontohkan menggunakan Debian 7.8

Udah 3 hal itu aja sih ya, langsung aja ke langkah-langkanya:

## Langkah-langkah

Buka GNS3 nya, akan tampil seperti dibawah ini

![](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/posts/2017-08-21-menambahkan-device-di-gns3-dari-vmware/vlcsnap-2017-08-21-20h57m11s003_qabk0o.webp)

Kemudian ke menu `Edit` > `Preferences`

![](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/posts/2017-08-21-menambahkan-device-di-gns3-dari-vmware/vlcsnap-2017-08-21-20h57m36s642_jzymlg.webp)

Pilih pada VMware kemudian klik menu `Advanced local settings`

![](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/posts/2017-08-21-menambahkan-device-di-gns3-dari-vmware/vlcsnap-2017-08-21-20h57m46s507_romepw.webp)

Beri centang pada `Block ...` dan atur interface untuk GNS3nya mau dari vmnet berapa sampai berapa, kemudian klik `Configure`

![](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/posts/2017-08-21-menambahkan-device-di-gns3-dari-vmware/vlcsnap-2017-08-21-20h57m50s473_eumpbz.webp)

Tunggu beberapa saat hingga keluar seperti berikut, dan jendelanya akan hilang sendiri

![](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/posts/2017-08-21-menambahkan-device-di-gns3-dari-vmware/vlcsnap-2017-08-21-20h58m26s647_hqtn7x.webp)

Pindah ke tab VMware VMs dan kilk New

![](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/posts/2017-08-21-menambahkan-device-di-gns3-dari-vmware/vlcsnap-2017-08-21-20h58m48s853_vwj910.webp)

Pilih VM list sesuai dengan vmware yang ingin ditambahkan dan beri centang pada `Use as a ...` dan Finish

![](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/posts/2017-08-21-menambahkan-device-di-gns3-dari-vmware/vlcsnap-2017-08-21-20h58m51s454_ijfq4d.webp)

Kemudian klik edit, dan ke tab `Network`, beri conteng pada `Allow GNS3 ...`

![](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/posts/2017-08-21-menambahkan-device-di-gns3-dari-vmware/vlcsnap-2017-08-21-20h59m19s617_mznz8n.webp)

kembali ke tab `General Setting` dan ubah Template Name, Default name format, dll sesuai keinginan. ok maka vm ware udah ditambahkan

![](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/posts/2017-08-21-menambahkan-device-di-gns3-dari-vmware/vlcsnap-2017-08-21-20h59m26s115_ecknkw.webp)

Coba tambahkan devicenya dengan klik icon end devices dan akan muncul daftar devices yang tersedia, jika ada berarti sudah berhasil dan siap digunakan

![](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/posts/2017-08-21-menambahkan-device-di-gns3-dari-vmware/vlcsnap-2017-08-21-20h59m59s970_xanlca.webp)

Coba buat topologi sederhana misalkan menghubungkan dua pc, dan klik Play yang warna ijo

![](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/posts/2017-08-21-menambahkan-device-di-gns3-dari-vmware/vlcsnap-2017-08-21-21h00m14s567_vv8yof.webp)

maka akan tampil VMwarenya sudah menjalankan device yang ditambahkan. Selesai

![](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/posts/2017-08-21-menambahkan-device-di-gns3-dari-vmware/vlcsnap-2017-08-21-21h00m23s395_nioizc.webp)

Begitu saja ya guys untuk tutorial kali ini, jika bingung dengan penjelasan text saya sudah sertakan dalam bentuk video dibawah ini. Jangan lupa untuk supscribe, like, share, dan comment channel youtube saya biar saya makin semangat untuk share, hahaha. Terimakasih semuanya. semoga bermanfaat bagi kita semua. Selamat malam. :pray:

## Video

{{< youtube PZB8jTCc7dY >}}
