# 🎁 客服打赏系统 (Tip Plugin)

> Mulebuy 客服打赏系统 — 一个集成 Intercom 和 PayPal 的客服打赏插件，支持用户通过 PayPal 向客服人员发送小费，并提供完整的管理后台进行数据查看、导出和退款处理。

---

## 📑 目录

- [系统概述](#系统概述)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [核心功能](#核心功能)
- [环境变量配置](#环境变量配置)
- [本地开发](#本地开发)
- [部署](#部署)
- [API 路由说明](#api-路由说明)
- [数据库设计](#数据库设计)
- [业务流程](#业务流程)
- [关键设计决策](#关键设计决策)
- [注意事项与常见问题](#注意事项与常见问题)

---

## 系统概述

本系统是一个 **Intercom Canvas 插件**，允许客服人员在与客户对话时发送打赏卡片，客户通过 PayPal 完成支付。系统同时提供管理后台用于查看打赏记录、生成月度报表和处理退款。

### 系统角色

| 角色 | 说明 |
|------|------|
| **客户 (User)** | 在 Intercom 对话中看到打赏卡片，通过 PayPal 支付小费 |
| **客服 (Agent)** | 在 Intercom Inbox 侧边栏中操作插件，发送打赏卡片给客户 |
| **管理员 (Admin)** | 登录管理后台，查看打赏记录、导出报表、处理退款 |

---

## 技术栈

| 技术 | 用途 | 版本 |
|------|------|------|
| **Node.js + Express 5** | 后端服务框架 | Express ^5.1.0 |
| **Supabase** | PostgreSQL 云数据库 | @supabase/supabase-js ^2.49.8 |
| **PayPal REST SDK** | 支付处理（创建支付/执行支付/退款） | ^1.8.1 |
| **Intercom API v2.11** | 与 Intercom 平台交互（Canvas 应用、发送消息） | intercom-client ^6.3.0 |
| **JWT (jsonwebtoken)** | 无状态认证，适配 Serverless 环境 | ^9.0.3 |
| **ExcelJS** | 生成 Excel 报表导出 | ^4.4.0 |
| **Axios** | HTTP 请求（汇率 API、Intercom API） | ^1.6.0 |
| **Vercel** | 生产环境部署平台 | - |
| **飞书 Webhook** | 支付成功时向飞书群发送通知 | - |

---

## 项目结构

```
Tip-Plugin/
├── server.js                  # 主入口文件，Express 应用配置与启动
├── package.json               # 依赖管理
├── vercel.json                # Vercel 部署路由配置
├── .env                       # 环境变量（不入版本库）
├── .gitignore
├── public/                    # 静态文件
│   ├── favicon.ico
│   ├── favicon.png
│   └── favicon.svg
└── src/
    ├── config/
    │   └── index.js           # 集中配置管理（环境变量、Supabase 客户端初始化）
    ├── routes/                # 路由层
    │   ├── index.js           # 路由统一导出
    │   ├── auth.js            # 认证路由（登录/登出，JWT Cookie）
    │   ├── payment.js         # 支付路由（打赏页面、PayPal 创建/回调）
    │   ├── canvas.js          # Intercom Canvas 路由（用户端+客服端）
    │   ├── api.js             # API 路由（汇率查询）
    │   └── admin.js           # 管理后台路由（数据查询、退款、Excel导出）
    ├── services/              # 业务逻辑层
    │   ├── index.js           # 服务统一导出
    │   ├── database.js        # Supabase 数据库操作（CRUD、分页、幂等创建）
    │   ├── paypal.js          # PayPal SDK 集成（创建/执行/退款）
    │   └── excel.js           # Excel 报表生成（月度汇总、客服排行、明细）
    ├── utils/                 # 工具模块
    │   ├── auth.js            # JWT 认证中间件（生成/验证 Token）
    │   ├── currency.js        # 货币工具（汇率获取+缓存、手续费计算、格式化）
    │   ├── feishu.js          # 飞书 Webhook 通知（支付成功通知到群）
    │   ├── intercom.js        # Intercom API 交互（发消息、提取对话ID/客服名）
    │   └── logger.js          # 日志工具（生产/开发环境日志分级）
    └── views/                 # 视图层（服务端渲染 HTML）
        ├── index.js           # 视图统一导出
        ├── login.js           # 管理后台登录页
        ├── tip-page.js        # 独立打赏页面（非 Canvas 模式）
        ├── payment-result.js  # 支付结果页（成功/失败）
        ├── canvas.js          # Intercom Canvas JSON 组件（用户端+客服端）
        ├── admin-page.js      # 管理后台主页面
        ├── monthly-report.js  # 月度报表页面
        ├── agent-name-sheet.js    # 客服名字输入 Sheet 页面
        ├── user-tip-sheet.js      # 用户打赏 Sheet 页面
        └── admin/             # 管理后台子组件
            ├── helpers.js     # 页面辅助函数
            ├── scripts.js     # 前端交互脚本
            └── styles.js      # 页面样式
```

---

## 核心功能

### 1. 🎯 Intercom Canvas 插件

- **客服端 (Inbox Sidebar)**：客服在 Intercom Inbox 右侧边栏看到插件，输入英文名后点击发送，将打赏卡片插入到对话中
- **用户端 (Messenger)**：用户在 Intercom Messenger 中看到打赏卡片，选择预设金额（$1/$5/$10/$20）或自定义金额，跳转 PayPal 完成支付
- **Configure Flow**：发送卡片前让客服输入自己的名字，名字会显示在用户看到的卡片上

### 2. 💳 PayPal 支付

- 支持创建、执行、退款全流程
- 金额范围：$1 ~ $999
- 模式：**live**（正式环境）
- 支付成功后自动发送 Intercom 消息确认
- 幂等性处理：避免重复支付回调创建重复记录

### 3. 📊 管理后台

- **JWT 无状态认证**：基于 HttpOnly Cookie，适配 Serverless 环境
- **打赏记录查看**：支持日期范围筛选、按客服筛选、分页浏览
- **货币切换**：支持 USD/CNY 显示，实时汇率（10 分钟缓存）
- **退款处理**：通过 PayPal API 执行全额退款
- **月度报表**：HTML 可视化月度报表
- **Excel 导出**：包含月度汇总、客服排行榜、打赏明细三个工作表
- **待支付订单**：展示 24 小时内处于 pending 状态的订单

### 4. 📢 飞书通知

- 支付成功后自动发送飞书群通知
- 根据金额展示不同颜色和 emoji（$1~$4 绿色 💵 / $5~$9 青色 💰 / $10~$19 橙色 🌟 / $20+ 红色 💎）
- 包含客服名称、金额、客户邮箱、Intercom 对话链接
- 自动重试机制（最多 2 次）

### 5. 💰 手续费计算

- PayPal 手续费率：**4.4% + $0.30** 每笔
- 管理后台和 Excel 报表中会同时显示毛收入和净收入

---

## 环境变量配置

在项目根目录创建 `.env` 文件，配置以下变量：

```env
# Supabase 数据库
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# PayPal（正式环境凭据）
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret

# Intercom
INTERCOM_ACCESS_TOKEN=your-intercom-access-token

# 服务配置
BASE_URL=http://localhost:3000       # 本地开发时用 localhost，部署时替换为实际域名
PORT=3000

# JWT 认证
JWT_SECRET=your-jwt-secret           # 建议使用足够长度的随机字符串
SESSION_SECRET=your-session-secret

# 管理员凭证
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-strong-password  # 生产环境请使用强密码

# 飞书通知（可选）
FEISHU_WEBHOOK_URL=https://open.feishu.cn/open-apis/bot/v2/hook/your-webhook-id
```

> ⚠️ **安全提醒**：`.env` 文件已在 `.gitignore` 中排除。生产环境请通过 Vercel 环境变量面板配置，不要提交到版本库。

---

## 本地开发

### 前置要求

- Node.js >= 18.x
- npm >= 9.x

### 安装与启动

```bash
# 安装依赖
npm install

# 开发模式启动（使用 nodemon 自动重载）
npm run dev

# 或者普通启动
npm start
```

启动后访问：
- 管理后台：`http://localhost:3000/`
- 健康检查：`http://localhost:3000/health`
- 打赏页面示例：`http://localhost:3000/tip/{conversationId}/{agentName}`

---

## 部署

### Vercel 部署

项目已配置 `vercel.json`，所有请求路由到 `server.js`：

```bash
# 安装 Vercel CLI（如未安装）
npm i -g vercel

# 部署
vercel --prod
```

**部署后必做事项**：
1. 在 Vercel 项目设置中配置所有环境变量
2. 将 `BASE_URL` 设置为实际部署域名（例如 `https://tip.mulebuy.com`）
3. 确保 PayPal 应用的回调 URL 已添加你的域名

### Intercom 应用配置

在 Intercom Developer Hub 中配置 Canvas App：

| 配置项 | URL |
|--------|-----|
| **Canvas Kit: Initialize URL (User)** | `{BASE_URL}/canvas/user/initialize` |
| **Canvas Kit: Submit URL (User)** | `{BASE_URL}/canvas/user/submit` |
| **Canvas Kit: Configure URL (User)** | `{BASE_URL}/canvas/user/configure` |
| **Inbox App: Initialize URL** | `{BASE_URL}/intercom/initialize` |
| **Inbox App: Submit URL** | `{BASE_URL}/intercom/submit` |
| **Sheet URLs** | `{BASE_URL}/sheet/agent-name`, `{BASE_URL}/sheet/user-tip/:conversationId/:agentName` |

---

## API 路由说明

### 认证相关

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/login` | 管理员登录（速率限制：15分钟内最多5次） | 否 |
| GET | `/logout` | 管理员登出（清除 JWT Cookie） | 否 |

### 支付相关

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/tip/:conversationId/:agentName` | 独立打赏页面 | 否 |
| POST | `/create-payment` | 创建 PayPal 支付（速率限制：每分钟100次） | 否 |
| GET | `/payment/success` | PayPal 支付成功回调 | 否 |
| GET | `/payment/cancel` | PayPal 支付取消回调 | 否 |

### Intercom Canvas

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/canvas/user/initialize` | 用户端 Canvas 初始化 | Intercom |
| POST | `/canvas/user/submit` | 用户端 Canvas 交互提交 | Intercom |
| POST | `/canvas/user/configure` | Configure Flow（客服输入名字） | Intercom |
| POST | `/canvas/user/submit-sheet` | Sheet 提交（客服名字） | Intercom |
| POST | `/intercom/initialize` | 客服端 Inbox 插件初始化 | Intercom |
| POST | `/intercom/submit` | 客服端 Inbox 插件交互 | Intercom |
| GET | `/sheet/agent-name` | 客服名字输入 Sheet 页面 | 否 |
| GET | `/sheet/user-tip/:conversationId/:agentName` | 用户打赏 Sheet 页面 | 否 |

### 管理后台

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/` | 管理后台主页（支持筛选、分页） | JWT |
| POST | `/admin/refund/:tipId` | 处理退款 | JWT |
| GET | `/export/monthly/:year/:month` | 月度 Excel 导出 | JWT |

### 公共 API

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/exchange-rate` | 获取实时 USD→CNY 汇率 | 否 |
| GET | `/health` | 健康检查（含数据库连接状态） | 否 |

---

## 数据库设计

使用 Supabase 托管的 PostgreSQL 数据库，核心表 `tips`：

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | serial / int | 自增主键 |
| `amount` | decimal | 打赏金额（USD） |
| `agent_name` | text | 客服名称 |
| `user_name` | text | 用户邮箱（支付前为 "Pending..."） |
| `conversation_id` | text | Intercom 对话 ID |
| `payment_id` | text | PayPal 支付 ID（唯一约束） |
| `status` | text | 订单状态：`pending` / `completed` / `expired` |
| `created_at` | timestamp | 创建时间 |
| `refund_status` | text | 退款状态：`null` / `completed` |
| `refund_id` | text | PayPal 退款 ID |
| `refund_date` | timestamp | 退款时间 |
| `refund_reason` | text | 退款原因 |

> **幂等性**：`payment_id` 字段有唯一约束，通过 `createOrIgnoreTip` 函数实现幂等创建，避免并发请求产生重复记录。

---

## 业务流程

### 打赏支付流程

```
客服在 Intercom Inbox 侧边栏操作
     │
     ▼
输入英文名 → 点击"发送"
     │
     ▼
插件返回 card_creation_options
Intercom 将打赏卡片插入对话
     │
     ▼
用户在 Messenger 中看到卡片
选择金额（$1/$5/$10/$20/自定义）
     │
     ▼
后端调用 PayPal API 创建支付
数据库创建 pending 记录
     │
     ▼
用户跳转 PayPal 完成支付
     │
     ├── 支付成功 ──→ /payment/success 回调
     │                  ├── 调用 PayPal 执行支付 API
     │                  ├── 更新数据库记录为 completed
     │                  ├── 发送 Intercom 确认消息
     │                  ├── 发送飞书群通知
     │                  └── 返回成功结果页
     │
     └── 支付取消 ──→ /payment/cancel 回调
                       └── 返回取消结果页
```

### 退款流程

```
管理员登录后台 → 找到打赏记录 → 点击退款
     │
     ▼
验证记录状态（未退款 + 有 payment_id）
     │
     ▼
调用 PayPal 退款 API（通过 sale_id）
     │
     ▼
更新数据库退款状态
     │
     └── 标记 refund_status = completed
         记录 refund_id、refund_date、refund_reason
```

---

## 关键设计决策

### 1. JWT 替代 Session

由于部署在 Vercel Serverless 环境，无法使用传统的内存 Session，因此采用 **JWT Token + HttpOnly Cookie** 方案实现无状态认证。Token 有效期 24 小时。

### 2. 幂等支付处理

支付回调（`/payment/success`）可能被多次触发（用户刷新、网络重试），系统通过以下机制确保幂等性：
- 先查数据库，如果记录已 `completed`，直接返回成功页面，不调用 PayPal API
- 使用 `createOrIgnoreTip` 函数避免 pending 记录重复创建
- 处理 `23505` 唯一约束冲突，自动降级为更新操作

### 3. Canvas vs 独立页面双模式

系统同时支持两种打赏模式：
- **Canvas 模式**：嵌入在 Intercom Messenger 内，交互体验好，但受 Canvas Kit 限制
- **独立页面模式** (`/tip/:id/:name`)：独立网页，可通过链接直接访问，不受 Canvas 限制

### 4. 汇率缓存策略

汇率 API 调用结果缓存 10 分钟，减少对外部 API 的依赖。缓存失效或 API 不可用时，自动回退到默认汇率 7.2。

### 5. trust proxy

Express 配置了 `app.set('trust proxy', 1)`，以正确获取经过 Vercel/Nginx 反向代理后的客户端真实 IP，同时解决 `express-rate-limit` 的 `ERR_ERL_UNEXPECTED_X_FORWARDED_FOR` 错误。

---

## 注意事项与常见问题

### 部署相关

1. **PayPal 模式**：当前硬编码为 `live` 模式（`src/config/index.js` 第 25 行），如需切换到 sandbox 测试，需修改此配置并更换为 sandbox 凭据
2. **Vercel 冷启动**：Serverless 环境首次请求可能有 1-3 秒冷启动延迟，已通过增加 Intercom API 超时（15s/60s）缓解
3. **Excel 导出限制**：单次导出上限 5000 条记录，超过会自动截断并在报表中提示

### 安全相关

1. 管理后台登录有速率限制（15 分钟内最多 5 次失败尝试）
2. API 接口有通用速率限制（每分钟 100 次）
3. JWT Cookie 在生产环境自动启用 `Secure` 标志（仅 HTTPS 传输）
4. 生产环境错误信息会自动隐藏敏感细节

### 常见问题

| 问题 | 解决方案 |
|------|----------|
| 登录提示"请求过于频繁" | 等待 15 分钟后重试，或重启服务清除限制 |
| PayPal 支付创建失败 | 检查 PayPal 凭据是否正确，确认 `BASE_URL` 配置是否匹配实际域名 |
| Intercom 消息发送失败 | 检查 `INTERCOM_ACCESS_TOKEN` 是否有效，确认对话 ID 是否正确 |
| 汇率显示为默认值 7.2 | exchangerate-api.com 可能暂时不可用，等 10 分钟缓存过期后会自动重试 |
| 管理后台无法退款 | 确认记录有 `payment_id`，且 PayPal 销售状态为 `completed` |
| 飞书通知未收到 | 检查 `FEISHU_WEBHOOK_URL` 是否已配置，Webhook 是否仍然有效 |

---

## 版本信息

- **当前版本**：v2.0.0-modular
- **架构**：模块化重构版本（从单文件重构为分层架构）
# intercom-plugin
