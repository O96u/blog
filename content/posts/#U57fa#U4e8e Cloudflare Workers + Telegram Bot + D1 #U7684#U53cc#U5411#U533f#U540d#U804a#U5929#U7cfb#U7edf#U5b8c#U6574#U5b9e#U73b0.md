---
slug: cloudflare-workers-telegram-d1-anonymous-chat
title: 基于 Cloudflare Workers + Telegram Bot + D1 的双向匿名聊天系统完整实现
description: 在本篇文章中，我将分享一个基于 Cloudflare Workers + Telegram Bot + D1 数据库 的完全无服务器（Serverless）聊天系统。该机器人支持用户匿名与管理员双向通信，具备首访验证、自动诈骗检测、屏蔽管理
date: 2025-11-16
updated: 2025-11-17
draft: false
pinned: false
tags:
  - opensource
  - cloudflare
  - telegram
toc: true
comments: true
searchable: true
---




在本篇文章中，我将分享一个基于 **Cloudflare Workers + Telegram Bot + D1 数据库** 的完全无服务器（Serverless）聊天系统。该机器人支持用户匿名与管理员双向通信，具备首访验证、自动诈骗检测、屏蔽管理、消息映射等功能，是一个非常适合作为客服、匿名反馈、小型 IM 系统的解决方案。

---

## ⭐ **系统亮点**

- 🚀 **100% Serverless 无需服务器**
- 🔐 **首访用户自动加减法验证（防骚扰）**
- 🔁 **双向匿名对话（用户看不到管理员 ID）**
- 🛡 **管理员可屏蔽 / 解封任何用户**
- 🧠 **自动诈骗账号检测（基于 D1 fraud 表）**
- 💾 **D1 数据库存储用户状态与消息映射**
- 📌 **管理员收到用户消息时自动生成“用户资料卡”**
- 🔔 **可控频率的通知提醒机制**

---

## 🧩 系统架构

```bash
[Telegram User]
      ↓ 发送消息
[Cloudflare Workers /endpoint]
      ↓
[验证系统（加减法 1～10）]
      ↓ 通过后
[反诈检测(fraud)]
      ↓
[自动转发消息 → 管理员]

管理员 ←→ 用户 （双向聊天）
```

---

## 📦 使用技术

<table class="has-fixed-layout"><thead><tr><th>技术</th><th>用途</th></tr></thead><tbody><tr><td><strong>Cloudflare Workers</strong></td><td>核心逻辑执行环境</td></tr><tr><td><strong>Telegram Bot API</strong></td><td>双向聊天接口</td></tr><tr><td><strong>Cloudflare D1</strong></td><td>用户资料、屏蔽状态、验证码、消息映射存储</td></tr><tr><td><strong>Webhooks</strong></td><td>实时接收 Telegram 更新事件</td></tr></tbody></table>

---

# 🗄 数据库结构（D1）

为保证机器人功能完整，需要创建以下表：

```bash
CREATE TABLE blocks (
  user_id TEXT PRIMARY KEY,
  is_blocked INTEGER
);

CREATE TABLE msg_map (
  admin_msg_id TEXT PRIMARY KEY,
  user_id TEXT
);

CREATE TABLE lastmsg (
  user_id TEXT PRIMARY KEY,
  ts INTEGER
);

CREATE TABLE fraud (
  user_id TEXT PRIMARY KEY
);

CREATE TABLE verify (
  user_id TEXT PRIMARY KEY,
  question TEXT,
  answer INTEGER,
  passed INTEGER
);

CREATE TABLE user_first (
  user_id TEXT PRIMARY KEY
);
```

---

# 🔢 首次验证系统（加减法 1～10）

为了防止广告机器人、骚扰用户，系统会对第一次聊天的用户进行简单的数学验证：

### ✨ 验证示例

```bash
为了防止骚扰，请先完成验证：

7 + 3 = ?

请直接回复数字答案。
```

答对后自动进入聊天流程；答错则重新生成题目。

---

# 🎯 核心功能说明

## 1️⃣ **匿名聊天（Forward/Copy）**

用户发送消息 → 机器人自动转发给管理员  
管理员「回复这条转发消息」→ 机器人将回复复制给用户

整个过程：

