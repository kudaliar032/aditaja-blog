---
title: "Deploy Docker Image pada Elastic Beanstalk"
date: 2021-11-02T15:57:31+08:00
draft: false
toc: false
backtotop: true
tags:
- ""
images:
- "https://via.placeholder.com/500x250.webp?text=please+change+this+header"
---

Hallo semuanya, selamat datang bulan November. Kali ini saya hendak sedikit berbagi mengenai hal yang baru saya coba-coba. Mendeploy aplikasi kita ke Elastic Beanstalk namun ada yang sedikit berbeda yaitu saya mencoba mendeploy docker image ke Elastic Beanstalk tanpa menggunakan Image Repoisotry. Jadi saya mencoba untuk mengirim docker image ke EB langsung (dengan fitur save dan load) tanpa menggunakan docker registry. Oke, langsung saja kita mencobanya. Pertama-tama pastinya kita harus membuat dulu Application dan Environment di AWS. Jangan lupa untuk memilih Docker untuk platformnya.

![](https://imgur.com/wl0EOFI.jpg)

Selanjutnya mari kita siapkan untuk docke image yang akan digunakan

## Prepare Docker Image

Pertama-tama mari membuat docker image yang hendak di deploy, kemudian menjadikannya file untuk diunggah ke EB. Misalkan saya pakai `nginx:alpine` yang kemudian nanti saya modifikasi untuk halaman index-nya. Pertama-tama kita pakai yang default dulu saja.

```bash
docker pull nginx:alpine
docker tag nginx:alpine the-apps
docker save -o the-apps.tar the-apps
```

 Pada tahap ini saya akan mentag image asli menjadi nama lain, nantinya nama tersebut lah yang akan di load dan di deploy pada EB. Dari perintah diatas akan menghasilkan sebuah file compress yang berisikan docker image dengan nama file `the-apps.tar`.

## Create Prebuild Script

Selanjutnya mari membuat script prebuild, script ini akan digunakan untuk ngeload image yang telah di compress sebelumnya. Nah mari kita buat script tersebut di dalam directory `.platform/hooks/prebuild` dan buat sebuah file bash dengan nama bebas sebenarnya, misalnya saja pakai nama `01loadimage.sh`. Nah untuk isinya kira-kira seperti berikut ini

```bash
#!/bin/bash
docker load -i the-apps.tar >> /var/log/load_docker_image.log
```

Pada script tersebut kita akan melakukan perintah sederhana saja yaitu meload image, kemudian memasukan log ke file `/var/log/load_docker_image.log` untuk mempermudah debuging saja sih. Jangan lupa untuk memberikan akses eksekusi agar script tersebut dapat dijalankan oleh EB. Gunakan perintah berikut

```bash
chmod +x .platform/hooks/prebuild/01loadimage.sh
```

## Deploy to Elastic Beanstalk

Dan, tahap terakhir marilah kita deploy, bisa menggunakan eb cli seperti berikut

```bash
eb deploy
```

Kemudian tunggu beberapa saat hingga deployment selesai

![](https://imgur.com/XHgrUIX.jpg)

Kalau sudah coba diakses, dan pastikan image nginx terdeploy

![](https://imgur.com/2aTVmyo.jpg)

Sampai sini sebenarnya sudah selesai untuk deploymnetnya. Namun kurang afdol sepertinya jika kita tidak mencoba untuk mengupdate image tersebut, guna memastikan bahwa deployment berjalan dengan baik.

## Update Docker Image

Misalkan berikut adalah docker imagenya, buat dulu file `index.html`

```html
<html>
  <head>
    <title>the-apps</title>
  </head>
  <body>
    <h1>Hello the-apps!</h1>
  </body>
</html>
```

Setelah itu mari membuat dockerfilenya

```docker
FROM nginx:alpine
COPY index.html /usr/share/nginx/html/index.html
```

Mari build, dan save seperti sebelumnya

```bash
docker build -t the-apps .
rm the-apps.tar
docker save -o the-apps.tar the-apps
```

Terakhir deploy

```bash
eb deploy
```

Pastikan, semuanya sukses dengan sempurna

![](https://imgur.com/woqYo4V.jpg)

Kemudian coba akses melalui tautan yang ada dan pastikan halaman webnya telah menjadi yang baru

![](https://imgur.com/me01dxq.jpg)

Taraa, selesai sudah semuanya. Begitulah kira-kira cara mendeploy sebuah docker image ke Elastic Beanstalk. Sebenarnya ini bukan cara yang resmi ya, karena kalau dari dokumentasi AWS yang saya tahu mereka merekomendasikan menggunakan metode Push ke registry dan deploy ke EB, atau build Dockerfile di EB. Namun di sini saya mencoba untuk mengeksplor cara lain yang memungkinkan sehingga kita tidak perlu membutuhkan docker registry. Untuk metode buildnya sendiri nantinya bisa dimasukan ke pipeline seperti GitLab CI/CD atau mungkin CodePipeline. Semoga ini bisa bermanfaat untuk kita semua, terima kasih :pray: :pray: :pray:

Btw, kalau mau pakai lab yang saya gunakan bisa dari tautan berikut [docker-eb-tar](https://github.com/kudaliar032/docker-eb-tar)
