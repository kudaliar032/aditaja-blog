---
title: "Mengaktifkan Layanan SSH dan SFTP pada Windows Server 2016"
date: 2021-08-01T10:12:52+08:00
draft: false
toc: false
backtotop: true
tags:
- "windows server"
- "sftp"
images:
- "https://imgur.com/XQ5zWpr.jpg"
---

Hallo semuanya, mari kita awali bulan Agustus dengan sebuah catatan sederhana, sesederhana makanan padang yang enak itu. Alasan saya membuat catatan ini karena belum lama ini saya mendapati issue mengaktifkan SFTP pada Windows Server khususnya Windows Server 2016 jadi sekalian dah. Langsung saja to the point.

## Lingkungan Lab

- Windows Server 2016
- 2 vCPU
- 2 GiB Memory

## Langkah Kerja

- Langsung saja masuk ke server milik klean klean klean

### Mengaktifkan OpenSSH Pada Windows Server 2016

- Download dulu OpenSSH-nya karena memang Windows Server 2106 bawaannya tidak tersedia openssh. Bisa di download pada [GitHub](https://github.com/PowerShell/Win32-OpenSSH/releases)

![](https://imgur.com/rAYPCUu.jpg)

- Setelah itu extract dan masukan kedalam directory `C:\Program Files\`

![](https://imgur.com/VG3sFKg.jpg)

- Setelah selesai di extract, masuk kedalamnya dan jalankan script PowerShell yang untuk menginstall sshd yang telah tersedia file tersebut seharusnya bernama `install-sshd`, nantinya ditanya untuk menerima Policy silahkan di Y saja dan tunggu hingga terminal PowerShell nya close

![](https://imgur.com/tOE54R6.jpg)

- Setelah itu masuk kedalam `Administrative Tools` untuk menjalankan OpenSSH-nya, pilih yang `Services`

![](https://imgur.com/JtWXiH0.jpg)

![](https://imgur.com/egAJNbD.jpg)

- Cari yang bernama `OpenSSH`, klik kanan, pilih `Properties`, pada bagian `Startup type:` ganti menjadi `Automatic`, klik `Start`, dan tutup dengan menekan tombol `OK`, lakukan pada kedua service yang ada

![](https://imgur.com/tWyqzZH.jpg)

### Membuat Firewall Untuk Menerima Koneksi Port 22 (SSH)

- Berikutnya kita perlu mengallow port 22 agar dapat mengakses SSH dan SFTP pada server
- Buka `Windows Firewall with Advanced Security` pada server anda

![](https://imgur.com/dWAeBfM.jpg)

- Klik `Inbound Rules`, dan pilih `New Rule...`

![](https://imgur.com/9QzTlEA.jpg)

- Pada bagian `Rule Type`, pilih `Port`, dan `Next >`

![](https://imgur.com/D8jVGvk.jpg)

- Pada bagian `Protocol and Ports`, pilih `TCP`, `Specific local ports` isi dengan `22`, dan `Next >`

![](https://imgur.com/bbFyCrN.jpg)

 - Pada bagian `Action`, pilih `Allow the connection`, dan `Next >`

 ![](https://imgur.com/8Gf0MNK.jpg)

 - Pada bagian `Profile`, kasih conteng semuanya saja `Domain`, `Private`, `Public`, dan `Next >`

 ![](https://imgur.com/vRRHxDh.jpg)

 - Dan terakhir masukan `Name` dan `Description` sesuka anda tetapi tetap mudah dipahami ini firewall buat apa?, dan terkahir klik `Finish`

 ![](https://imgur.com/yz4zncQ.jpg)

- Jangan lupa allow juga port 22 dari sisi firewall external, disini saya enggak kasih liat, silahkan cari sendiri saja

### Buat User Untuk Koneksi SSH/SFTP

- Ini optional, tidak harus. Pakai user yang anda gunakan untuk masuk ke server saat ini saja seharusnya juga enggak ada masalah, sesuai kebutuhan saja sih
- Buka dulu `Computer Management` untuk menambahkan user

![](https://imgur.com/AGHxa8N.jpg)

- Expand `Local Users and Groups`, dan pilih `Users`, klik kanan dan pilih `New User...`

![](https://imgur.com/fBTDqQF.jpg)

- Masukan data user yang diinginkan, masukan `User name` sesuai keinginan, `Full name` sesuai keinginan, `Password` sesuai keinginan dan konfirm passwordnya pada isian dibawahnya, Uncheck `User must change password at next logon` jika tidak mau hal tersebut terjadi, dan tinggal terakhir klik `Create`, tutup dengan mengklik `Close`

![](https://imgur.com/FcTQlcZ.jpg)

## Uji Hasil Kerja

- Buka terminal kesayangan di komputer anda
- Coba masukan perintah ssh ke server anda menggunakan user yang telah dibuat tadi

![](https://imgur.com/t1aV6Oz.jpg)

![](https://imgur.com/xvZuWYP.jpg)

- Coba juga untuk sftp

![](https://imgur.com/GvJ4Uar.jpg)
![](https://imgur.com/YzKTizF.jpg)

Selesai juga sudah semuanya, sebenarnya ada beberapa hal lain yang bisa anda lakukan seperti mensetting agar user SFTP di jail untuk tidak dapat mengakses parent pathnya. Selain itu juga bisa mematikan SSH-nya atau SFTP only, dll. Mungkin cukup itu saja kali ya kali ini, terima kasih :pray: :pray: :pray:
