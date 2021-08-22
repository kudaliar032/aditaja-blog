---
title: "Deploy Dockerfile di OpenShift"
date: 2021-08-21T19:08:58+08:00
draft: false
toc: false
backtotop: true
tags:
- openshift
- kubernetes
- docker
images:
- "https://imgur.com/NEn6DW6.jpg"
---

Hallo semuanya, halo-halo. Kebetulan akhir-akhir ini saya lagi mainan openshift karena baru saja ikutan eventnya kominfo yaitu [Digital Talent Scholarship](https://digitalent.kominfo.go.id/) yang mana disitu saya ambil pelatihan untuk OpenShift dan Kubernetes nah, supaya ada juga menempel coba saya buat catatannya. Di sini saya akan tulis hal yang simple saja ya enggak usah aneh-aneh, cukup gimana sih cara deploy aplikasi di OpenShift? Oh iya, sebelumnya mungkin jika teman-teman tertarik ikutan eventnya bisa coba aja akses link yang saya tempel dicatatan ini setahu saya setiap tahun ada event itu dan materinya sangat menarik semua ya. Jadi jangan sia-siakan kesempatan belajar yang dikasih sama pemerintah ini :grin: :grin: :grin:.

Sebenarnya untuk deploy aplikasi di OpenShift sendiri ada banyak metode ya, salah satunya pakai tools S2I, dari Dockerfile, dan dari Docker image. Kali ini saya coba tulis yang pakai Dockerfile saja deh, nanti coba saya kasih contoh yang dari Web Console sama dari CLI-nya. Pembukaan yang panjang sekali.

## Lingkungan Lab

- OpenShift, jika mau jalankan di komputer local bisa menggunakan [CodeReady Container](https://developers.redhat.com/products/codeready-containers/getting-started) atau pakai Sandbox yang disediakan Red Hat yaitu [Developer Sandbox for Red Hat OpenShift](https://developers.redhat.com/developer-sandbox)
- Laptop yang sudah terinstall [OpenShift CLI](https://docs.openshift.com/container-platform/4.8/cli_reference/openshift_cli/getting-started-cli.html)

## Cara Deploy

Untuk lab ini saya akan menggunakan aplikasi berikut untuk di deploy https://github.com/kudaliar032/nextjs-with-docker. Disana sudah tersedia `Dockerfile` yang tinggal digunakan, jika anda memiliki aplikasi lain bisa dicoba juga. Pastikan untuk aplikasi sudah di upload ke git sebenarnya bisa juga sih tanpa melalui git tapi caranya sedikit berbeda dan tidak akan dibahas pada catatan kali ini.

### Menggunakan Web Console

- Login ke Web Console, silahkan buat project dan pilih project tesebut.

![](https://imgur.com/MN65yd4.jpg)

- Untuk mendeploy aplikasi pindah ke mode `Developer`, pilih menu `Topology`, dan pilih `From Dockerfile`

![](https://imgur.com/VaS6NKY.jpg)

- Setelah itu terdapat inputan untuk mengisi detail aplikasi yang akan di deploy. Isikan kira-kira seperti berikut

Name | Value
--- | ---
Git Repo URL | https://github.com/kudaliar032/nextjs-with-docker
Application name | Biarkan saja default atau ganti sesuai selera
Name | Biarkan saja default atau ganti sesuai selera

- Untuk resource type pilih yang `DeploymentConfig` saja, dan jangan hilangkan centang pada `Create a Route to the Application` agar aplikasi dapat diakses secara public. Sisanya default saja

![](https://imgur.com/0Ow9rCA.jpg)

![](https://imgur.com/k27AO1E.jpg)

- Setelah dirasa semuanya OK tinggal klik `Create`. Nanti anda akan diredirect ke menu `Topology` untuk menlihat aplikasi yang di deploy dan tunggu beberapa saat hingga semuanya selesai

![](https://imgur.com/ZQgdQxc.jpg)

- Setelah menunggu beberapa saat nantinya deployment akan berjalan yang ditandai dengan adanya tanda conteng selesai pada build, dan terdapat lingkaran biru yang menandakan deployment sudah selesai

![](https://imgur.com/ZSJlBFH.jpg)

- Karena kita tadi juga sekalian buat routenya maka kita bisa mengaksesnya dengan menekan tombol dengan simbol pana, pada gambar sebelumnya yang nomor 3. Jika everything oke seharusnya muncul seperti berikut

![](https://imgur.com/34rqO8Z.jpg)

- Mendeploy dengan web consolepun telah selesai.

### Menggunakan OpenShift CLI

- Loginkan OpenShift CLI di komputer anda, misalkan dengan perintah berikut

```bash
oc login --token=sha256~token --server=https://api.sandbox-m2.ll9k.p1.openshiftapps.com:6443
```

- Selanjutkan jalankan perintah berikut untuk mendeploy aplikasi

```bash
oc new-app --as-deployment-config --strategy docker --name nextjs-with-docker https://github.com/kudaliar032/nextjs-with-docker
```
- Gunakan perintah `oc get pods -w` untuk memantau deployment, dan mastikan nanti semuanya selesai dengan baik. Yang sudah selesai terdeploy kira-kira seperti berikut ini

![](https://imgur.com/e6bKtvO.jpg)

- Jika kita menggunakan CLI aplikasi yang dideploy belum di expose sehingga masih belum bisa diakses dari luar cluster openshift, gunakan perintah berikut untuk mengekspose servicenya. Gunakan `oc get svc` untuk menampilkan nama servicenya

```bash
oc get svc
oc expose svc/nextjs-with-docker
```

- Untuk mendapatkan URLnya gunakan perintah berikut

```bash
oc get routes
```

- Silahkan ambil tautan yang ditampilkan dan coba diakses

![](https://imgur.com/GfDeZE1.jpg)

- Kira-kira akan tampil seperti berikut ini

![](https://imgur.com/OKadFyA.jpg)

Selesai sudah semua, mudah bukan untuk mendeploy aplikasi di OpenShift ya karena memang salah satu tujuan OpenShift yaitu memudahkan kita untuk mendeploy aplikasi menggunakan Kubernetes. Mungkin sampai sini saja catatan kali ini semoga bermanfaat untuk kita semua. Terima kasih :pray: :pray: :pray:
