---
title: "Nyobain Pasang ModSecurity di OpenLiteSpeed"
date: 2021-08-13T11:25:36+08:00
draft: false
toc: false
backtotop: true
tags:
- "openlitespeed"
- "web server"
- "server"
images:
- "https://imgur.com/veYLAPJ.jpg"
---

Hallo semuanya, setelah kemaren saya mencoba menggunakan beberapa versi sekaligus pada OpenLiteSpeed yang bisa dilihat di [Menjalankan Beberapa Versi PHP pada OpenLiteSpeed]({{< ref "menjalankan-beberapa-versi-php-pada-openlitespeed" >}}) kali ini saya mencoba untuk memasang tools security yaitu WAF (Web Application Firewall) di web server yang men jalankan OpenLiteSpeed. Salah satu WAF yang menurut saya ok yaitu ModSecurity yang mana ModSecurity sendiri itu open-source, cross flatform, dan tentunya bisa diintegrasikan dengan web server popular seperti Apache, Nginx dan OpenLiteSpeed. Bagaimana caranya langsung sahaja.

## Lingkungan Lab

- **Sistem Operasi**: Ubuntu 20.04
- **Memory**: 8GB
- **vCPU**: 4

## Langkah-langkah

### Memasang ModSecurity di OpenLiteSpeed

- Pastikan anda sudah menginstall openlite sebelumnya, masuk ke user root agar saat mengeksekusi perintah-perintahnya tidak perlu menggunakan `sodo`, tapi bebas sih senyamannya
- Kemudian cek dulu, apakah modul untuk modsecurity sudah terpasang atau belum, coba masuk ke Server Root dari OpenLiteSpeed dan lihat didalam directory `modules`, jika sudah ada file bernama `mod_security.*` berarti modulenya sudah ada. Jika belum kita harus menginstallnya dulu

```bash
cd /usr/local/lsw
ls modules
```

