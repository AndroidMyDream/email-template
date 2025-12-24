-- Email Templates 数据库表设置
-- 在 Supabase SQL Editor 中执行此脚本

-- 创建 email_templates 表
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scene VARCHAR(50) NOT NULL,           -- 'welcome', 'reset_password', 'verify_email'
  language VARCHAR(10) NOT NULL,         -- 'zh-CN', 'en-US'
  react_component_name VARCHAR(100),     -- 'ResetPasswordEmailZh'
  subject VARCHAR(200),                  -- 邮件主题
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 唯一约束：同一场景和语言只能有一条记录
  UNIQUE(scene, language)
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_email_templates_scene_lang 
ON email_templates(scene, language);

CREATE INDEX IF NOT EXISTS idx_email_templates_enabled 
ON email_templates(enabled);

-- 插入默认模板数据
INSERT INTO email_templates (scene, language, react_component_name, subject)
VALUES 
  -- 欢迎邮件
  ('welcome', 'zh-CN', 'WelcomeEmailZh', '欢迎加入我们！'),
  ('welcome', 'en-US', 'WelcomeEmailEn', 'Welcome to Our Service!'),
  
  -- 重置密码邮件
  ('reset_password', 'zh-CN', 'ResetPasswordEmailZh', '重置您的密码'),
  ('reset_password', 'en-US', 'ResetPasswordEmailEn', 'Reset Your Password'),
  
  -- 邮箱验证邮件
  ('verify_email', 'zh-CN', 'VerifyEmailZh', '验证您的邮箱地址'),
  ('verify_email', 'en-US', 'VerifyEmailEn', 'Verify Your Email Address')
ON CONFLICT (scene, language) DO NOTHING;

-- 创建更新时间的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
CREATE TRIGGER update_email_templates_updated_at
    BEFORE UPDATE ON email_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 查询示例
-- SELECT * FROM email_templates WHERE scene = 'reset_password' AND language = 'zh-CN' AND enabled = true;

