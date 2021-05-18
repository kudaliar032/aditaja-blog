---
title: Membuat OpenVPN Server Menggunakan Docker + 2FA Google Authenticator
date: "2020-12-26"
tags:
- docker
- linux
- server
---

![Membuat OpenVPN Server Menggunakan Docker + 2FA Google Authenticator](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/headers/2020-12-26-membuat-openvpn-server-menggunakan-docker_wh2ilu.webp)

Hallo, jadi ceritanya beberapa lalu saya dapat permintaan untuk melakukan deployment server. Dimana untuk keamannya diminta untuk mempersiapkan VPN yang digunakan saat hendak mengakses server-server yang ada, dan server-server tersebut hanya bisa diakses menggunakan VPN tersebut jadi harapannya lebih aman. Ini openingnya kok aneh ya, wkwkwkk.

<!-- truncate -->

Saya menggunakan OpenVPN dikarenakan open source, mudah implementasinya, dan fiturnya yang banyak. Nah, beberapa hal yang perlu disiapkan sebelum memulai semuanya adalah:

## Prasyarat

1. [Docker engine](https://docs.docker.com/engine/install/)
2. [Docker compose](https://docs.docker.com/compose/install/)

Oh iya, disini saya pakai docker image yang sudah dibuat orang, jadi tinggal pakai saja. Untuk repo githubnya ada di [kylemanna/docker-openvpn](https://github.com/kylemanna/docker-openvpn) dan untuk tautan docker hubnya ada di [kylemanna/openvpn](https://hub.docker.com/r/kylemanna/openvpn/).

## Menjalankan OpenVPN Server Menggunakan Docker Compose

### Konfigurasi server

Siapkan file `docker-compose.yml`-nya. Yang saya gunakan isinya seperti berikut

```yaml title="docker-compose.yml"
version: "3.5"
services:
  openvpn:
    cap_add:
      - NET_ADMIN
    image: kylemanna/openvpn
    container_name: openvpn
    hostname: openvpn
    ports:
      - "1194:1194/udp"
    restart: always
    volumes:
      - ./conf:/etc/openvpn
```

Lakukan generate konfigurasi openvpn dan buat sertifikat-sertifikat, ajaibnya pada image ini semuanya sudah disiapkan, jadi kita tinggal mengeksekusi command saja.

```bash
## generate konfigurasi
docker-compose run --rm openvpn ovpn_genconfig -u udp://SERVER-ADDR

## inisialisasi sertifikat-sertifikat
docker-compose run --rm openvpn ovpn_initpki
```

Jika hanya menggunakan parameter `-u`, secara default server akan berjalan menggunakan port `1194` dengan protokol `udp` dengan alamat server sesuai dengan nilai `SERVER-ADDR` yang dimasukan. Bisa berupa IP atau Domain. Defaultnya network yang digunakan adalah `192.168.255.0/24`. Kemudian saat melakukan inisialisasi sertifikat akan diminta untuk memasukan passphrase untuk sertifikat. Silahkan masukan serumit mungkin.

Atur hak akses untuk file konfigurasi, ini akan berguna nantinya jika kita ingin menlakukan backup menggunakan script yang telah disiapkan pada docker image.

```bash
sudo chown -R $(whoami): ./conf
```

Jalankan OpenVPN Server-nya

```bash
docker-compose up -d
```

### Membuat user/client

Setelah server selesai dipersiapkan, berikutnya adalah membuat user/client yang akan digunakan nantinya. Yang pertama perlu dilakukan adalah mengenerate sertifikat client. Menggunakan perintah berikut


```bash
## generate sertifikat dengan passphrase
docker-compose run --rm openvpn easyrsa build-client-full aditya

## generate sertifikat tanpa passphrase
docker-compose run --rm openvpn easyrsa build-client-full aditya nopass
```

Jika sertifikat berhasil dibuat, berikutnya generate file konfigurasi `.ovpn` untuk client, agar memudahkan saat penggunaannya.

```bash
docker-compose run --rm openvpn ovpn_getclient aditya > aditya.ovpn
```

Tinggal download file konfigurasi-nya `aditya.ovpn`, import dan hubungkan dari sisi client. Gunakan langkah ini setiap hendak mengenerate user/client baru.

## Mengaktifkan 2FA pada Server

Untuk meningkatkan keamanan, kita bisa mengaktifkan 2FA pada server OpenVPN kita, sehingga setiap kali user hendak terhubung dengan server maka perlu memasukan kode OTP yang dihasilkan oleh aplikasi OTP generator alih-alih menggunakan password yang tetap. Disini akan menggunakan [Google Authenticator](https://en.wikipedia.org/wiki/Google_Authenticator) untuk pengguna [iOS](https://apps.apple.com/us/app/google-authenticator/id388497605) dan untuk pengguna [Android](https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=en). Untuk penggunaannya kita bisa melanjutkan dari konfigurasi sebelumnya, dimana kita hanya perlu mengenerate ulang konfigurasi untuk server dan client jika sudah ada.

Jika hendak menggunakan OTP disarankan untuk mengubah [chiper](https://community.openvpn.net/openvpn/wiki/SWEET32) defaultnya, dikarenakan semenjak [OpenVPN 2.3.13](https://community.openvpn.net/openvpn/wiki/ChangesInOpenvpn23#OpenVPN2.3.13) chiper default yang digunakan oleh OpenVPN adalah `BF-CBC` yang akan melakukan renegosiasi apabila data sudah sampai `64 MB`, hal tersebut akan mengganggu sekali apabila kita menggunakan OTP untuk loginnya. Untuk mengenerate konfigurasinya, gunakan perintah berikut

```bash
docker-composer run --rm openvpn ovpn_genconfig -u udp://SERVER-ADDR -2 -C AES-256-GCM
```

Setelah itu restart dengan perintah

```bash
docker-compose restart openvpn
```

Next, untuk client kita perlu mengenerate Google Authenticator-nya untuk masing-masing user. Gunakan command berikut

```bash
docker-compose run --rm openvpn ovpn_otp_user aditya
```

Nantinya akan muncul QR Code yang dapat discan menggunakan Google Authenticator dan emergency code untuk akun yang digenerate. Silahkan scan QR Code tersebut dan simpan emergency code dengan baik. Contohnya seperti ini

![](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/posts/2020-12-26-membuat-openvpn-server-menggunakan-docker/gnome-shell-screenshot-AI8JW0_egpvji.webp)

:::danger Perhatian
Harap amankan QR Code, URL QR Code, dan Emergency Code untuk anda sendiri
:::

:::danger Perhatian
Generate ulang setiap file konfigurasi milik user yang telah terdaftar dikarenakan ada perubahan chiper dan mengaktifkan user login, bisa juga dilakukan dengan mengubah manual dari sisi user. Pilihlah cara yang menurut anda mudah
:::

Generate ulang konfigurasi client yang telah dibuat sebelumnya, dikarenakan ada beberapa perubahan yang telah kita lakukan. Gunakan perintah

```bash
docker-compose run --rm openvpn ovpn_getclient aditya > aditya.ovpn
```

Download, dan jalankan pada client. Jangan lupa untuk mengset username dan password di set agar ditanya setiap login.

## (BONUS) - Menghubungkan OpenVPN pada Fedora 33

Buka menu `Settings` > `Netowork` > `VPN` > `+`

![](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/posts/2020-12-26-membuat-openvpn-server-menggunakan-docker/fedora-33-ovpn-1_ltrxqx.webp)

Klik `Import from file...` dan cari file `.ovpn` yang telah diunduh sebelumnya. Isikan `User name` dengan username yang digunakan, `Password` ubah menjadi `Ask for this password every time`, dan `User key password` dengan passphrase yang digunakan saat mengenerate sertifikat client.

![](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/posts/2020-12-26-membuat-openvpn-server-menggunakan-docker/fedora-33-ovpn-2_mxtubf.webp)

Hubungkan VPN, nantinya akan dimintai password, silahkan masukan 6 digit angka yang dihasilkan oleh Google Authenticator.

![](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/posts/2020-12-26-membuat-openvpn-server-menggunakan-docker/Screenshot_from_2020-12-26_21-50-42_be9ikx.webp)

Sampai sini dulu, terima kasih untuk kalian-kalian yang telah membaca catatan saya ini.

## Refrensi

- https://github.com/kylemanna/docker-openvpn
- https://github.com/kylemanna/docker-openvpn/blob/master/docs/otp.md
