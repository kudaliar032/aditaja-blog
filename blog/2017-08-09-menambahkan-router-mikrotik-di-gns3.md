---
title: Menambahkan Router Mikrotik di GNS3
tags:
- mikrotik
- gns3
- networking
---

<img src="https://res.cloudinary.com/kudaliar032/image/upload/v1608092839/aditaja-blog/2017-08-09-menambahkan-router-mikrotik-di-gns3/3_emjbzf.jpg" width="100%" style={{marginBottom: "25px"}}/>

Selamat malam menjelang pagi semuanya. Setelah sekian lama vakum dari dunia networking saya ingin kembali mengenang masa-masa itu dan ingin membagikan sedikit ilmu kepada pembaca blog ini sekalian. Kita mulai dari ilmu yang ringan-ringan dulu ya bree, soalnya udah pada lupa _#ketawa_. Oke yang akan saya bagikan kali ini adalah bagimana cara menambahkan RouterOS di GNS3.

<!-- truncate -->

## Alat dan Bahan

Hal-hal yang perlu dipersiapkan antara lain:

1. Software GNS3 yang sudah terinstall di PC/Laptop, kalo belum punya silahkan [download](https://www.gns3.com/software/download) dan install seperti software pada umumnya.
2. Software [Qemu emulator](https://www.qemu.org/download/), ini sudah include dengan GNS3 biasanya.
3. File [CHR (Cloud Hosted Router)](https://mikrotik.com/download), ini sejenis file instalasi dari RouterOS tapi tinggal eksekusi aja bisa digunain diberbagai macam emulator.

Oke, saya rasa cuman 3 hal diatas yang perlu di persiapkan bree. Pertama-tama marilah baca do’a terlebih dahulu agar ilmu yang dipelajari bermanfaat bagi kita semua. Berdo’a mulai... selesai. Langsung, berikut langkah kerjanya:

## Langkah Kerja

Buka software GNS3nya, maka akan tampil seperti berikut ini. Perlu diketahui saya pakai versi 2.0.3.

![](https://res.cloudinary.com/kudaliar032/image/upload/v1608092973/aditaja-blog/2017-08-09-menambahkan-router-mikrotik-di-gns3/langkah1_vbwzkc.png)

Pilih ok aja deh dulu, kemudian pilih `Edit` > `Prefences` maka akan tampil jendela apalah itu namanya, pilih yang Qemu VMs dan akan tampil seperti berikut

![](https://res.cloudinary.com/kudaliar032/image/upload/v1608092972/aditaja-blog/2017-08-09-menambahkan-router-mikrotik-di-gns3/langkah2_llxzfz.png)

Klik `New`, jika ada pesan peringatan ok aja. Kemudian masukan nama untuk perangkatnya nanti, sesuka hati aja. Dan `Next`

![](https://res.cloudinary.com/kudaliar032/image/upload/v1608092972/aditaja-blog/2017-08-09-menambahkan-router-mikrotik-di-gns3/langkah3_uloldn.png)

Ubah RAM sesuka hati disini saja pakai 64MB aja dan `Qemu Binary` seperti punya berikut ini, Next

![](https://res.cloudinary.com/kudaliar032/image/upload/v1608092972/aditaja-blog/2017-08-09-menambahkan-router-mikrotik-di-gns3/langkah4_e6nfli.png)

Biarkan saja tetap telnet dan klik `Next` lagi. Nah pada bagian ini pilih `New Image` kemudian `Browse…` dan cari file CHR dari RouterOS yang sudah didownload sebelumnya. Pilih open maka akan tampil peringatan yang mengatakan `apakah anda ingin mengcopy file CHRnya ke default image derektori?` pilih oke aja, dan tunggu beberapa saat. Jika sudah selesai tekan `Finish`, tara mikrotiknya sudah berhasil ditambahkan. tinggal atur inteface dan lain sebagainya

![](https://res.cloudinary.com/kudaliar032/image/upload/v1608092972/aditaja-blog/2017-08-09-menambahkan-router-mikrotik-di-gns3/langkah5_cacc9c.png)

![](https://res.cloudinary.com/kudaliar032/image/upload/v1608092972/aditaja-blog/2017-08-09-menambahkan-router-mikrotik-di-gns3/langkah5.1_snyywm.png)

Pilih yang ditambahkan tadi, kemudian klik `Edit` maka akan tampil seperti ini

![](https://res.cloudinary.com/kudaliar032/image/upload/v1608092973/aditaja-blog/2017-08-09-menambahkan-router-mikrotik-di-gns3/langkah6_rouv1k.png)

Penjelasan untuk masing-masingnya gini. Template name, itu untuk menentukan nama perangkatnya. Default name format, itu menentukan nama perangkat yang akan tampil saat ditambahkan di lembar kerja. Symbol, itu nanti icon yang tampil di lembar kerja bagian itu bisa kita tambahkan sendiri. Category, itu cuman untuk menkategorikan perangkat aja. RAM, untuk menentukan jumlah RAM per-perangkat. Dan lain-lain deh, silahkan di ubah sesuai hati dan dicoba-coba sendiri. Untuk menambahkan/mengatur Interfacenya kita harus pergi ke menu `Network` dan akan tampil seperti berikut

![](https://res.cloudinary.com/kudaliar032/image/upload/v1608092973/aditaja-blog/2017-08-09-menambahkan-router-mikrotik-di-gns3/langkah7_uvqq6d.png)

Kalau mau menambah jumlah interface di mikrotiknya ubah pada bagian `Adapters` ubah angkanya seuai keinginan. Kalau mau mengubah type interfacenya silahkan diubah pada bagian `Type` jika sudah di ok’in aja. Saya rasa itu saya yang perlu disetting Mikrotiknya udah bisa berjalan seperti yang asli kok. Untuk menyimpannya klik `OK` aje terus yak. Tinggal digunakan aja deh.

Kira-kira itu saja yang ingin saya bagikan kali ini, gampang kan bree? gak pake ribet. Terima kasih telah berkunjung keblog ini maafkan jika bahasa yang digunakan susah dimengerti, silahkan ditanyakan saja dikomentar. Jangan lupa liat-liat postingan yang lainnya dan semoga postingan saya dapat selalu bermanfaat bagi kita semua. Babay…
