import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { AuthExperience } from '../components/auth/AuthExperience';
import { AuthExperienceField } from '../components/auth/AuthExperienceField';
import { normalizeAuthFeedback } from '../components/auth/authFeedback';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const isSubmitDisabled = loading || !email;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setMessage('Se houver uma conta vinculada a este e-mail, enviaremos as instruções de redefinição em instantes.');
    } catch (err: any) {
      setError(normalizeAuthFeedback(err, 'Não foi possível enviar a recuperação agora. Tente novamente em instantes.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthExperience
      eyebrow="Recuperação"
      title={<>Recupere o acesso mantendo a mesma assinatura da <span className="landing-gradient-text">landing</span></>}
      description="A página de recuperação também foi refeita em uma base nova para continuar a narrativa visual do site público e do login."
      heroEyebrow="Fluxo seguro"
      heroTitle={<>Volte ao seu plano sem perder a <span className="landing-gradient-text">continuidade</span>.</>}
      heroDescription="O processo foi reduzido ao essencial: um campo, um envio e feedback direto, com a mesma estética sofisticada presente na landing pública."
      heroQuote="Recuperar acesso rápido evita atrito no momento em que a disciplina mais precisa de continuidade."
      heroQuoteLabel="Operação rápida"
      metrics={[
        { value: '1 campo', label: 'ação direta' },
        { value: '1 envio', label: 'link seguro' },
        { value: '0 ruído', label: 'interface objetiva' },
      ]}
      primaryAction={{ label: 'Voltar ao login', to: '/login' }}
      secondaryAction={{ label: 'Criar cadastro', to: '/register' }}
      footer={(
        <>
          <p>
            Já lembrou a senha? <Link className="credential-link" to="/login">Voltar para login</Link>
          </p>
          <p>
            Ainda sem conta? <Link className="credential-link credential-link-muted" to="/register">Criar cadastro</Link>
          </p>
          <p className="credential-footer-note">StudyFlow AI • recuperação no mesmo sistema visual</p>
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
          helper="Enviaremos o link de redefinição para este endereço, se ele estiver cadastrado."
          required
          disabled={loading}
          onChange={(event) => setEmail(event.target.value)}
        />

        {message ? <div className="credential-status credential-status-success" aria-live="polite"><span className="material-symbols-outlined">check_circle</span><span>{message}</span></div> : null}
        {error ? <div className="credential-status credential-status-error" role="alert"><span className="material-symbols-outlined">error</span><span>{error}</span></div> : null}

        <button className="credential-submit" type="submit" disabled={isSubmitDisabled}>
          <span className="credential-submit-content">
            {loading ? <span className="credential-spinner" aria-hidden="true" /> : null}
            <span>{loading ? 'Enviando...' : 'Enviar link de recuperação'}</span>
            <span className="material-symbols-outlined">arrow_forward</span>
          </span>
        </button>
      </form>
    </AuthExperience>
  );
};

export default ForgotPasswordPage;
