---
slug: windows-update-blocker
title: Windows 更新阻止程序 v1.8
description: 与以前版本的 Windows 相比，Windows 11 和 10 对操作系统更新行为的 UI 控制较少，没有使用控制面板或设置关闭 Windows 更新的选项Windows 11 和 Windows 10 中的应用程序会自动检查更新并安装
date: 2025-05-13
updated: 2025-05-13
draft: false
pinned: false
tags:
  - windows
toc: true
comments: true
searchable: true
---




![](https://s.muxui.com:8015/images/2026/09/wR1CAtK37UP6.webp)

与以前版本的 Windows 相比，Windows 11 和 10 对操作系统更新行为的 UI 控制较少，没有使用控制面板或设置关闭 Windows 更新的选项Windows 11 和 Windows 10 中的应用程序会自动检查更新并安装任何找到的更新，无论您是否喜欢。这项新功能实际上对大多数用户来说非常方便。如果您想控制更新过程，可以禁用 Windows 更新服务。这需要您打开服务管理器，找到该服务并更改其启动参数和状态。之后，每当您希望操作系统检查更新时，您都必须再次启用该服务（这看起来并不那么容易）。

![Windows 更新阻止程序主要](https://www.sordum.org/wp-content/uploads/2023/06/windos_update_blocker_main.png "Windows 更新阻止程序主要")

Windows Update Blocker 是一款免费软件，只需单击按钮即可帮助您彻底禁用或启用 Windows 系统上的自动更新。此实用程序是便携式的，这意味着您无需再经历安装过程，并且卸载后硬盘上不会留下任何残留物。如果您将程序文件放置到外部数据设备中，就可以随身携带 Windows Update Blocker，并在您接触的任何计算机上使用它，只要您的计算机配置正确，并且不想冒险让更新搞乱系统。此实用程序就是为这样的人准备的。

**工作原理**

下载后，将 Windows Update Blocker 解压到所需位置，然后运行它

![windows 更新阻止程序被阻止](https://www.sordum.org/wp-content/uploads/2023/06/windos_update_blocker_blocked_status.png "windows 更新阻止程序被阻止")

服务状态图标将显示您的 Windows 更新服务状态，如果您想阻止自动 Windows 更新，请选择“禁用服务”并单击“立即应用”按钮，保护服务设置可以防止不受控制的更改（推荐）。

**如何阻止其他服务并保护设置**

Windows 更新阻止程序新版本允许用户将任何其他服务添加到 Wub.ini 文件中以阻止它，首先请编辑 Wub.ini 文件并在“dosvc=2,4”行下添加所需的服务名称，例如，如果您想阻止“Windows 更新医疗服务”，请打开服务并找到它

![Windows 服务](https://www.sordum.org/wp-content/uploads/2023/06/services.png "Windows 服务")

然后单击它并复制服务名称

![Windows 更新医疗服务](https://www.sordum.org/wp-content/uploads/2023/06/windows_update_medic_service.png "Windows 更新医疗服务")

在 dosvc=2,4 行下写入或粘贴服务名称

![wub.ini 文件](https://www.sordum.org/wp-content/uploads/2023/06/wub_ini_file.png "wub.ini 文件")

最后打开 Windows 更新阻止程序，然后点击“立即应用”按钮。如果您想在一段时间后删除最近添加的服务，请按照以下步骤操作：

1\. 打开 Windows Update Blocker，选择“启用服务”选项，然后点击“立即应用”按钮。

2\. 从 Wub.ini 文件中删除所需的服务行。

3\. 现在，您可以选择“禁用服务”和“保护服务设置”选项。

**服务列表选项**

在“菜单”按钮下有一个“服务列表选项”选项，点击后会弹出“服务列表选项”窗口。通过此图形用户界面，您可以轻松控制已添加到 Wub.ini 部分的服务。您最多可以向 Wub.ini 添加 25 个服务。Wausrv 服务仅供参考，因此您无法对其进行编辑。

![Wub 服务列表选项](https://www.sordum.org/wp-content/uploads/2023/06/wub_service_list_options.png "Wub 服务列表选项")

**注意：**如果 Windows 更新服务无法启动，或者即使您已启用 Windows 更新，仍然出现问题，请**重启系统**并重试。**关闭**Windows 更新后，某些 Windows 进程或程序可能会尝试打开并修复 Windows 更新，**从而导致 Windows 更新损坏。**如果重启系统后更新仍未打开，[请使用Microsoft](https://support.microsoft.com/en-us/windows/windows-update-troubleshooter-19bc41ca-ad72-ae67-af3c-89ce169755dd)提供的 Windows 更新疑难解答

Windows Update Blocker 支持命令行选项来自动执行 Windows Update Blocker 任务：

![Windows 更新阻止程序 Cmd 参数](https://www.sordum.org/wp-content/uploads/2023/06/wub_cmd_parameters.png "Windows 更新阻止程序 Cmd 参数")

**注意：** Wub 软件不会阻止 Microsoft Defender 更新。

**支持的操作系统：** Windows 11、Windows 10、Windows 8.1、Windows 8、Windows 7、Windows Vista、Windows XP（32\\64 位）。

**支持的语言：**英语、土耳其语、德语、希伯来语、斯洛文尼亚语、法语、俄语、葡萄牙语、意大利语、波兰语、西班牙语、捷克语、乌克兰语、希腊语、匈牙利语、简体中文、繁体中文、葡萄牙语（巴西）、泰语、阿拉伯语、韩语、越南语、日语、印尼语、波斯语、瑞典语、泰语、格鲁吉亚语、丹麦语（丹麦语）、阿尔巴尼亚语、阿塞拜疆语、保加利亚语、塞尔维亚语、乌兹别克语、塔吉克语、阿布哈兹语、罗马尼亚语、斯洛伐克语、僧伽罗语、马其顿语、克罗地亚语、立陶宛语、土库曼语、荷兰语（荷兰）、荷兰语（迪迪埃）

文件：Wub_x64.exe │ [Virustotal](https://www.virustotal.com/gui/file/187eeee9e518011de1b87cfb0ed03e12ea551e9011f0c8defdd0e4535e672da2/detection)  
MD5：9d6778f7f274f7ecd4e7e875a7268b64  
SHA1：452fa439f1cc0b9fcc37cf4b8cfff96e8cc348aa

文件：Wub.exe │ [Virustotal](https://www.virustotal.com/gui/file/aac1123f17f8569a36bf93876cea30e15103fd2379b401a79129a2a6e7285ac2/detection)  
MD5：82aff8883099cf75462057c4e47e88ac  
SHA1：68e2939f59b3869e9bd3ecc4aca3947649631bf8

原文链接: [https://www.sordum.org](https://www.sordum.org/9470/windows-update-blocker-v1-8/)
