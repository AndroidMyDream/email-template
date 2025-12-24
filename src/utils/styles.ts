/**
 * 邮件组件的公共样式
 */

export const styles = {
  main: {
    backgroundColor: "#f6f9fc",
    fontFamily:
      '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  },

  container: {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "20px 0 48px",
    marginBottom: "64px",
    maxWidth: "600px",
  },

  logoSection: {
    padding: "32px 20px",
    textAlign: "center" as const,
  },

  heading: {
    fontSize: "24px",
    lineHeight: "1.3",
    fontWeight: "700",
    color: "#484848",
    padding: "0 40px",
    textAlign: "center" as const,
  },

  paragraph: {
    fontSize: "16px",
    lineHeight: "1.4",
    color: "#484848",
    padding: "0 40px",
    margin: "16px 0",
  },

  buttonContainer: {
    padding: "27px 0 27px",
    textAlign: "center" as const,
  },

  button: {
    backgroundColor: "#5e6ad2",
    borderRadius: "3px",
    color: "#fff",
    fontSize: "16px",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "block",
    width: "200px",
    padding: "12px 20px",
    margin: "0 auto",
  },

  link: {
    color: "#5e6ad2",
    textDecoration: "underline",
  },

  footer: {
    fontSize: "12px",
    lineHeight: "1.4",
    color: "#8898aa",
    padding: "0 40px",
    margin: "16px 0",
    textAlign: "center" as const,
  },

  warning: {
    fontSize: "12px",
    lineHeight: "1.4",
    color: "#ea5455",
    padding: "0 40px",
    margin: "16px 0",
    textAlign: "center" as const,
  },
};
