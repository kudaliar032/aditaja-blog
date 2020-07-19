---
title: Deploy Aplikasi Flask di Heroku
date: 2020-07-11
author: Aditya Rahman
tags:
- heroku
- python
- flask
coverImageUrl: https://aditaja-bucket.s3-ap-southeast-1.amazonaws.com/blog-media/20200719-heroku.png
excerpt: ''

---
Hallo semuanya, saya ingin membagikan sedikit cara untuk mendeploy aplikasi python dengan framework flask di heroku, langsung saja seperti berikut

## Buat akun di Heroku

Untuk buat akun heroku, tinggal akses link berikut [https://signup.heroku.com/](https://signup.heroku.com/), isi form dan simpan

## Persiapkan Aplikasi

Buka dulu aplikasi yang mau di deploy, jika belum ada bisa pakai contoh aplikasi sederhana berikut ini [simple flask](https://github.com/kudaliar032/simple-flask/tree/master). Pada aplikasi tersebut terdapat beberapa file seperti berikut

![](https://i.imgur.com/INgVNme.png)

siapkan terlebih dahulu [virtualenv](https://pypi.org/project/virtualenv/) untuk menjalankan aplikasi dan mempersiapkan library yang diperlukan oleh heroku, dapat menggunakan perintah berikut

    python -m venv venv/

setelah dibuat, aktifkan virtualenv tersebut untuk menggunakannya dengan perintah

    source venv/bin/activate

install library `gunicorn` dengan perintah

    pip install gunicorn