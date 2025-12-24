# Email Templates

React Email templates for authentication flows with multi-language support (中文/English).

## 📋 目录

- [功能特性](#功能特性)
- [项目结构](#项目结构)
- [快速开始](#快速开始)
- [使用方式](#使用方式)
- [Supabase + Resend 集成](#supabase--resend-集成)
- [开发指南](#开发指南)

**👉 [完整的 Supabase 集成指南](SUPABASE_RESEND_INTEGRATION.md)**

## ✨ 功能特性

- ✅ 支持多语言（中文/英文）
- ✅ 四种邮件模板：注册验证、欢迎邮件、重置密码、邮箱验证
- ✅ 使用 React Email 组件库
- ✅ TypeScript 支持
- ✅ 响应式设计，兼容各种邮件客户端
- ✅ 统一的样式系统，可复用的组件

## 📁 项目结构

```
email-templates/
├── src/
│   ├── components/
│   │   ├── SignupEmail.tsx           # 注册验证邮件（需要验证邮箱）
│   │   ├── WelcomeEmail.tsx          # 欢迎邮件（注册完成后）
│   │   ├── ResetPasswordEmail.tsx    # 重置密码邮件
│   │   └── VerifyEmail.tsx           # 邮箱验证邮件
│   ├── locales/
│   │   ├── zh-CN.json                # 中文文案
│   │   ├── en-US.json                # 英文文案
│   │   └── index.ts
│   ├── utils/
│   │   ├── getComponent.ts           # 组件获取工具函数
│   │   └── styles.ts                 # 共享样式常量
│   ├── types.ts                      # TypeScript 类型定义
│   └── index.ts                      # 导出入口
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

这将启动 React Email 开发服务器，可以在浏览器中预览邮件模板。

### 构建

```bash
npm run build
```

### 预览邮件

```bash
npm run preview
```

## 📖 使用方式

### 在 Supabase Edge Function 中使用

```typescript
import { render } from "@react-email/render";
import { ResetPasswordEmail } from "email-templates";

// 在 Edge Function 中
const emailHtml = render(
  ResetPasswordEmail({
    resetUrl: "https://your-domain.com/reset?token=xxx&lang=zh-CN",
    language: "zh-CN",
    logoUrl: "https://your-domain.com/logo.png",
    companyName: "Your Company",
    supportEmail: "support@your-domain.com",
  })
);

// 使用 Resend 发送
await resend.emails.send({
  from: "onboarding@your-domain.com",
  to: userEmail,
  subject: "重置您的密码",
  html: emailHtml,
});
```

### 组件 Props

#### SignupEmail

```typescript
interface SignupEmailProps {
  name?: string; // 用户名称
  verifyUrl: string; // 验证邮箱链接（必需）
  language?: "zh-CN" | "en-US"; // 语言
  logoUrl?: string; // Logo URL
  companyName?: string; // 公司名称
  supportEmail?: string; // 支持邮箱
}
```

用于注册流程中，要求用户验证邮箱地址。包含验证链接和邮箱确认提示。

#### WelcomeEmail

```typescript
interface WelcomeEmailProps {
  name?: string; // 用户名称
  language?: "zh-CN" | "en-US"; // 语言
  logoUrl?: string; // Logo URL
  companyName?: string; // 公司名称
  supportEmail?: string; // 支持邮箱
}
```

用于欢迎新注册用户或验证完成后的欢迎邮件。

#### ResetPasswordEmail

```typescript
interface ResetPasswordEmailProps {
  resetUrl: string; // 重置密码链接（必需）
  language?: "zh-CN" | "en-US";
  logoUrl?: string;
  companyName?: string;
  supportEmail?: string;
}
```

用于密码重置流程，包含重置密码链接。

#### VerifyEmail

```typescript
interface VerifyEmailProps {
  verifyUrl: string; // 验证邮箱链接（必需）
  language?: "zh-CN" | "en-US";
  logoUrl?: string;
  companyName?: string;
  supportEmail?: string;
}
```

用于邮箱验证流程，包含验证链接。

## 🔌 Supabase + Resend 集成

> 📚 **推荐阅读**: [完整的 Supabase + Resend 集成指南](SUPABASE_RESEND_INTEGRATION.md)
>
> 包含以下内容：
>
> - 详细的 Supabase 项目设置
> - Resend 配置步骤
> - 完整的 Edge Function 示例代码
> - 本地测试和调试方法
> - 生产部署最佳实践

### 快速集成

#### 1. 创建数据库表

```sql
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scene VARCHAR(50) NOT NULL,
  language VARCHAR(10) NOT NULL,
  react_component_name VARCHAR(100),
  subject VARCHAR(200) NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(scene, language)
);

-- 邮件日志表（用于追踪）
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email_to VARCHAR(255) NOT NULL,
  scene VARCHAR(50) NOT NULL,
  language VARCHAR(10),
  status VARCHAR(20),           -- 'sent', 'failed'
  resend_email_id VARCHAR(255),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 插入初始邮件模板配置
INSERT INTO email_templates (scene, language, react_component_name, subject)
VALUES
  ('signup', 'zh-CN', 'SignupEmailZh', '欢迎注册！请验证您的邮箱'),
  ('signup', 'en-US', 'SignupEmailEn', 'Welcome! Please Verify Your Email'),
  ('welcome', 'zh-CN', 'WelcomeEmailZh', '欢迎加入我们！'),
  ('welcome', 'en-US', 'WelcomeEmailEn', 'Welcome to Our Service!'),
  ('reset_password', 'zh-CN', 'ResetPasswordEmailZh', '重置您的密码'),
  ('reset_password', 'en-US', 'ResetPasswordEmailEn', 'Reset Your Password'),
  ('verify_email', 'zh-CN', 'VerifyEmailZh', '验证您的邮箱地址'),
  ('verify_email', 'en-US', 'VerifyEmailEn', 'Verify Your Email Address');
```

#### 2. 配置 Secrets

在 Supabase Dashboard 中设置以下环境变量：

```plaintext
RESEND_API_KEY = your_resend_api_key
SUPABASE_URL = https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY = your_service_role_key
FROM_EMAIL = noreply@your-domain.com
LOGO_URL = https://your-domain.com/logo.png
COMPANY_NAME = Your Company
SUPPORT_EMAIL = support@your-domain.com
APP_URL = https://your-app.com
```

#### 3. 部署 Edge Function

```bash
# 创建 Edge Function
supabase functions new send-email

# 查看 supabase/functions/send-email/index.ts 中的实现
# 代码已提供在本项目中

# 部署
supabase functions deploy send-email
```

#### 4. 调用 Edge Function

```typescript
// 从前端或后端调用
const response = await supabase.functions.invoke("send-email", {
  body: {
    scene: "signup",
    email: "user@example.com",
    language: "zh-CN",
    customData: {
      name: "User Name",
      verifyUrl: "https://your-app.com/verify?token=xxx",
    },
  },
});
```

### 提供的 Edge Function

本项目包含以下预配置的 Edge Function：

| 函数名                      | 功能             | 文件位置                                        |
| --------------------------- | ---------------- | ----------------------------------------------- |
| `send-email`                | 通用邮件发送函数 | `supabase/functions/send-email/`                |
| `send-signup-email`         | 注册验证邮件     | `supabase/functions/send-signup-email/`         |
| `send-reset-password-email` | 密码重置邮件     | `supabase/functions/send-reset-password-email/` |

## 🛠️ 开发指南

### 添加新语言

1. 在 `src/locales/` 目录下创建新的 JSON 文件（如 `ja-JP.json`）
2. 在组件中添加对应的翻译对象
3. 更新 `types.ts` 中的 `Language` 类型
4. 在 Supabase `email_templates` 表中插入新记录

### 自定义样式

所有样式都在 `src/utils/styles.ts` 中定义，统一管理：

```typescript
import { styles } from "./utils/styles";

// 可用的样式对象：
// styles.main - 背景色和字体
// styles.container - 内容容器
// styles.heading - 标题
// styles.button - 按钮
// styles.footer - 页脚
// styles.warning - 警告文字
```

### 预览邮件

```bash
# 启动开发服务器
npm run dev

# 在浏览器打开 http://localhost:3000 预览邮件
```

## 📝 常见问题

**Q: 如何修改邮件样式？**  
A: 编辑 `src/utils/styles.ts` 文件，所有组件都会自动应用新样式。

**Q: 如何支持新的语言？**  
A: 参考上面的"添加新语言"部分。

**Q: Resend 如何配置自定义域名？**  
A: 详见 [Supabase 集成指南](SUPABASE_RESEND_INTEGRATION.md#resend-设置)。

## 🔗 更多资源

- [完整的 Supabase + Resend 集成指南](SUPABASE_RESEND_INTEGRATION.md) - 详细的集成步骤
- [快速参考指南](QUICK_REFERENCE.md) - 快速查询各组件用法
- [优化总结](OPTIMIZATION_SUMMARY.md) - 项目优化细节
- [React Email 文档](https://react.email/)
- [Resend 文档](https://resend.com/docs)
- [Supabase 文档](https://supabase.com/docs)

## 📄 License

MIT
