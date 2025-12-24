/**
 * Supabase Edge Function: send-email
 *
 * 通用邮件发送函数，支持所有邮件模板
 *
 * 使用方式：
 * curl -X POST https://your-project.supabase.co/functions/v1/send-email \
 *   -H "Authorization: Bearer YOUR_TOKEN" \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "scene": "signup",
 *     "email": "user@example.com",
 *     "language": "zh-CN",
 *     "customData": {
 *       "name": "User Name",
 *       "verifyUrl": "https://example.com/verify?token=xxx"
 *     }
 *   }'
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.33.1";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { render } from "https://esm.sh/@react-email/render@0.0.20";
import React from "https://esm.sh/react@18";
import {
  SignupEmail,
  WelcomeEmail,
  ResetPasswordEmail,
  VerifyEmail,
} from "https://esm.sh/email-templates@1.0.0?external=react,react-email/components";

const emailComponents = {
  signup: SignupEmail,
  welcome: WelcomeEmail,
  reset_password: ResetPasswordEmail,
  verify_email: VerifyEmail,
};

interface EmailRequest {
  scene: "signup" | "welcome" | "reset_password" | "verify_email";
  email: string;
  language?: "zh-CN" | "en-US";
  customData?: Record<string, any>;
}

interface EmailTemplate {
  id: string;
  scene: string;
  language: string;
  react_component_name: string;
  subject: string;
  enabled: boolean;
}

// 验证邮箱格式
function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// 主处理函数
serve(async (req) => {
  // 处理 CORS 预检请求
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // 只处理 POST 请求
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // 初始化 Supabase 和 Resend 客户端
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!supabaseUrl || !supabaseKey || !resendApiKey) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const resend = new Resend(resendApiKey);

    // 解析请求体
    const body: EmailRequest = await req.json();
    const { scene, email, language = "en-US", customData = {} } = body;

    // 验证必需参数
    if (!scene || !email) {
      return new Response(
        JSON.stringify({
          error: "Missing required parameters",
          required: ["scene", "email"],
          received: { scene, email },
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 验证邮箱格式
    if (!validateEmail(email)) {
      return new Response(JSON.stringify({ error: "Invalid email format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 查询邮件模板
    const { data: template, error: templateError } = (await supabase
      .from("email_templates")
      .select("*")
      .eq("scene", scene)
      .eq("language", language)
      .eq("enabled", true)
      .single()) as { data: EmailTemplate | null; error: any };

    if (templateError || !template) {
      return new Response(
        JSON.stringify({
          error: "Email template not found",
          scene,
          language,
          details: templateError,
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 获取邮件组件
    const Component = emailComponents[scene as keyof typeof emailComponents];

    if (!Component) {
      return new Response(
        JSON.stringify({
          error: "Email component not found",
          scene,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 准备组件 props
    const componentProps = {
      language: language as "zh-CN" | "en-US",
      logoUrl: Deno.env.get("LOGO_URL") || "https://via.placeholder.com/150",
      companyName: Deno.env.get("COMPANY_NAME") || "Our Company",
      supportEmail: Deno.env.get("SUPPORT_EMAIL") || "support@example.com",
      ...customData,
    };

    // 验证必需的自定义数据
    if (scene === "signup" && !customData.verifyUrl) {
      return new Response(
        JSON.stringify({
          error: "verifyUrl is required for signup scene",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (scene === "reset_password" && !customData.resetUrl) {
      return new Response(
        JSON.stringify({
          error: "resetUrl is required for reset_password scene",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (scene === "verify_email" && !customData.verifyUrl) {
      return new Response(
        JSON.stringify({
          error: "verifyUrl is required for verify_email scene",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 渲染邮件 HTML
    let emailHtml: string;
    try {
      const component = React.createElement(Component, componentProps);
      emailHtml = await render(component);
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

    // 发送邮件
    const fromEmail = Deno.env.get("FROM_EMAIL") || "onboarding@resend.dev";
    const { data: emailData, error: emailError } = (await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: template.subject,
      html: emailHtml,
      reply_to: Deno.env.get("SUPPORT_EMAIL"),
    })) as { data: { id: string } | null; error: any };

    if (emailError) {
      console.error("Resend error:", emailError);

      // 记录失败的邮件
      await supabase
        .from("email_logs")
        .insert({
          email_to: email,
          scene: scene,
          language: language,
          status: "failed",
          error_message: emailError.message,
        })
        .catch((err) => console.error("Failed to log error:", err));

      return new Response(
        JSON.stringify({
          error: "Failed to send email",
          details: emailError.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 记录成功发送的邮件
    const emailId = emailData?.id;
    await supabase
      .from("email_logs")
      .insert({
        email_to: email,
        scene: scene,
        language: language,
        status: "sent",
        resend_email_id: emailId,
      })
      .catch((err) => console.error("Failed to log success:", err));

    // 返回成功响应
    return new Response(
      JSON.stringify({
        success: true,
        message: `${scene} email sent successfully`,
        emailId: emailId,
        recipient: email,
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
