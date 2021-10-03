---
title: "Deploy Go dengan Elastic Beanstalk"
date: 2021-10-03T18:12:05+08:00
draft: false
toc: false
backtotop: true
tags:
- "aws"
- "golang"
- "elastic beanstalk"
images:
- "https://imgur.com/7i6BErS.jpg"
---

Hallo semuanya, selamat datang bulan oktober. Minggu ini dikarenakan ada satu urusan yang harus dikerjakan pada waktu weekend sehinga molor untuk posting, walaupun begitu saya akan coba tetap posting sesuatu yang santai saja. Yaitu, bagaimana mendeploy sebuah aplikasi Golang di server menggunakan bantuan Elastic Beanstalk (EB). Sebelumnya apa itu Elastic Beanstalk? Elastic Beanstalk adalah salah satu service yang dimiliki AWS, service ini digunakan untuk mendeploy sebuah aplikasi di lingkungan AWS tanpa harus kita memikirkan gimana cara mendeploynya, karena semua sudah disiapkan oleh AWS. EB sendiri dapat digunakan pada banyak platform aplikasi, seperti Go, Java, .NET, Node.js, PHP, Python, dan Ruby. Nah, bagaimana caranya? Langsung saja.

## Kebutuhan Lab

- Sebuah akun AWS, untuk menjalankan service EB, yang free tier juga boleh
- Aplikasi yang di deploy, misalkan pakai [go-simple-http-server](https://github.com/kudaliar032/go-simple-http-server)

## Membuat Service Elastic Beanstalk

- Pertama-tama, masuk dulu kedalam service EB, misalkan bisa pada link berikut https://ap-southeast-1.console.aws.amazon.com/elasticbeanstalk untuk region singapore

### Membuat Application

- Pilih `Create Application`
- Masukan `Application name` sesuai keinginan

![](https://imgur.com/bkdh67q.jpg)

- Kemudian, masukan `Application tags` sesuai dengan kebutuhan, misalkan `Environment = Development`

![](https://imgur.com/HN5oirj.jpg)

- Kemudian pada bagian `Platform`, pilih untuk `Go`, `Platform branch` pilihlah versi terbaru yang tersedia, dan `Platform version` pilih versi terbaru yang tersedia

![](https://imgur.com/AgoNqhs.jpg)

- Kemudian pada bagian `Application code` pilihlah yang `Upload your code`, yang bagian `Source code origin` pilih yang `Local file` dan upload file `.zip` dari aplikasi yang kita miliki. Silahkan di compress dulu, untuk compressnya jangan masukan kedalam directory, pastikan source code aplikasi kita berada pada root dari file `zip` tersebut

![](https://imgur.com/jJ5YsdK.jpg)

![](https://imgur.com/80q2HZw.jpg)

- Setelah itu klik tombol `Configure more options` untuk konfigurasi Environment

![](https://imgur.com/NdKQMEj.jpg)

### Membuat Environment

Nah, untuk environment ini digunakan untuk menentukan lingkungan server dari aplikasi yang hendak kita jalankan. Misalkan kita hendak menjalankan pada lingkungan single intance atau mungkin lingkungan HA dengan multi server

Pada bagian `Presets` pilih saja yang `Single instance (Free Tier eligible)`, karena kita hanya mau coba-coba saja, kita pilih yang itu dulu

![](https://imgur.com/jiREofs.jpg)

Jika mau konfigurasi lain, misalkan kita sekaligus membuat database, menentukan jumlah instance jika HA aktif, metode deployment, networknya, dll bisa lakukan pada bagian bawah menu ini

![](https://imgur.com/8LQQhyN.jpg)

Setelah semuanya dirasa cukup, tinggal klik `Create app`

![](https://imgur.com/v44thwh.jpg)

Tunggu beberapa saat, maka semuanya akan disiapkan untuk kita, hingga aplikasi berjalan.

![](https://imgur.com/FkRdnmn.jpg)

Setelah, selesai buka pada bagian environment untuk mendapatkan status aplikasi, dan juga menampilkan URL dari aplikasi, silahkan diklik dan niscaya aplikasi anda terdeploy dengan sempurna

![](https://imgur.com/mfuFYcu.jpg)

![](https://imgur.com/YBuF4X5.jpg)

Selesai sudah kita mendeploy sebuah aplikasi web yang dituliskan dengan Golang dengan bantuan Elastic Beanstalk, disini kita akan dimanjakan dengan kemudian dalam mendeploy aplikasi tanpa harus ribet memikirkan bagaimana untuk mengatur infrastrukturnya. Sangat mudah bukan? Semoga catatan kali ini bermanfaat, terima kasih :pray: :pray: :pray:
