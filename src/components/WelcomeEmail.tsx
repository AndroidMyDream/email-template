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

interface WelcomeEmailProps {
  name?: string;
  language?: 'zh-CN' | 'en-US';
  logoUrl?: string;
  companyName?: string;
  supportEmail?: string;
}

const translations = {
  'zh-CN': {
    subject: '欢迎加入我们！',
    title: '欢迎加入',
    greeting: (name: string) => `您好，${name}！`,
    message: '感谢您注册我们的服务。您的账户已成功创建。',
    button: '开始使用',
    footer: '如果您没有创建此账户，请忽略此邮件。',
  },
  'en-US': {
    subject: 'Welcome to Our Service!',
    title: 'Welcome',
    greeting: (name: string) => `Hello, ${name}!`,
    message: 'Thank you for registering with us. Your account has been successfully created.',
    button: 'Get Started',
    footer: 'If you did not create this account, please ignore this email.',
  },
};

export const WelcomeEmail = ({
  name = 'User',
  language = 'en-US',
  logoUrl = 'https://via.placeholder.com/150',
  companyName = 'Our Service',
  supportEmail = 'support@example.com',
}: WelcomeEmailProps) => {
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
            <Button style={styles.button} href="https://example.com/dashboard">
              {t.button}
            </Button>
          </Section>
          <Text style={styles.footer}>{t.footer}</Text>
          <Text style={styles.footer}>
            {language === 'zh-CN' ? '如有问题，请联系' : 'If you have questions, contact'}{' '}
            <Link href={`mailto:${supportEmail}`} style={styles.link}>
              {supportEmail}
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

WelcomeEmail.PreviewProps = {
  name: 'John Doe',
  language: 'en-US',
} as WelcomeEmailProps;

export default WelcomeEmail;