![](https://imgur.com/NiLUa3h.jpg)

- Di sini saya belum menginstallnya, maka saya harus menginstallnya dengan perintah

```bash
apt install ols-modsecurity
```

![](https://imgur.com/iS4G3pD.jpg)

- Sudah begitu saja proses installasinya

### Mengaktifkan Modul dan Test Rule

- Setalah berhasil dipasang kita tinggal mengaktifkan dan coba menggunakan rule sederhana, yaitu kita akan memblock untuk mengakses file dengan nama tertentu
- Masuk kedalam web admin, buka menu `Server Configuration` > `Modules`, dan klik tambah untuk menambahkan modul modsecurity

![](https://imgur.com/55mT6GQ.jpg)

- Kemudian isikan `Module` dengan `mod_security`, untuk `Module Parameters` isikan kira-kira seperti berikut

```text
modsecurity  on
modsecurity_rules `
SecRuleEngine On
SecRule REQUEST_URI "@pm phpinfo.php" "phase:1,id:'10',log,deny,status:403"
`
```

![](https://imgur.com/YLr4j2y.jpg)

- Setelah itu simpan dan restart untuk menjalankan perubahan konfigurasi yang baru saja dilakukan

![](https://imgur.com/knwsNzg.jpg)

- Setelah selesai di restart, coba akses dan pakstikan dapat response 403 (Forbidden)

![](https://imgur.com/fqryjNr.jpg)

- Untuk memastikan benar, coba ubah pada module parameters `modsecurity` menjadi `off`, kemudian akses kembali, pastikan semuanya baik-baik saja

![](https://imgur.com/RoYgnKp.jpg)

### Mengaktifkan OWASP (Open Web Application Security Project®) ModSecurity Rule pada OpenLiteSpeed

Sampai poin sebelumnya sebenarnya ModSecurity sudah bisa digunakan, tapi disini kita belum memiliki rule yang dapat digunakan untuk melakukan bloking terhadap traffic yang berbahaya, kita harus menambahkannya secara manual atau kita bisa juga menggunakan rules yang sudah ada seperti yang dibuat oleh [COMODO](https://waf.comodo.com/) dan [OWASP](https://coreruleset.org/). Kali ini saya mencoba untuk menggunakan rule yang telah disediakan oleh OWASP

- Pertama-tama kita mendownload dulu rulesnya, dan kemudian extract

```bash
mkdir -p /usr/local/lsws/modsec/owasp
cd /usr/local/lsws/modsec/owasp
wget https://github.com/coreruleset/coreruleset/archive/refs/tags/v3.3.2.zip
unzip v3.3.2.zip
mv coreruleset-3.3.2 crs332
cd crs332
pwd
# /usr/local/lsws/modsec/owasp/crs332
```

- Copy konfigurasi

```bash
cp crs-setup.conf.example crs-setup.conf
```

- Rename beberapa rules yang ada pada directory `rules`, misalkan

```bash
cd rules
mv REQUEST-900-EXCLUSION-RULES-BEFORE-CRS.conf.example REQUEST-900-EXCLUSION-RULES-BEFORE-CRS.conf
cd ..
```

- Setelah itu buat master file untuk owasp-nya, berikan nama `owasp-master.conf` dan masukan konfigurasi berikut

```
include /usr/local/lsws/modsec/owasp/crs332/crs-setup.conf
include /usr/local/lsws/modsec/owasp/crs332/rules/REQUEST-900-EXCLUSION-RULES-BEFORE-CRS.conf
include /usr/local/lsws/modsec/owasp/crs332/rules/REQUEST-901-INITIALIZATION.conf
include /usr/local/lsws/modsec/owasp/crs332/rules/REQUEST-903.9001-DRUPAL-EXCLUSION-RULES.conf
include /usr/local/lsws/modsec/owasp/crs332/rules/REQUEST-903.9002-WORDPRESS-EXCLUSION-RULES.conf
include /usr/local/lsws/modsec/owasp/crs332/rules/REQUEST-903.9003-NEXTCLOUD-EXCLUSION-RULES.conf
include /usr/local/lsws/modsec/owasp/crs332/rules/REQUEST-903.9004-DOKUWIKI-EXCLUSION-RULES.conf
include /usr/local/lsws/modsec/owasp/crs332/rules/REQUEST-903.9005-CPANEL-EXCLUSION-RULES.conf
include /usr/local/lsws/modsec/owasp/crs332/rules/REQUEST-903.9006-XENFORO-EXCLUSION-RULES.conf
include /usr/local/lsws/modsec/owasp/crs332/rules/REQUEST-905-COMMON-EXCEPTIONS.conf
include /usr/local/lsws/modsec/owasp/crs332/rules/REQUEST-910-IP-REPUTATION.conf
include /usr/local/lsws/modsec/owasp/crs332/rules/REQUEST-911-METHOD-ENFORCEMENT.conf
include /usr/local/lsws/modsec/owasp/crs332/rules/REQUEST-912-DOS-PROTECTION.conf
include /usr/local/lsws/modsec/owasp/crs332/rules/REQUEST-913-SCANNER-DETECTION.conf
include /usr/local/lsws/modsec/owasp/crs332/rules/REQUEST-920-PROTOCOL-ENFORCEMENT.conf
include /usr/local/lsws/modsec/owasp/crs332/rules/REQUEST-921-PROTOCOL-ATTACK.conf
include /usr/local/lsws/modsec/owasp/crs332/rules/REQUEST-930-APPLICATION-ATTACK-LFI.conf
include /usr/local/lsws/modsec/owasp/crs332/rules/REQUEST-931-APPLICATION-ATTACK-RFI.conf
include /usr/local/lsws/modsec/owasp/crs332/rules/REQUEST-932-APPLICATION-ATTACK-RCE.conf
include /usr/local/lsws/modsec/owasp/crs332/rules/REQUEST-933-APPLICATION-ATTACK-PHP.conf
include /usr/local/lsws/modsec/owasp/crs332/rules/REQUEST-934-APPLICATION-ATTACK-NODEJS.conf
include /usr/local/lsws/modsec/owasp/crs332/rules/REQUEST-941-APPLICATION-ATTACK-XSS.conf
include /usr/local/lsws/modsec/owasp/crs332/rules/REQUEST-942-APPLICATION-ATTACK-SQLI.conf
include /usr/local/lsws/modsec/owasp/crs332/rules/REQUEST-943-APPLICATION-ATTACK-SESSION-FIXATION.conf
include /usr/local/lsws/modsec/owasp/crs332/rules/REQUEST-944-APPLICATION-ATTACK-JAVA.conf
include /usr/local/lsws/modsec/owasp/crs332/rules/REQUEST-949-BLOCKING-EVALUATION.conf
```

- Update konfigurasi mod_security pada OpenLiteSpeed pada bagian `Module Parameters` menjadi seperti berikut ini

```
modsecurity  on
modsecurity_rules `
SecRuleEngine On
`
modsecurity_rules_file /usr/local/lsws/modsec/owasp/crs332/owasp-master.conf
```

- Setelah itu simpan dan restart OpenLiteSpeed. Selesai

### Uji Coba WAF

Setelah selesai restart kita dapat mencoba apakah semua yang dilakukan sudah berjalan apa tidak, untuk mencobanya dapat menggunakan tools berikut https://github.com/wallarm/gotestwaf

- Install docker
- Jalankan perintah berikut

```bash
docker run -v ${PWD}/reports:/go/src/gotestwaf/reports wallarm/gotestwaf --url=http://test.domain.ltd/
```

- Setelah selesai kira-kira akan tampil seperti berikut, yang menandakan bahwa WAF sudah berjalan

![](https://imgur.com/smhBZe9.jpg)

Sudah semunya, saya rasa cukup sampai sini saja tulisan kali ini, semua bermanfaat untuk kita semua :smiley: :smiley: :smiley: Terima kasih :pray:
