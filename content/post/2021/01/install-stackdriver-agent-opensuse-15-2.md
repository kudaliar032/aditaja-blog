---
title: Install Stackdriver Agent pada Sistem Operasi openSUSE 15.2 di Google Cloud Platform
date: 2021-01-20
draft: false
toc: false
backtotop: true
tags:
- linux
- opensuse
- gcp
- monitoring
images:
- https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/headers/stackdriver-agent_onvn68.webp
---

Hallo, jadi beberapa waktu lalu di kantor baru saja melakukan migrasi project di GCP, dimana salah satu server yang digunakan itu menggunakan sistem operasi openSUSE. Nah, masalah muncul waktu mau buat monitoringnya di GCP, dikarenakan openSUSE yang tidak di support secara default maka dari itu waktu mau install monitoring agent-nya tidak bisa jika pakai script bawaannya GCP, akan muncul pesan peringatan sistem operasi tidak support. Kalau enggak install monitoring agent beberapa metrik tidak muncul lagi, seperti penggunaan memory dan penggunaan disk.

![](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/posts/2021-01-20-install-stackdriver-agent-opensuse-15-2/opensuse-no-metrik_cywboa.webp)

Setelah merenung beberapa waktu, akhirnya coba deh buka script installernya yang di download di [sini](https://dl.google.com/cloudagents/add-monitoring-agent-repo.sh). Dan, sepertinya bisa ini tambah manual repositorynya. Kemudian dicoba dannn ternya bisa. Gimana caranya? begini. Oh iya, perlu di ingat ini bukan official yak jadi mungkin saja ada issue yang bakal ditimbulkan, jadi tidak disarankan dipakai di lingkungan `production`. Kalau diproduction pakai [SLES](https://www.suse.com/products/server/) lah :grin: sudah support dengan monitoring agent. Mungkin bacotan tidak jelasnya begitu saja. Kalau mau skip bacotannya bisa klik [ini](#langkah-langkah)

## Langkah-langkah

- Login ke instance, kemudian masuk sebagai `root`. Bebas sih, mau menjadi kaum `sudo` juga boleh
- Kemudian tambahkan repository untuk monitoring agentnya, kalau di opensuse itu bisa taro file didalam directory `/etc/zypp/repos.d/`

```bash
cat > /etc/zypp/repos.d/google-cloud-monitoring.repo <<EOM
[google-cloud-monitoring]
name=Google Cloud Monitoring Agent Repository
baseurl=https://packages.cloud.google.com/yum/repos/google-cloud-monitoring-sles15-x86_64-all
enabled=1
gpgcheck=1
repo_gpgcheck=1
gpgkey=https://packages.cloud.google.com/yum/doc/yum-key.gpg
       https://packages.cloud.google.com/yum/doc/rpm-package-key.gpg
EOM
```

- Karena disini saya pakai `openSUSE Leap 15.2` makadari itu saya ambil repository-nya dari yang versi SLES 15
- Update repository dengan perintah `zypper refresh`. Jika ada pilihan masukan saja `yes` dan sejenis lah

![](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/posts/2021-01-20-install-stackdriver-agent-opensuse-15-2/jGuYCrU_vm0ylg.webp)

- Coba pastikan dulu apakah paket-nya sudah masuk. Gunakan perintah `zypper search stackdriver-agent`. Kalau benar, nanti muncul output yang menyatakan bahwa packagenya ditemukan

![](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/posts/2021-01-20-install-stackdriver-agent-opensuse-15-2/Qd6wK0A_zl0rxa.webp)

- Setelah itu install dek `stackdriver-agent`-nya

```bash
zypper install stackdriver-agent
```

- Setelah diinstall, jalankan service `stackdriver-agent` dari systemd dan, jangan lupa set agar dijalankan saat startup

```bash
systemctl start stackdriver-agent
systemctl enable stackdriver-agent
```

- Cek dengan `systemctl status stackdriver-agent` dan pastikan service-nya berjalan

![](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/posts/2021-01-20-install-stackdriver-agent-opensuse-15-2/HZPWArQ_godokk.webp)

- Selesai, setelah itu coba tunggu beberapa saat sampai metrik-nya muncul di GCP

![](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/posts/2021-01-20-install-stackdriver-agent-opensuse-15-2/JqogUWC_uau4kr.webp)

- Disini juga sudah terdeteksi terinstall monitoring agent-nya

![](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/posts/2021-01-20-install-stackdriver-agent-opensuse-15-2/CSlB6sj_rd2zgp.webp)

Okee, mungkin itu saja bacotan saya kali ini. Semoga bermanfaat, see u :blush:

## Refrensi

- https://cloud.google.com/monitoring/agent/installation#joint-install
- https://sakananote2.blogspot.com/2020/12/stackdriver-agent-with-opensuse-leap.html (ternyata sudah ada yg buat)
