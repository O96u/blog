---
slug: mihomo-personal-config
title: Mihomo (原Clash) 自用配置
description: "DNS防泄漏查询 查询地址: $1 $1 其实吧,我感觉DNS泄露这东西,咋个说呢,感觉并没啥大用 仁者见仁吧 DNS解析流程 节点配置 全局配置 mixed port: 7890 HTTP S + SOCKS 混合代理端口，Clash 主"
date: 2025-05-20
updated: 2025-05-20
draft: false
pinned: false
tags:
  - mac
cover: https://s.muxui.com:8015/Bk4fiIwLzYNT.webp
toc: true
comments: true
searchable: true
---




## DNS防泄漏查询

![](https://s.muxui.com:8015/images/2026/09/hcN1EuB8HLHA.webp)

![](https://s.muxui.com:8015/images/2026/09/hSDJOg8jD6GY.webp)

查询地址:

- [https://ipcheck.ing/#/](https://ipcheck.ing/#/)
- [https://browserleaks.com/dns](https://browserleaks.com/dns)

> 其实吧,我感觉DNS泄露这东西,咋个说呢,感觉并没啥大用!仁者见仁吧

## **DNS解析流程**

![](https://s.muxui.com:8015/images/2026/09/KxFeag0fVhnP.webp)

## 节点配置

```text
### 全局配置
mixed-port: 7890 # HTTP(S) + SOCKS 混合代理端口，Clash 主代理入口
allow-lan: true # 允许局域网设备连接本机代理
mode: rule # 代理模式，使用规则分流
bind-address: "*" # 绑定所有网卡地址，使局域网内其他设备可访问
ipv6: false # 禁用 IPv6，防止 DNS 泄露及访问异常
log-level: debug # 日志等级，调试时推荐设置为 debug
profile:
  store-selected: true # 记住上次选择的节点或策略
  store-fake-ip: true # 记住 fake-ip 映射关系，提升命中率
unified-delay: true # 启用统一延迟计算
tcp-concurrent: true # TCP 并发连接，提升连接速度
global-client-fingerprint: chrome # 全局默认浏览器指纹，用于模拟真实浏览器行为

### DNS 配置
dns:
  enable: true # 启用内置 DNS 服务器
  prefer-h3: true # 优先使用 HTTP/3（QUIC）协议解析 DNS 请求
  ipv6: false # 不解析 AAAA 记录，避免走 IPv6
  enhanced-mode: fake-ip # 使用 fake-ip 模式，防止 DNS 泄露
  fake-ip-range: 198.18.0.1/16 # 用于 fake-ip 映射的 IP 段（保留地址段）
  fake-ip-filter: # fake-ip 排除列表，这些域名将使用真实 IP 解析，防止功能异常
    # 本地主机/设备
    - +.lan
    - +.local
    # Windows网络出现小地球图标
    - +.msftconnecttest.com
    - +.msftncsi.com
    # QQ快速登录检测失败
    - localhost.ptlogin2.qq.com
    - localhost.sec.qq.com
    # 追加以下条目
    - +.in-addr.arpa
    - +.ip6.arpa
    - time.*.com
    - time.*.gov
    - pool.ntp.org
    # 微信快速登录检测失败
    - localhost.work.weixin.qq.com
  respect-rules: true # DNS 查询也按 Clash 规则处理
  nameserver: # 直连使用的 DNS 服务器（DoH）
    - https://223.5.5.5/dns-query # 阿里公共 DNS
    - https://doh.pub/dns-query # 腾讯公共 DNS
  proxy-server-nameserver: # 被规则判断为走代理的域名使用此处 DNS
    - https://cloudflare-dns.com/dns-query # CloudflareDNS
    - https://77.88.8.8/dns-query # YandexDNS
    - https://8.8.4.4/dns-query#ecs=1.1.1.1/24&ecs-override=true  #GoogleDNS
    - https://208.67.222.222/dns-query#ecs=1.1.1.1/24&ecs-override=true  #OpenDNS
    - https://9.9.9.9/dns-query  #Quad9DNS

## 这里替换你的自建节点
proxies:
  - { name: "🇯🇵日本claw"}
  - { name: "🇺🇸美国dmit"}


### 出站策略锚点（用于复用）
pr: &pr { type: select, proxies: [ 节点选择, 自动选择, 🇯🇵日本claw, 🇺🇸美国dmit, 全局直连 ] }

### 代理组定义
proxy-groups:
  - { name: 节点选择, type: select, proxies: [ 自动选择, 🇯🇵日本claw, 🇺🇸美国dmit ] ,icon: https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/adjust.svg }
  - { name: 自动选择, type: url-test, include-all: true, tolerance: 20, interval: 300, filter: "^((?!(全局直连)).)*$" ,icon: https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/speed.svg }
  - { name: Google, <<: *pr ,icon: https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/google.svg }
  - { name: Stream, <<: *pr , icon: https://cdn.jsdelivr.net/gh/O96u/O96u@refs/heads/master/image/stream.svg }
  - { name: ChatGPT, <<: *pr , icon: https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/chatgpt.svg }
  - { name: Microsoft, <<: *pr , icon: https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/microsoft.svg }
  - { name: Telegram, <<: *pr ,icon: https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/telegram.svg }
  - { name: Apple, <<: *pr , icon: https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/apple.svg }
  - { name: 漏网之鱼, <<: *pr , icon: https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/fish.svg }
  - { name: 全局直连, type: select, proxies: [ DIRECT ], icon: https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/link.svg }

# 规则配置
RuleSet_classical: &RuleSet_classical { type: http, behavior: classical, interval: 86400, format: text}
RuleSet_domain: &RuleSet_domain { type: http, behavior: domain, interval: 86400, format: text}
RuleSet_ipcidr: &RuleSet_ipcidr { type: http, behavior: ipcidr, interval: 86400, format: text}

# 订阅规则
rule-providers:
  reject_non_ip_no_drop:
    <<: *RuleSet_classical
    url: 'https://ruleset.skk.moe/Clash/non_ip/reject-no-drop.txt'
    path: './rule_set/sukkaw_ruleset/reject_non_ip_no_drop.txt'

  reject_non_ip_drop:
    <<: *RuleSet_classical
    url: https://ruleset.skk.moe/Clash/non_ip/reject-drop.txt
    path: ./rule_set/sukkaw_ruleset/reject_non_ip_drop.txt

  reject_non_ip:
    <<: *RuleSet_classical
    url: https://ruleset.skk.moe/Clash/non_ip/reject.txt
    path: ./rule_set/sukkaw_ruleset/reject_non_ip.txt

  reject_domainset:
    <<: *RuleSet_domain
    url: https://ruleset.skk.moe/Clash/domainset/reject.txt
    path: ./rule_set/sukkaw_ruleset/reject_domainset.txt

  reject_ip:
    <<: *RuleSet_classical
    url: https://ruleset.skk.moe/Clash/ip/reject.txt
    path: ./rule_set/sukkaw_ruleset/reject_ip.txt

  cdn_domainset:
    <<: *RuleSet_domain
    url: https://ruleset.skk.moe/Clash/domainset/cdn.txt
    path: ./rule_set/sukkaw_ruleset/cdn_domainset.txt

  cdn_non_ip:
    <<: *RuleSet_domain
    url: https://ruleset.skk.moe/Clash/non_ip/cdn.txt
    path: ./rule_set/sukkaw_ruleset/cdn_non_ip.txt

  # 所有流媒体（包括上述所有流媒体）
  stream_non_ip:
    <<: *RuleSet_classical
    url: https://ruleset.skk.moe/Clash/non_ip/stream.txt
    path: ./rule_set/sukkaw_ruleset/stream_non_ip.txt

  stream_ip:
    <<: *RuleSet_classical
    url: https://ruleset.skk.moe/Clash/ip/stream.txt
    path: ./rule_set/sukkaw_ruleset/stream_ip.txt

  ai_non_ip:
    <<: *RuleSet_classical
    url: https://ruleset.skk.moe/Clash/non_ip/ai.txt
    path: ./rule_set/sukkaw_ruleset/ai_non_ip.txt

  telegram_non_ip:
    <<: *RuleSet_classical
    url: https://ruleset.skk.moe/Clash/non_ip/telegram.txt
    path: ./rule_set/sukkaw_ruleset/telegram_non_ip.txt

  telegram_ip:
    <<: *RuleSet_classical
    url: https://ruleset.skk.moe/Clash/ip/telegram.txt
    path: ./rule_set/sukkaw_ruleset/telegram_ip.txt

  apple_cdn:
    <<: *RuleSet_domain
    url: https://ruleset.skk.moe/Clash/domainset/apple_cdn.txt
    path: ./rule_set/sukkaw_ruleset/apple_cdn.txt

  apple_services:
    <<: *RuleSet_classical
    url: https://ruleset.skk.moe/Clash/non_ip/apple_services.txt
    path: ./rule_set/sukkaw_ruleset/apple_services.txt

  apple_cn_non_ip:
    <<: *RuleSet_classical
    url: https://ruleset.skk.moe/Clash/non_ip/apple_cn.txt
    path: ./rule_set/sukkaw_ruleset/apple_cn_non_ip.txt

  microsoft_cdn_non_ip:
    <<: *RuleSet_classical
    url: https://ruleset.skk.moe/Clash/non_ip/microsoft_cdn.txt
    path: ./rule_set/sukkaw_ruleset/microsoft_cdn_non_ip.txt

  microsoft_non_ip:
    <<: *RuleSet_classical
    url: https://ruleset.skk.moe/Clash/non_ip/microsoft.txt
    path: ./rule_set/sukkaw_ruleset/microsoft_non_ip.txt

  # 软件更新、操作系统等大文件下载
  download_domainset:
    <<: *RuleSet_domain
    url: https://ruleset.skk.moe/Clash/domainset/download.txt
    path: ./rule_set/sukkaw_ruleset/download_domainset.txt

  download_non_ip:
    <<: *RuleSet_domain
    url: https://ruleset.skk.moe/Clash/non_ip/download.txt
    path: ./rule_set/sukkaw_ruleset/download_non_ip.txt

  # 内网域名和局域网 IP
  lan_non_ip:
    <<: *RuleSet_classical
    url: https://ruleset.skk.moe/Clash/non_ip/lan.txt
    path: ./rule_set/sukkaw_ruleset/lan_non_ip.txt

  lan_ip:
    <<: *RuleSet_classical
    url: https://ruleset.skk.moe/Clash/ip/lan.txt
    path: ./rule_set/sukkaw_ruleset/lan_ip.txt

  domestic_non_ip:
    <<: *RuleSet_classical
    url: https://ruleset.skk.moe/Clash/non_ip/domestic.txt
    path: ./rule_set/sukkaw_ruleset/domestic_non_ip.txt

  direct_non_ip:
    <<: *RuleSet_classical
    url: https://ruleset.skk.moe/Clash/non_ip/direct.txt
    path: ./rule_set/sukkaw_ruleset/direct_non_ip.txt

  global_non_ip:
    <<: *RuleSet_classical
    url: https://ruleset.skk.moe/Clash/non_ip/global.txt
    path: ./rule_set/sukkaw_ruleset/global_non_ip.txt

  domestic_ip:
    <<: *RuleSet_classical
    url: https://ruleset.skk.moe/Clash/ip/domestic.txt
    path: ./rule_set/sukkaw_ruleset/domestic_ip.txt

  china_ip:
    <<: *RuleSet_ipcidr
    url: https://ruleset.skk.moe/Clash/ip/china_ip.txt
    path: ./rule_set/sukkaw_ruleset/china_ip.txt

# 分流规则
rules:
  ### 自定义类规则
  - DOMAIN-SUFFIX,infini.money,🇯🇵日本claw
  - DOMAIN-SUFFIX,piggo.me,DIRECT
  ### 非 IP 类规则
  - RULE-SET,reject_non_ip,REJECT
  - RULE-SET,reject_domainset,REJECT
  - RULE-SET,reject_non_ip_drop,REJECT-DROP
  - RULE-SET,reject_non_ip_no_drop,REJECT
  - RULE-SET,cdn_domainset,节点选择
  - RULE-SET,cdn_non_ip,节点选择
  - RULE-SET,stream_non_ip,Stream
  - RULE-SET,telegram_non_ip,Telegram
  - RULE-SET,download_domainset,节点选择
  - RULE-SET,download_non_ip,节点选择
  - RULE-SET,apple_cdn,Apple
  - RULE-SET,apple_cn_non_ip,Apple
  - RULE-SET,apple_services,Apple
  - RULE-SET,microsoft_cdn_non_ip,Microsoft
  - RULE-SET,microsoft_non_ip,Microsoft
  - RULE-SET,ai_non_ip,ChatGPT
  - RULE-SET,global_non_ip,节点选择
  - RULE-SET,domestic_non_ip,全局直连
  - RULE-SET,direct_non_ip,全局直连
  - RULE-SET,lan_non_ip,全局直连

  ### IP 类规则
  - RULE-SET,reject_ip,REJECT
  - RULE-SET,telegram_ip,Telegram
  - RULE-SET,stream_ip,Stream
  - RULE-SET,lan_ip,全局直连
  - RULE-SET,domestic_ip,全局直连
  - RULE-SET,china_ip,全局直连
  - GEOIP,CN,全局直连
  - MATCH,漏网之鱼
```

![](https://s.muxui.com:8015/images/2026/09/xWe5pCOyuvTJ.webp)

## 软件下载(Win/Mac/Linux通用)


[GitHub：mihomo-party-org/mihomo-party](https://github.com/mihomo-party-org/mihomo-party)


[GitHub：clash-verge-rev/clash-verge-rev](https://github.com/clash-verge-rev/clash-verge-rev)
