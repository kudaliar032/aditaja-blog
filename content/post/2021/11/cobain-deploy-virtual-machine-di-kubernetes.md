---
title: "Cobain Deploy Virtual Machine di Kubernetes"
date: 2021-11-08T15:32:11+08:00
draft: false
toc: false
backtotop: true
tags:
- "kubernetes"
- "kubevirt"
images:
- "https://imgur.com/3rCQJuX.jpg"
---

Hallo semuanya, jadi baru saja saya mencoba sebuah alat yang sangat menarik menurut saya. Karena dengan alat ini kita bisa menjalankan sebuah Virtual Machine di Kubernetes kita. Waw menarik sekali bukan, dengan bantuan alat ini kita dapat dengan mudah menghubungkan stack infrastruktur kita yang mungkin memang susah untuk di containerkan. Sesuai dengan namanya KubeVirt ini menggunakan libvirt untuk menjalankan Virtual Machine-nya ya intinya sih [KubeVirt](https://kubevirt.io/) akan memanfaatkan API dari libvirt untuk membuat, menjalankan, dan menghapus VM. Oke dari pada banyak cingcong mari kita coba saja. Disini nantinya saya akan menjalankan VM dengan sistem operasi ubuntu.

## Spesification and Topology

Saya tidak menggunakan kubernetes yang aneh-aneh. Cukup dengan sebuah node saja. Untuk spesifikasinya sendiri adalah

- 2 vCPU
- 4 GiB Memory
- Sistem Operasi Ubuntu 20.04

Kalau pakai VM di Azure bisa pakai yang Sizenya `Standard B2s`. Untuk kubernetes pakai K3s seperti biasa.

##  Deploy KubeVirt

Pertama-tama dan yang pasti harus dilakukan adalah mendeploy KubeVirt-nya sendiri, mari kita deploy operatornya dulu gunakan perintah berikut ini

```bash
export VERSION=$(curl -s https://api.github.com/repos/kubevirt/kubevirt/releases | grep tag_name | grep -v -- '-rc' | sort -r | head -1 | awk -F': ' '{print $2}' | sed 's/,//' | xargs)
echo $VERSION
kubectl create -f https://github.com/kubevirt/kubevirt/releases/download/${VERSION}/kubevirt-operator.yaml
```

Nah, karena disini saya pakai Azure yang tidak mengaktifkan Virtualizationnya maka kita perlu mengaktifkan KubeVirt emulation menggunakan perintah

```bash
kubectl create configmap kubevirt-config -n kubevirt --from-literal debug.useEmulation=true
```

Setelah itu mari mendeploy CRD-nya

```bash
kubectl create -f https://github.com/kubevirt/kubevirt/releases/download/${VERSION}/kubevirt-cr.yaml
```

![](https://imgur.com/eXNXhUk.jpg)

Oke, mari kita awasi bahwa deployment berhasil. Untuk memastikan deployment berhasil secara default KubeVirt akan mendeploy 7 buah pods, 3 buah services, 1 buah daemonset, 3 buah deployment apps, dan 3 buah replica sets.

```bash
kubectl -n kubevirt get all
```

![](https://imgur.com/nWd0760.jpg)

## Install Virtctl

Setelah mendeploy marilah memasang sebuah alat lain yang bernama `virtctl` fungsinya adalah untuk kita berinteraksi dengan VM yang dijalankan. Dengan bantuan alat ini kita bisa meremote VM-nya, menjalankan, menghentikan, dll. Gunakan perintah berikut untuk memasangnya

```bash
VERSION=$(kubectl get kubevirt.kubevirt.io/kubevirt -n kubevirt -o=jsonpath="{.status.observedKubeVirtVersion}")
ARCH=$(uname -s | tr A-Z a-z)-$(uname -m | sed 's/x86_64/amd64/') || windows-amd64.exe
echo ${ARCH}
curl -L -o virtctl https://github.com/kubevirt/kubevirt/releases/download/${VERSION}/virtctl-${VERSION}-${ARCH}
chmod +x virtctl
sudo install virtctl /usr/local/bin
```

![](https://imgur.com/zqRYYux.jpg)

## Deploy Containerized Data Importer (CDI)

Selanjutnya kita akan mendeploy resource untuk CDI. Apa itu CDI? CDI digunakan untuk kita mengimport VM image ke KubeVirt agar dapat digunakan pada VM kita. Untuk mendeploynya sendiri sama seperti sebelumnya kita tinggal memasang operator dan CRD-nya. Gunakan perintah berikut

```bash
export VERSION=$(curl -s https://github.com/kubevirt/containerized-data-importer/releases/latest | grep -o "v[0-9]\.[0-9]*\.[0-9]*")
kubectl create -f https://github.com/kubevirt/containerized-data-importer/releases/download/$VERSION/cdi-operator.yaml
kubectl create -f https://github.com/kubevirt/containerized-data-importer/releases/download/$VERSION/cdi-cr.yaml
```

Setelah itu cek status deploymentnya

```bash
kubectl -n cdi get cdi
kubectl -n cdi get pods
```

![](https://imgur.com/nDVRrGM.jpg)

## Create Ubuntu VM

Dan puncaknya mari kita mendeploy VM ubuntunya ke KubeVirt yang sudah kita siapkan, disini akan ada beberapa step, yang pertama kita perlu siapkan ubuntunya di CDI. Setelah itu buat VM-nya, dan nikmati

### Import Ubuntu Image to CDI

Gunakan contoh berikut untuk mengimport disk Ubuntu Cloud Image ke CDI

```yaml
cat <<EOF > pvc_ubuntu.yml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: "ubuntu"
  labels:
    app: containerized-data-importer
  annotations:
    cdi.kubevirt.io/storage.import.endpoint: "https://cloud-images.ubuntu.com/focal/current/focal-server-cloudimg-amd64.img"
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
EOF

kubectl create -f pvc_ubuntu.yml
```

Setelah di create mari kita pantau proses importnya, gunakan perintah berikut untuk menampilkan pod untuk importer sdh berjalan

```bash
kubectl get pods # pastikan ada pod dengan nama import ...
kubectl logs -f importer-ubuntu
```

Tunggu "beberapa saat" hingga proses import selesai, lamanya tergantung spesifikasi node dan network yang digunakan

![](https://imgur.com/CfKMAPB.jpg)

Setelah menunggu beberapa saat, import selesai. Kira-kira seperti berikut ini

![](https://imgur.com/Dn84cHe.jpg)

### Create VM

Setelah selesai import imagenya, mari kita buat VM dari image tersebut, untuk membuatnya mari gunakan konfigurasi berikut [vm-ubuntu_pvc.yaml](https://raw.githubusercontent.com/kudaliar032/k8s-labs/main/kubevirt-ubuntu/vm-ubuntu_pvc.yaml). Sebelumnya jangan lupa untuk mengupdate file tersebut pada bagian `YOUR_SSH_PUBLIC_KEY` dengan ssh public key masing-masing yang akan digunakan untuk meremote VM nantinya.

```bash
wget https://raw.githubusercontent.com/kudaliar032/k8s-labs/main/kubevirt-ubuntu/vm-ubuntu_pvc.yaml
kubectl create -f vm-ubuntu_pvc.yaml
```

Setelah itu cek status VM instance

```bash
kubectl get vmis
```

Setelah statusnya running, mari coba akses menggunakan `virtctl`

```bash
virtctl console vm-ubuntu
```

Tekan enter beberapa kali jika tidak muncul apa-apa

![](https://imgur.com/vcoy1Xs.jpg)

Maka kira-kira akan seperti gambar di atas, saat sudah selesai semua coba kita akses menggunakan ssh. Untuk keluar dari console bisa tekan `^]`

```bash
kubectl get vmis
ssh ubuntu@10.42.0.23
```

Jika sukes kira-kira seperti berikut ini

![](https://imgur.com/1wulich.jpg)

Setelah itu silahkan dinikmati sesuai dengan kebutuhan

## Test Virtual Machine

Di sini, mari mencoba install web server kemudian kita expose dengan service kubernetes. Install dulu web servernya dan pastikan berjalan

```bash
sudo apt update
sudo apt install -y apache2
sudo systemctl status apache2
```

Kira-kira seperti berikut

![](https://imgur.com/y4rLvZG.jpg)

Oke, mari `exit` dan coba ekpose kemudian mari kita akses

```bash
virtctl expose vmi vm-ubuntu --port 8080 --target-port 80 --type NodePort --name vm-ubuntu-http
kubectl get services
```

![](https://imgur.com/bxywm0G.jpg)

Mari kita akses melalui port yang terekpose `31503`. Dan, tadaaa :tada: :tada: :tada:

![](https://imgur.com/3IqRr0A.jpg)

Selesai sudah, mantab sekali bukan. Kita dapat menjalankan sebuah Virtual Machine pada Kubernetes kita, tentunya ini akan sangat berguna apabila stack yang kita gunakan sangat sulit untuk di ekstrak ke Container atau mungkin pengennya pakai Virtual Machine aja. Tentunya ada banyak hal yang dapat di eksplore lagi pada KubeVirt ini. Saya rasa sudah cukup saja sampai di sini, semoga semuanya bermanfaat untuk kita semua. Sampai jumpa lagi, Terima Kasih :pray: :pray: :pray:
