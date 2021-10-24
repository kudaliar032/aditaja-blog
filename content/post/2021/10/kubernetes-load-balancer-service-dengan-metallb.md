---
title: "Kubernetes Load Balancer Service dengan MetalLB"
date: 2021-10-24T13:00:11+08:00
draft: false
toc: false
backtotop: true
tags:
- ""
images:
- "https://imgur.com/bZgrVSk.jpg"
---

Hallo semuanya, di kubernetes ada yang namanya service yang bisa digunakan untuk mengexpose pod yang berjalan di kubernetes. Service di kubernetes sendiri ada banyak typenya, salah satunya adalah Load Balancer. Namun sayangnya untuk yang tipe kubernetes ini biasanya hanya support di cloud provider seperti GCP, AWS, Azure, dll. Lalu bagaimana untuk kubernetes yang berjalan di on-premise? Apakah tidak bisa menggunakan service dengan type Load Balancer? Tentunya masih bisa dong, tapi kita perlu deploy tools tambahan yaitu [MetalLB](https://metallb.universe.tf/). Namun sayangnya MetalLB saat ini masih dalam posisi beta, jadinya tidak disarankan untuk digunakan pada lingkungan production. Untuk mendeploynya sendiri terbilang cukup mudah, kita bisa pakai manifest kubernetes, Kustomize, atau Helm. Langsung saja kita coba bersama.

## Spesifikasi dan Topologi

Berikut adalah topologi dan spesifikasi dari lab yang akan digunakan

![](https://imgur.com/SJWt7dN.jpg)

Di sini kita hanya akan menggunakan 2 buah node, yaitu master dan worker saja. Untuk masing-masing server memiliki spesifikasi

- Memory 4096MB
- vCPU 2
- Sistem Operasi 20.04

Jika tertarik menggunakan lab yang sama bisa menggunakan vagrantfile berikut [metallb-simple](https://github.com/kudaliar032/vagrantfile-labs/tree/main/metallb-simple). Kemudian untuk deploy kubernetesnya saya pakai k3s.

## Mendeploy MetalLB ke Kubernetes Cluster

Pertama-tama mari kita deploy dulu MetalLB-nya di kubernetes cluster, disini kita coba pakai metode helm saja. Tambahkan dulu reponya

```bash
helm repo add metallb https://metallb.github.io/metallb
helm repo update
```

Setelah itu mari membuat Helm values yang akan digunakan oleh metallb, isinya kira-kira seperti berikut. Simpanlah menggunakan nama bebas misalkan saya pakai `metallb-values.yaml`

```yaml
configInline:
  address-pools:
    - name: default
      protocol: layer2
      addresses:
        - 192.168.10.10-192.168.10.50
```

Di sini kita akan mencoba menggunakan protocol layer2 saja, karena kita tidak punya router BGP dan kita coba yang simple saja dulu. Selain itu kita menyediakan IP address dari `192.168.10.10` hingga `192.168.10.50`. Setelah itu mari kita deploy

```bash
kubectl create namespace metallb-system
helm install metallb metallb/metallb -n metallb-system -f metallb-values.yaml
```

Berikut kira-kira kalau sudah terdeploy

![](https://imgur.com/EqN5AgS.jpg)

Nah, coba cek podnya sudah terdeploy dengan sempurna menggunakan perintah

```bash
kubectl get pods -n metallb-system
```

Pastikan semuanya berstatus running seperti berikut

![](https://imgur.com/iLaMiBW.jpg)

## Mencoba MetalLB

Setelah selesai terdeploy, marilah mencoba service LoadBalancer kita. Kita coba deploy nginx kemudian buat service dan coba mari diakses. Dapat menggunakan perintah berikut

```bash
kubectl create deployment web-server --image=httpd --replicas=3
kubectl expose deployment web-server --type=LoadBalancer --port 80 --target-port 80
```

Pastikan semua pod running, dan coba cek pada service pastikan mendapatkan external ip seperti berikut

![](https://imgur.com/A2BkZ6u.jpg)

Sekarang coba akses bisa pakai curl atau buka di browser tercinta, pastikan muncul seperti ini

![](https://imgur.com/5okihrC.jpg)

Kalau sudah muncul berarti metallb kita sudah bekerja, tinggal digunakan. Mantab sekali, mudah bukan untuk membuat LoadBalancer service di kubernetes cluster on-premise kita? Mungkin cukup sampai sini saja dari saja, semoga dapat bermanfaat untuk kita semua. Sampai jumpa :tada: :tada: :tada:
