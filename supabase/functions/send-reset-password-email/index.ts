/**
 * Supabase Edge Function: send-reset-password-email
 *
 * 专用于密码重置邮件，集成 Supabase Auth
 *
 * 功能：
 * 1. 生成密码重置链接
 * 2. 渲染 ResetPasswordEmail 模板
 * 3. 通过 Resend 发送邮件
 * 4. 记录邮件日志
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.33.1";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { render } from "https://esm.sh/@react-email/render@0.0.20";
import React from "https://esm.sh/react@18";
import { ResetPasswordEmail } from "https://esm.sh/email-templates@1.0.0?external=react,react-email/components";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ResetPasswordRequest {
  email: string;
  language?: "zh-CN" | "en-US";
  redirectTo?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // 初始化客户端
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseKey);
    const resend = new Resend(resendApiKey);

    // 解析请求
    const {
      email,
      language = "en-US",
      redirectTo,
    }: ResetPasswordRequest = await req.json();

    // 验证邮箱
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: "Invalid email address" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. 检查用户是否存在
    const { data: userData, error: userError } =
      await supabase.auth.admin.getUserByEmail(email);

    if (userError || !userData) {
      // 为了安全，不要泄露用户是否存在
      // 但可以记录此尝试
      console.warn(`Password reset attempted for non-existent email: ${email}`);

      return new Response(
        JSON.stringify({
          success: true,
          message:
            language === "zh-CN"
              ? "如果该邮箱已注册，您将收到密码重置邮件。"
              : "If the email is registered, you will receive a password reset email.",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 2. 生成密码重置链接
    const { data, error: linkError } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email: email,
      options: {
        redirectTo:
          redirectTo || `${Deno.env.get("APP_URL")}/auth/reset-password`,
      },
    });

    if (linkError || !data) {
      console.error("Link generation error:", linkError);
      return new Response(
        JSON.stringify({
          error: "Failed to generate reset link",
          details: linkError?.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 3. 获取邮件模板配置
    const { data: template, error: templateError } = await supabase
      .from("email_templates")
      .select("*")
      .eq("scene", "reset_password")
      .eq("language", language)
      .eq("enabled", true)
      .single();

    if (templateError || !template) {
      console.error("Template error:", templateError);
      return new Response(
        JSON.stringify({ error: "Email template not found" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 4. 构建重置链接
    const resetUrl = `${data.properties.action_link}?lang=${language}`;

    // 5. 使用 React 组件渲染邮件 HTML
    let emailHtml: string;
    try {
      const resetPasswordComponent = React.createElement(ResetPasswordEmail, {
        resetUrl: resetUrl,
        language: language as "zh-CN" | "en-US",
        logoUrl: Deno.env.get("LOGO_URL") || "https://via.placeholder.com/150",
        companyName: Deno.env.get("COMPANY_NAME") || "Our Service",
        supportEmail: Deno.env.get("SUPPORT_EMAIL") || "support@example.com",
      });
      emailHtml = await render(resetPasswordComponent);
    } catch (renderError) {
      console.error("Email render error:", renderError);
      return new Response(
        JSON.stringify({
          error: "Failed to render email",
          details:
            renderError instanceof Error
              ? renderError.message
              : "Unknown error",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 6. 发送邮件
    const { data: emailData, error: emailError } = (await resend.emails.send({
      from: Deno.env.get("FROM_EMAIL") || "onboarding@resend.dev",
      to: email,
      subject: template.subject,
      html: emailHtml,
      reply_to: Deno.env.get("SUPPORT_EMAIL"),
    })) as { data: { id: string } | null; error: any };

    if (emailError) {
      console.error("Email send error:", emailError);

      // 记录失败
      await supabase
        .from("email_logs")
        .insert({
          email_to: email,
          scene: "reset_password",
          language: language,
          status: "failed",
          error_message: emailError.message,
        })
        .catch((err) => console.error("Log error:", err));

      return new Response(
        JSON.stringify({
          error: "Failed to send reset email",
          details: emailError.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 7. 记录邮件日志
    await supabase
      .from("email_logs")
      .insert({
        email_to: email,
        scene: "reset_password",
        language: language,
        status: "sent",
        resend_email_id: emailData?.id,
      })
      .catch((err) => console.error("Log error:", err));

    // 8. 返回成功响应（出于安全考虑，不透露是否已发送）
    return new Response(
      JSON.stringify({
        success: true,
        message:
          language === "zh-CN"
            ? "如果该邮箱已注册，您将收到密码重置邮件。"
            : "If the email is registered, you will receive a password reset email.",
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
