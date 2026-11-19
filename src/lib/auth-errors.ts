interface ErrorLike {
  message?: string;
  code?: string;
  status?: number;
  error?: {
    message?: string;
    code?: string;
    status?: number;
  };
}

/**
 * Translates Neon Auth / Better Auth errors into clear, user-friendly Portuguese messages.
 */
export function getFriendlyAuthErrorMessage(
  err: unknown,
  context: 'login' | 'signup' | 'general' = 'general'
): string {
  if (!err) {
    return 'Ocorreu um erro inesperado. Tente novamente em instantes.';
  }

  const errorObj = err as ErrorLike;
  const code = (errorObj.error?.code || errorObj.code || '').toUpperCase();
  const status = errorObj.error?.status ?? errorObj.status;
  const rawMessage = (
    errorObj.error?.message ||
    errorObj.message ||
    (typeof err === 'string' ? err : '')
  ).toLowerCase();

  if (
    code === 'INVALID_EMAIL_OR_PASSWORD' ||
    code === 'INVALID_CREDENTIALS' ||
    code === 'INVALID_PASSWORD' ||
    rawMessage.includes('invalid email or password') ||
    rawMessage.includes('invalid credentials') ||
    (context === 'login' && status === 401)
  ) {
    return 'E-mail ou senha incorretos. Verifique seus dados e tente novamente.';
  }

  if (
    code === 'USER_ALREADY_EXISTS' ||
    code === 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL' ||
    code === 'EMAIL_EXISTS' ||
    rawMessage.includes('already exists') ||
    rawMessage.includes('already registered') ||
    status === 409
  ) {
    return 'Este e-mail já está cadastrado. Faça login ou utilize outro e-mail.';
  }

  if (
    code === 'PASSWORD_TOO_SHORT' ||
    code === 'WEAK_PASSWORD' ||
    rawMessage.includes('password') && (rawMessage.includes('short') || rawMessage.includes('at least'))
  ) {
    return 'A senha deve ter no mínimo 9 caracteres.';
  }

  if (
    code === 'INVALID_EMAIL' ||
    code === 'EMAIL_ADDRESS_INVALID' ||
    rawMessage.includes('invalid email')
  ) {
    return 'Informe um endereço de e-mail válido.';
  }

  if (
    code === 'OVER_REQUEST_RATE_LIMIT' ||
    status === 429 ||
    rawMessage.includes('too many requests') ||
    rawMessage.includes('rate limit')
  ) {
    return 'Muitas tentativas seguidas. Aguarde alguns instantes e tente novamente.';
  }

  if (
    rawMessage.includes('failed to fetch') ||
    rawMessage.includes('networkerror') ||
    rawMessage.includes('network request failed') ||
    rawMessage.includes('load failed')
  ) {
    return 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.';
  }

  if (context === 'login') {
    return 'Não foi possível entrar. Verifique seu e-mail e senha e tente novamente.';
  }

  if (context === 'signup') {
    return 'Não foi possível concluir o cadastro. Verifique os dados informados e tente novamente.';
  }

  return 'Não foi possível concluir a solicitação. Tente novamente em instantes.';
}

