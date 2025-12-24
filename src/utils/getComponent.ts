import { Language, EmailScene } from "../types";
import { WelcomeEmail } from "../components/WelcomeEmail";
import { SignupEmail } from "../components/SignupEmail";
import { ResetPasswordEmail } from "../components/ResetPasswordEmail";
import { VerifyEmail } from "../components/VerifyEmail";

/**
 * 根据场景和语言获取对应的 React 组件
 * 对应 Supabase email_templates 表中的 react_component_name
 */
export function getEmailComponent(scene: EmailScene, language: Language) {
  const componentMap: Record<string, any> = {
    "welcome_zh-CN": WelcomeEmail,
    "welcome_en-US": WelcomeEmail,
    "signup_zh-CN": SignupEmail,
    "signup_en-US": SignupEmail,
    "reset_password_zh-CN": ResetPasswordEmail,
    "reset_password_en-US": ResetPasswordEmail,
    "verify_email_zh-CN": VerifyEmail,
    "verify_email_en-US": VerifyEmail,
  };

  const key = `${scene}_${language}`;
  return componentMap[key] || null;
}

/**
 * 生成组件名称（用于 Supabase email_templates 表）
 */
export function getComponentName(
  scene: EmailScene,
  language: Language
): string {
  const sceneMap: Record<EmailScene, string> = {
    welcome: "WelcomeEmail",
    signup: "SignupEmail",
    reset_password: "ResetPasswordEmail",
    verify_email: "VerifyEmail",
  };

  const langSuffix = language === "zh-CN" ? "Zh" : "En";
  return `${sceneMap[scene]}${langSuffix}`;
}
