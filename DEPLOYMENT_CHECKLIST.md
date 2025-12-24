# Supabase + Resend 部署清单

快速检查清单，用于在生产环境中部署邮件系统。

## ✅ 前置准备

- [ ] Supabase 项目已创建
- [ ] Resend 账户已创建
- [ ] 获取 Resend API Key
- [ ] 获取 Supabase Service Role Key
- [ ] 获取 Supabase Project URL
- [ ] 有效的发件人邮箱或域名已配置

## ✅ 数据库设置

### 在 Supabase SQL Editor 中执行

```bash
# 检查清单项
- [ ] 创建 email_templates 表
- [ ] 创建 email_logs 表
- [ ] 插入邮件模板配置
- [ ] 验证表结构和数据
```

**SQL 命令：**

```sql
-- 1. 创建表
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

CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email_to VARCHAR(255) NOT NULL,
  scene VARCHAR(50) NOT NULL,
  language VARCHAR(10),
  status VARCHAR(20),
  resend_email_id VARCHAR(255),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. 插入数据
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

-- 3. 验证
SELECT COUNT(*) FROM email_templates;  -- 应返回 8
```

## ✅ Edge Function 部署

### 本地环境设置

```bash
# 初始化 Supabase CLI
- [ ] 运行: supabase init
- [ ] 运行: supabase link --project-ref your-project-ref

# 创建 Functions
- [ ] 运行: supabase functions new send-email
- [ ] 运行: supabase functions new send-signup-email
- [ ] 运行: supabase functions new send-reset-password-email

# 从项目中复制代码
- [ ] 复制 supabase/functions/send-email/index.ts
- [ ] 复制 supabase/functions/send-signup-email/index.ts
- [ ] 复制 supabase/functions/send-reset-password-email/index.ts
```

### Secrets 配置

在 Supabase Dashboard → Project Settings → Secrets 中添加：

```bash
# 必需的 Secrets
RESEND_API_KEY = your_resend_api_key_here
SUPABASE_URL = https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY = your_service_role_key_here

# 可选的 Secrets
FROM_EMAIL = noreply@your-domain.com
LOGO_URL = https://your-domain.com/logo.png
COMPANY_NAME = Your Company Name
SUPPORT_EMAIL = support@your-domain.com
APP_URL = https://your-app.com
```

### 本地测试

```bash
- [ ] 运行: supabase start
- [ ] 运行: supabase functions serve
- [ ] 测试 send-email 函数调用

# 测试命令
curl -X POST http://localhost:54321/functions/v1/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "scene": "signup",
    "email": "test@example.com",
    "language": "en-US",
    "customData": {
      "name": "Test User",
      "verifyUrl": "https://example.com/verify?token=test123"
    }
  }'
```

### 生产部署

```bash
# 部署 Functions
- [ ] 运行: supabase functions deploy send-email
- [ ] 运行: supabase functions deploy send-signup-email
- [ ] 运行: supabase functions deploy send-reset-password-email

# 验证部署
- [ ] 在 Supabase Dashboard 中查看 Functions 状态
- [ ] 检查 Edge Function 日志
- [ ] 测试实际邮件发送
```

## ✅ 应用集成

### 前端 (React/Next.js)

```typescript
- [ ] 安装 @supabase/supabase-js
- [ ] 创建 Supabase 客户端
- [ ] 实现注册邮件调用
- [ ] 实现密码重置邮件调用
- [ ] 添加错误处理
- [ ] 测试端到端流程

// 示例代码
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function signupWithEmail(email: string, password: string) {
  // 1. 创建用户
  const { data: authData, error: authError } =
    await supabase.auth.signUp({ email, password });

  // 2. 发送验证邮件
  if (!authError) {
    const { error: emailError } =
      await supabase.functions.invoke('send-signup-email', {
        body: {
          email: email,
          language: 'zh-CN',
          verifyUrl: `${window.location.origin}/auth/verify?token=${token}`,
        },
      });
  }
}
```

### 后端 (Node.js/Deno)

