---
title: "Coba Deploy Gitpod Self-Hosted Dengan K3s"
date: 2021-07-08T10:43:18+08:00
draft: false
toc: false
backtotop: true
tags:
- "gitpod"
- "code"
images:
- "https://imgur.com/zIwUV2s.jpg"
---

Hallo semuanya, setelah kemaren menulis tentang [ngoding di mana saja dengan gitpod]({{< ref "./ngoding-di-mana-saja-pakai-gitpod.md" >}}), di mana pada postingan tersebut saya menggunakan layanan SaaS dari Gitpod yang tinggal daftar dan koding. Kali ini saya mencoba mendeploy Gitpod pada server milik kita atau biasa disebut Self-Hosted. Nantinya kita akan mendeploy gitpodnya di Kubernetes Cluster menggunakan bantuan dari Helm yang telah disediakan oleh gitpod itu sendiri. Untuk kubernetes clusternya sendiri saya buat menggunakan bantuan dari [K3s](https://k3s.io/). Kenapa? Karena menurut [dokumentasi](https://www.notion.so/1b9eac5cb33d42e391f86a87f0e37836?v=4f2ec7c943514ee19203b9d4fe096094) yang diberikan oleh gitpod, pada saat ini platform yang sudah terbukti dan support dengan gitpod itu baru kubernetes cluster yang dibuat menggunakan GKE dan K3s. Selain itu tidak support dan belum terbukti. Ya karena kebetulan saya cuma punya 1 VPS buat mainan dan tidak memungkinkan menggunakan GKE akhirnya saya memutuskan untuk menggunakan K3s untuk membuat clusternya. Oke langsung saja jangan banyak bacot. Beginilah langkah-langkah yang saya gunakan saat mendeploy gitpod self-hosted. Disini saya akan mencoba untuk mendeploy dari VM kosongan yak.

## Lingkungan Lab

- VPS (4 vCPU, 8 GB RAM, 200 GB SSD)
- Sistem Operasi Ubuntu 18.04 LTS (Kernel 5.4^)

Untuk lingkungan lab pastikan versi-versinya sesuai dengan yang dituliskan pada dokumen yang diberikan oleh gitpod, jika tidak akan terjadi kegagalan.

## Step Deployment

### Upgrade Kernel

Karena pada OS ubuntu saya dia menggunakan kernel `4.15.x` sehingga saya perlu upgrade dulu versi kernelnya menjadi `5.4.x` untuk langkahnya sendiri ada menggunakan perintah berikut ini

```bash
sudo apt-get install --install-recommends linux-generic-hwe-18.04 xserver-xorg-hwe-18.04
```

tunggu beberapa saat hingga pemasangan selesai dan reboot server, berhati-hatilah karena langkah ini memungkinakan server gagal

### Membuat Kubernetes Cluster

- Setelah selesai upgrade kernel. Selanjutnya kita login lagi kedalam server `ssh [user]@[ip/hostname]` setelah direboot

![](https://imgur.com/DsVFxtL.jpg)

- Install dulu K3s untuk membuat cluster, disini saya pakai kubernetes versi `1.20` sesuai dengan yang diminta pada dokumentasi

```bash
sudo su -
curl -sfL https://get.k3s.io | INSTALL_K3S_VERSION='v1.20.8+k3s1' sh -
```

![](https://imgur.com/dai8YOJ.jpg)

- Setelah itu kita perlu matikan traefik bawaan K3s karena untuk saat ini tidak akan kita gunakan, kita matikan agar tidak mengganggu deployment Gitpod dengan edit konfigurasi systemd milik K3s dengan menambahkan argument `--disable traefik`, kira-kira menjadi seperti ini

```ini
[Unit]
Description=Lightweight Kubernetes
Documentation=https://k3s.io
Wants=network-online.target
After=network-online.target

[Install]
WantedBy=multi-user.target

[Service]
Type=notify
EnvironmentFile=-/etc/default/%N
EnvironmentFile=-/etc/sysconfig/%N
EnvironmentFile=-/etc/systemd/system/k3s.service.env
KillMode=process
Delegate=yes
# Having non-zero Limit*s causes performance problems due to accounting overhead
# in the kernel. We recommend using cgroups to do container-local accounting.
LimitNOFILE=1048576
LimitNPROC=infinity
LimitCORE=infinity
TasksMax=infinity
TimeoutStartSec=0
Restart=always
RestartSec=5s
ExecStartPre=/bin/sh -xc '! /usr/bin/systemctl is-enabled --quiet nm-cloud-setup.service'
ExecStartPre=-/sbin/modprobe br_netfilter
ExecStartPre=-/sbin/modprobe overlay
ExecStart=/usr/local/bin/k3s \
    server \
    --disable traefik \

```

- Setelah disimpan, reload service-servicenya dan juga restart service K3s

```bash
sudo systemctl daemon-reload
sudo systemctl restart k3s
```

- Pastikan bahwa traefik sudah mati dengan menggunakan `kubectl get svc -n kube-system` dan service yang berbau traefik sudah hilang

### Install Helm

- Lanjut kita install helm dulu buat jalankan chart dari gitpodnya
- Download helm dari link ini https://github.com/helm/helm/releases

```bash
curl -O https://get.helm.sh/helm-v3.6.2-linux-amd64.tar.gz
tar xzvf helm-v3.6.2-linux-amd64.tar.gz
sudo mv linux-amd64/helm /usr/local/bin/
```

- Test dengan perintah `helm version`
- Setelah terinstall kita perlu load konfigurasi dari kubernetes hasil K3s agar helmnya bisa digunakan

```bash
ln -s /etc/rancher/k3s/k3s.yaml ~/.kube/config
```

- Test dengan perintah `helm list`, dan pastikan tidak ada kesalahan

### Install Gitpod

- Setelah lingkungan siap, lanjutkan menu utama hari ini yaitu mendeploy gitpodnya
- Pertama-tama kita tambahkan dulu repo helm untuk gitpod

```bash
helm repo add gitpod.io https://charts.gitpod.io
helm repo list
```

- Siapkan values untuk konfigurasi dari gitpod, disini kita wajib mengisikan konfigurasi untuk kredensial RabbitMQ dan koredensial untuk MinIO

```bash
mkdir -p gitpod
cd gitpod
vim values.custom.yaml
```

- Isikan kira-kira seperti ini isi dari file `values.custom.yaml`

```yaml
rabbitmq:
  auth:
    username: bambang
    password: p(4Mun6K4555!
minio:
  accessKey: yourrandomaccesskey
  secretKey: veryrandomstringforthesecret#%
```

- Deploy deh gitpodnya pakai helm

```bash
helm install -f values.custom.yaml gitpod gitpod.io/gitpod --version=0.9.0
```

- Tunggu beberapa saat hingga deployment selesai dan pastikan pod-pod berstatus `RUNNING`

```bash
kubectl get pods
```

![](https://imgur.com/CsmTt8Q.jpg)

- Nah, jika kita perhatikan pada tangkapan layar tersebut ada beberapa pod yang masih berstatus `!RUNNING`
- Maka, mari kita perbaiki

### Troubleshoot Pod Tidak Berjalan

#### Pod `ws-daemon-xxxxx`

Cek dulu errornya kenapa `kubectl describe pod ws-daemon-4h8jc`

![](https://imgur.com/TUuyAE3.jpg)

Kalau pesan errornya seperti itu maka kita perlu memperbaiki hostPath dari container runtimenya dengan menambahkan values di file `values.custom.yaml` dengan path yang benar. Namun, sebelumnya kita perlu cari dulu path yang benar itu dimana dengan perintah `mount | grep rootfs`. Setelah itu liat path yang dimunculkan apa

![](https://imgur.com/rN89vnP.jpg)

Jika sudah dapat selanjutnya tambahkan pada file `values.custom.yaml` menjadi

```yaml
rabbitmq:
  auth:
    username: bambang
    password: p(4Mun6K4555!
minio:
  accessKey: yourrandomaccesskey
  secretKey: veryrandomstringforthesecret#%
components:
  wsDaemon:
    containerRuntime:
      nodeRoots:
      - /run/k3s/containerd/io.containerd.runtime.v2.task/k8s.io
```

Buat revisi bari dihelm dengan perintah

```bash
helm upgrade -f values.custom.yaml gitpod gitpod.io/gitpod --version=0.9.0
```

Tunggu beberapa saat dan cek kembali apakah masih ada stuck, dan ternyata masih ada maka dari itu kita cek lagi apa yang masih salah

![](https://imgur.com/48rfjD7.jpg)

Jika dilihat dari kesalahannya kita perlu mengupdate lokasi dari containerd-socketnya. Dengan cara yang sama yitu menambahkan values di file `values.custom.yaml`. Nah untuk lokasi socketnya bisa dicek menggunakan perintah `crictl info`

![](https://imgur.com/xgomLgk.jpg)

Update filenya lagi menjadi kira-kira seperti berikut ini

```yaml
rabbitmq:
  auth:
    username: bambang
    password: p(4Mun6K4555!
minio:
  accessKey: yourrandomaccesskey
  secretKey: veryrandomstringforthesecret#%
components:
  wsDaemon:
    containerRuntime:
      nodeRoots:
      - /run/k3s/containerd/io.containerd.runtime.v2.task/k8s.io
      containerd:
        socket: /run/k3s/containerd/containerd.sock
```

Setelah itu buat revisi lagi, dan cek lagi status podnya

![](https://imgur.com/S8ABlDj.jpg)

Oke satu masalah telah teratasi, lanjut yang lainnya

#### Pod `proxy-xxxxxxxxxx-xxxxx`

Sama seperti seblumnya cek dulu errornya dimana, bisa pakai `kubectl describe pod proxy-xxxxxxxxxx-xxxxx`

![](https://imgur.com/G3lZfCW.jpg)

Jika kita perhatikan dari error diatas kesalahan terjadi karena si pod mencoba melakukan mount terhadap secret namum tidak ditemukan, sehingga solusinya ya membuat secret yang dibutuhkan tersebut. Disini secret yang dibutuhkan itu ialah secret untuk sertifikat SSL-nya jadi kita perlu mengenerate dulu atau jika sudah punya yang berbayar tinggal gunakan saja. Tapi ada beberapa syarat nih terkait sertifikatnya domain apa saja yang dibutuhkan oleh gitpod. Yaitu `domain.tld`, `*.domain.tld` dan `*.ws.domain.tld`. Nah kita harus memiliki sertifikat untuk 3 domain tersebut, 2 wildcard 1 domain tok. Disini saya kan menggunakan LE dengan bantuan certbot, langsung saja. Setep-stepnya

1. Install cerbot dulu

```bash
sudo apt install -y snapd
sudo snap install core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

2. Cari IP address dari gitpod-nya dulu

```bash
kubectl describe svc proxy | grep -i ingress
```

3. Setelah mendapatkan alamat IPnya selanjutnya adalah mengupdate domain untuk diarahkan pada IP tersebut. Silahkan lakukan pada DNS Management masing-masing. Untuk domainnya sendiri seperti yang sudah disebutkan sebelumnya. Kira-kira punya saya yang di Cloudflare seperti ini jadinya

![](https://imgur.com/NUd2Elp.jpg)

4. Setelah dipointing selanjutnya yaitu mengupdate konfigurasi dari helm yang berada pada file `values.custom.yaml`. Kira-kira nantinya akan menjadi seperti ini

```yaml
rabbitmq:
  auth:
    username: bambang
    password: p(4Mun6K4555!
minio:
  accessKey: yourrandomaccesskey
  secretKey: veryrandomstringforthesecret#%
components:
  proxy:
    loadBalancerIP: xx.xx.xx.xx
  wsDaemon:
    containerRuntime:
      nodeRoots:
      - /run/k3s/containerd/io.containerd.runtime.v2.task/k8s.io
      containerd:
        socket: /run/k3s/containerd/containerd.sock
hostname: gitpod.my.id
```

5. Sementara untuk deployment gitpodnya sampai disitu dulu, selanjutnya yaitu kita menggenerate sertifikat SSL-nya. Nah, kalau pakai certbot perintahnya seperti ini

```bash
export DOMAIN=gitpod.my.id
export EMAIL=you@mail.com
export WORKDIR=$PWD/letsencrypt

certbot certonly \
--config-dir $WORKDIR/config \
--work-dir $WORKDIR/work \
--logs-dir $WORKDIR/logs \
--manual \
--preferred-challenges=dns \
--email $EMAIL \
--server https://acme-v02.api.letsencrypt.org/directory \
--agree-tos \
-d *.ws.$DOMAIN \
-d *.$DOMAIN \
-d $DOMAIN
```

![](https://imgur.com/6inZ6hV.jpg)

![](https://imgur.com/m1FFiJR.jpg)

![](https://imgur.com/Xf6xfIB.jpg)

6. Setelah sukses lanjutkan untuk menyalin sertifikat yang baru saja dibuat

```bash
mkdir -p secrets/https-certificates
find $WORKDIR/config/live -name "*.pem" -exec cp {} secrets/https-certificates \;
ls -lha secrets/https-certificates
```

![](https://imgur.com/KmIEENr.jpg)

7. Setelah itu kita buat menjadi secret

```bash
kubectl create secret generic https-certificates --from-file=secrets/https-certificates
kubectl describe secret https-certificates
```

8. Setelah semua masuk, saatnya buat revisi baru dari deploymentnya

```bash
helm upgrade -f values.custom.yaml gitpod gitpod.io/gitpod --version=0.9.0
kubectl get pods
```

Setelah selesai buat revisi, cek pod-nya sudah aman sentosa semuanya. Jika semua sudah berstatus `RUNNING` saatnya ketahap selanjutnya. Kalau belum ya troubleshoot lagi

![](https://imgur.com/zabhWkh.jpg)

### Integrasi Gitpod Dengan GitLab

Saat pertama kali gitpod diakses pastinya akan meminta untuk di integrasikan dengan SCM disini saya akan menggunakan GitLab, bisa juga pakai GitHub silahkan dipilih sesuai kebutuhan saja.

![](https://imgur.com/HDssCGL.jpg)

- Buat dulu aplikasinya untuk dihubungkan dengan Gitpod. Ada dimenu `Preferences` > `Applications`. Masukan nama yang diinginkan, untuk scope pilih `api` dan `read_user`. Kemudian untuk callback isikan dengan URL callback yang ditampilkan pada gitpod

![](https://imgur.com/7scc9Dl.jpg)

- Setelah disimpan nanti akan muncul `Application ID` dan `Secret` untuk dimasukan kedalam gitpod

![](https://imgur.com/teTabxV.jpg)

- Simpan tunggu beberapa saat dan :tada:

![](https://imgur.com/z1R2wFt.jpg)

### Uji Coba Deployment Gitpod

- Terakhir mari kita uji deployment kita dapat berjalan dengan benar. Dengan memasukan URL dari repository pada gitpod, untuk caranya bisa dicek pada postingan saya sebelumnya

![](https://imgur.com/dWUgiA8.jpg)

- Happy coding :tada:

Oke selesai sudah, begitulah step-step yang bisa dicoba untuk mendeploy gitpod self-hosted di k3s. Setelah saya mencoba untuk deploy beberapa kali ternyata untuk mendeploy gitpod sendiri itu sangat tricky, karena memang kompatibilitas yang ribet sehingga kita harus benar-benar menyesuaikan lingkungan server dengan yang diminta oleh gitpod. Seperti versi OS, versi kubernetes, hingga versi kernel yang digunakan pada OS itu sendiri.
