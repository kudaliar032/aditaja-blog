---
title: Cara Install Mikrotik di Komputer dengan VirtualBox
date: "2017-08-14"
tags:
- mikrotik
- networking
- jaringan
- virtualbox
---

![Cara Install Mikrotik di Komputer dengan VirtualBox](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/headers/2_hgbiiq.webp)

Selamat pagi, saya ingin membuat tutorial bagaimana cara menginstall mikrotik di PC menggunakan VirtualBox.

## Alat dan Bahan

- PC (beli [di sini](https://www.tokopedia.com/search?st=product&q=komputer))
- VirtualBox (Saya pakai versi 5.1 download [di sini](https://www.virtualbox.org/wiki/Downloads))
- ISO Mikrotik (download [di sini](https://mikrotik.com/download))

## Cara Kerja

### Persiapan Virtual Machine

Buat virtual machine baru di virtual box dengan nama sesuka hati, untuk type dan version biarkan saja kemudian klik `Next`

![](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/posts/2017-08-14-cara-install-mikrotik-di-komputer-dengan-vbox/word-image_f6ln0b.webp)

Atur memori/RAM secukupnya Minimal `64MB` dan Maksimal yang dapat diberikan adalah `2GB`, misalkan 64MB kemudian `Next`

![](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/posts/2017-08-14-cara-install-mikrotik-di-komputer-dengan-vbox/word-image-1_islksi.webp)

Plih `Create a virtual hard disk now` dan pilih `Next`

![](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/posts/2017-08-14-cara-install-mikrotik-di-komputer-dengan-vbox/word-image-2_qhnvqy.webp)

Biarkan saja “VDI (VirtualBox Disk Image)” langsung saja klik “Next”

![](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/posts/2017-08-14-cara-install-mikrotik-di-komputer-dengan-vbox/word-image-3_yvbwmb.webp)

Pilih saya yang “Dynamically allocated” dan klik “Next”

![](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/posts/2017-08-14-cara-install-mikrotik-di-komputer-dengan-vbox/word-image-4_moqvmz.webp)

Untuk ukuran harddisk pilih sesuai kebutuhan, atau biarkan saya 2GB dan klik “Create”

![](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/posts/2017-08-14-cara-install-mikrotik-di-komputer-dengan-vbox/word-image-5_ppvqac.webp)

Setelah itu akan muncul virtual machine baru, kemudian jalankan virtual machine yang baru dibuat tadi.

### Instalasi Mikrotik

Pilih file iso mikrotik yang sudah didownload sebelumnya. Dengan klik yang gambar folder ada ijo-ijonya itu. Kemudian cari file .iso yang sudah didonwload. Maka akan tampil seperti berikut ini dan klik `Start`

![](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/posts/2017-08-14-cara-install-mikrotik-di-komputer-dengan-vbox/word-image-6_qzyacp.webp)

Pilih modul-modul yang ingin diinstall, dengan menekan `spasi` atau tekan saja `a` jika ingin menginstall semua modul yang disediakan. Bisa juga tekan `m` jika ingin menginstall mikrotik hanya sistemnya saja. Setelah itu tekan `i` untuk memulai proses instalasi

![](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/posts/2017-08-14-cara-install-mikrotik-di-komputer-dengan-vbox/d-documents-blog-tutorial-tutorial-install-mikrot_ebzjot.webp)

Jika keluar pertanyaan `Do you want to keep old configuration? [y/n]:` Tekan saja `n`

![](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/posts/2017-08-14-cara-install-mikrotik-di-komputer-dengan-vbox/d-documents-blog-tutorial-tutorial-install-mikrot-1_t4e8an.webp)


Kemudian akan tampil pesan apakah ingin melanjutkan? Jika iya tekan lagi `y` dan proses instalasi akan dimulai dan tunggu hingga selesai dan mikrotik akan reboot dengan sendirinya.

![](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/posts/2017-08-14-cara-install-mikrotik-di-komputer-dengan-vbox/d-documents-blog-tutorial-tutorial-install-mikrot-3_qzuoku.webp)

Namun setelah sampai proses reboot selsai mikrotik akan kembali lagi ke jendela pertama saat instal mikrotik, untuk mengatasinya dan agar kita dapat masuk ke mikrotik yang sudah kita install, kita harus menghilangkan iso mikrotiknya dari `Virtual Machine`.

![](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/posts/2017-08-14-cara-install-mikrotik-di-komputer-dengan-vbox/d-documents-blog-tutorial-tutorial-install-mikrot-4_yr6ts2.webp)

Buka menu `Input` `Optical Drives` kemudian hilangkan contreng pada iso mikrotiknya jika keluar pesan peringatan piliha saja `force unmount`

![](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/posts/2017-08-14-cara-install-mikrotik-di-komputer-dengan-vbox/Untitled_b5mf0b.webp)

Langkah selanjutnya reboot mikrotik dengan shortcut `ctrl (right) + r`. Dan akan tampil seperti berikut ini.

![](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/posts/2017-08-14-cara-install-mikrotik-di-komputer-dengan-vbox/d-documents-blog-tutorial-tutorial-install-mikrot-5_clgo0o.webp)

Jika sudah keluar seperti itu, berarti instalasi mikrotik sudah selesai. Terima kasih dan semoga bermanfaat bagi kita semua. :pray: