import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [ctaHover, setCtaHover] = useState(false);

  const isSubmitDisabled = loading || !email;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setMessage('Email localizado. Enviamos instruções para redefinir a senha (verifique sua caixa de entrada).');
    } catch (err: any) {
      let errorMessage = 'Não foi possível enviar a recuperação agora.';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-shell">
      <div className="fluid-mesh" />
      <div className="orb orb-indigo" />
      <div className="orb orb-purple" />
      <div className="orb orb-blue" />
      <div className="orb orb-white" />

      <div className="login-outer">
        <div className="login-card glassmorphism">
          <div className="login-brand">
            <div className="login-logo">SF</div>
            <h2 className="login-badge">Mente Preparada</h2>
          </div>

          <div className="login-heading">
            <h1>Recuperar acesso</h1>
            <p>Informe seu email para receber o link de redefinição.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="login-field">
              <span className="sr-only">Email</span>
              <input
                className="input-minimalist"
                type="email"
                placeholder="Seu e-mail de estudante"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                disabled={loading}
              />
            </label>

            {message && <p className="login-status success">{message}</p>}
            {error && <p className="login-status error">{error}</p>}

            <button
              className="btn-glow"
              type="submit"
              disabled={isSubmitDisabled}
              style={{
                position: 'relative',
                background: 'linear-gradient(90deg, #6366f1, #818cf8, #4f46e5, #6366f1)',
                backgroundSize: '320% 100%',
                backgroundPosition: ctaHover && !isSubmitDisabled ? '95% 50%' : '5% 50%',
                transition: 'background-position 0.6s ease, transform 0.25s ease, box-shadow 0.25s ease, filter 0.25s ease',
                boxShadow: ctaHover && !isSubmitDisabled
                  ? '0 20px 38px -12px rgba(79, 70, 229, 0.5), inset 0 -5px 12px rgba(0,0,0,0.18), inset 0 3px 12px rgba(255,255,255,0.4)'
                  : '0 12px 24px -8px rgba(79, 70, 229, 0.38), inset 0 -3px 8px rgba(0, 0, 0, 0.16), inset 0 2px 8px rgba(255, 255, 255, 0.3)',
                transform: ctaHover && !isSubmitDisabled ? 'translateY(-3px) scale(1.02)' : 'none',
                filter: ctaHover && !isSubmitDisabled ? 'saturate(125%) brightness(1.05)' : 'none',
                cursor: isSubmitDisabled ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={() => !isSubmitDisabled && setCtaHover(true)}
              onMouseLeave={() => setCtaHover(false)}
              onFocus={() => !isSubmitDisabled && setCtaHover(true)}
              onBlur={() => setCtaHover(false)}
              onMouseDown={() => setCtaHover(false)}
              onMouseUp={() => !isSubmitDisabled && setCtaHover(true)}
            >
              {loading ? 'Enviando...' : 'Enviar link de recuperação'}
            </button>
          </form>

          <div className="login-support">
            <p>Já lembrou a senha? <Link className="login-link-strong" to="/login">Voltar para login</Link></p>
            <p>Não tem conta? <Link className="login-link" to="/register">Cadastre-se</Link></p>
          </div>
        </div>

        <div className="login-footer">© 2024 PLATAFORMA DE EXCELÊNCIA EM ESTUDOS</div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
