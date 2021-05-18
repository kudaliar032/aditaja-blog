---
title: GitLab ChatOps
date: "2020-09-18"
tags:
- gitlab
- chatops
- cicd
- devops
---

![GitLab ChatOps](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/headers/6M1LQzG_joykbs.webp)

Hallo, saya ingin membagikan sesuatu yang baru saja saya coba pelajari yaitu GitLab ChatOps. Sebelumnya ChatOps itu apa sih? Menurut dari beberapa artikel di internet yang saya baca. Yang kemudian coba saya simpulkan, ChatOps merupakan.

<!--truncate-->

> Model kolaborasi yang dapat menghubungkan orang, alat, proses, dan otomatisasi, ke dalam alur kerja yang transparan yaitu obrolan/chat

Dengan adanya model ChatOps ini kita dapat menjadikan alur kerja lebih terpusat dan lebih efektif dengan mengandalkan aplikasi obrolan populer seperti Slack, Telegram, HipChat, Mattermost, dan sebagainya. Selain itu, kita juga dapat membangun ruang chat kita sendiri menggunakan aplikasi sumber terbuka seperti Hubot, Lita, dan Err.

Untuk mendukung perkembangan model ChatOps tersebut maka GitLab juga mengeluarkan fiturnya sendiri yang bisa kita gunakan. Fitur tersebut bernama GitLab ChatOps, GitLab ChatOps sebelumnya adalah salah satu fitur dari GitLab Ultimate, namun semenjak [GitLab versi 11.9 dibuka untuk umum](https://about.gitlab.com/blog/2018/12/24/gitlab-chatops-will-become-available-to-everyone/).

Dengan menggunakan GitLab ChatOps kita dapat melakukan interaksi dengan GitLab CI/CD menggunakan layanan obrolan seperti Slack. Sehingga kita dapat mengerjakan pekerjaan operation kita melalui obrolan tersebut, seperti melakukan release, deploy, monitoring, dan sebagainya.

## Bagaimana GitLab ChatOps Bekerja

Perlu diketahui bahwa GitLab ChatOps sendiri dibangun menggunakan [GitLab CI/CD](https://docs.gitlab.com/ee/ci/) dan [Slack Slash Commands](https://docs.gitlab.com/ee/user/project/integrations/slack_slash_commands.html). GitLab ChatOps menyediakan perintah `run` pada slack slash command dengan dua buah argumen, yaitu

* `<job name>` yang akan dijalankan
* `<job argumen>` yang akan dikirimkan ke job

Saat GitLab ChatOps dijalankan maka GitLab akan mengirimkan dua buah variabel baru yang dapat digunakan, yaitu

* `CHAT_INPUT` yang berisikan `<job argumen>`
* `CHAT_CHANNEL` yang berisikan nama channel slack yang digunakan untuk trigger action tersebut

Apabila job dieksekusi maka ChatOps akan mencari nama job yang sesuai dari konfigurasi CI/CD di file `.gitlab-ci.yml` yang berada di branch `master`. Saat ditemukan maka job tersebut akan dijalankan sebagai job pipeline. Setelah job selesai dijalankan maka GitLab ChatOps akan

* Mengirimkan job output ke Slack jika job selesai dalam waktu `kurang dari 30 menit`
* Apabila `lebih dari 30 menit` job memerlukan Slack API untuk mengirimkan datanya ke channel slack

Pengguna wajib memiliki hak akses `Developer` atau lebih apabila ingin menjalankan perintah ChatOps dari Slack, dan job yang akan dijalankan tidak memiliki konfigurasi `except: [chat]`

## Kelebihan dan Kekurangan GitLab ChatOps

Tentunya GitLab ChatOps memiliki kelebihan dan kekurangan, berikut ini beberapa kelebihan dan kekurangan dari GitLab ChatOps menurut saya pribadi.

### Kelebihan GitLab ChatOps
1. Dapat diintegrasikan dengan baik dengan layanan-layanan GitLab lainnya
2. Penggunaan dari GitLab ChatOps sangat mudah
3. Digunakan oleh GitLab pada production

### Kekurangan GitLab ChatOps
1. Layanan obrolan yang didukung baru Slack dan Mattermost
2. Masih terdapat keterbatasan perintah

## Kapan Menggunakan GitLab ChatOps
Saat hendak menerapkan model ChatOps pada pekerjaan kita, menurut saya berikut adalah beberapa poin yang dapat dijadikan pertimbangan untuk memilih GitLab ChatOps

1. Pekerjaan yang kita kerjakan telah terpusat dalam satu layanan chat yaitu Slack atau Mattermost
2. Sudah menggunakan layanan-layanan GitLab
3. Ingin menggunakan ChatOps yang simple pada saat implementasinya
4. Ingin menggunakan tools ChatOps yang open source

## Contoh Penggunaan GitLab ChatOps

Disini akan dicontohkan penerapan GitLab ChatOps menggunakan layanan obrolan Slack dan GitLab.com, pada contoh ini akan menggunakan aplikasi flutter sederhana, dapat dilihat disini [https://gitlab.com/kudaliar032/flutter-get-started](https://gitlab.com/kudaliar032/flutter-get-started "https://gitlab.com/kudaliar032/flutter-get-started").

### Kodingan

Saat ini pada kodingan saya belum terdapat file `.gitlab-ci.yml` sehingga kita perlu menambahkannya, bagaimana membuat konfigurasi GitLab CI/CD secara mendetail tidak akan dibahas di postingan ini, disini kita akan berfokus pada integrasi ChatOps nya saja. Saat ini kondisi kodingan milik saya seperti berikut

![](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/posts/2020-09-18-gitlab-chatops/BIkSHoNiPOU9hOVkN-DgI7sPAPdGUu-GembAEOejUPgg5FfWb5oQcQV8lAOqdAn1gGhkeyi8wm7FXv5dare_WVIFaAucKv7LyKyBleM0FxcugzS8dHJNBsnvXakq_0m8vi1EqadM_siuoh5.webp)

sehingga kita perlu menambahkan sebuah file `.gitlab-ci.yml` yang berisikan konfigurasi untuk menjalankan GitLab CI/CD seperti berikut ini

```yaml
build:apk:
  image: kudaliar032/flutter:28
  only: [chat]
  variables:
    PUB_CACHE: $CI_PROJECT_DIR/.pub-cache
    GRADLE_USER_HOME: $CI_PROJECT_DIR/android/.gradle
  cache:
    paths:
      - .dart_tool
      - .pub-cache
      - build
      - android/.gradle
  artifacts:
    paths:
      - build/app/outputs/apk/release
  before_script:
    - cp $ANDROID_KEY_PROPERTIES $CI_PROJECT_DIR/android/key.properties
  script:
    - flutter pub upgrade
    - flutter build apk
    - export APK_FILE=`find build/app/outputs/apk/release -type f -name "*.apk"`
    - export DOWNLOAD_URL=$CI_PROJECT_URL/-/jobs/artifacts/$CI_COMMIT_BRANCH/raw/$APK_FILE?job=$CI_JOB_NAME
    - echo -e "section_start:`date +%s`:chat_reply\r\e[0K\nDownload APK build job <$CI_JOB_URL|#$CI_JOB_ID> from <$DOWNLOAD_URL|here>\nsection_end:`date +%s`:chat_reply\r\e[0K"
  tags:
    - docker
```

Pada konfigurasi GitLab CI/CD di atas, yang terpenting agar dapat dieksekusi oleh GitLab ChatOps adalah keberadaan kondisi only yang memuat chat, yang dapat diartikan bahwa job tersebut hanya akan dieksekusi oleh GitLab ChatOps. Kalau konfigurasi GitLab CI/CD yang lain tinggal menyesuaikan dengan apa yang hendak dilakukan pada job tersebut.

Selain itu pada bagian script juga terdapat echo yang berisikan [section](https://docs.gitlab.com/ee/ci/pipelines/index.html#custom-collapsible-sections) untuk menentukan pesan apa yang akan dikirimkan atau menjadi balasan dari GitLab di ruang obrolan. Pada contoh tersebut nantinya job akan mengirimkan pesan yang kurang lebih seperti berikut ini `Download APK build job #745220970 from here`. Untuk formatting chat secara lengkap terdapat pada dokumentasi [Formatting text](https://api.slack.com/reference/surfaces/formatting).

### Integrasi GitLab dan Slack

Agar kita dapat mengirimkan perintah dari Slack menuju repository GitLab maka kita perlu untuk menghubungkan GitLab kita dengan Slack. Langkah-langkah untuk menghubungkannya adalah sebagai berikut

Pada project yang ingin dihubungkan, pilih `Settings` > `Integrations` > `Slack application`

![](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/posts/2020-09-18-gitlab-chatops/47NtSrnw67UkcxB5BYx5XIY85fw8Q2SyLuaVwHCPist-4h3aCq1GdBatlLGfczFYi0u24VRBLHDvK-FqagDoLsbeMl5FELgDDFpdxLPJnlyr09Q6r1ZBE9hV8HDQ9QbuSHzAtWLg_xkmz2m.webp)

akan tampil seperti gambar berikutnya, maka pilihlah `Add to Slack`

![](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/posts/2020-09-18-gitlab-chatops/6QplBBs_omr0IVm16uAlhMzcyVC3h1WVPow4QA06gHW-NRYIj8NiTfrOEtPd7mr7uQmlhT0JtajclUXMNcOIxPuxJKqlIubXiaWOsrYTsgeJNcsUHyT--lr3u2jcbRu71Uslil3D_pq4hbn.webp)

allow permintaan permission dari GitLab untuk mengakses workspace slack yang akan digunakan.

![](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/posts/2020-09-18-gitlab-chatops/PkQpsNmIpU6PdpatAKCrDqK4r1yhb68-uCNh_AY2jgHevZHNCX2LuhgCoBXuH7n7S3qR72CMz4C05cWRK1TLHDGcbCoqpiVXuVvc5s5NdukED68Rwo4o9hK80nVFuqIWRlCcJNYK_hgrdk3.webp)

apabila sudah menampilkan seperti gambar berikut ini, berarti slack dan gitlab telah berhasil dihubungkan, kita dalam memodifikasi `Project alias` untuk memperpendek perintah nantinya, apabila Project aliasnya seperti dibawah ini, maka nantinya kita menggunakan perintah `/gitlab kudaliar032/flutter-get-started run <job name> <job argument>`

![](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/posts/2020-09-18-gitlab-chatops/3KBI7DCohIvVYIcMN96LllLUAkuEUtHB1TSil2jtgyxElu_JVIQ5Pl9bRdD16mYrylGAAhjn9nxzzFzzJJIBrJjkiuvaLRX8Zntr94Kif77e7BiMRHcyOVKt3bfMP_zU_FyhJrKJ_lwul5h.webp)

kemudian coba buka atau buat channel baru di Workspace Slack

![](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/posts/2020-09-18-gitlab-chatops/4KeSqMKHrMa53Ss3qcU-0xE3Wg3Be8BOvzNGk1UH1M9JVnWrNqaVqvpdn7s7uBcMEJLRFZ4cP5VZ9s8IlWEvB9hR7PlptnC6f6l9oXwGtbRiPYD7sEhsJmCAQ6q7sTKupy2BmbGF_zvi7hb.webp)

coba untuk berinteraksi dengan GitLab dengan mengirimkan pesan `/gitlab kudaliar032/flutter-get-started help`, maka GitLab akan membalasnya seperti berikut ini

![](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/posts/2020-09-18-gitlab-chatops/Qxx5cZd_7XdGEPQLucPYTzqnHTQGES3JZR3ftEJgSYienWwOIBJfuAqrrGV5NIGZcpLkIVT1VYZ81DEFlsAaUEZ0gmDKZJXC9t0jResuq1YUqyGiy7Ym2sGHv6x0HmhrXWK173v9_s7ushk.webp)

hal tersebut menandakan bahwa GitLab ChatOps siap untuk digunakan.

### Cara Pakai

Untuk penggunaannya sendiri sangat mudah, kita tinggal mengirimkan perintah ChatOps yang telah kita atur, dengan format `/gitlab <Project alias> run <job name> <job atribut>`, misalnya kita ingin menjalankan job yang telah kita buat sebelumnya, seperti berikut

![](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/posts/2020-09-18-gitlab-chatops/2GRqhl59wZppTZcAjB89W5EdTLDgBZ4OYYBIN8eXFcJGZZNW9pu_RuCsobZ3HObOeVhpQ6dZ2fxPwQpiWCv7WoyvoQxICv0ZrugdSWMOGlo_fT2UlclSu6QxIyk3fSxZhNxnOO6U_m2yh1w.webp)

Jika job telah selesai, maka GitLab akan mengirimkan pesan sesuai dengan yang telah kita tentukan sebelumnya. Tinggal modifikasi sesuai selera.

## Kesimpulan

ChatOps adalah salah satu model kolaborasi project yang memanfaatkan layanan obrolan baik yang sudah ada seperti Telegram, Slack, Mattermost, ataupun lainnya, maupun layanan obrolan yang dikhususkan untuk ChatOps seperti Hubot, Lita, Err dan lainnya. Dengan menggunakan ChatOps kita dapat memusatkan kolaborasi di satu tempat seperti melakukan deployment, release, dan monitoring.

Salah satu layanan ChatOps adalah GitLab ChatOps dimana untuk penggunaannya sangat mudah, kita hanya perlu menghubungkan GitLab dengan Slack, kemudian membuat job khusus untuk dijalankan oleh Slack. Dan kita hanya perlu mengirimkan perintah dengan format tertentu untuk menjalankan job tersebut di dalam ruang obrolan. Apabila job selesai dijalankan maka hasil dari job tersebut dapat dikirimkan kembali ke obrolan tempat menjalankan perintah tersebut.

Cukup sekian tulisan ini, `terima kasih` telah menyempatkan untuk membaca, `semoga bermanfaat`. See u...

## Video Demonstrasi

{{< youtube q5NqCXOnqBo >}}
