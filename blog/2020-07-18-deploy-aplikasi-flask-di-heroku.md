---
title: Deploy Aplikasi Flask di Heroku
tags:
- heroku
- python
- flask
---

![Deploy Aplikasi Flask di Heroku](https://i.imgur.com/MRv134Y.png)

Hallo semuanya, saya ingin membagikan sedikit cara untuk mendeploy aplikasi python dengan framework flask di heroku, langsung saja seperti berikut

<!--truncate-->

## Flask

Buka dulu aplikasi yang mau di deploy, jika belum ada bisa pakai contoh aplikasi sederhana berikut ini [simple flask](https://github.com/kudaliar032/simple-flask/tree/master). Pada aplikasi tersebut terdapat beberapa file seperti berikut

![](https://i.imgur.com/INgVNme.png)

siapkan terlebih dahulu [virtualenv](https://pypi.org/project/virtualenv/) untuk menjalankan aplikasi, dapat menggunakan perintah berikut

    python -m venv venv/

setelah dibuat, aktifkan [virtualenv](https://pypi.org/project/virtualenv/) tersebut untuk menggunakannya perintah

    source venv/bin/activate

install library yang diperlukan oleh aplikasi flask

    pip install -r requirements.txt

kita coba jalankan dulu aplikasi tersebut untuk memastikan aplikasi dapat berjalan dengan baik

    python app.py

maka akan tampil seperti berikut ini, yang menandakan bahwa aplikasi sudah berjalan dan dapat diakses pada url `http://127.0.0.1:5000`

![](https://aditaja-bucket.s3-ap-southeast-1.amazonaws.com/blog-media/20200719-Screenshot-20200719220627-952x204.png)

tampilannya kurang lebih seperti berikut ini

![](https://aditaja-bucket.s3-ap-southeast-1.amazonaws.com/blog-media/20200719-Screenshot-20200719221223-429x142.png)

jika tampil muncul seperti tersebut dapat dipastikan bahwa aplikasi telah berjalan dengan baik, untuk keluar dapat dengan menekan shortcut `Ctrl+C`.

## Heroku

### Persiapan Akun

Jika belum memiliki akun diheroku maka kita dapat membuatnya dengan link berikut ini [https://signup.heroku.com/](https://signup.heroku.com/ "https://signup.heroku.com/"), isi form dan kirimkan. Apabila diperlukan lakukan juga verifikasi akun sesuai dengan langkah-langkah yang diminta.

### Persiapan Heroku CLI

Untuk melakukan deployment di heroku ada beberapa metode yang bisa digunakan, antara lain dihubungkan langsung dengan GitHub, Menggunakan Container, atau menggunakan Heroku Git. Untuk itu diperlukan tools yang bernama Heroku CLI agar kita dapat mendeploy aplikasi kita. Untuk instalasi dari tools tersebut dapat membuka link [disini](https://devcenter.heroku.com/articles/heroku-cli).

Setelah berhasil diinstall, maka berikutnya adalah login ke Heroku CLI dengan perintah

    heroku login

kemudian tekan sembarang tombol untuk membuka browser, maka akan tampil seperti berikut

![](https://aditaja-bucket.s3-ap-southeast-1.amazonaws.com/blog-media/20200719-Screenshot-20200719231419-1919x943.png)

tekan `Log In` maka otomatis login pada Heroku CLI.

### Persiapan Aplikasi

Tambahkan terlebih dahulu library `gunicorn` yang akan digunakan oleh heroku sebagai web server dari aplikasi flask kita nantinya. Untuk menginstallnya gunakan perintah `pip` sebagai berikut

    pip install gunicorn

setelah berhasil ditambahkan, maka kita harus memperbarui file `requirements.txt` dari aplikasi milik kita dengan perintah

    pip freeze > requirements.txt

jika file `requerments.txt` kita buka, kurang lebih akan berisi seperti berikut ini

    click==7.1.2
    Flask==1.1.2
    gunicorn==20.0.4
    itsdangerous==1.1.0
    Jinja2==2.11.2
    MarkupSafe==1.1.1
    Werkzeug==1.0.1

agar heroku dapat menjalankan aplikasi kita maka kita perlu mendefinisikan command yang akan dieksekusi oleh heroku. Untuk mendefinisikan command tersebut, kita perlu membuat sebuah file bernama `Procfile` kemudian isikan dengan

    web: gunicorn app:app

perintah `web` digunakan heroku untuk menjalankan web server dengan bantuan library `gunicorn`, karena aplikasi kita menggunakan nama `app.py` sebagai main programnya maka kita mendefinisikannya dengan `app:app`.

### Buat App di Heroku

Buka terlebih dahulu dashboard heroku kita, dapat dengan mengakses link berikut ini [https://dashboard.heroku.com/apps](https://dashboard.heroku.com/apps "https://dashboard.heroku.com/apps"), setelah itu buat aplikasi baru pada menu berukut ini dihalaman utama dashboard. Pilih saja yang `Create new app`

![](https://aditaja-bucket.s3-ap-southeast-1.amazonaws.com/blog-media/20200719-Screenshot-20200719223510-258x199.png)

Masukan nama aplikasi dan juga pilih region dari aplikasi kita nantinya, untuk akun free hanya terdapat 2 region yaitu `Europe` dan `US`.

![](https://aditaja-bucket.s3-ap-southeast-1.amazonaws.com/blog-media/20200719-Screenshot-20200719223822-813x524.png)

### Deploy Aplikasi ke Heroku

Selanjutnya ialah tahap akhir yaitu mendeploy atau mengirimkan aplikasi kita ke heroku. Pastikan terlebih dahulu bahwa kita telah login pada Heroku CLI, dapat dilihat pada langkah sebelumnya, berikutnya adalah melakukan git init, apabila aplikasi kita belum dihubungkan dengan git sama sekali. Apabila sudah, maka dapat melewati langkah ini

    git init

tambahkan repository remote milik heroku pada repository local kita

    heroku git:remote -a kl032-simple-flask

setelah itu masukan file-file aplikasi kita kedalam git stage dan lakukan git commit

    git add .
    git commit -m "deploy to heroku"

setelah itu lakukan push ke repository remote milik heroku

    git push heroku master

maka otomatis heroku akan melakukan build dan deployment pada server mereka, tunggu beberapa saat hingga aplikasi berhasil di deploy, kira-kira akan muncul pesan seperti berikut ini

![](https://aditaja-bucket.s3-ap-southeast-1.amazonaws.com/blog-media/20200719-Screenshot-20200719225635-902x272.png)

coba akses aplikasinya dengan url yang ditampilkan, misalkan [https://kl032-simple-flask.herokuapp.com/](https://kl032-simple-flask.herokuapp.com/ "https://kl032-simple-flask.herokuapp.com/"). Maka seharusnya akan tampila seperti saat kita menjalankannya dilocal sebelumnya.

![](https://aditaja-bucket.s3-ap-southeast-1.amazonaws.com/blog-media/20200719-Screenshot-20200719225847-408x106.png)

## Kesimpulan

Pada artikel ini ditampilkan langkah-langkah melakukan deployment aplikasi sederhana, dalam hal ini ialah aplikasi python dengan framework flask, pada Heroku. Untuk mendeploy aplikasi flask diperlukan library python yaitu `gunicorn`. Selain itu dalam melakukan deployment ke heroku diperlukan pengetahuan dasar dan perintah-perintah `git`.

Heroku ialah salah satu contoh dari penerapan Platform-as-a-service (PaaS). Dengan menggunakan heroku kita dapat mendeploy aplikasi tanpa perlu kita melakukan konfigurasi disisi infrastruktur. Heroku sendiri menawarkan beberapa paket, diantaranya adalah paket Free dan Student Plan yang dapat kita gunakan untuk belajar dan deployment yang sederhana. 

Sekian dari saya, semoga catatan ini bermanfaat, apabila ada pertanyaan jangan segan melemparkan komentar. Terima kasih.