- 用户不会看到管理员的 UID
- 管理员同样看不到用户昵称（除资料卡）

实现完整“匿名双向通信”。

---

## 2️⃣ **用户资料卡（首次出现）**

管理员第一次收到用户消息时，自动生成用户信息卡：

![](https://s.muxui.com:8015/images/2026/09/atyzJj1Glh51.webp)

管理员点按钮后 → 自动屏蔽

---

## 3️⃣ **屏蔽 / 解除屏蔽**

管理员可直接通过命令控制：

<table class="has-fixed-layout"><thead><tr><th>指令</th><th>说明</th></tr></thead><tbody><tr><td><code>/block</code></td><td>屏蔽此用户</td></tr><tr><td><code>/unblock</code></td><td>解除屏蔽</td></tr><tr><td><code>/checkblock</code></td><td>查看用户是否被屏蔽</td></tr></tbody></table>

---

## 4️⃣ **诈骗检测（D1 fraud 表）**

只需点击按钮

![](https://s.muxui.com:8015/images/2026/09/1hj7rHykrhdC.webp)

或者

![](https://s.muxui.com:8015/images/2026/09/OVmJwCkhRoUM.webp)

回复的是输入/block 也可以拉黑用户

---

## 5️⃣ **可控间隔的通知提醒系统**

为了避免管理员被刷屏，可设置提醒间隔（默认 1 小时）：

作用：

- 用户第一次联系 → 提醒
- 用户长时间没聊天，再次联系 → 再提醒一次
- 保证管理员不会被Spam

---

# 🛠 Worker 代码结构说明

代码整体分为：

- Webhook 接收器
- Telegram API 封装
- 核心消息处理
- 加减法验证模块
- 管理员控制命令
- D1 数据访问模块
- 首次资料卡发送模块（可扩展）

该架构清晰、可维护性高、支持未来扩展。

---

# 📚 使用教程

## 1\. 创建 Telegram Bot

在 @BotFather 创建一个机器人，并获得：

- Bot Token

![](https://s.muxui.com:8015/images/2026/09/yRrI8v2v6wpO.webp)

## 2\. 部署到 Cloudflare Workers

```bash
// ================== 常量区 ==================

const START_MESSAGE = `
🤖 你好，欢迎使用 @guaguawa_bot 双向聊天机器人！
请通过此机器人发送您的消息与我联系，我会立即为您传达。
`;

const START_MESSAGE_ADMIN = `
🤖 <b>关于本机器人</b>

本机器人用于 <b>双向匿名聊天</b>，旨在提高用户的沟通体验，并防止骚扰。

📌 <b>功能介绍：</b>
- 匿名聊天：用户可以自由交流，管理员可管理消息流转。
- 防骚扰功能：管理员可使用 /block 指令屏蔽不良用户。
- 诈骗检测：自动检测是否属于诈骗用户，并提醒管理员。

📜 <b>可用命令：</b>
- /start 获取欢迎信息
- /block 屏蔽用户（管理员）
- /unblock 解除屏蔽（管理员）
- /checkblock 查询用户状态（管理员）

🔹 机器人由 <b>匿名聊天管理系统</b> 提供支持。
`;


// ================== Worker 入口（ESM 格式） ==================

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/endpoint") {
      return handleWebhook(request, env, ctx);
    }
    if (url.pathname === "/registerWebhook") {
      return registerWebhook(request, env);
    }
    if (url.pathname === "/unRegisterWebhook") {
      return unRegisterWebhook(request, env);
    }

    return new Response("OK");
  }
};


// ===================== Telegram API 封装 ========================

function apiUrl(methodName, params = null, env) {
  let query = params ? "?" + new URLSearchParams(params).toString() : "";
  return `https://api.telegram.org/bot${env.ENV_BOT_TOKEN}/${methodName}${query}`;
}

function requestTelegram(method, body, env, params = null) {
  return fetch(apiUrl(method, params, env), body).then(r => r.json());
}

const makeReq = (body) => ({
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body)
});

const sendMessage = (msg, env) =>
  requestTelegram("sendMessage", makeReq(msg), env);

const forwardMessage = (msg, env) =>
  requestTelegram("forwardMessage", makeReq(msg), env);

const copyMessage = (msg, env) =>
  requestTelegram("copyMessage", makeReq(msg), env);


// ===================== Webhook ========================

async function handleWebhook(request, env, ctx) {
  if (request.headers.get("X-Telegram-Bot-Api-Secret-Token") !== env.ENV_BOT_SECRET) {
    return new Response("Unauthorized", { status: 403 });
  }

  const update = await request.json();
  ctx.waitUntil(onUpdate(update, env));
  return new Response("OK");
}


// ===================== Update Routing ========================

async function onUpdate(update, env) {
  if (update.message) {
    await onMessage(update.message, env);
  }
  if (update.callback_query) {
    await onCallback(update.callback_query, env);
  }
}


// ===================== D1 数据库封装 ========================

// 拉黑
async function getBlock(env, userId) {
  const row = await env.TG_BOT_DB.prepare("SELECT is_blocked FROM blocks WHERE user_id=?").bind(userId).first();
  return row ? row.is_blocked === 1 : false;
}

async function setBlock(env, userId, val) {
  await env.TG_BOT_DB.prepare("INSERT OR REPLACE INTO blocks (user_id, is_blocked) VALUES (?, ?)").bind(userId, val ? 1 : 0).run();
}

// 消息映射
async function getMsgMap(env, adminMsgId) {
  const row = await env.TG_BOT_DB.prepare("SELECT user_id FROM msg_map WHERE admin_msg_id=?").bind(adminMsgId).first();
  return row ? row.user_id : null;
}

async function setMsgMap(env, adminMsgId, userId) {
  await env.TG_BOT_DB.prepare("INSERT OR REPLACE INTO msg_map (admin_msg_id, user_id) VALUES (?, ?)").bind(adminMsgId, userId).run();
}

// 通知节流
async function getLastMsg(env, userId) {
  const row = await env.TG_BOT_DB.prepare("SELECT ts FROM lastmsg WHERE user_id=?").bind(userId).first();
  return row ? row.ts : null;
}

async function setLastMsg(env, userId, ts) {
  await env.TG_BOT_DB.prepare("INSERT OR REPLACE INTO lastmsg (user_id, ts) VALUES (?, ?)").bind(userId, ts).run();
}

// 诈骗
async function isFraud(env, userId) {
  const row = await env.TG_BOT_DB.prepare("SELECT user_id FROM fraud WHERE user_id=?").bind(userId).first();
  return !!row;
}


// ===================== 首次加减验证 ========================

function genVerifyQuestion() {
  let a = Math.floor(Math.random() * 10) + 1;
  let b = Math.floor(Math.random() * 10) + 1;

  if (Math.random() < 0.5) {
    return { question: `${a} + ${b} = ?`, answer: a + b };
  } else {
    if (a < b) [a, b] = [b, a];
    return { question: `${a} - ${b} = ?`, answer: a - b };
  }
}

async function getVerify(env, userId) {
  return await env.TG_BOT_DB.prepare("SELECT * FROM verify WHERE user_id=?").bind(userId).first();
}

async function setVerify(env, userId, question, answer) {
  await env.TG_BOT_DB.prepare("INSERT OR REPLACE INTO verify (user_id, question, answer, passed) VALUES (?, ?, ?, 0)").bind(userId, question, answer).run();
}

async function passVerify(env, userId) {
  await env.TG_BOT_DB.prepare("UPDATE verify SET passed=1 WHERE user_id=?").bind(userId).run();
}


// ===================== 消息主处理 ========================

async function onMessage(message, env) {
  const chatId = message.chat.id.toString();
  const ADMIN_UID = env.ENV_ADMIN_UID;

  // /start
  if (message.text === "/start") {
    return sendMessage({ chat_id: chatId, text: chatId === ADMIN_UID ? START_MESSAGE_ADMIN : START_MESSAGE, parse_mode: "HTML" }, env);
  }

  // -------- 管理员 --------
  if (chatId === ADMIN_UID) {
    return handleAdminMessage(message, env);
  }

  // -------- 用户 --------
  return handleGuestMessage(message, env);
}


// ===================== 管理员逻辑 ========================

async function handleAdminMessage(message, env) {
  const ADMIN_UID = env.ENV_ADMIN_UID;

  if (!message.reply_to_message?.message_id) {
    return sendMessage({ chat_id: ADMIN_UID, text: START_MESSAGE_ADMIN, parse_mode: "HTML" }, env);
  }

  const guestId = await getMsgMap(env, message.reply_to_message.message_id.toString());

  if (!guestId) {
    return sendMessage({ chat_id: ADMIN_UID, text: "无法找到用户映射" }, env);
  }

  // 管理员命令
  if (message.text === "/block") return handleBlock(message, env);
  if (message.text === "/unblock") return handleUnblock(message, env);
  if (message.text === "/checkblock") return handleCheckBlock(message, env);

  // 正常回复
  return copyMessage({
    chat_id: guestId,
    from_chat_id: ADMIN_UID,
    message_id: message.message_id
  }, env);
}


// ===================== 用户逻辑（含验证 + 资料卡） ========================

async function handleGuestMessage(message, env) {
  const chatId = message.chat.id.toString();
  const ADMIN_UID = env.ENV_ADMIN_UID;

  // --- 1. 验证 ---
  const verify = await getVerify(env, chatId);

  if (!verify) {
    const q = genVerifyQuestion();
    await setVerify(env, chatId, q.question, q.answer);

    return sendMessage({
      chat_id: chatId,
      text: `为了防止骚扰，请先完成验证：\n\n<b>${q.question}</b>`,
      parse_mode: "HTML"
    }, env);
  }

  if (verify.passed !== 1) {
    const ans = parseInt(message.text);

    if (ans === verify.answer) {
      await passVerify(env, chatId);

      return sendMessage({
        chat_id: chatId,
        text: "验证通过！你现在可以给管理员发送消息了 🎉"
      }, env);
    }

    const q = genVerifyQuestion();
    await setVerify(env, chatId, q.question, q.answer);

    return sendMessage({
      chat_id: chatId,
      text: `❌ 错误，请重新验证：\n\n<b>${q.question}</b>`,
      parse_mode: "HTML"
    }, env);
  }

  // --- 2. 是否被屏蔽 ---
  if (await getBlock(env, chatId)) {
    return sendMessage({ chat_id: chatId, text: "🚫 你被拉黑了" }, env);
  }

  // --- 3. 首次与管理员建立联系 → 发送资料卡 ---
  const firstRow = await env.TG_BOT_DB.prepare("SELECT user_id FROM user_first WHERE user_id=?").bind(chatId).first();

  if (!firstRow) {
    await env.TG_BOT_DB.prepare("INSERT INTO user_first (user_id) VALUES (?)").bind(chatId).run();

    const fullname = (message.from.first_name || "") + (message.from.last_name ? " " + message.from.last_name : "");
    const username = message.from.username ? "@" + message.from.username : "无";

    const now = new Date();
    const timeDisplay = now.toLocaleString("zh-CN", { hour12: false });

    const userCard = `
<b>用户资料卡</b>
---
• 昵称名称: <b>${fullname}</b>
• 用户名: <b>${username}</b>
• ID: <code>${chatId}</code>
• 首次连接时间: <code>${timeDisplay}</code>
`;

    const blockKeyboard = {
      inline_keyboard: [
        [{ text: "🚫 屏蔽此人 (Block)", callback_data: `block:${chatId}` }]
      ]
    };

    await sendMessage({
      chat_id: ADMIN_UID,
      text: userCard,
      parse_mode: "HTML",
      reply_markup: blockKeyboard
    }, env);
  }

  // --- 4. 转发消息 ---
  const fw = await forwardMessage({
    chat_id: ADMIN_UID,
    from_chat_id: chatId,
    message_id: message.message_id
  }, env);

  if (fw.ok) {
    await setMsgMap(env, fw.result.message_id.toString(), chatId);
  }
}


// ===================== 回调按钮（屏蔽） ========================

async function onCallback(query, env) {
  const ADMIN_UID = env.ENV_ADMIN_UID;

  if (query.from.id.toString() !== ADMIN_UID) {
    return;
  }

  const data = query.data;

  if (data.startsWith("block:")) {
    const userId = data.split(":")[1];

    await setBlock(env, userId, true);

    await requestTelegram(
      "answerCallbackQuery",
      makeReq({ callback_query_id: query.id, text: "已拉黑该用户" }),
      env
    );

    await requestTelegram(
      "editMessageReplyMarkup",
      makeReq({
        chat_id: query.message.chat.id,
        message_id: query.message.message_id,
        reply_markup: {
          inline_keyboard: [[{ text: "✔ 已拉黑", callback_data: "noop" }]]
        }
      }),
      env
    );
  }
}


// ===================== 管理员命令 ========================

async function handleBlock(message, env) {
  const guest = await getMsgMap(env, message.reply_to_message.message_id.toString());

  await setBlock(env, guest, true);
  return sendMessage({ chat_id: env.ENV_ADMIN_UID, text: `UID:${guest} 已屏蔽` }, env);
}

async function handleUnblock(message, env) {
  const guest = await getMsgMap(env, message.reply_to_message.message_id.toString());

  await setBlock(env, guest, false);
  return sendMessage({ chat_id: env.ENV_ADMIN_UID, text: `UID:${guest} 已解除屏蔽` }, env);
}

async function handleCheckBlock(message, env) {
  const guest = await getMsgMap(env, message.reply_to_message.message_id.toString());
  const blocked = await getBlock(env, guest);

  return sendMessage({
    chat_id: env.ENV_ADMIN_UID,
    text: `UID:${guest} → ${blocked ? "已屏蔽" : "未屏蔽"}`
  }, env);
}


// ===================== Webhook 控制 ========================

async function registerWebhook(request, env) {
  const url = new URL(request.url);
  const webhookUrl = `${url.protocol}//${url.hostname}/endpoint`;

  const res = await fetch(apiUrl("setWebhook", { url: webhookUrl, secret_token: env.ENV_BOT_SECRET }, env)).then(r => r.json());
  return new Response(res.ok ? "OK" : JSON.stringify(res));
}

async function unRegisterWebhook(request, env) {
  const res = await fetch(apiUrl("setWebhook", { url: "" }, env)).then(r => r.json());
  return new Response(res.ok ? "OK" : JSON.stringify(res));
}
```

![](https://s.muxui.com:8015/images/2026/09/LBRzi6dDrfmd.webp)

![](https://s.muxui.com:8015/images/2026/09/b7tGwXUlHmpK.webp)

![](https://s.muxui.com:8015/images/2026/09/Qw0DC6MlU9co.webp)

然后把上面的代码全部复制到里面去.

## 3\. 绑定 D1 数据库

![](https://s.muxui.com:8015/images/2026/09/aQI55gnsNUk9.webp)

![](https://s.muxui.com:8015/images/2026/09/0Vvabkzf9QY6.webp)

D1的key为:TG_BOT_DB

## 4\. 设置环境变量

<table class="has-fixed-layout"><thead><tr><th>变量</th><th>说明</th></tr></thead><tbody><tr><td><code>ENV_BOT_TOKEN</code></td><td>Telegram Bot Token</td></tr><tr><td><code>ENV_ADMIN_UID</code></td><td>管理员 UID</td></tr><tr><td><code>ENV_BOT_SECRET</code></td><td>Webhook secret（可随意生成）</td></tr></tbody></table>

![](https://s.muxui.com:8015/images/2026/09/Wpf5cwuAZ7o6.webp)

1.  从[@BotFather](https://t.me/BotFather)获取token，并且可以发送`/setjoingroups`来禁止此Bot被添加到群组
2.  从[uuidgenerator](https://www.uuidgenerator.net/)获取一个随机uuid作为secret
3.  从[@username_to_id_bot](https://t.me/username_to_id_bot)获取你的用户id
4.  配置worker的变量
    - 增加一个`ENV_BOT_TOKEN`变量，数值为从步骤1中获得的token
    - 增加一个`ENV_BOT_SECRET`变量，数值为从步骤2中获得的secret
    - 增加一个`ENV_ADMIN_UID`变量，数值为从步骤3中获得的用户id

## 5\. 注册 Webhook

访问：

```bash
https://你的worker域名/registerWebhook
```

## 6\. 测试

测试Bot: [@guaguawa_bot](https://t.me/guaguawa_bot)
