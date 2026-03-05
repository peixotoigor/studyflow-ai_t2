import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/client';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const defaultToken = searchParams.get('token') || '';
  const [token, setToken] = useState(defaultToken);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

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
      let errorMessage = 'Não foi possível redefinir a senha agora.';
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
            <h1>Redefinir senha</h1>
            <p>Insira o token recebido por email e escolha uma nova senha.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="login-field">
              <span className="sr-only">Token</span>
              <input
                className="input-minimalist"
                type="text"
                placeholder="Token de recuperação"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                required
                disabled={loading}
              />
            </label>

            <label className="login-field">
              <span className="sr-only">Nova senha</span>
              <input
                className="input-minimalist"
                type="password"
                placeholder="Nova senha"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                disabled={loading}
              />
            </label>

            <label className="login-field">
              <span className="sr-only">Confirme a senha</span>
              <input
                className="input-minimalist"
                type="password"
                placeholder="Confirme a nova senha"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                disabled={loading}
              />
            </label>

            {message && <p className="login-status success">{message}</p>}
            {error && <p className="login-status error">{error}</p>}

            <button className="btn-glow" type="submit" disabled={loading}>
              {loading ? 'Redefinindo...' : 'Redefinir senha'}
            </button>
          </form>

          <div className="login-support">
            <p>Voltar para <Link className="login-link-strong" to="/login">login</Link></p>
            <p>Precisa de um novo token? <Link className="login-link" to="/forgot-password">Solicitar novamente</Link></p>
          </div>
        </div>

        <div className="login-footer">© 2024 PLATAFORMA DE EXCELÊNCIA EM ESTUDOS</div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
