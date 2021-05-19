---
title: Menghubungkan Koneksi WiFi pada Debian 10 "Buster" Mode Text
date: 2020-12-14
draft: false
toc: false
backtotop: true
tags:
- debian
- linux
images:
- https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/headers/BS0ofve_rfnfek.webp
---

Hallo, saya kali ini mau nulis-nulis dikit mengenai cara untuk menghubungkan koneksi wifi pada sistem operasi Debian 10 "Buster", langsung lah pendek saja.

<!--truncate-->

Login ke dalam sistem operasi anda, masuk sebagai user root karena kita akan membutuhkan akses root untuk setup-setup. Bisa langsung masuk dari login screen, atau menggunakan perintah `su -` kemudian masukan password root anda.

Cari tahu terlebih dahulu nama interface wireless anda, dapat menggunakan perintah `ip a` atau `iw dev`. Seperti contoh berikut, dimana nama interface saya adalah `wlp5s0`. Diingat kalau perlu dicatat, pastikan interface tersebut sudah UP dengan menggunakan perintah `ip link set wlp5s0 up`

![](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/posts/2020-12-14-menghubungkan-wifi-pada-debian-cli/zR8dHFS_jvnq7o.webp)

Cari tahu nama wifinya/SSID dari wifi menggunakan perintah `iwlist wlp5s0 scan | grep ESSID`. Kalau anda sudah tau tidak perlu menjalankan perintah ini.

![](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/posts/2020-12-14-menghubungkan-wifi-pada-debian-cli/HKFTuaj_bmfd8i.webp)

Disini terdapat dua wifi yaitu `XXX XXX` dan `YYY YYY`. Anggap saja kita akan menghubungkan ke `XXX XXX`. Selanjutnya kita update konfigurasi interfacesnya dengan menyunting file `/etc/network/interfaces`.

```
# This file describes the network interfaces available on your system
# and how to activate them. For more information, see interfaces(5).

source /etc/network/interfaces.d/*

# The loopback network interface
auto lo
iface lo inet loopback

allow-hotplug wlp5s0
iface wlp5s0 inet dhcp
        wpa-ssid "XXX XXX"
        wpa-psk "YourStrongPassword"
```

Untuk bagian `allow-hotplug wlp5s0` berguna agar wifi terhubung saat sistem operasi melakukan booting, yang bagian `iface wlp5s0 inet dhcp` berguna untuk mengatur bahwa interface tersebut menggunakan DHCP untuk pengaturan alamat IP nya. Yang `wpa-ssid` berisikan nama wifi yang ingin dihubungkan, dan `wpa-psk` berisikan password dari wifi yang ingin dihubungkan apabila ada.

Terakhir untuk memastikan semua benar, hubungkan dengan mengaktifkan interface dengan perintah `ifup wlp5s0` dan pastikan wifi dapat alamat IP dengan perintah `ip addr`.

![](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/posts/2020-12-14-menghubungkan-wifi-pada-debian-cli/xD8vAkw_zmz00n.webp)

Selesai, sepertinya begitu saja tulisan kali ini. Terima kasih :pray:
