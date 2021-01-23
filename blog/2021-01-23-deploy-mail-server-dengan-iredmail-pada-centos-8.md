---
title: Deploy Mail Server dengan iRedMail pada RHEL/CentOS
tags:
- linux
- mail server
---

![](https://res.cloudinary.com/kudaliar032/image/upload/v1611402435/aditaja-blog/posts/2021-01-23-deploy-mail-server-dengan-iredmail-pada-centos-8/nh97GXa_cgn9i0.webp)

Hallo, karena kemaren saya baru saja coba-coba deploy/setup mail server pakai iRedMail jadi sekalian lah ditulis di blog biar gak lupa. Sebenernya sudah tau iRedMail sendiri sudah lumayan lama sih, tapi kemaren-kemaren cuma coba deploy saja terus kirim email sesama user udah gitu aja. Nah, mungkin kali ini saya coba tulis cara yang saya gunakan untuk deploy mail servernya sampai bisa kirim email ke provider email lain (tidak pasti).

<!-- truncate -->

Tapi perlu diingat bahwa setup mail server sendiri itu susah, susah, gampang. Karena memang stack yang digunakan pada mail server sendiri emang banyak, dari SMTP, POP3/IMAP, Web Mail, Untuk simpan data user, Buat SPAM, dll. Belum lagi nanti port SMTP diblok sama ISP. Wah ribet dah :grin:

Nah, apasih iRedMail itu? Kata websitenya begini

> **iRedMail - Open Source Mail Server Solution**  
> The right way to build your mail server with open source softwares.  
> Works on Red Hat, CentOS, Debian, Ubuntu, FreeBSD, OpenBSD.  
> Since 2007.
>
> https://www.iredmail.org

Intinya iRedMail itu tools yang bisa kita pakai untuk membangun mail server yang open source tentunya, dengan bantuan iRedMail ini kita enggak perlu lagi setup satu persatu komponentnya udah dibantu installkan aja gitu. Untuk komponen lengkapnya bisa dibaca pada tautan berikut https://docs.iredmail.org/used.components.html. Dahlah, langsung saja silahkan dinikmati.

## Requirements

- Sistem Operasi yang disupport iRedMail bisa dicek di [sini](https://www.iredmail.org/download.html).
- Sebuah host yang fresh install, maksudnya fresh ini belum terinstal dengan beberapa komponen yang akan digunakan. Antara lain, MySQL, OpenLDAP, Postfix, Dovecot, Amavisd, dll.
- Memory `2GB` untuk mail server yang biasa-biasa saja, rekomendasinya `4GB`.
- Pastikan 3 `UID/GID` berikut belum digunakan `2000`, `2001`, dan `2002`.
- Port `25` dibuka, ini optional sih kalau mail server ingin digunakan untuk kirim ke provider email lain ini jadi wajib.

## Langkah-langkah Deployment

### Persiapan

#### Setup [FQDN](https://en.wikipedia.org/wiki/Fully_qualified_domain_name) hostname pada server

Untuk untuk mengecek dapat menggunakan perintah `hostname -f`

```bash
[root@mail ~]# hostname -f
mail.example.my.id
```

Kalau misalkan belum pakai FQDN silahkan diatur dengan cara berikut ini

```bash
[root@mail ~]# hostnamectl set-hostname mail.example.my.id
```

kemudian edit file `/etc/hosts`. Pastikan yg FQDN pertama ya

```
127.0.0.1 mail.example.my.id mail localhost.localdomain localhost
```

Terakhir cek lagi pakai perintah `hostname -f`. Pastikan hostname-nya sudah pakai FQDN.

#### Disable SELinux

Dikarenakan iRedMail tidak support SELinux maka perlu dimatikan terlebih dahulu. Dengan mengedit file `/etc/selinux/config` dan ubah value `SELINUX`.

```
SELINUX=disabled
```

Kemudian reboot host, kalau males reboot bisa pakai perintah `setenforce 0`.

#### Perisapkan repository

- Pada CentOS
  - Aktifkan official repository. Pada CentOS 8, pastikan repo `AppStream` dan `PowerTools` diaktifkan
  - Aktifkan `epel` repo
  - Matikan semua 3rd-patry agar tidak terjadi conflict

- Pada RHEL
  - Aktifkan Red Hat Network install packages
  - Aktifkan `epel` repo

#### Download dan ekstrak instaler

Download instaler di [sini](https://www.iredmail.org/download.html), kemudian ekstrak instaler tersebut.

```bash
cd /root
wget https://github.com/iredmail/iRedMail/archive/x.y.z.tar.gz
tar xvf x.y.z.tar.gz
```

### Proses Instalasi

- Jalankan script installer

```bash
cd /root/iRedMail-x.y.z/
bash iRedMail.sh
```

- Pesan selamat datang, pilih `Yes` kalau mau melanjutkan

![](https://res.cloudinary.com/kudaliar032/image/upload/v1611402432/aditaja-blog/posts/2021-01-23-deploy-mail-server-dengan-iredmail-pada-centos-8/aJAL3mC_kkkn5u.webp)

- Tentukan directory untuk penyimpanan email, default-nya berada di `/var/vmail`, Biarkan saja default, tapi kalau mau dipindah juga boleh

![](https://res.cloudinary.com/kudaliar032/image/upload/v1611402433/aditaja-blog/posts/2021-01-23-deploy-mail-server-dengan-iredmail-pada-centos-8/WPsAnHF_lbyel7.webp)

- Pilih web server yang akan digunakan, default-nya `nginx`. Disini saya pilih `nginx`

![](https://res.cloudinary.com/kudaliar032/image/upload/v1611402434/aditaja-blog/posts/2021-01-23-deploy-mail-server-dengan-iredmail-pada-centos-8/6zCHgtn_bmpltz.webp)

- Berikutnya pilih backend yang akan digunakan untuk menyimpan mail account, pilihlah yang familiar. Misalkan disini saya pakai `MariaDB`. Untuk memilih pakai `space`

![](https://res.cloudinary.com/kudaliar032/image/upload/v1611402434/aditaja-blog/posts/2021-01-23-deploy-mail-server-dengan-iredmail-pada-centos-8/4pnmQfn_kzjegp.webp)

- Masukan password untuk akun `root` databasenya. Buat seribet mungkin

![](https://res.cloudinary.com/kudaliar032/image/upload/v1611402433/aditaja-blog/posts/2021-01-23-deploy-mail-server-dengan-iredmail-pada-centos-8/gGCuPgU_s9jqeb.webp)

- Masukan domain untuk emailnya, misalkan `example.my.id`. Nantinya akan menjadi alamat emailnya, buat berbeda dengan hostname-nya.

![](https://res.cloudinary.com/kudaliar032/image/upload/v1611402437/aditaja-blog/posts/2021-01-23-deploy-mail-server-dengan-iredmail-pada-centos-8/pN4HXMj_wninz2.webp)

- Masukan password untuk postmaster/admin. Buat password serumit mungkin

![](https://res.cloudinary.com/kudaliar032/image/upload/v1611402435/aditaja-blog/posts/2021-01-23-deploy-mail-server-dengan-iredmail-pada-centos-8/jBLJhrt_vvlasc.webp)

- Pilih komponen-komponen lain yang hendak diinstal, misalkan `Roundcubemail` untuk Webmail, `SOGo` untuk Webmail, Kalender, Address Book, dll.

![](https://res.cloudinary.com/kudaliar032/image/upload/v1611404008/aditaja-blog/posts/2021-01-23-deploy-mail-server-dengan-iredmail-pada-centos-8/1QpSgWb_erc5vt.webp)

- Konfirmasi dengan memasukan `y`

![](https://res.cloudinary.com/kudaliar032/image/upload/v1611402437/aditaja-blog/posts/2021-01-23-deploy-mail-server-dengan-iredmail-pada-centos-8/swoMdqX_pjgsln.webp)

- Konfirmasi `Y` saja jika ada permintaan untuk konfirmasi

- Jika sudah selesai akan muncul pesan seperti berikut ini. Kira-kira

![](https://res.cloudinary.com/kudaliar032/image/upload/v1611402436/aditaja-blog/posts/2021-01-23-deploy-mail-server-dengan-iredmail-pada-centos-8/yzthTMm_kfmqky.webp)

- Sampai sini instalasi telah selesai mail server sudah siap digunakan tinggal lakukan reboot server, kemudian tuning-tuning agar bisa berkirim email dengan provider lain seperti GMail, Outlook, Zoho, dll

:::danger PERINGATAN
Setelah, proses instalasi selesai akan mengenerate file `/root/iRedMail-x.y.z/iRedMail.tips` di dalam sini tertulis beberapa kredensial jadi mohon amankan file ini
:::

- Saat salah satu tautan yang ditampilkan dan masukan user postmaster@example.my.id dengan password yang dimasukan pada saat instalasi

![](https://res.cloudinary.com/kudaliar032/image/upload/v1611402436/aditaja-blog/posts/2021-01-23-deploy-mail-server-dengan-iredmail-pada-centos-8/FQuLKoJ_iufh6y.webp)

## Setelah Instalasi

Setelah proses instalasi selesai lakukan beberapa pengaturan berikut agar mail server dapat digunakan untuk berkirim-kirim email.

### Setup DNS Record

Untuk mail server itu sangat sensitif agar dapat digunakan secara public, karena sebuah DNS pada mail server perlu beberapa record agar dapat saling berkirim email. Dengan iRedMail kita dimudahkan dalam mengaturnya, beberapa yang perlu di setup antara lain.

#### `A` record untuk hostname server

`A` record disini digunakan untuk mapping antara FQDN dengan IP address dari server. Untuk mengaturnya silahkan lakukan dari Domain Management yang anda gunakan, misalkan pakai `Cloudflare`.

#### `PTR` record untuk alamat IP server

`PTR` record digunakan untuk resolve alamat IP ke domain dari server. Ini sangat berguna agar server dapat berkirim email dan tidak dianggap spam. Untuk mengatur `PTR` record biasanya perlu minta ke provider penyedia cloud dari server yang digunakan. Misalkan minta saja ke `AWS`, `Linode`, `Contabo` untuk mengatur `PTR` pada IP address anda.

#### `MX` record untuk domain

`MX` atau Mail Exchanger digunakan untuk mengarahkan pengirim email ke mail server anda. `MX` record dapat diataur dari domain management dari domain milik anda. Misalkan email anda `mail@example.my.id` dan alamat mail server-nya di `mail.example.my.id`, maka perlu buat `MX` record dari `example.my.id` ke `mail.example.my.id`.

#### `SPF` record untuk domain email

`SPF` record digunakan untuk menghindari spam dan phishing, record ini digunakan untuk memfilter host yang diizinkan mengirim email dari domain ini. Untuk lebih lanjut dapat dibaca dari [wikipedia](https://en.wikipedia.org/wiki/Sender_Policy_Framework). Untuk mengaurnya dilakukan dari domain management, dengan menambahkan `TXT` record pada domain milik anda. Misalkan

```
example.my.id.  3600  IN  TXT "v=spf1 mx -all"
```

atau spesifik di host tertentu

```
example.my.id.  3600  IN  TXT "v=spf1 ip4:111.111.111.111 -all"
```

#### `DKIM` record untuk domain email

`DKIM` record digunakan untuk memverifikasi pesan. Apa itu `DKIM` secara lengkap dapat dilihat pada [wikipedia](https://en.wikipedia.org/wiki/DomainKeys_Identified_Mail). Untuk mengatur `DKIM` record sebagai berikut.

pada CentOS jalankan perintah berikut `amavisd showkeys`. Jika muncul pesan error `Config file "/etc/amavisd.conf" does not exist ...` gunakan perintah berikut ini `amavisd -c /etc/amavisd/amavisd.conf showkeys`. Kira-kira akan muncul seperti berikut ini

![](https://res.cloudinary.com/kudaliar032/image/upload/v1611402434/aditaja-blog/posts/2021-01-23-deploy-mail-server-dengan-iredmail-pada-centos-8/qDuVbFl_qbkkuo.webp)

copy output tersebut dengan mengabaikan tanda `"` dan `enter` sehingga kira-kira menjadi seperti berikut ini

```
v=DKIM1; p=MIIBIjANBgkqhkiG9...
```

masukan record tersebut sebagai `TXT` record di domain management. Untuk domain `dkim._domainkey.example.my.id`. Untuk memverifikasi silahkan lakukan query dengan perintah `dig -t TXT dkim._domainkey.example.my.id` atau `nslookup -type=TXT dkim._domainkey.example.my.id` dan pastikan key yang digenerate tadi sudah masuk sebagai record. Atau gunakan tools yang sudah disediakan oleh `amavisd` dengan mengeksekusi perintah `amavisd -c /etc/amavisd/amavisd.conf testkeys` dan pastikan dapat output `PASS`

![](https://res.cloudinary.com/kudaliar032/image/upload/v1611402433/aditaja-blog/posts/2021-01-23-deploy-mail-server-dengan-iredmail-pada-centos-8/3Tf6Uri_ndahli.webp)

#### `DMARC` record

`DMARC` record pokoknya digunakan agar email yang kita kirimkan tidak dianggap spam oleh server tujuan. Untuk lebih jelasnya bisa dibaca pada tautan berikut https://dmarc.org. Untuk mengatur `DMARC` record pastikan anda telah mengatur `SPF` dan `DKIM` sebelumnya. Sama seperti sebelum-sebelumnya kita perlu masukan record ini dalam bentuk `TXT` record. Dengan value yang paling sederhana seperti berikut ini

```
v=DMARC1; p=none
```

Itulah beberapa record yang saya lengkapi agar email yang dikirimkan oleh mail server kita dapat diterima oleh provider lain. Untuk mengetahui apakah email yang dirimkan sudah ok bisa menggunakan bantuan tools dari https://www.mail-tester.com. Disini saya berhasil dapat score `9.4`.

![](https://res.cloudinary.com/kudaliar032/image/upload/v1611404036/aditaja-blog/posts/2021-01-23-deploy-mail-server-dengan-iredmail-pada-centos-8/BqQDyBN_phyykw.webp)

### Setup SSL

Setelah record-record domain dilengkapi. Berikutnya adalah mengganti sertifikat SSL yang digenerate otomatis saat melakukan instasi agar Webmail milik kita jika diakses tidak muncul peringatan yang menyebalkan. Selain itu saat kita login ke Mail Client nantinya tidak muncul pesan-pesan menyebalkan itu juga. Seperti ini

![](https://res.cloudinary.com/kudaliar032/image/upload/v1611402432/aditaja-blog/posts/2021-01-23-deploy-mail-server-dengan-iredmail-pada-centos-8/Yy0Rxjy_etdymc.webp)

Disini saya pakai SSL gratisan dari Let's Encrypt jika anda punya sertifikat yang didapatkan dari penyedia sertifikat bisa gunakan sertifikat tersebut, untuk caranya di [sini](https://docs.iredmail.org/use.a.bought.ssl.certificate.html). Jika pakai LE caranya sebagai berikut.

- Install dulu certbot, bisa pakai `snap` caranya ada di [sini](https://certbot.eff.org/lets-encrypt/centosrhel8-other)
- Pastikan domain-domain yang akan digunakan telah dipointing dengan baik dan dapat diakses oleh public
- Request sertifikat dengan menggunakan perintah

```bash
certbot certonly --webroot -w /var/www/html -d mail.example.my.id -d other.example.my.id
```

- Masukan email untuk notifikasi jika sertifikat hendak kadaluarsa, jika ditanya ToS di `Y` saja, jika ditanya tentang iklan boleh di `Y` boleh juga di `N`
- Setelah muncul pesan `Selamat`, lanjutkan dengan mengubah hak akses agar file-file sertifikat dapat dibaca oleh stack dari mail server.

```bash
chmod 0644 /etc/letsencrypt/{live,archive}
```

- Buat cron untuk perpanjangan otomatis dari sertifikat, dengan menambahkan script cron berikut dengan `crontab -e`

```bash
0 0 * * 0 certbot renew --post-hook '/usr/sbin/service postfix restart; /usr/sbin/service nginx restart; /usr/sbin/service dovecot restart'
```

- Pada contoh ini pengecekan renew dilakukan seminggu sekali
- Berikutnya arahkan agar server-server menggunakan SSL dari LE, dengan perintah berikut

```bash
mv /etc/pki/tls/certs/iRedMail.crt{,.bak}       # Backup. Rename iRedMail.crt to iRedMail.crt.bak
mv /etc/pki/tls/private/iRedMail.key{,.bak}     # Backup. Rename iRedMail.key to iRedMail.key.bak
ln -s /etc/letsencrypt/live/mail.example.my.id/fullchain.pem /etc/pki/tls/certs/iRedMail.crt
ln -s /etc/letsencrypt/live/mail.example.my.id/privkey.pem /etc/pki/tls/private/iRedMail.key
```

- Terakhir restart service-service yang menggunakan SSL

```bash
systemctl restart postfix
systemctl restart dovecot
systemctl restart nginx
```

- Coba akses, pastikan sertifikat-nya valid, bisa juga cek dengan tools dari https://www.ssllabs.com/ssltest/analyze.html

![](https://res.cloudinary.com/kudaliar032/image/upload/v1611402435/aditaja-blog/posts/2021-01-23-deploy-mail-server-dengan-iredmail-pada-centos-8/lOQWZ8U_u4ksst.webp)

![](https://res.cloudinary.com/kudaliar032/image/upload/v1611402434/aditaja-blog/posts/2021-01-23-deploy-mail-server-dengan-iredmail-pada-centos-8/eoL41R1_ypvf1d.webp)

## Email Client

Selanjutnya adalah beberapa cara yang dapat digunakan untuk berkirim dan menerima email dengan mail server yang baru saja dibuat

### Menggunakan Webmail

Untuk menggunakan webmail, cukup mudah kita hanya perlu mengakses domain dari mail server menggunakan browser, misalkan domainya `mail.example.my.id` maka untuk mengakses webmail dapat menggunakan tautan `https://mail.example.my.id/mail`. Akan keluar form login

![](https://res.cloudinary.com/kudaliar032/image/upload/v1611404059/aditaja-blog/posts/2021-01-23-deploy-mail-server-dengan-iredmail-pada-centos-8/B9DcNAv_d4op2b.webp)

masukan kredensial dan klik `Login`

![](https://res.cloudinary.com/kudaliar032/image/upload/v1611402435/aditaja-blog/posts/2021-01-23-deploy-mail-server-dengan-iredmail-pada-centos-8/ZQY3h1Z_kh4h6o.webp)

untuk penggunaanya bisa di googling saja, mirip-mirip lah sama kalau kita pakai Gmail.

### Menggunakan Thunderbird

Kita juga dapat menggunakan mail server kita dari Thunderbird, untuk konfigurasinya kurang lebih sama kalau mau menghubungkan dengan mail server pada umumnya.

- Buka aplikasi thunderbird
- Cari menu `New` > `Existing Mail Account...`

![](https://res.cloudinary.com/kudaliar032/image/upload/v1611403983/aditaja-blog/posts/2021-01-23-deploy-mail-server-dengan-iredmail-pada-centos-8/zIbPV3n_u9sp3p.webp)

- Isi form yang diminta, seperti Nama, Email Address, dan Password. Kemudian klik `Configure manually...`
- Isi kira-kira seperti berikut, nanti tinggal sesuaikan dengan hostname saat menginstall mail server dan alamat email yang digunakan. Kemudian klik `Re-test`

![](https://res.cloudinary.com/kudaliar032/image/upload/v1611402437/aditaja-blog/posts/2021-01-23-deploy-mail-server-dengan-iredmail-pada-centos-8/bXftAc7_oulv4l.webp)

- Setelah klik `Done`, maka akan masuk kedalam akun email anda. Silahkan dijelajahi lebih lanjut.

![](https://res.cloudinary.com/kudaliar032/image/upload/v1611402437/aditaja-blog/posts/2021-01-23-deploy-mail-server-dengan-iredmail-pada-centos-8/J9VLNYl_e8yvqk.webp)

**Selesai**, mungkin sampai sini saja catatan saya kali ini, apabila ada yang tersesat kedalam tulisan ini dan membaca hingga kalimat ini. Terima kasih anda luar biasa. :grin:

## Sumber Refrensi

- https://www.iredmail.org
- https://docs.iredmail.org/install.iredmail.on.rhel.html
- https://docs.iredmail.org/setup.dns.html
- https://docs.iredmail.org/use.a.bought.ssl.certificate.html#request-a-free-cert-from-lets-encrypt
- https://docs.iredmail.org/configure.thunderbird.html
