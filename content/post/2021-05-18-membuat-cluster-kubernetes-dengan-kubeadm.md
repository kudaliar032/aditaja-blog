---
title: Membuat Cluster Kubernetes Dengan Kubeadm
date: 2021-05-18T20:54:16+08:00
tags:
- kubernetes
- container
draft: false
toc: false
backtotop: true
---

![](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/posts/2021-05-18-membuat-cluster-kubernetes-dengan-kubeadm/header_pl2nad.webp)

Hallo, setelah sekian purnama saya tidak menulis apa-apa di blog ini, kali ini saya akan menuliskan langkah-langkah untuk membuat sebuah cluster kubernetes secara manual, yang mana kita akan menggunakan kubeadm dkk. Nah, sebenarnya kalau kita mau buat cluster kubernetes saat ini khususnya jika kita membuatnya di public cloud seperti di [GCP](https://cloud.google.com/), [AWS](https://aws.amazon.com/), [Azure](https://azure.microsoft.com/en-us/), [Alibaba Cloud](https://id.alibabacloud.com/), dsb. Kita sudah dimudahkan dengan layanan terkelola mereka kita tinggal atur jumlah nodenya, spesifikasi mesinnya, hubungkan kubernetes clientnya, udah jalan kita bisa dengan mudah mendeploy aplikasi di kubernetes. Tapi rasanya kurang afdol kalau tidak mencoba cara manualnya dimana kita perlu pasang satu-satu paket yang dibutuhkan dsb. Gimana caranya? langsung saja.

## Persiapan

Sebelum memulai kita perlu mengetahui apa saja yang perlu dipersiapkan dan dipastikan, antara lain:

1. Sebuah mesin linux. Kubernetes sendiri menyediakan paket-paket distribusi berbasis Debian dan Red Hat secara default
2. Mesinnya memiliki memori 2GB atau lebih, semakin besar semakin banyak aplikasi yang dapat kita jalankan
3. Mesinnya memiliki CPUs 2 atau lebih
4. Koneksi penuh antara mesin, bisa melalui jaringan private atau public
5. Memiliki hostname, alamat MAC, dan product_uuid yang unik
6. Akses port-port yang dibutuhkan terbuka, dapat dilihat pada link berikut https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/install-kubeadm/#control-plane-node-s
7. Swap dimatikan, ini wajib dilakukan agar kubelet dapat berkerja

## Lingkungan Lab

Berikut adalah lingkungan lab yang saya gunakan pada postingan ini, dimana saya akan pakai VM dari Azure dengan spesifikasi seperti berikut

ROLE | FQDN | IP | OS | RAM | CPU | TYPE
--- | --- | --- | --- | --- | --- | ---
Master | master.***.cloudapp.net | 10.0.0.5 | Ubuntu 20.04 LTS | 4 GB | 2 CPUs | B2s
Worker | worker.***.cloudapp.net | 10.0.0.4 | Ubuntu 20.04 LTS | 4 GB | 2 CPUs | B2s

## Langkah Kerja

### Seluruh Mesin

> - Jalankan semua perintah dengan akses root#
> - Jalankan semua perintah ini pada seluruh mesin

#### Matikan firewall

Agar tidak ribet untuk masalah jaringan, kita matikan dulu saja firewallnya. Karena disini saya pakai ubuntu jadi perintahnya seperti berikut ini

```bash
ufw disable
```

#### Matikan swap

Matikan swap agar kubelet dapat berjalan dengan baik

```bash
swapoff -a; sed -i '/swap/d' /etc/fstab
```

#### Update sysctl untuk networking

Pastikan modul `br_netfilter` telah diload dengan baik agar jaringan kubernetes dapat bekerja dengan semestinya

```bash
cat <<EOF | tee /etc/modules-load.d/k8s.conf
br_netfilter
EOF

cat <<EOF | tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
EOF
sysctl --system
```
#### Memasang container runtime

Agar container yang berada di dalam pod dapat berjalan maka kita perlu menginstall runtimenya, pada umumnya dikubernetes yang berjalan pada mesin linux menggunakan runtime berikut

- [contianerd](https://kubernetes.io/docs/setup/production-environment/container-runtimes/#containerd)
- [CRI-O](https://kubernetes.io/docs/setup/production-environment/container-runtimes/#cri-o)
- [Docker](https://kubernetes.io/docs/setup/production-environment/container-runtimes/#docker)

Disini akan pakai docker saja, dan versi docker yang akan digunakan ialah versi `19.03.10` karena sudah teruji secara klinis

```bash
apt update && apt install -y apt-transport-https ca-certificates curl gnupg lsb-release
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo \
  "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt update
apt install -y docker-ce=5:19.03.10~3-0~ubuntu-focal docker-ce-cli=5:19.03.10~3-0~ubuntu-focal containerd.io
```

#### Memasang kubeadm, kubelet, dan kubectl

Setelah runtimenya terinstal dengan baik, berikutnya ialah menginstall komponen-komponen dari kubernetesnya sendiri, disini kita akan pakai versi `1.18.5`. Kenapa? karena versi tersebut sudah teruji klinis jika disandingkan dengan Docker versi `19.03.10`

```bash
curl -fsSLo /usr/share/keyrings/kubernetes-archive-keyring.gpg https://packages.cloud.google.com/apt/doc/apt-key.gpg
echo "deb [signed-by=/usr/share/keyrings/kubernetes-archive-keyring.gpg] https://apt.kubernetes.io/ kubernetes-xenial main" | tee /etc/apt/sources.list.d/kubernetes.list
apt update
apt install -y kubeadm=1.18.5-00 kubelet=1.18.5-00 kubectl=1.18.5-00
```

Oke, kalau sudah pasang memasang paket sudah selesai pada mesin master, lakukan hal yang sama pada mesin workernya. Baru lanjut ke tahap berikutnya.

### Pada Mesin Master

> - Jalankan semua perintah dengan akses root#
> - Jalankan semua perintah ini pada mesin master

#### Inisialisasi kubernetes cluster

Untuk melakukan inisialisasi kubernetes cluster jalankan perintah berikut ini

```bash
kubeadm init --apiserver-advertise-address=$(hostname -i) --pod-network-cidr=192.168.0.0/16 --ignore-preflight-errors=all
```

Pada perintah tersebut terdapat beberapa parameter yaitu:
- `--apiserver-advertise-address` Berisikan alamat IP dari server master
- `--pod-network-cidr` Berisikan alamat network (CIDR) yang akan digunakan oleh pod-pod berkomunikasi
- `--ignore-preflight-errors=all` Digunakan untuk menampilkan kesalahan-kesalahan saat inisialisasi cluster

Tunggu beberapa saat hingga proses inisialisasi cluster selesai

#### Memasang jaringan untuk pod

Agar setiap pod dapat saling berkomunikasi, maka perlu kita pasang Contianer Network Interface (CNI). Terdapat banyak macamnya CNI yang dapat kita gunakan, seperti [Flanel](https://kubernetes.io/docs/concepts/cluster-administration/networking/#flannel), [k-vswitch](https://kubernetes.io/docs/concepts/cluster-administration/networking/#k-vswitch). [calico](https://kubernetes.io/docs/concepts/cluster-administration/networking/#calico), dsb. Disini kita akan pakai `calico` tentunya karena sudah teruji klinis. Sebelumnya pastikan sudah memuat konfigurasi untuk `kubectl`, bisa dilakukan dengan menggunakan environment variable atau dengan menyalin kedalam direktori home user. Langkah-langkah yang perlu dilakukan biasanya muncul sesaat setelah kita selesai melakukan inisialisasi cluster

```bash
export KUBECONFIG=/etc/kubernetes/admin.conf
kubectl create -f https://docs.projectcalico.org/manifests/tigera-operator.yaml
```

Setelah itu download file konfigurasi custom resource definition berikut ini `https://docs.projectcalico.org/manifests/custom-resources.yaml`. Dan sesuaikan bagian `spec.calicoNetwork.ipPools.[].cidr` dengan network yang digunakan saat inisialisasi cluster kubernetes

```bash
curl -LO https://docs.projectcalico.org/manifests/custom-resources.yaml
vim custom-resources.yaml
kubectl apply -f custom-resources.yaml
```

Tunggu beberapa saat, dan pastikan pod pada namespace `calico-system` sudah berstatus `Running`

```bash
kubectl get pods -n calico-system
```

Selain itu untuk memastikannya dapat dilihat juga dari pod untuk `CoreDNS` sudah berstatus `Running`

```bash
kubectl get pods -n kube-system
```

Oke, master sudah siap. Tinggal lanjut ke mesin `worker` untuk bergabung dengan cluster.

### Pada Mesin Worker

> - Jalankan semua perintah dengan akses root#
> - Jalankan semua perintah ini pada mesin worker

Karena mesin worker hanya difungsikan sebagai mesin yang menerima penjadwalan pods, sehingga kita cukup menghubungkan worker dengan cluster kubernetes yang sudah diinisialisasikan sebelumnya. Untuk menggabungkannya kita dapat menggunakan perintah `kubeadm join ...`. Sebenarnya perintah tersebut dapat kita temukan saat kita melakukan inisialisasi cluter diawal, namun jika sudah hilang kita bisa generate token dan key baru dengan perintah

```bash
kubeadm token create --print-join-command
```

yang dieksekusi pada server master tentunya, jika sudah dapat token dll. Kita tinggal mengekseksuinya di worker, misalkan

```bash
kubeadm join 10.0.0.5:6443 --token xxx.xxxxx --discovery-token-ca-cert-hash sha256:xxxxx
```

Jika sudah selesai, coba cek apakah sudah terjoin dengan baik. Dapat menggunakan perintah

```bash
kubectl get nodes -o wide
```

Pastikan statusnya `Ready` dan silahkan coba buat deployment untuk memastikan cluster sudah berkerja.

### Membuat Deployment

Untuk membuat deployment, bisa menggunakan perintah berikut

```bash
kubectl create deployment webserver --image=nginx:alpine
kubectl scale deployment webserver --replicas=15
kubectl get pods
```

Expose dengan service menggunakan perintah

```bash
kubectl expose deployment webserver --port=80 --type=NodePort
kubectl get svc
```

Kemudian coba akses dengan

```bash
curl [ip-worker]:[port]
```

Sudah selesai, sampai sini saja langkah-langkah untuk membuat cluster kubernetes secara manual menggunakan kubeadm, namun perlu diketahui untuk lingkunan produksi tentunya akan masih banyak hal yang kita perlu lakukan pada cluster yang telah kita buat sebelumnya, baik optimasi, HA, dan dari sisi keamanan. Secara umum tahapan-tahapan membuat kubernetes cluster dengan kubeadm adalah sebagai berikut:

1. Persiapkan semua mesin dengan mematikan firewall, dsb.
2. Install container runtime
3. Install kubeadm, kubelet, dan kubectl
4. Inisialisasi cluster pada mesin master
5. Deploy container network interface
6. Hubungkan mesin worker dengan master
7. Lakukan percobaan pada cluster, dan selesai


Mungkin sampai sini saja dari saya, semoga bermanfaat. Terima kasih :pray:, see uu :wave: :wave: :wave:

## Refrensi

- https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/
- https://kubernetes.io/docs/concepts/cluster-administration/networking
- https://kubernetes.io/docs/setup/production-environment/container-runtimes/
- https://github.com/justmeandopensource/kubernetes/blob/master/docs/install-cluster-ubuntu-20.md
- https://docs.docker.com/engine/install/ubuntu/
- https://docs.projectcalico.org/getting-started/kubernetes/quickstart
