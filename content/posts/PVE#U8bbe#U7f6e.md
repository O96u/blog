---
slug: proxmox-ve-setup
title: PVE设置
description: <video controls="" src=" </video 基础设置 1\. 合并硬盘分区 1.1 删除local lvm lvremove pve/data 1.2 扩容local lvextend l +100%FREE r pv
date: 2025-02-22
updated: 2025-06-27
draft: false
pinned: false
tags:
  - diy
cover: https://s.muxui.com:8015/OgpA40kQEfTm.webp
toc: true
comments: true
searchable: true
---




<iframe width="100%" height="468" src="https://player.bilibili.com/player.html?isOutside=true&aid=113448457341619&bvid=BV1jZDeYfEv1&cid=26675513689&p=1" title="bilibili video player" frameborder="0" allowfullscreen></iframe>

## 基础设置

### 1\. 合并硬盘分区

#### 1.1 删除local-lvm

```bash
lvremove pve/data
```

#### 1.2 扩容local

```bash
lvextend -l +100%FREE -r pve/root
```

#### 1.3 然后数据中心进行图形界面的local-lvm删除和local编辑。

### 2\. 确认网络是否正常

ping www.baidu.com 如果ping不通，修改网关和dns。

### 3\. 更换软件源

```bash
https://mirrors.tuna.tsinghua.edu.cn/help/debian
```

```bash
nano /etc/apt/sources.list
```

添加网页上的内容，保存退出。

建议全部修改成清华源：

```bash
deb https://mirrors.tuna.tsinghua.edu.cn/debian-security bookworm-security main contrib non-free non-free-firmware
```

### 4\. 修改pve源

#### 4.1 添加清华源

```bash
https://mirrors.tuna.tsinghua.edu.cn/help/proxmox
```

```bash
nano /etc/apt/sources.list.d/pve-no-subscription.list
```

加入内容   

```bash
deb https://mirrors.tuna.tsinghua.edu.cn/proxmox/debian/pve bookworm pve-no-subscription
```

#### 4.2 去掉企业源

```bash
nano /etc/apt/sources.list.d/pve-enterprise.list
```

前面加入#

#### 4.3 去掉ceph源（有需要的可以之后自行修改）

```bash
nano /etc/apt/sources.list.d/ceph.list
```

前面加入#

PVE更新--存储库里面添加pve-no-subscription

### 5\. 去掉登录弹窗：

```bash
sed -i.backup -z "s/res === null || res === undefined || \!res || res\n\t\t\t.data.status.toLowerCase() \!== 'active'/false/g" /usr/share/javascript/proxmox-widget-toolkit/proxmoxlib.js && systemctl restart pveproxy.service
```

### 6\. 更新软件源，升级软件

```bash
apt update

apt upgrade -y
```

### 7\. 开启IPV6（可选）

```bash
nano /etc/sysctl.conf
```

添加如下内容：

```bash
net.ipv6.conf.all.accept_ra=2

net.ipv6.conf.default.accept_ra=2

net.ipv6.conf.vmbr0.accept_ra=2

net.ipv6.conf.all.autoconf=1

net.ipv6.conf.default.autoconf=1

net.ipv6.conf.vmbr0.autoconf=1
```

重启系统：reboot

##

硬盘直通

### 1\. 查看硬盘信息

```bash
ls -l /dev/disk/by-id/
```

### 2\. 设置硬盘直通

```bash
qm set 100 -sata1 /dev/disk/by-id/ata-WDC_WD5000AAKX-753CA1_WD-WMAYU7283459

qm set 100 -sata2 /dev/disk/by-id/ata-WDC_WD5000AAKX-00ERMA0_WD-WCC2E6DHKRCX

qm set 100 -sata3 /dev/disk/by-id/ata-WDC_WD5000AAKX-08U6AA0_WD-WCC2E2LDAVCN
```

### 3\. 解除硬盘直通

```bash
qm set 100 -sata1 none

qm set 100 -sata2 none

qm set 100 -sata3 none
```
