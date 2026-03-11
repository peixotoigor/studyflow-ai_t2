import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { AuthExperience } from '../components/auth/AuthExperience';
import { AuthExperienceField } from '../components/auth/AuthExperienceField';
import { normalizeAuthFeedback } from '../components/auth/authFeedback';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, token } = useAuth();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const insights = [
    'A excelência não é um ato, mas um hábito. Construa hoje o seu futuro.',
    'Disciplina é fazer o que precisa ser feito, mesmo sem vontade.',
    'Cada página estudada é um tijolo a mais na sua aprovação.',
    'Persistência vence o talento quando o talento não persiste.',
    'Seu futuro começa no próximo bloco de estudo que você inicia.',
    'Pequenos avanços diários geram grandes conquistas.',
    'Você não precisa ser perfeito, só consistente.'
  ];
  const daySeed = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const todayInsight = insights[daySeed % insights.length];

  if (token) {
    return <Navigate to="/app" replace />;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const { data, error: supeError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (supeError) {
        throw supeError;
      }

      const accessToken = data.session?.access_token;
      if (!accessToken) {
        throw new Error('Sessão não retornada pelo Supabase');
      }

      const primaryStorage = rememberMe ? localStorage : sessionStorage;
      const secondaryStorage = rememberMe ? sessionStorage : localStorage;
      primaryStorage.setItem('studyflow_token', accessToken);
      secondaryStorage.removeItem('studyflow_token');

      const meResponse = await api.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      login(accessToken, meResponse.data.user, rememberMe);
      queryClient.clear();
      navigate('/app', { replace: true });
    } catch (err: any) {
      console.error(err);
      setError(normalizeAuthFeedback(err, 'Não foi possível entrar agora. Tente novamente em instantes.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthExperience
      eyebrow="Login"
      title={<>Acesse sua conta com a mesma estética da <span className="landing-gradient-text">landing</span></>}
      description="A experiência de entrada foi recriada do zero para seguir a linguagem visual da página inicial, com foco em clareza, contraste e ação direta."
      heroEyebrow="Acesso principal"
      heroTitle={<>Entre e retome seu <span className="landing-gradient-text">ritmo</span> de estudo.</>}
      heroDescription="A landing abre a narrativa. Esta tela continua a mesma assinatura visual para levar você direto à execução do plano, sem ruptura estética no percurso."
      heroQuote={todayInsight}
      heroQuoteLabel="Foco do dia"
      metrics={[
        { value: '24/7', label: 'acesso liberado' },
        { value: '1 clique', label: 'retorno ao app' },
        { value: '100%', label: 'mesma identidade visual' },
      ]}
      primaryAction={{ label: 'Criar conta', to: '/register' }}
      secondaryAction={{ label: 'Recuperar senha', to: '/forgot-password' }}
      footer={(
        <>
          <p>
            Não possui conta? <Link className="credential-link" to="/register">Crie sua conta</Link>
          </p>
          <p>
            Recuperação rápida em <Link className="credential-link credential-link-muted" to="/forgot-password">esqueci minha senha</Link>
          </p>
          <p className="credential-footer-note">StudyFlow AI • acesso com narrativa contínua</p>
        </>
      )}
    >
      <form className="credential-form" onSubmit={handleSubmit}>
        <AuthExperienceField
          label="E-mail"
          icon="mail"
          type="email"
          value={email}
          placeholder="voce@exemplo.com"
          autoComplete="email"
          inputMode="email"
          helper="Use o mesmo e-mail cadastrado para continuar de onde parou."
          required
          disabled={loading}
          onChange={(event) => setEmail(event.target.value)}
        />

        <AuthExperienceField
          label="Senha"
          icon="lock"
          type={showPassword ? 'text' : 'password'}
          value={password}
          placeholder="Digite sua senha"
          autoComplete="current-password"
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

        {error ? <div className="credential-status credential-status-error" role="alert"><span className="material-symbols-outlined">error</span><span>{error}</span></div> : null}

        <div className="credential-meta-row">
          <label className="credential-checkbox">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              disabled={loading}
            />
            Manter sessão neste dispositivo
          </label>
          <Link className="credential-link" to="/forgot-password">Esqueci minha senha</Link>
        </div>

        <button className="credential-submit" type="submit" disabled={loading}>
          <span className="credential-submit-content">
            {loading ? <span className="credential-spinner" aria-hidden="true" /> : null}
            <span>{loading ? 'Entrando...' : 'Entrar na plataforma'}</span>
            <span className="material-symbols-outlined">arrow_forward</span>
          </span>
        </button>
      </form>
    </AuthExperience>
  );
};

export default LoginPage;
