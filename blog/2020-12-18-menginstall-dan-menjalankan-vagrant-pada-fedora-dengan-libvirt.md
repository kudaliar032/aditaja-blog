---
title: Menginstall dan Menjalankan Vagrant pada Fedora dengan libvirt
tags:
- fedora
- linux
- vagrant
---

<img src="https://res.cloudinary.com/kudaliar032/image/upload/v1608275048/aditaja-blog/headers/vagrant-libvirt_o3tfde.png" width="100%" style={{marginBottom: "25px"}} />

Halo, saya ingin sedikit mencoret-coret mengenai cara yang saya gunakan untuk menginstall dan menjalankan vagrant pada laptop saya. Dimana saat ini saya menggunakan sistem operasi Fedora 33, di sini saya akan menggunakan Libvirt sebagai provider dari vagrantnya. Diambil dari situsnya, vagrant adalah

<!-- truncate -->

> Vagrant is a tool for building and managing virtual machine environments in a single workflow. With an easy-to-use workflow and focus on automation, Vagrant lowers development environment setup time, increases production parity, and makes the "works on my machine" excuse a relic of the past.
>
> https://www.vagrantup.com/intro

Ya, intinya vagrant digunakan untuk menjalankan dan memenajemen mesin virtualisasi untuk keperluan development, nge-lab, dll. Kalau mau lebih detail bisa langsung liat-liat di situs [vagrant](https://www.vagrantup.com/) saja.

## Langkah Instalasi Vagrant + libvirt

### Periksa virtualisasi support

Pada processor **Intel**
```bash
kudaliar@konidin[~] > lscpu | grep vmx
```

Pada processor **AMD**
```bash
kudaliar@konidin[~] > lscpu | grep svm
```

Pastikan saat menjalankan perintah tersebut ada yang muncul. Jika tidak silahkan lakukan sesuatu.

### Install libvirt

Untuk menjalankan vagrant di komputer local anda, anda perlu memiliki tools virtualisasi baik itu VirtualBox, libvirt, atau lainnya yang disupport vagrant tentunya. Disini saya akan menggunakan libvirt. Untuk menginstallnya anda perlu menjalankan perintah berikut.

```bash
kudaliar@konidin[~] > sudo dnf install qemu-kvm libvirt libguestfs-tools virt-install rsync
```

### Aktifkan libvirtd

Jika anda baru melakukan instalasi perlu menjalankan libvirtd terlebih dahulu, dapat menggunakan perintah

```bash
kudaliar@konidin[~] > sudo systemctl start libvirtd
```

agar libvirtd dijalankan saat startup, eksekusi perintah berikut

```bash
kudaliar@konidin[~] > sudo systemctl enable libvirtd
```

### Install vagrant

Install vagrant dikomputer milik anda, dapat dengan menggunakan binnary file yang diunduh dari https://www.vagrantup.com/downloads. Atau menggunakan package managernya fedora.

```bash
kudaliar@konidin[~] > sudo dnf install vagrant
kudaliar@konidin[~] > vagrant --version
Vagrant 2.2.14
```

### Install vagrant libvirt plugin

Untuk dapat menjalankan vagrant dengan libvirt anda perlu menginstall pluginnya di vagrant

```bash
kudaliar@konidin[~] > vagrant plugin install vagrant-libvirt
Installing the 'vagrant-libvirt' plugin. This can take a few minutes...
Building native extensions. This could take a while...
Building native extensions. This could take a while...
Installed the plugin 'vagrant-libvirt (0.3.0)'!
kudaliar@konidin[~] > vagrant plugin list                   
vagrant-libvirt (0.3.0, global)
```

Jika tidak ada error, disini anda sudah berhasil menginstall vagrant + libvirt. Vagrant siap digunakan.

## Menjalankan Mesin Virtual dengan Vagrant

### Menambahkan vagrant box

Sebelum kita dapat menjalankan sebuah virtual machine di vagrant kita membutuhkan sesuatu yang dinamakan `box`. Apa itu?

> Boxes are the package format for Vagrant environments. A box can be used by anyone on any platform that Vagrant supports to bring up an identical working environment.
>
> https://www.vagrantup.com/docs/boxes

Ya gampangnya, box adalah template yang digunakan untuk menjalankan sebuah virtual machine. Mirip-mirip `docker image` fungsinya. Untuk menambahkan box di mesin local anda, anda dapat menjalankan perintah berikut

```bash
kudaliar@konidin[/m/h/l/v/vagrant-test] > vagrant box add centos/8 --provider=libvirt
==> box: Loading metadata for box 'centos/8'
    box: URL: https://vagrantcloud.com/centos/8
==> box: Adding box 'centos/8' (v2011.0) for provider: libvirt
    box: Downloading: https://vagrantcloud.com/centos/boxes/8/versions/2011.0/providers/libvirt.box
Download redirected to host: cloud.centos.org
    box: Calculating and comparing box checksum...
==> box: Successfully added box 'centos/8' (v2011.0) for 'libvirt'!
```

Pada perintah tersebut saya menambahkan box untuk sistem operasi Centos 8.

### Membuat Vagrantfile

Untuk dapat menjalankan mesin virtual dibutuhkan sebuah file `Vagrantfile` yang berisikan konfigurasi dari mesin virtual yang akan kita jalankan. Disini kita dapat mendefinisikan berbagai hal, seperti spesifikasi mesin, jumlah mesin, dan lainnya. Untuk membuatnya anda dapat menggunakan perintah berikut

```bash
kudaliar@konidin[/tmp] > mkdir -p vagrant-test     
kudaliar@konidin[/tmp] > cd vagrant-test
kudaliar@konidin[/t/vagrant-test] > vagrant init
A `Vagrantfile` has been placed in this directory. You are now
ready to `vagrant up` your first virtual environment! Please read
the comments in the Vagrantfile as well as documentation on
`vagrantup.com` for more information on using Vagrant.
kudaliar@konidin[/t/vagrant-test] > vim Vagrantfile
```

Perintah `vagrant init` untuk membuat sebuah file `Vagrantfile` secara otomatis, kemudian kita perlu melakukan sedikit perubahan yang kita butuhkan. Seperti misalkan mengubah sistem operasi dan sebagainya. Disini saya akan merubah sistem operasinya, dengan memodifikasi bagian berikut

```diff
-   config.vm.box = "base"
+   config.vm.box = "centos/8"
```

### Menjalankan mesin virtual dan remote mesin

Terakhir, untuk menjalankan mesin, kita hanya perlu menjalankan perintah `vagrant up`. Jika dimintai password seperti berikut, masukan saja password user anda

![](https://i.imgur.com/oF5kUzA.png)

```bash
kudaliar@konidin[/m/h/l/v/vagrant-test] > vagrant up     
Bringing machine 'default' up with 'libvirt' provider...
==> default: Checking if box 'centos/8' version '2011.0' is up to date...
==> default: Uploading base box image as volume into Libvirt storage...
==> default: Creating image (snapshot of base box volume).
==> default: Creating domain with the following settings...
==> default:  -- Name:              vagrant-test_default
==> default:  -- Domain type:       kvm
==> default:  -- Cpus:              1
==> default:  -- Feature:           acpi
==> default:  -- Feature:           apic
==> default:  -- Feature:           pae
==> default:  -- Memory:            512M
==> default:  -- Management MAC:    
==> default:  -- Loader:            
==> default:  -- Nvram:             
==> default:  -- Base box:          centos/8
==> default:  -- Storage pool:      default
==> default:  -- Image:             /mnt/hdd-3/kvm/vagrant-test_default.img (11G)
==> default:  -- Volume Cache:      default
==> default:  -- Kernel:            
==> default:  -- Initrd:            
==> default:  -- Graphics Type:     vnc
==> default:  -- Graphics Port:     -1
==> default:  -- Graphics IP:       127.0.0.1
==> default:  -- Graphics Password: Not defined
==> default:  -- Video Type:        cirrus
==> default:  -- Video VRAM:        9216
==> default:  -- Sound Type:
==> default:  -- Keymap:            en-us
==> default:  -- TPM Path:          
==> default:  -- INPUT:             type=mouse, bus=ps2
==> default: Creating shared folders metadata...
==> default: Starting domain.
==> default: Waiting for domain to get an IP address...
==> default: Waiting for SSH to become available...
    default:
    default: Vagrant insecure key detected. Vagrant will automatically replace
    default: this with a newly generated keypair for better security.
    default:
    default: Inserting generated public key within guest...
    default: Removing insecure key from the guest if it's present...
    default: Key inserted! Disconnecting and reconnecting using new SSH key...
==> default: Rsyncing folder: /mnt/hdd-2/learn/vagrant/vagrant-test/ => /vagrant
kudaliar@konidin[/m/h/l/v/vagrant-test] >
```

Setelah mesin berhasil dijalankan, maka kita dapat melakukan remote kedalam mesin virtual kita dengan menjalankan perintah `vagrant ssh`. Setelah masuk, silahkan lakukan apa yang hendak anda lakukan disana.

```bash
kudaliar@konidin[/m/h/l/v/vagrant-test] > vagrant ssh
Last login: Fri Dec 18 07:20:50 2020 from 192.168.121.1
[vagrant@localhost ~]$ free -h
              total        used        free      shared  buff/cache   available
Mem:          465Mi       130Mi       140Mi       4.0Mi       194Mi       317Mi
Swap:         2.0Gi          0B       2.0Gi
[vagrant@localhost ~]$
```

Mungkin itu saja catatan saya kali ini, semoga bermanfaat untuk kita semua. Terima kasih.

## Troubleshooting

Tambahan, berikut adalah beberapa error yang sempat saya temui dan bagaimana saya mengatasinya.

### /usr/lib64/libk5crypto.so.3: undefined symbol: EVP_KDF_ctrl, version OPENSSL_1_1_1b

Log lengkap: https://pastebin.com/2BRgpJ1J  
Solusi: https://github.com/hashicorp/vagrant/issues/11020#issuecomment-540043472

### libvirt library not found in default locations (RuntimeError)

Solusi: https://github.com/vagrant-libvirt/vagrant-libvirt/issues/951#issuecomment-443654745
