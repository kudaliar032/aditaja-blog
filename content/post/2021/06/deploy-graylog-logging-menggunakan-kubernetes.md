---
title: "Deploy Graylog Logging Menggunakan Kubernetes"
date: 2021-06-09T14:21:18+08:00
draft: false
toc: false
backtotop: true
tags:
- "kubernetes"
- "log"
- "graylog"
images:
- "https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/posts/2021-06-09-deploy-graylog-logging-menggunakan-kubernetes/header.webp"
---

Hallo, selamat siang (saat ini ditulis). Kali ini saya hendak sedikit berbagi pengalaman mencoba deploy Graylog di cluster Kubernetes. Sebelumnya mungkin biar kaya penulis profesional kita sedikit kasih penjelasan yak apa itu Graylog. Menurut [wikipedia](https://en.wikipedia.org/wiki/Graylog) graylog adalah sebuah alat yang dapat digunakan untuk mengcapture log secara terpusat, menyimpannya, dan memungkinkan kita untuk melakukan pencarian log secara real time terhadap terabytes-an data log dari berbagai komponen infrastruktur IT dan aplikasi. Ya, kira-kira begitu semoga bisa dipahami :grin:, oke langsung saja beginilah step-step yang saya pakai saat mencoba mendeploy graylog di sebuah cluster Kubernetes.

## Requirements

Berikut adalah requirements yang dibutuhkan

- Kubernetes cluster, kalau belum buat bisa liat [di sini]({{< ref "../05/membuat-cluster-kubernetes-dengan-kubeadm.md" >}})
- Helm

## Step-step

Disini akan dibagi menjadi 3 bagian, yg pertama adalah step untuk mendeploy mongodb, kemudian mendeploy elasticsearch, dan terakhir mendeploy graylognya. Setelah graylog terinstall silahkan digunakan sesuai kebutuhan. Sebelumnya kira-kira cluster yang kita buat akan berbentuk seperti ini

![minial arch](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/posts/2021-06-09-deploy-graylog-logging-menggunakan-kubernetes/architec_small_setup_v2yzln.webp)

### Install MongoDB

Pertama-tama kita perlu mempersiapkan MongoDB untuk cluster graylog kita, mongodb akan digunakan untuk menyimpan beberapa data seperti meta information, dan konfigurasi dari graylog sehingga disini tidak membutuhkan banyak resources. Dikubernetes kita bisa menggunakan helm dari [bitnami](https://bitnami.com/stack/mongodb/helm). Saya memilih menggunakan itu dikarenakan penggunaannya mudah dan rating penggunanya bagus yaitu 5 :star: walaupun yang ngerating baru 3 wkwkwk. Langsung saja

- Buat direktori dulu dengan nama mongodb, sebenarnya enggak wajib sih cuma untuk mengumpulkan konfigurasi aja

```bash
mkdir -p mongodb
cd mongodb
```

- Kemudian, buat file dengan nama `values.yaml` yang akan berisikan parameter-parameter konfigurasi dari mongodb. Isikan seperti berikut ini

```yaml
auth:
  enabled: false
```

- Parameter tersebut berguna untuk mematikan autentikasi dari mongodb, untuk mempermudah saja sih. Kalau `production` sangat-sangat disarankan tidak mematikan authentikasi ini
- Buat namespace agar manajemen resourcenya lebih mudah

```bash
kubectl create namespace mongodb
```

- Tambahkan repository helm untuk bitnami

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo list

...
NAME         	URL                                                        
bitnami      	https://charts.bitnami.com/bitnami     
...
```

- Setelah dipastikan sudah tertambah, silahkan instal mongodb dengan perintah berikut

```bash
helm install --namespace mongodb mongodb-test bitnami/mongodb -f values.yaml
```

- Untuk memastikan mongodb sudah berjalan coba aktifkan port forwarding ke service mongodb dan coba akses melalui CLI atau apapun itu

```bash
kubectl port-forward --namespace mongodb svc/mongodb-test 27017:27017
```

- Pastikan bisa terhubung seperti berikut, maka lanjut ke step berikutnya

![](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/posts/2021-06-09-deploy-graylog-logging-menggunakan-kubernetes/jRO1k54_ovmv1c.webp)

### Install Elasticsearch

Berikutnya adalah menginstall [elasticsearch](https://www.elastic.co/elasticsearch/) sesuai dengan diagram arsitektur sebelumnya. Elasticsearch berguna untuk menyimpan log dan mengolah logging, disini sangat disarankan menggunakan resource RAM yang besar dan menggunakan disk yang wuz wuz untuk mendapatkan performa yang maksimal. Untuk deployment elasticsearch saya akan menggunakan [Elastic Cloud on Kubernetes (ECK)](https://www.elastic.co/elastic-cloud-kubernetes) saya memilih cara ini karena penggunaannya cukup mudah dan resmi ya dari elastic. Langsung saja seperti berikut langkah-langkahnya

- Buat direktori untuk mengumpulkan konfigurasi-konfigurasinya, ini optional ya

```bash
cd ..
mkdir -p elasticsearch
cd elasticsearch
```

- Deploy ECK-nya dulu ke kubernetes cluster, disini akan dilakukan deployment terhadap banyak komponen-komponen CRD yang dibutuhkan untuk memanage elasticsearch cluster nantinya, berikut perintah yang bisa digunakan

```bash
kubectl apply -f https://download.elastic.co/downloads/eck/1.6.0/all-in-one.yaml
```

- Untuk memeriksa status terakhir dari deploymentnya bisa menggunakan perintah

```bash
kubectl -n elastic-system logs -f statefulset.apps/elastic-operator
```
- Setelah dipastikan semuanya terdeploy kita lanjutkan untuk membuat elasticsearch resourcenya, peratama-tama kita definisikan dulu dengan membuat file `elasticsearch.yaml` yang kira-kira isinya seperti ini

```yaml
apiVersion: elasticsearch.k8s.elastic.co/v1
kind: Elasticsearch
metadata:
  name: elasticsearch-test
  namespace: elasticsearch
spec:
  version: 7.13.0
  http:
    tls:
      selfSignedCertificate:
        disabled: true
  nodeSets:
  - name: default
    count: 1
    config:
      node.store.allow_mmap: false
      xpack.security.authc:
        anonymous:
          username: anonymous
          roles: superuser
          authz_exception: false
    volumeClaimTemplates:
    - metadata:
        name: elasticsearch-data
        namespace: elasticsearch
      spec:
        accessModes:
        - ReadWriteOnce
        resources:
          requests:
            storage: 20Gi
```

- Pada konfigurasi tersebut akan dibuat sebuah cluster elasticsearch dengan jumlah `1 node`, disk yang tersedia `20 Gigabytes`, untuk https dan authentikasi dimatikan untuk lab ini, supaya mudah saja
- Setelah siap filenya lanjutkan untuk di deploy ke cluster namun sebelumnya jangan lupa untuk membuat namespace `elasticsearch`

```bash
kubectl create namespace elasticsearch
kubectl apply -f elasticsearch.yaml
```

- Setelah menunggu beberapa saat pastikan podnya sudah running, bisa dicek dari lognya, seharusnya sih nama lognya `elasticsearch-test-es-default-0` karena dia statefulset ya

```bash
kubectl get pods -w elasticsearch
kubectl logs -f elasticsearch-test-es-default-0 -n elasticsearch
```
- Kalau sudah oke bisa tes koneksinya dengan menggunakana port forwarding ke service, seharusnya nama servicenya `elasticsearch-test-es-http`

```bash
kubectl get svc -n elasticsearch
kubectl port-forward -n elasticsearch svc/elasticsearch-test-es-http 9200
```

- Coba di curl dan pastikan success untuk diakses

```bash
curl localhost:9200

...
{
  "name" : "elasticsearch-test-es-default-0",
  "cluster_name" : "elasticsearch-test",
  "cluster_uuid" : "-zje22qPQqWy59XbTqAWKw",
  "version" : {
    "number" : "7.13.0",
    "build_flavor" : "default",
    "build_type" : "docker",
    "build_hash" : "5ca8591c6fcdb1260ce95b08a8e023559635c6f3",
    "build_date" : "2021-05-19T22:22:26.081971330Z",
    "build_snapshot" : false,
    "lucene_version" : "8.8.2",
    "minimum_wire_compatibility_version" : "6.8.0",
    "minimum_index_compatibility_version" : "6.0.0-beta1"
  },
  "tagline" : "You Know, for Search"
}
...
```

![](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/posts/2021-06-09-deploy-graylog-logging-menggunakan-kubernetes/aK51775_tcgi65.webp)

### Install Graylog

Setelah kita menginstall beberapa requirements sebelumnya, maka selanjutnya kita menginstall graylognya sendiri di cluster kubernetes. Disini saya akan menggunakan [graylog helm](https://github.com/KongZ/charts/tree/main/charts/graylog) agar mudah, langsung saja begini stepnya.

- Buat dulu folder buat kita mengumpulkan konfigurasi-konfigurasinya menjadi satu (optional)

```bas
cd ..
mkdir -p graylog
cd graylog
```

- Setelah itu buat file `values.yaml` yang akan berisikan beberapa konfigurasi dari graylog yang akan kita deploy, nah isinya kira-kira seperti ini

```yaml
tags:
  install-mongodb: false
  install-elasticsearch: false
graylog:
  mongodb:
    uri: mongodb://mongodb-test.mongodb.svc.cluster.local:27017/graylog
  elasticsearch:
    version: 7
    hosts: http://elasticsearch-test-es-default.elasticsearch.svc.cluster.local:9200
  input:
    tcp:
      service:
        type: ClusterIP
      ports:
        - name: gelf-tcp-input
          port: 12201
```

- Sedikit penjelasan, pada konfigurasi tersebut berguna untuk mengatur agar helm tidak menginstall elasticsearch dan mongodb karena kita sudah menginstalnya secara manual sebelumnya. Selain itu kita juga mendefinisikan uri dari mongodb dan elasticsearch, dan terakhir kita membuat service untuk mengexpose input pada protokol `tcp` dan port `12201`
- Tambahkan dulu helm reponya

```bash
helm repo add kongz https://charts.kong-z.com
helm repo list

...
NAME         	URL                                                  
kongz        	https://charts.kong-z.com                                   
bitnami      	https://charts.bitnami.com/bitnami   
...
```

- Langsung kita spin up graylognya, jangan lupa buat namespacenya dulu

```bash
kubectl create namespace graylog
helm install --namespace graylog graylog kongz/graylog -f values.yaml
```

- Setelah dieksekusi coba cek podnya apakah sudah berstatus running, bisa juga liat lognya gimana seharusnya nama podnya `graylog-0` karena statefulset harusnya enggak random nama podnya

```bash
kubectl get pods -n graylog
kubectl logs -f graylog-test-0 -n graylog
```

- Nah, pastikan diakhir-akhir log ada notifikasi bahwa server berhasil berjalan, kira-kira pesannya seperti berikut

```log
...
2021-06-13 10:30:17,643 INFO    [InputSetupService] - Triggering launching persisted inputs, node transitioned from Uninitialized [LB:DEAD] to Running [LB:ALIVE] - {}
2021-06-13 10:30:17,803 INFO    [ServerBootstrap] - Graylog server up and running. - {}
```

- Coba buat port forwarding ke service web graylognya untuk mengakses dashboard, selain itu kita perlu retrive passwordnya dari secret

```bash
kubectl get secrets -n graylog
kubectl get secret graylog-test -o jsonpath="{.data.graylog-password-secret}" -n graylog | base64 -di
kubectl port-forward svc/graylog-test-web 9000 -n graylog
```

- Nah coba diakses pasti error, kalau dilihat dari console error terjadi karena dashboard graylog mencari komponen-komponennya menggunakan hostname/domain sehingga kita perlu menyesuaikan. Jika dilinux kita bisa bisa menambahkan hostname sesuai yang diminta untuk diarahkan ke `localhost/127.0.0.1`

![](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/posts/2021-06-09-deploy-graylog-logging-menggunakan-kubernetes/WcbpDrx_bkbmci.png)

- Edit file `/etc/hosts` dan tambahkan

```
127.0.0.1 graylog-test-0.graylog-test.graylog.svc.cluster.local
```

- Setelah disimpan coba akses menggunakan hostname tersebut, dan tada :tada:

![](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/posts/2021-06-09-deploy-graylog-logging-menggunakan-kubernetes/SVSZ6cI_fzx7ax.png)

- Silahkan coba login dengan user `admin` dan password yang didapatkan dari secret pada perintah sebelumnya

![](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/posts/2021-06-09-deploy-graylog-logging-menggunakan-kubernetes/ozq6eB7_zjyseu.png)

- Siap digunakan

Sampai sini kita sudah sukses mendeploy graylog di kubernetes. Selanjutnya, silahkan buat input kemudian atur-atur untuk mengirimkan logging ke graylog. Perlu diingat langkah-langkah ini bisa digunakan pada lingkungan `production` tapi dengan beberapa catatan seperti perlu memperhatikan jumlah node, kredensialnya, sesuaikan kebutuhan `production` anda. Saya pamit undur diri Terima kasih :grin: :pray:
