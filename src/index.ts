// Export all email components
export { WelcomeEmail } from "./components/WelcomeEmail";
export { SignupEmail } from "./components/SignupEmail";
export { ResetPasswordEmail } from "./components/ResetPasswordEmail";
export { VerifyEmail } from "./components/VerifyEmail";

// Export types
export * from "./types";

// Export utilities
export { getEmailComponent, getComponentName } from "./utils/getComponent";

// Export locales (for reference, actual usage depends on implementation)
export { zhCN, enUS, locales } from "./locales";
