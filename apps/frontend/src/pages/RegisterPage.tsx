import React, { useState } from 'react';
import { Link, useNavigate, Navigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { AuthExperience } from '../components/auth/AuthExperience';
import { AuthExperienceField } from '../components/auth/AuthExperienceField';
import { normalizeAuthFeedback } from '../components/auth/authFeedback';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login, token } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const passwordChecks = [
    { label: 'Mín. 8 caracteres', pass: password.length >= 8 },
    { label: 'Letra minúscula', pass: /[a-z]/.test(password) },
    { label: 'Letra maiúscula', pass: /[A-Z]/.test(password) },
    { label: 'Número', pass: /\d/.test(password) },
    { label: 'Símbolo', pass: /[^A-Za-z0-9]/.test(password) }
  ];

  const isPasswordStrong = passwordChecks.every((rule) => rule.pass);
  const passwordsMatch = confirmPassword === '' || password === confirmPassword;
  const isFormFilled = Boolean(name.trim() && email.trim() && password && confirmPassword);
  const isSubmitDisabled = loading || !isFormFilled || !isPasswordStrong || !passwordsMatch;
  const missingRequirements: string[] = [];
  if (!name.trim()) missingRequirements.push('nome');
  if (!email.trim()) missingRequirements.push('e-mail');
  if (!password) missingRequirements.push('senha');
  if (!confirmPassword) missingRequirements.push('confirmação');
  if (password && !isPasswordStrong) missingRequirements.push('senha forte');
  if (password && confirmPassword && !passwordsMatch) missingRequirements.push('senhas iguais');

  if (token) {
    return <Navigate to="/app" replace />;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    if (!isPasswordStrong) {
      setError('Crie uma senha forte com maiúscula, minúscula, número e símbolo (mín. 8).');
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não conferem.');
      setLoading(false);
      return;
    }
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const { data, error: supeError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            full_name: name,
          }
        }
      });

      if (supeError) {
        throw supeError;
      }

      const accessToken = data.session?.access_token;
      if (!accessToken) {
        // Supabase pode exigir confirmação de email
        setError('Verifique seu e-mail para confirmar o cadastro.');
        return;
      }

      localStorage.setItem('studyflow_token', accessToken);
      sessionStorage.removeItem('studyflow_token');

      const meResponse = await api.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      login(accessToken, meResponse.data.user);
      queryClient.clear();
      navigate('/app', { replace: true });
    } catch (err: any) {
      console.error(err);
      setError(normalizeAuthFeedback(err, 'Não foi possível concluir o cadastro agora. Tente novamente em instantes.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthExperience
      eyebrow="Cadastro"
      title={<>Crie sua conta em uma interface nova, sem herdar nada da tela <span className="landing-gradient-text">anterior</span></>}
      description="Esta página foi remontada para seguir a mesma gramática da landing: contraste intencional, serif display, azul elétrico e superfícies elevadas."
      heroEyebrow="Nova jornada"
      heroTitle={<>Comece sua preparação com um onboarding <span className="landing-gradient-text">coeso</span>.</>}
      heroDescription="O cadastro repete a mesma assinatura da landing pública e leva você para dentro do app sem quebra de identidade visual ou estrutura de navegação."
      heroQuote="Pequenos avanços diários geram grandes conquistas quando o sistema sustenta sua constância."
      heroQuoteLabel="Primeiro passo"
      metrics={[
        { value: '3 min', label: 'cadastro objetivo' },
        { value: '5 regras', label: 'senha robusta' },
        { value: '1 fluxo', label: 'entrada até o app' },
      ]}
      primaryAction={{ label: 'Já tenho conta', to: '/login' }}
      secondaryAction={{ label: 'Recuperar senha', to: '/forgot-password' }}
      footer={(
        <>
          <p>
            Já possui conta? <Link className="credential-link" to="/login">Entrar agora</Link>
          </p>
          <p>
            Precisa recuperar acesso? <Link className="credential-link credential-link-muted" to="/forgot-password">Solicitar redefinição</Link>
          </p>
          <p className="credential-footer-note">StudyFlow AI • onboarding reconstruído do zero</p>
        </>
      )}
    >
      <form className="credential-form" onSubmit={handleSubmit}>
        <AuthExperienceField
          label="Nome completo"
          icon="person"
          value={name}
          placeholder="Como devemos te chamar"
          autoComplete="name"
          helper="Esse nome será usado no perfil e nas mensagens do seu workspace."
          required
          disabled={loading}
          onChange={(event) => setName(event.target.value)}
        />

        <AuthExperienceField
          label="E-mail"
          icon="mail"
          type="email"
          value={email}
          placeholder="voce@exemplo.com"
          autoComplete="email"
          inputMode="email"
          helper="Se este ambiente exigir confirmação, o próximo passo chegará neste e-mail."
          required
          disabled={loading}
          onChange={(event) => setEmail(event.target.value)}
        />

        <AuthExperienceField
          label="Senha"
          icon="lock"
          type={showPassword ? 'text' : 'password'}
          value={password}
          placeholder="Crie uma senha segura"
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

        <div className="credential-password-checks" aria-live="polite">
          {passwordChecks.map((rule) => (
            <span key={rule.label} className={`credential-password-check${rule.pass ? ' is-valid' : ''}`}>
              {rule.label}
            </span>
          ))}
        </div>

        <AuthExperienceField
          label="Confirmar senha"
          icon="verified_user"
          type={showConfirmPassword ? 'text' : 'password'}
          value={confirmPassword}
          placeholder="Repita sua senha"
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

        {confirmPassword && !passwordsMatch ? (
          <div className="credential-status credential-status-error" role="alert"><span className="material-symbols-outlined">error</span><span>As senhas precisam coincidir.</span></div>
        ) : null}

        {error ? <div className="credential-status credential-status-error" role="alert"><span className="material-symbols-outlined">error</span><span>{error}</span></div> : null}

        {!loading && isSubmitDisabled ? (
          <p className="credential-hint">Para liberar o cadastro, complete: {missingRequirements.join(', ')}.</p>
        ) : null}

        <button className="credential-submit" type="submit" disabled={isSubmitDisabled}>
          <span className="credential-submit-content">
            {loading ? <span className="credential-spinner" aria-hidden="true" /> : null}
            <span>{loading ? 'Enviando...' : 'Criar conta agora'}</span>
            <span className="material-symbols-outlined">arrow_forward</span>
          </span>
        </button>
      </form>
    </AuthExperience>
  );
};

export default RegisterPage;
