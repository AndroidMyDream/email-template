import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { styles } from '../utils/styles';

interface SignupEmailProps {
  name?: string;
  verifyUrl: string;
  language?: 'zh-CN' | 'en-US';
  logoUrl?: string;
  companyName?: string;
  supportEmail?: string;
}

const translations = {
  'zh-CN': {
    subject: '欢迎注册！请验证您的邮箱',
    title: '完成您的注册',
    greeting: (name: string) => `您好，${name}！`,
    message: '感谢您注册我们的服务。请点击下面的按钮验证您的邮箱地址以激活账户。',
    button: '验证邮箱',
    expiry: '此链接将在 24 小时后过期。',
    noAction: '如果您没有注册此账户，请忽略此邮件。',
    footer: '如果您遇到任何问题，请联系我们的支持团队。',
    copyLink: '或者复制此链接到浏览器：',
  },
  'en-US': {
    subject: 'Welcome! Please Verify Your Email',
    title: 'Complete Your Registration',
    greeting: (name: string) => `Hello, ${name}!`,
    message: 'Thank you for signing up! Please click the button below to verify your email address and activate your account.',
    button: 'Verify Email',
    expiry: 'This link will expire in 24 hours.',
    noAction: 'If you did not create this account, please ignore this email.',
    footer: 'If you have any issues, please contact our support team.',
    copyLink: 'Or copy this link in your browser:',
  },
};

export const SignupEmail = ({
  name = 'User',
  verifyUrl,
  language = 'en-US',
  logoUrl = 'https://via.placeholder.com/150',
  companyName = 'Our Service',
  supportEmail = 'support@example.com',
}: SignupEmailProps) => {
  const t = translations[language];

  return (
    <Html>
      <Head />
      <Preview>{t.greeting(name)}</Preview>
      <Body style={styles.main}>
        <Container style={styles.container}>
          {logoUrl && (
            <Section style={styles.logoSection}>
              <Img src={logoUrl} width="150" height="auto" alt={companyName} />
            </Section>
          )}
          <Heading style={styles.heading}>{t.title}</Heading>
          <Text style={styles.paragraph}>{t.greeting(name)}</Text>
          <Text style={styles.paragraph}>{t.message}</Text>
          <Section style={styles.buttonContainer}>
            <Button style={styles.button} href={verifyUrl}>
              {t.button}
            </Button>
          </Section>
          <Text style={styles.paragraph}>{t.copyLink}</Text>
          <Text style={styles.paragraph}>
            <Link href={verifyUrl} style={styles.link}>
              {verifyUrl}
            </Link>
          </Text>
          <Text style={styles.warning}>{t.expiry}</Text>
          <Text style={styles.footer}>{t.noAction}</Text>
          <Text style={styles.footer}>
            {t.footer}{' '}
            <Link href={`mailto:${supportEmail}`} style={styles.link}>
              {supportEmail}
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

SignupEmail.PreviewProps = {
  name: 'John Doe',
  verifyUrl: 'https://example.com/verify?token=xxx&lang=en-US',
  language: 'en-US',
} as SignupEmailProps;

export default SignupEmail;
