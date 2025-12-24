# 快速参考指南

## 🚀 快速开始

### 安装和开发

```bash
# 安装依赖
npm install

# 启动开发服务器（预览邮件模板）
npm run dev

# 构建项目
npm run build
```

## 📧 邮件模板快速调用

### SignupEmail（新增）

```typescript
import { SignupEmail } from "email-templates";

<SignupEmail
  name="用户名"
  verifyUrl="https://example.com/verify?token=xxx"
  language="zh-CN"
  logoUrl="https://example.com/logo.png"
  companyName="公司名"
  supportEmail="support@example.com"
/>;
```

### WelcomeEmail

```typescript
import { WelcomeEmail } from "email-templates";

<WelcomeEmail
  name="用户名"
  language="zh-CN"
  logoUrl="https://example.com/logo.png"
  companyName="公司名"
  supportEmail="support@example.com"
/>;
```

### ResetPasswordEmail

```typescript
import { ResetPasswordEmail } from "email-templates";

<ResetPasswordEmail
  resetUrl="https://example.com/reset?token=xxx"
  language="zh-CN"
  logoUrl="https://example.com/logo.png"
  companyName="公司名"
  supportEmail="support@example.com"
/>;
```

### VerifyEmail

```typescript
import { VerifyEmail } from "email-templates";

<VerifyEmail
  verifyUrl="https://example.com/verify?token=xxx"
  language="zh-CN"
  logoUrl="https://example.com/logo.png"
  companyName="公司名"
  supportEmail="support@example.com"
/>;
```

## 🔧 工具函数

### getEmailComponent()

获取指定场景和语言的组件

```typescript
import { getEmailComponent } from "email-templates";

const Component = getEmailComponent("signup", "zh-CN");
```

### getComponentName()

获取 Supabase 中使用的组件名称

```typescript
import { getComponentName } from "email-templates";

const name = getComponentName("signup", "zh-CN"); // "SignupEmailZh"
```

## 📝 支持的语言和场景

**语言**: `'zh-CN' | 'en-US'`

**场景**:

- `'signup'` - 注册验证
- `'welcome'` - 欢迎邮件
- `'reset_password'` - 密码重置
- `'verify_email'` - 邮箱验证

## 🎨 样式定制

所有样式定义在 `src/utils/styles.ts` 中：

```typescript
import { styles } from "./utils/styles";

// 可用的样式对象:
// styles.main - 背景样式
// styles.container - 容器样式
// styles.heading - 标题样式
// styles.paragraph - 段落样式
// styles.button - 按钮样式
// styles.link - 链接样式
// styles.footer - 页脚样式
// styles.warning - 警告文本样式
```

## 💾 Supabase 集成

### SQL 初始化

```sql
-- 创建表
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scene VARCHAR(50) NOT NULL,
  language VARCHAR(10) NOT NULL,
  react_component_name VARCHAR(100),
  subject VARCHAR(200),
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 插入数据
INSERT INTO email_templates (scene, language, react_component_name, subject)
VALUES ('signup', 'zh-CN', 'SignupEmailZh', '欢迎注册！请验证您的邮箱');
```

### Edge Function 中使用

```typescript
import { render } from "@react-email/render";
import { SignupEmail } from "email-templates";

const emailHtml = render(
  SignupEmail({
    name: userEmail.split("@")[0],
    verifyUrl: verificationLink,
    language: userLanguage,
  })
);

await resend.emails.send({
  from: "onboarding@your-domain.com",
  to: userEmail,
  subject: "欢迎注册",
  html: emailHtml,
});
```

## 📚 核心类型

```typescript
// 邮件组件 Props
interface SignupEmailProps {
  name?: string; // 用户名称
  verifyUrl: string; // 验证链接（必需）
  language?: Language; // 语言
  logoUrl?: string; // Logo URL
  companyName?: string; // 公司名称
  supportEmail?: string; // 支持邮箱
}

// 其他邮件组件Props类似，根据功能调整必需参数

// 通用邮件场景
type EmailScene = "signup" | "welcome" | "reset_password" | "verify_email";

// 支持的语言
type Language = "zh-CN" | "en-US";
```

## ❓ 常见问题

**Q: 如何修改邮件颜色？**
A: 编辑 `src/utils/styles.ts` 中的颜色值，所有组件会自动应用新颜色。

**Q: 如何添加新的语言？**
A: 修改 types.ts 中的 Language 类型，然后在各邮件组件中添加翻译。

**Q: 如何在 Supabase 中管理多个版本的邮件模板？**
A: 在 email_templates 表中添加 version 字段，通过版本号进行管理。

---

更新时间: 2025-12-23
