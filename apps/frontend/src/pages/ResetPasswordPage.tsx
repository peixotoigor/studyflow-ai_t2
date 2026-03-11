import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/client';
import { AuthExperience } from '../components/auth/AuthExperience';
import { AuthExperienceField } from '../components/auth/AuthExperienceField';
import { normalizeAuthFeedback } from '../components/auth/authFeedback';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const defaultToken = searchParams.get('token') || '';
  const [token, setToken] = useState(defaultToken);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas precisam ser iguais.');
      return;
    }

    if (password.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/reset-password', { token, newPassword: password });
      setMessage('Senha redefinida com sucesso. Você já pode fazer login.');
    } catch (err: any) {
      setError(normalizeAuthFeedback(err, 'Não foi possível redefinir a senha agora. Solicite um novo token e tente novamente.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthExperience
      eyebrow="Nova senha"
      title={<>Defina uma nova senha no mesmo universo visual da <span className="landing-gradient-text">entrada</span></>}
      description="A redefinição também foi reconstruída na nova base, sem reaproveitar a interface antiga, preservando apenas a lógica de negócio."
      heroEyebrow="Retorno seguro"
      heroTitle={<>Redefina sua credencial e volte ao ritmo de <span className="landing-gradient-text">execução</span>.</>}
      heroDescription="Token, nova senha, confirmação e feedback imediato seguem a mesma estética da landing e do login para manter a experiência coesa até o retorno ao app."
      heroQuote="Segurança boa não atrapalha o fluxo; ela organiza o retorno ao ponto exato onde você parou."
      heroQuoteLabel="Redefinição"
      metrics={[
        { value: '1 token', label: 'validação direta' },
        { value: '2 campos', label: 'confirmação segura' },
        { value: '1 retorno', label: 'volta ao login' },
      ]}
      primaryAction={{ label: 'Ir para login', to: '/login' }}
      secondaryAction={{ label: 'Novo token', to: '/forgot-password' }}
      footer={(
        <>
          <p>
            Voltar para <Link className="credential-link" to="/login">login</Link>
          </p>
          <p>
            Precisa de um novo token? <Link className="credential-link credential-link-muted" to="/forgot-password">Solicitar novamente</Link>
          </p>
          <p className="credential-footer-note">StudyFlow AI • redefinição consistente com a landing</p>
        </>
      )}
    >
      <form className="credential-form" onSubmit={handleSubmit}>
        <AuthExperienceField
          label="Token de recuperação"
          icon="key"
          value={token}
          placeholder="Cole o token recebido"
          helper="Cole exatamente o token recebido por e-mail ou use o link enviado para preencher automaticamente."
          required
          disabled={loading}
          onChange={(event) => setToken(event.target.value)}
        />

        <AuthExperienceField
          label="Nova senha"
          icon="lock"
          type={showPassword ? 'text' : 'password'}
          value={password}
          placeholder="Digite a nova senha"
          autoComplete="new-password"
          required
          disabled={loading}
          onChange={(event) => setPassword(event.target.value)}
          action={(
            <button
              type="button"
              className="credential-field-action"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              disabled={loading}
            >
              <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
            </button>
          )}
        />

        <AuthExperienceField
          label="Confirmar nova senha"
          icon="verified_user"
          type={showConfirmPassword ? 'text' : 'password'}
          value={confirmPassword}
          placeholder="Repita a nova senha"
          autoComplete="new-password"
          required
          disabled={loading}
          onChange={(event) => setConfirmPassword(event.target.value)}
          action={(
            <button
              type="button"
              className="credential-field-action"
              onClick={() => setShowConfirmPassword((current) => !current)}
              aria-label={showConfirmPassword ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'}
              disabled={loading}
            >
              <span className="material-symbols-outlined">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
            </button>
          )}
        />

        <p className="credential-hint">A nova senha precisa ter pelo menos 6 caracteres e coincidir com a confirmação.</p>

        {message ? <div className="credential-status credential-status-success" aria-live="polite"><span className="material-symbols-outlined">check_circle</span><span>{message}</span></div> : null}
        {error ? <div className="credential-status credential-status-error" role="alert"><span className="material-symbols-outlined">error</span><span>{error}</span></div> : null}

        <button className="credential-submit" type="submit" disabled={loading}>
          <span className="credential-submit-content">
            {loading ? <span className="credential-spinner" aria-hidden="true" /> : null}
            <span>{loading ? 'Redefinindo...' : 'Redefinir senha'}</span>
            <span className="material-symbols-outlined">arrow_forward</span>
          </span>
        </button>
      </form>
    </AuthExperience>
  );
};

export default ResetPasswordPage;
