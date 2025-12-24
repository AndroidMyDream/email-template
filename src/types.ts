export type Language = "zh-CN" | "en-US";

export type EmailScene =
  | "welcome"
  | "signup"
  | "reset_password"
  | "verify_email";

export interface EmailTemplateConfig {
  logoUrl?: string;
  companyName?: string;
  supportEmail?: string;
}

export interface WelcomeEmailProps {
  name?: string;
  language?: Language;
  logoUrl?: string;
  companyName?: string;
  supportEmail?: string;
}

export interface ResetPasswordEmailProps {
  resetUrl: string;
  language?: Language;
  logoUrl?: string;
  companyName?: string;
  supportEmail?: string;
}

export interface VerifyEmailProps {
  verifyUrl: string;
  language?: Language;
  logoUrl?: string;
  companyName?: string;
  supportEmail?: string;
}

export interface SignupEmailProps {
  name?: string;
  verifyUrl: string;
  language?: Language;
  logoUrl?: string;
  companyName?: string;
  supportEmail?: string;
}
