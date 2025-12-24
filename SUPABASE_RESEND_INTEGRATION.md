# Supabase + Resend 集成指南

这是一份完整的指南，展示如何在 Supabase Edge Functions 中集成 Resend，并使用我们的邮件模板项目发送各种认证邮件。

## 📋 目录

- [前置需求](#前置需求)
- [Supabase 设置](#supabase-设置)
- [Resend 设置](#resend-设置)
- [Edge Function 部署](#edge-function-部署)
- [使用本项目的邮件模板](#使用本项目的邮件模板)
- [完整的 Edge Function 示例](#完整的-edge-function-示例)
- [测试和调试](#测试和调试)
- [生产部署](#生产部署)

---

## 前置需求

1. **Supabase 账户** - [supabase.com](https://supabase.com)
2. **Resend 账户** - [resend.com](https://resend.com)
3. **Deno** - Edge Functions 使用 Deno 运行时
4. **Supabase CLI** - `npm install -g supabase`

## Supabase 设置

### 1. 创建 Supabase 项目

登录 Supabase Dashboard，创建新项目并获取：

- **Project URL** - 例如：`https://your-project.supabase.co`
- **Service Role Key** - 用于 Edge Function 中的服务端认证

### 2. 创建数据库表

在 Supabase SQL Editor 中执行以下 SQL：

```sql
-- 创建邮件模板表
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scene VARCHAR(50) NOT NULL,           -- 'signup', 'welcome', 'reset_password', 'verify_email'
  language VARCHAR(10) NOT NULL,         -- 'zh-CN', 'en-US'
  react_component_name VARCHAR(100),     -- 组件名称
  subject VARCHAR(200) NOT NULL,         -- 邮件主题
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(scene, language)
);

-- 插入初始邮件模板配置
INSERT INTO email_templates (scene, language, react_component_name, subject) VALUES
  ('signup', 'zh-CN', 'SignupEmailZh', '欢迎注册！请验证您的邮箱'),
  ('signup', 'en-US', 'SignupEmailEn', 'Welcome! Please Verify Your Email'),
  ('welcome', 'zh-CN', 'WelcomeEmailZh', '欢迎加入我们！'),
  ('welcome', 'en-US', 'WelcomeEmailEn', 'Welcome to Our Service!'),
  ('reset_password', 'zh-CN', 'ResetPasswordEmailZh', '重置您的密码'),
  ('reset_password', 'en-US', 'ResetPasswordEmailEn', 'Reset Your Password'),
  ('verify_email', 'zh-CN', 'VerifyEmailZh', '验证您的邮箱地址'),
  ('verify_email', 'en-US', 'VerifyEmailEn', 'Verify Your Email Address');

-- 创建邮件发送日志表（可选，用于追踪）
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email_to VARCHAR(255) NOT NULL,
  scene VARCHAR(50) NOT NULL,
  language VARCHAR(10),
  status VARCHAR(20),           -- 'sent', 'failed', 'pending'
  resend_email_id VARCHAR(255),  -- Resend 返回的邮件 ID
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3. 配置 Realtime（可选）

如果需要实时订阅邮件状态，可在 Supabase Dashboard 中启用 Realtime 通知。

## Resend 设置

### 1. 创建 Resend 账户并获取 API Key

1. 访问 [Resend Dashboard](https://resend.com)
2. 创建账户并验证邮箱
3. 在 API Keys 页面生成新的 API Key
4. 保存 API Key（将在 Supabase 中配置）

### 2. 验证发送者邮箱

Resend 提供两种方式：

**选项 A：使用 Resend 提供的发送者邮箱**

```
onboarding@resend.dev
```

（仅用于测试）

**选项 B：配置自定义域名（生产推荐）**

1. 在 Resend Dashboard 中添加你的域名
2. 按照说明添加 DNS 记录
3. 验证域名后可使用 `noreply@your-domain.com`

## Edge Function 部署

### 1. 初始化本地 Supabase 项目

```bash
# 在项目目录中初始化 Supabase
supabase init

# 链接到远程 Supabase 项目
supabase link --project-ref sklrrplqohktnubfaqkj
```

### 2. 创建 Edge Function

```bash
# 创建 send-email 函数
supabase functions new send-email

# 创建其他专用函数
supabase functions new send-signup-email
supabase functions new send-reset-password-email
```

### 3. 配置环境变量（Secrets）

在 Supabase Dashboard 中设置以下 Secrets：

```plaintext
RESEND_API_KEY = your_resend_api_key
SUPABASE_URL = https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY = your_service_role_key
FROM_EMAIL = noreply@your-domain.com
LOGO_URL = https://your-domain.com/logo.png
COMPANY_NAME = Your Company Name
SUPPORT_EMAIL = support@your-domain.com
```

或使用 CLI 设置：

```bash
supabase secrets set RESEND_API_KEY=your_api_key
supabase secrets set FROM_EMAIL=noreply@your-domain.com
```

## 使用本项目的邮件模板

### 1. 构建邮件模板项目

```bash
# 在 email-templates 目录中
npm run build

# 生成的文件在 dist/ 目录中
```

### 2. 在 Edge Function 中导入

```typescript
// 方法1：从发布的 npm 包导入（推荐）
import { SignupEmail, ResetPasswordEmail } from "email-templates";

// 方法2：从本地编译文件导入
import { SignupEmail } from "./email-templates/dist/index.js";
```

### 3. 渲染邮件 HTML

```typescript
import { render } from "@react-email/render";
import { ResetPasswordEmail } from "email-templates";

const emailHtml = render(
  ResetPasswordEmail({
    resetUrl: "https://your-app.com/auth/reset?token=xxx",
    language: "zh-CN",
    logoUrl: Deno.env.get("LOGO_URL"),
    companyName: Deno.env.get("COMPANY_NAME"),
    supportEmail: Deno.env.get("SUPPORT_EMAIL"),
  })
);
```

## 完整的 Edge Function 示例

### 通用邮件发送函数

创建 `supabase/functions/send-email/index.ts`：

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { render } from "https://esm.sh/@react-email/render@0.0.20";

// 动态导入邮件组件
const emailComponents: Record<string, any> = {
  SignupEmailZh: async () => (await import("email-templates")).SignupEmail,
  SignupEmailEn: async () => (await import("email-templates")).SignupEmail,
  WelcomeEmailZh: async () => (await import("email-templates")).WelcomeEmail,
  WelcomeEmailEn: async () => (await import("email-templates")).WelcomeEmail,
  ResetPasswordEmailZh: async () =>
    (await import("email-templates")).ResetPasswordEmail,
  ResetPasswordEmailEn: async () =>
    (await import("email-templates")).ResetPasswordEmail,
  VerifyEmailZh: async () => (await import("email-templates")).VerifyEmail,
  VerifyEmailEn: async () => (await import("email-templates")).VerifyEmail,
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    const {
      scene,
      email,
      language = "en-US",
      customData = {},
    } = await req.json();

    if (!scene || !email) {
      return new Response(
        JSON.stringify({ error: "scene and email are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 查询邮件模板
    const { data: template, error: templateError } = await supabase
      .from("email_templates")
      .select("*")
      .eq("scene", scene)
      .eq("language", language)
      .eq("enabled", true)
      .single();

    if (templateError || !template) {
      return new Response(JSON.stringify({ error: "Template not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 获取邮件组件
    const componentName = template.react_component_name;
    const Component = await emailComponents[componentName]();

    // 渲染邮件
    const emailHtml = render(
      Component({
        language: language as "zh-CN" | "en-US",
        logoUrl: Deno.env.get("LOGO_URL"),
        companyName: Deno.env.get("COMPANY_NAME"),
        supportEmail: Deno.env.get("SUPPORT_EMAIL"),
        ...customData,
      })
    );

    // 发送邮件
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: Deno.env.get("FROM_EMAIL") || "onboarding@resend.dev",
      to: email,
      subject: template.subject,
      html: emailHtml,
    });

    if (emailError) {
      throw emailError;
    }

    // 记录邮件发送
    await supabase.from("email_logs").insert({
      email_to: email,
      scene: scene,
      language: language,
      status: "sent",
      resend_email_id: emailData?.id,
    });

    return new Response(
      JSON.stringify({
        success: true,
        emailId: emailData?.id,
        message: `${scene} email sent to ${email}`,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
```

### 特定场景函数示例

**注册验证邮件**（`send-signup-email`）：

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { render } from "https://esm.sh/@react-email/render@0.0.20";
import { SignupEmail } from "https://esm.sh/email-templates@1.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    const { email, username, verifyUrl, language = "en-US" } = await req.json();

    if (!email || !verifyUrl) {
      return new Response(
        JSON.stringify({ error: "email and verifyUrl are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 渲染邮件
    const emailHtml = render(
      SignupEmail({
        name: username || email.split("@")[0],
        verifyUrl: verifyUrl,
        language: language as "zh-CN" | "en-US",
        logoUrl: Deno.env.get("LOGO_URL"),
        companyName: Deno.env.get("COMPANY_NAME"),
        supportEmail: Deno.env.get("SUPPORT_EMAIL"),
      })
    );

    // 发送邮件
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: Deno.env.get("FROM_EMAIL") || "onboarding@resend.dev",
      to: email,
      subject:
        language === "zh-CN"
          ? "欢迎注册！请验证您的邮箱"
          : "Welcome! Please Verify Your Email",
      html: emailHtml,
    });

    if (emailError) throw emailError;

    // 记录邮件
    await supabase.from("email_logs").insert({
      email_to: email,
      scene: "signup",
      language: language,
      status: "sent",
      resend_email_id: emailData?.id,
    });

    return new Response(
      JSON.stringify({ success: true, emailId: emailData?.id }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
```

## 测试和调试

### 1. 本地测试

```bash
# 启动本地 Supabase
supabase start

# 在另一个终端测试 Edge Function
supabase functions serve

# 测试 API 调用
curl -X POST http://localhost:54321/functions/v1/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "scene": "signup",
    "email": "test@example.com",
    "language": "zh-CN",
    "customData": {
      "name": "John Doe",
      "verifyUrl": "https://example.com/verify?token=xxx"
    }
  }'
```

### 2. 查看日志

```bash
# 查看 Edge Function 日志
supabase functions logs send-email

# 在 Supabase Dashboard 中查看函数执行日志
```

### 3. 测试邮件发送

```typescript
// 在你的前端或后端中调用
const response = await fetch(
  "https://your-project.supabase.co/functions/v1/send-email",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${supabaseAccessToken}`,
    },
    body: JSON.stringify({
      scene: "signup",
      email: "user@example.com",
      language: "zh-CN",
      customData: {
        name: "User Name",
        verifyUrl: "https://your-app.com/verify?token=xxx",
      },
    }),
  }
);
```

## 生产部署

### 1. 部署 Edge Function

```bash
# 部署到 Supabase
supabase functions deploy send-email --no-verify-jwt

# 或部署特定函数
supabase functions deploy send-signup-email
```

### 2. 设置生产环境变量

在 Supabase Dashboard 中设置生产用的 Secrets：

```plaintext
RESEND_API_KEY = prod_your_resend_api_key
FROM_EMAIL = noreply@your-production-domain.com
LOGO_URL = https://your-production-domain.com/logo.png
```

### 3. 安全最佳实践

```typescript
// 1. 验证请求来源（在 Edge Function 中）
const authHeader = req.headers.get("Authorization");
const token = authHeader?.replace("Bearer ", "");
if (!token) {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
  });
}

// 2. 限流（防止滥用）
// 使用第三方库如 upstash 或自己实现计数器

// 3. 输入验证
const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// 4. 错误日志
await supabase.from("email_logs").insert({
  email_to: email,
  scene: scene,
  status: "failed",
  error_message: error.message,
});
```

### 4. 监控和告警

使用 Supabase 的内置监控：

- 查看函数执行时间
- 监控错误率
- 设置告警阈值

## 客户端集成示例

### React 中发送邮件

```typescript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function sendSignupEmail(email: string, token: string) {
  try {
    const { data, error } = await supabase.functions.invoke(
      "send-signup-email",
      {
        body: {
          email: email,
          username: email.split("@")[0],
          verifyUrl: `${window.location.origin}/auth/verify?token=${token}`,
          language: "zh-CN",
        },
      }
    );

    if (error) {
      console.error("Failed to send email:", error);
      return false;
    }

    console.log("Email sent:", data);
    return true;
  } catch (error) {
    console.error("Error:", error);
    return false;
  }
}
```

---

## 常见问题

**Q: 如何测试邮件是否发送成功？**
A: 查看 `email_logs` 表中的记录，或在 Resend Dashboard 中查看邮件发送历史。

**Q: 如何处理邮件发送失败？**
A: 在 Edge Function 中实现重试逻辑，或使用 Supabase 的 background jobs 功能。

**Q: 如何自定义邮件样式？**
A: 编辑 `src/utils/styles.ts` 中的样式，重新构建项目后重新部署。

---

最后更新：2025-12-23
