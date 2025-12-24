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

interface ResetPasswordEmailProps {
  resetUrl: string;
  language?: 'zh-CN' | 'en-US';
  logoUrl?: string;
  companyName?: string;
  supportEmail?: string;
}

const translations = {
  'zh-CN': {
    subject: '重置您的密码',
    title: '重置密码',
    greeting: '您好，',
    message: '我们收到了您的密码重置请求。请点击下面的按钮来重置您的密码：',
    button: '重置密码',
    expiry: '此链接将在 24 小时后过期。',
    ignore: '如果您没有请求重置密码，请忽略此邮件。',
    footer: '如果您遇到任何问题，请联系我们的支持团队。',
  },
  'en-US': {
    subject: 'Reset Your Password',
    title: 'Reset Password',
    greeting: 'Hello,',
    message: 'We received a request to reset your password. Please click the button below to reset your password:',
    button: 'Reset Password',
    expiry: 'This link will expire in 24 hours.',
    ignore: 'If you did not request a password reset, please ignore this email.',
    footer: 'If you have any issues, please contact our support team.',
  },
};

export const ResetPasswordEmail = ({
  resetUrl,
  language = 'en-US',
  logoUrl = 'https://via.placeholder.com/150',
  companyName = 'Our Service',
  supportEmail = 'support@example.com',
}: ResetPasswordEmailProps) => {
  const t = translations[language];

  return (
    <Html>
      <Head />
      <Preview>{t.message}</Preview>
      <Body style={styles.main}>
        <Container style={styles.container}>
          {logoUrl && (
            <Section style={styles.logoSection}>
              <Img src={logoUrl} width="150" height="auto" alt={companyName} />
            </Section>
          )}
          <Heading style={styles.heading}>{t.title}</Heading>
          <Text style={styles.paragraph}>{t.greeting}</Text>
          <Text style={styles.paragraph}>{t.message}</Text>
          <Section style={styles.buttonContainer}>
            <Button style={styles.button} href={resetUrl}>
              {t.button}
            </Button>
          </Section>
          <Text style={styles.paragraph}>
            <Link href={resetUrl} style={styles.link}>
              {resetUrl}
            </Link>
          </Text>
          <Text style={styles.warning}>{t.expiry}</Text>
          <Text style={styles.footer}>{t.ignore}</Text>
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

ResetPasswordEmail.PreviewProps = {
  resetUrl: 'https://example.com/reset?token=xxx&lang=en-US',
  language: 'en-US',
} as ResetPasswordEmailProps;

export default ResetPasswordEmail;

