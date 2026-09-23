export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_HINT = "At least 8 characters, with a letter and a number.";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateEmail(email: string) {
  if (!email.trim()) return "Please enter your email.";
  if (!EMAIL_PATTERN.test(email.trim())) return "Please enter a valid email address.";
  return null;
}

export function validatePassword(password: string) {
  if (!password) return "Please enter a password.";
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
  }
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return "Password must include at least one letter and one number.";
  }
  return null;
}

export function validatePasswordConfirmation(password: string, confirm: string) {
  if (!confirm) return "Please confirm your password.";
  if (password !== confirm) return "Passwords don't match.";
  return null;
}

/** Maps Supabase Auth errors to clear, human-readable messages. */
export function describeAuthError(error: { message?: string; code?: string; status?: number } | null) {
  if (!error) return "Something went wrong. Please try again.";
  const code = error.code ?? "";
  const message = (error.message ?? "").toLowerCase();

  if (code === "invalid_credentials" || message.includes("invalid login credentials")) {
    return "Incorrect email or password.";
  }
  if (code === "email_not_confirmed" || message.includes("email not confirmed")) {
    return "Please confirm your email first — check your inbox for the confirmation link.";
  }
  if (code === "user_already_exists" || code === "email_exists" || message.includes("already registered")) {
    return "An account with this email already exists. Try logging in instead.";
  }
  if (code === "weak_password" || message.includes("password should")) {
    return "That password is too weak. Please choose a stronger one.";
  }
  if (code === "same_password") {
    return "Your new password must be different from the current one.";
  }
  if (code === "over_email_send_rate_limit" || code === "over_request_rate_limit" || error.status === 429) {
    return "Too many attempts. Please wait a minute and try again.";
  }
  if (code === "session_not_found" || code === "session_expired" || message.includes("auth session missing")) {
    return "Your session has expired. Please log in again.";
  }
  if (message.includes("failed to fetch") || message.includes("network")) {
    return "Network error — please check your connection and try again.";
  }
  if (code === "validation_failed" && message.includes("email")) {
    return "Please enter a valid email address.";
  }
  return "Something went wrong. Please try again.";
}

export const AUTH_LINK_ERRORS: Record<string, string> = {
  link_invalid: "That link is invalid or has expired. Please request a new one.",
  auth_unavailable: "Sign-in is temporarily unavailable. Please try again later.",
  google_unavailable: "Google sign-in isn't available yet. Please use email and password.",
};
