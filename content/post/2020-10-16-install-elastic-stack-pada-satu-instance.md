---
title: Menginstal Elastic Stack Pada Satu Instance
date: "2020-10-16"
tags:
- elk
- elastic
- monitoring
- log
---

![Menginstal Elastic Stack](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/headers/UToebnD_qmowmb.webp)

Hallo, kali ini saya ingin membagikan cara untuk menginstal elastic stack pada sistem operasi linux, nantinya saya akan menggunakan sistem operasi [Ubuntu 18.04](https://releases.ubuntu.com/18.04/). Disini saya tidak akan menjelaskan secara mendetail apa itu elastic stack, saya hanya akan menuliskan langkah-langkah yang dilakukan untuk melakukan instalasi elastic stack. Untuk penjelasan elastic stack sendiri dapat dilihat di situs [elastic.co](https://www.elastic.co/elastic-stack).

Sesuai dengan namanya, elastic stack terdiri dari beberapa bagian. Diantaranya yaitu [Elastcisearch](https://www.elastic.co/elasticsearch), [Kibana](https://www.elastic.co/kibana), [Beats](https://www.elastic.co/beats/), dan [Logstash](https://www.elastic.co/logstash). Dari masing-masing bagian tersebut memiliki perannya masing-masing. Tidak semua komponen pada elastic stack harus terinstal, bisa saja kita hanya menginstal Elasticsearch, Kibana, Beats tanpa logstash. Selain itu, kita juga dapat menginstal masing-masing stack pada instance yang berbeda, tidak harus dalam satu instance.

## Elastic Stack

### Elasticsearch

![Elasticsearch](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/posts/2020-10-16-install-elastic-stack-pada-satu-instance/9wpKadu_tfgltz.webp)

Bertugas untuk mengumpulkan data, mencari data, dan menganalisis data yang akan diolah.

### Kibana

![Kibana](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/posts/2020-10-16-install-elastic-stack-pada-satu-instance/ltfzAat_xnuk3l.webp)

Bertugas untuk mengeksplorasi data dan menyajikannya dalam bentuk visual agar lebih mudah dibaca dan dipahami.

### Beats

![Beats](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/posts/2020-10-16-install-elastic-stack-pada-satu-instance/Ck3dV7z_n8udcn.webp)

Bertugas untuk mengambil data dari mesin yang akan dimonitoring dan mengirimkannya ke elasticsearch atau logstash untuk diolah.

### Logstash

![Logstash](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/posts/2020-10-16-install-elastic-stack-pada-satu-instance/MWpjyP9_ckijtu.webp)

Bertugas untuk menerima data yang dikirimkan oleh beats ataupun sumber lain untuk kemudian dilakukan pengolahan data agar lebih mudah untuk digunakan oleh Elastic Stack.

## Persiapan

Dikarenakan kita hanya akan menginstal elastic stack pada satu buat instance, maka hal-hal yang perlu dipersiapkan tidaklah banyak. Kita cukup menyiapkan koneksi internet untuk mendownload instalasi atau package yang diperlukan. Memastikan bahwa sistem operasi yang digunakan support dengan elastic stack. Hardware yang memadai. Perlu diketahui bahwa untuk menggunakan Elastic Stack kita harus menginstal versi yang sama untuk masing-masing stack, misalkan Elasticsearch `7.9.2`, Beats `7.9.2`, Kibana `7.9.2`, Logstash `7.9.2`. Untuk proses instalasi sendiri disarankan dengan urutan seperti berikut.
1. [Elasticsearch](#elasticsearch-1)
2. [Kibana](#kibana-1)
3. Logstash (Optional)
4. [Beats](#filebeat)
5. APM Server (Optional)

## Proses Instalasi

Proses instalasi yang saya lakukan disini akan menggunakan APT repositori sehingga akan lebih mudah, selain menggunakan metode tersebut, sebenarnya terdapat banyak metode yang dapat digunakan. Seperti mengekstrak dari file archive, menginstal dari file `.deb`, file `.rpm`, RPM repository, dll. Oke, langsung saja seperti berikut.

### Umum

Pertama-tama, kita upgrade dulu ubuntu kita, untuk memastikan semuanya dalam keadaan versi terbaru. Dengan perintah

#### Upgrade Packages

```shell
sudo apt update
sudo apt upgrade -y
```

#### Menambahkan repository Elastic Stack
Setelah itu, tambahkan repository dari elastic stack dengan perintah

```shell
wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -
echo "deb https://artifacts.elastic.co/packages/7.x/apt stable main" | sudo tee /etc/apt/sources.list.d/elastic-7.x.list
sudo apt update
```

Pastikan semuanya berjalan dengan baik-baik saja

### Elasticsearch

Untuk menginstal elasticsearch, kita hanya perlu menjalankan perintah andalan kita yaitu

```shell
sudo apt install -y elasticsearch
```

Kemudian tunggu beberapa saat hingga proses instalasi selesai, jika sudah selesai selanjutnya kita jalankan elasticsearch sebagai service

```shell
sudo systemctl daemon-reload
sudo systemctl enable elasticsearch #untuk mengaktifkan saat startup
sudo systemctl restart elasticsearch
```

Cek apakah sudah berjalan dengan perintah

```shell
sudo systemctl status elasticsearch
```

Kalau muncul pesan kira-kira seperti berikut ini, berarti elasticsearch berhasil berjalan dengan baik

```log
● elasticsearch.service - Elasticsearch
   Loaded: loaded (/usr/lib/systemd/system/elasticsearch.service; enabled; vendor preset: enabled)
   Active: active (running) since Fri 2020-10-16 15:07:56 UTC; 22s ago
     Docs: https://www.elastic.co
 Main PID: 14964 (java)
    Tasks: 62 (limit: 4686)
   CGroup: /system.slice/elasticsearch.service
           ├─14964 /usr/share/elasticsearch/jdk/bin/java -Xshare:auto -Des.networkaddress.cache.ttl=60 -Des.networkaddress.cache.negative.ttl=10 -XX:+AlwaysPreTouch -Xss1m -
           └─15196 /usr/share/elasticsearch/modules/x-pack-ml/platform/linux-x86_64/bin/controller

Oct 16 15:07:40 ip-172-31-1-195 systemd[1]: Starting Elasticsearch...
Oct 16 15:07:56 ip-172-31-1-195 systemd[1]: Started Elasticsearch.
```

Cek apakah elasticsearch sudah berjalan dengan perintah `curl 127.0.0.1:9200`

```log
{
  "name" : "ip-172-31-1-195",
  "cluster_name" : "elasticsearch",
  "cluster_uuid" : "KCbRtrGhTj2DLor77Q4yTQ",
  "version" : {
    "number" : "7.9.2",
    "build_flavor" : "default",
    "build_type" : "deb",
    "build_hash" : "d34da0ea4a966c4e49417f2da2f244e3e97b4e6e",
    "build_date" : "2020-09-23T00:45:33.626720Z",
    "build_snapshot" : false,
    "lucene_version" : "8.6.2",
    "minimum_wire_compatibility_version" : "6.8.0",
    "minimum_index_compatibility_version" : "6.0.0-beta1"
  },
  "tagline" : "You Know, for Search"
}
```

Kalau muncul seperti pesan diatas, berarti semuanya berjalan dengan baik, kita dapat melanjutkan katahap berikutnya

### Kibana

Setelah melakukan instalasi elasticsearch berikutnya kita perlu mengaktifkan kibana agar kita dapat menggunakannya elastic stack dengan nyaman. Untuk menginstalnya kita hanya perlu menjalankan perintah `sudo apt install -y kibana`. Namun, sebelum menjalankan kibana kita perlu melakukan konfigurasi agar kibana dapat diakses dari non-localhost. Yaitu, dengan melakukan sedikit perubahan pada file `/etc/kibana/kibana.yml`. Silahkan buka file tersebut dengan editor kesayangan. Kemudian cari bagian `server.host: "localhost"`, ubah menjadi `server.host: "0.0.0.0"`, jangan lupa di uncomment dong. Kira-kira isi dari file konfigurasinya seperti berikut.

```yaml
# Kibana is served by a back end server. This setting specifies the port to use.
#server.port: 5601

# Specifies the address to which the Kibana server will bind. IP addresses and host names are both valid values.
# The default is 'localhost', which usually means remote machines will not be able to connect.
# To allow connections from remote users, set this parameter to a non-loopback address.
server.host: "0.0.0.0"

# Enables you to specify a path to mount Kibana at if you are running behind a proxy.
# Use the `server.rewriteBasePath` setting to tell Kibana if it should remove the basePath
# from requests it receives, and to prevent a deprecation warning at startup.
# This setting cannot end in a slash.
#server.basePath: ""
...
```

Kita juga bisa mengubah port untuk mengakses kibana yang defaultnya `5601` menjadi `terserah` dengan mengedit bagian `server.port`. Untuk konfigurasi lain diabaikan dulu, karena kita coba yang `EZ` saja. Oh, untuk koneksi dengan elasticsearch kita tidak perlu melakukan apa-apa pada lab ini, karena elastic stacknya berada dalam satu instance yang sama.

Setelah itu, kita start kibana dengan perintah berikut

```shell
sudo systemctl daemon-reload
sudo systemctl enable kibana #untuk mengaktifkan saat startup
sudo systemctl start
```

Untuk kibana sendiri proses startupnya akan sedikit lama karena dia melakukan load GUI dll. Untuk mengetahui apakah sudah jalan apa belum, coba masukan perintah `sudo ss -tulpn | grep 5601` jika muncul sesuatu maka kibana sudah ready.

```log
tcp   LISTEN  0       128                   0.0.0.0:5601          0.0.0.0:*      users:(("node",pid=15695,fd=18))
```

Kemudian, coba akses dengan menggunakan browser kealamat dari server kita, dengan port `5601`. Dan pastikan muncul seperti berikut ini

![Kibana get started](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/posts/2020-10-16-install-elastic-stack-pada-satu-instance/xJoIq6G_l0zwji.webp)

Sampai sini sebenarnya kita sudah bisa coba eksplore data menggunakan Kibana dan Elaticsearch dengan sample data yang disediakan oleh kibana. Tapi tidak dong, kita akan mencoba menginstal beats yang berguna untuk mengambil data logs dari server dan mengirimkannya ke elasticsearch. Agar kita dapat merasakan sensasi monitoring lognya elastic stack.

### Filebeat

Disini, kita tidak akan menggunakan logstash, dikarenakan filebeat sendiri dapat langsung mengirimkan datanya ke elasticsearch, dimana elasticsearch dapat langsung mengolah data log yang dikirimkan oleh filebeat. Untuk menginstal filebeat kita tidak perlu menambahkan repositori lagi. Cukup jalankan perintah `sudo apt install -y filebeat` untuk menginstalnya.

Untuk mengambil data log dari instance, filebeat sudah menyapkan modules yang dapat kita gunakan, modules apa saja yang tersedia dapat dilihat pada link berikut [filebeat modules](https://www.elastic.co/guide/en/beats/filebeat/current/filebeat-modules.html). Kita akan mencoba untuk menggunakan [system module](https://www.elastic.co/guide/en/beats/filebeat/current/filebeat-module-system.html), untuk mengaktifkan module tersebut masukan perintah `filebeat moduels enable system`. Setelah diaktifkan jalankan filebeat dengan perintah.

```shell
sudo systemctl daemon-reload
sudo systemctl enable filebeat #untuk mengaktifkan saat startup
sudo systemctl restart filebeat
```

Cek status filebeat dengan perintah `sudo journalctl -fu filebeat`, dan pastikan terdapat pesan koneksi berhasil

```log
...
Oct 16 16:20:07 ip-172-31-1-195 filebeat[16233]: 2020-10-16T16:20:07.494Z        INFO        [index-management]        idxmgmt/std.go:446        Set settings.index.lifecycle.rollover_alias in template to {filebeat-7.9.2 {now/d}-000001} as ILM is enabled.
Oct 16 16:20:07 ip-172-31-1-195 filebeat[16233]: 2020-10-16T16:20:07.494Z        INFO        [index-management]        idxmgmt/std.go:450        Set settings.index.lifecycle.name in template to {filebeat {"policy":{"phases":{"hot":{"actions":{"rollover":{"max_age":"30d","max_size":"50gb"}}}}}}} as ILM is enabled.
Oct 16 16:20:07 ip-172-31-1-195 filebeat[16233]: 2020-10-16T16:20:07.495Z        INFO        template/load.go:89        Template filebeat-7.9.2 already exists and will not be overwritten.
Oct 16 16:20:07 ip-172-31-1-195 filebeat[16233]: 2020-10-16T16:20:07.495Z        INFO        [index-management]        idxmgmt/std.go:298        Loaded index template.
Oct 16 16:20:07 ip-172-31-1-195 filebeat[16233]: 2020-10-16T16:20:07.496Z        INFO        [index-management]        idxmgmt/std.go:309        Write alias successfully generated.
Oct 16 16:20:07 ip-172-31-1-195 filebeat[16233]: 2020-10-16T16:20:07.500Z        INFO        [publisher_pipeline_output]        pipeline/output.go:151        Connection to backoff(elasticsearch(http://localhost:9200)) established
```

Disini kita tidak melakukan konfigurasi apa-apa dikarenakan kita belum melakukan setup password untuk elasticsearch dan juga stack yang kita gunakan berada dalam satu instance. Sampai sini kita belum dapat melihat apa-apa dikibana kita, dikarenakan kita perlu melakukan konfigurasi untuk [Index](https://www.elastic.co/guide/en/kibana/current/managing-indices.html), membuat [Visualize](https://www.elastic.co/guide/en/kibana/current/visualize.html) ataupun membuat [Dashboard](https://www.elastic.co/guide/en/kibana/current/dashboard.html).

Untungnya, filebeat menyediakan perintah yang dapat kita gunakan untuk membuat itu semua secara otomatis. Yaitu dengan perintah

```shell
sudo filebeat setup
```

Kalau sudah selesai kira-kira muncul pesan seperti ini

```log
Overwriting ILM policy is disabled. Set `setup.ilm.overwrite: true` for enabling.

Index setup finished.
Loading dashboards (Kibana must be running and reachable)
Loaded dashboards
Setting up ML using setup --machine-learning is going to be removed in 8.0.0. Please use the ML app instead.
See more: https://www.elastic.co/guide/en/machine-learning/current/index.html
Loaded machine learning job configurations
Loaded Ingest pipelines
```

Untuk menampilkan log system yang dibaca oleh elastic stack dapat dilihat pada menu `Kibana` > `Discover`.

![Discover](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/posts/2020-10-16-install-elastic-stack-pada-satu-instance/9xlhMew_fc0y9a.webp)

Nah, filebeat juga sudah menyiapkan dashboard buat kita gunakan. Bisa dilihat pada menu `Kibana` > `Dashboard`. Setelah itu cari dashboard yang ingin kita lihat, karena disini kita baru mengaktifkan module system, kita bisa menampilkan SSH login untuk intance kita, dengan dashboard yang bernama `[Filebeat System] SSH login attempts ECS`. Kira-kira tampilannya seperti berikut ini.

![SSH login attempts ECS - 1](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/posts/2020-10-16-install-elastic-stack-pada-satu-instance/NzMS10h_rt55kg.webp)

![SSH login attempts ECS - 2](https://res.cloudinary.com/kudaliar032/image/upload/aditaja-blog/posts/2020-10-16-install-elastic-stack-pada-satu-instance/iKqEd2M_vlsaod.webp)

Pada dashboard tersebut kita bisa melihat beberapa informasi, seperti jumlah usaha login SSH yang dilakukan dalam rentang waktu tertentu, lokasi asal koneksi dilakukan, username yang paling sering digunakan untuk login gagal, dll.

## Kesimpulan

Elastic stack adalah salah satu tools yang dapat kita gunakan untuk membuat monitoring system. Pada elastic stack sendiri sesuai dengan namanya terdapat beberapa stack atau komponen yang saling bekerja sama, diantaranya Beats, Logstash, Elasticsearch, dan Kibana. Pada saat melakukan instalasi elastic stack, tidak harus menginstal seluruh komponent stack yang ada, instal saja sesuai kebutuhan. Untuk melakukan instalasi elastic stack dapat dilakukan pada satu buat instance saja atau dibuat sebuah cluster elastic stack. Dimana, metode instalasi yang digunakan ada banyak, antara lain menggunakan APT Repository, RPM file, DEB file, extract file, dll. Mungkin, cukup sekian dari saya, salah kurangnanya mohon maaf, karena saya juga baru belajar untuk elastic stack, jika ada masukan silahkan berkomentar. Semoga bermanfaat, terima kasih :pray: