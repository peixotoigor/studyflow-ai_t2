const messageMap: Array<[RegExp, string]> = [
  [/invalid login credentials/i, 'E-mail ou senha inválidos. Revise os dados e tente novamente.'],
  [/email not confirmed/i, 'Seu cadastro ainda precisa ser confirmado por e-mail. Verifique sua caixa de entrada.'],
  [/user already registered/i, 'Já existe uma conta com este e-mail. Tente entrar ou recupere sua senha.'],
  [/password should be at least/i, 'A senha precisa atender ao tamanho mínimo exigido para continuar.'],
  [/signup is disabled/i, 'O cadastro está temporariamente indisponível neste ambiente.'],
  [/network error/i, 'Não foi possível conectar agora. Verifique sua conexão e tente novamente.'],
  [/jwt|token/i, 'O token informado é inválido ou expirou. Solicite um novo link de recuperação.'],
];

export const normalizeAuthFeedback = (error: unknown, fallback: string): string => {
  const maybeMessage =
    typeof error === 'object' && error !== null
      ? (
          (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
          (error as { message?: string }).message
        )
      : '';

  if (!maybeMessage) {
    return fallback;
  }

  for (const [pattern, replacement] of messageMap) {
    if (pattern.test(maybeMessage)) {
      return replacement;
    }
  }

  return maybeMessage;
};