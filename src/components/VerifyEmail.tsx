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

interface VerifyEmailProps {
  verifyUrl: string;
  language?: 'zh-CN' | 'en-US';
  logoUrl?: string;
  companyName?: string;
  supportEmail?: string;
}

const translations = {
  'zh-CN': {
    subject: '验证您的邮箱地址',
    title: '验证邮箱',
    greeting: '您好，',
    message: '感谢您注册！请点击下面的按钮来验证您的邮箱地址：',
    button: '验证邮箱',
    expiry: '此链接将在 24 小时后过期。',
    ignore: '如果您没有创建此账户，请忽略此邮件。',
    footer: '如果您遇到任何问题，请联系我们的支持团队。',
  },
  'en-US': {
    subject: 'Verify Your Email Address',
    title: 'Verify Email',
    greeting: 'Hello,',
    message: 'Thank you for signing up! Please click the button below to verify your email address:',
    button: 'Verify Email',
    expiry: 'This link will expire in 24 hours.',
    ignore: 'If you did not create this account, please ignore this email.',
    footer: 'If you have any issues, please contact our support team.',
  },
};

export const VerifyEmail = ({
  verifyUrl,
  language = 'en-US',
  logoUrl = 'https://via.placeholder.com/150',
  companyName = 'Our Service',
  supportEmail = 'support@example.com',
}: VerifyEmailProps) => {
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
            <Button style={styles.button} href={verifyUrl}>
              {t.button}
            </Button>
          </Section>
          <Text style={styles.paragraph}>
            <Link href={verifyUrl} style={styles.link}>
              {verifyUrl}
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

VerifyEmail.PreviewProps = {
  verifyUrl: 'https://example.com/verify?token=xxx&lang=en-US',
  language: 'en-US',
} as VerifyEmailProps;

export default VerifyEmail;