```typescript
- [ ] 初始化 Supabase 服务端客户端
- [ ] 实现注册流程
- [ ] 实现密码重置流程
- [ ] 添加邮件日志记录
- [ ] 实现重试逻辑（可选）
- [ ] 测试所有场景

// 示例
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// 在注册时发送邮件
const { error } = await supabase.functions.invoke('send-signup-email', {
  body: { email, verifyUrl, language: 'zh-CN' },
});
```

## ✅ 验证和测试

### 邮件发送测试

```bash
- [ ] 注册账户，验证收到注册邮件
- [ ] 请求密码重置，验证收到重置邮件
- [ ] 验证邮件内容格式正确
- [ ] 验证多语言邮件（中文和英文）
- [ ] 验证邮件中的链接可正常点击
- [ ] 检查 Resend Dashboard 中的邮件统计
- [ ] 检查 Supabase email_logs 表中的记录
```

### 浏览器兼容性测试

- [ ] 在 Gmail 中测试
- [ ] 在 Outlook 中测试
- [ ] 在 Apple Mail 中测试
- [ ] 在手机客户端中测试（iOS/Android）

### 错误处理测试

```bash
- [ ] 测试无效邮箱
- [ ] 测试网络错误
- [ ] 测试缺少必需参数
- [ ] 测试 Resend API 配额限制
- [ ] 验证错误消息清晰
```

## ✅ 监控和维护

### 日志和监控

- [ ] 设置 Resend Dashboard 告警
- [ ] 监控 Edge Function 执行时间
- [ ] 监控 Edge Function 错误率
- [ ] 定期查看 email_logs 表
- [ ] 设置邮件失败告警

### 定期维护

```bash
# 每周检查
- [ ] 查看邮件发送统计
- [ ] 检查是否有失败的邮件
- [ ] 验证邮件模板是否正常

# 每月检查
- [ ] 审计邮件日志
- [ ] 检查 Resend 配额使用
- [ ] 更新邮件模板如果需要
```

## ✅ 安全检查

- [ ] API Keys 已正确存储在 Secrets 中
- [ ] Edge Functions 启用了认证（如需要）
- [ ] 敏感信息（密码重置链接）已正确处理
- [ ] 实现了速率限制（防止滥用）
- [ ] 邮件地址已验证（非测试地址）
- [ ] CORS 设置正确
- [ ] 错误消息不泄露敏感信息

## ✅ 文档和培训

- [ ] 团队成员已读 [集成指南](SUPABASE_RESEND_INTEGRATION.md)
- [ ] 已准备故障排除文档
- [ ] 已记录所有 Secrets 配置（在安全位置）
- [ ] 已准备 Edge Function 维护指南

## 📋 检查清单

总体完成度：**\_\_\_ / 45** 项

| 类别          | 项目数 | 完成 |
| ------------- | ------ | ---- |
| 前置准备      | 6      | ☐    |
| 数据库设置    | 4      | ☐    |
| Edge Function | 10     | ☐    |
| 应用集成      | 8      | ☐    |
| 验证测试      | 9      | ☐    |
| 监控维护      | 6      | ☐    |
| 安全检查      | 8      | ☐    |
| 文档培训      | 4      | ☐    |

## 🆘 故障排除

### 常见问题

**Q: Edge Function 返回 401 Unauthorized**

- 检查 SUPABASE_SERVICE_ROLE_KEY 是否正确
- 确保 Function 中的环境变量已正确设置

**Q: 邮件未收到**

- 检查邮箱地址是否正确
- 查看 Resend Dashboard 中的邮件状态
- 查看 email_logs 表中的错误信息
- 检查垃圾邮件文件夹

**Q: 邮件格式异常**

- 验证 FROM_EMAIL 是否已在 Resend 中验证
- 检查邮件 HTML 是否有效
- 在不同客户端中测试

## 📞 获取帮助

- [Supabase 文档](https://supabase.com/docs)
- [Resend 文档](https://resend.com/docs)
- [项目 GitHub Issues](https://github.com/your-repo/issues)

---

最后更新：2025-12-23
