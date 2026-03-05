import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { UserSummary } from '@shared/types/domain.js';
import { supabase } from '../lib/supabase';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [iconHover, setIconHover] = useState(false);
  const [ctaHover, setCtaHover] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: supeError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (supeError) {
        throw supeError;
      }

      const accessToken = data.session?.access_token;
      if (!accessToken) {
        throw new Error('Sessão não retornada pelo Supabase');
      }

      // Buscar perfil do backend e atualizar AuthContext antes de navegar
      localStorage.setItem('studyflow_token', accessToken);
      const meResponse = await api.get('/auth/me');
      login(accessToken, meResponse.data.user, rememberMe);
      queryClient.clear();
      navigate('/', { replace: true });
    } catch (err: any) {
      console.error(err);
      let errorMessage = 'Falha ao entrar';
      if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center p-8 relative" style={{ background: 'radial-gradient(circle at center, #f8fafc 0%, #e2e8f0 100%)', overflow: 'hidden' }}>
      <div className="liquid-bg-container" style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden' }}>
        <div className="liquid-shape w-[700px] h-[700px] bg-indigo-200 top-[-15%] left-[-10%]" style={{ position: 'absolute', filter: 'blur(80px)', opacity: 0.6, animation: 'fluid-motion 25s infinite ease-in-out' }}></div>
        <div className="liquid-shape w-[600px] h-[600px] bg-slate-300 bottom-[5%] right-[-10%]" style={{ position: 'absolute', filter: 'blur(80px)', opacity: 0.6, animation: 'fluid-motion 25s infinite ease-in-out', animationDelay: '-7s' }}></div>
        <div className="liquid-shape w-[500px] h-[500px] bg-purple-200 top-[15%] right-[5%]" style={{ position: 'absolute', filter: 'blur(80px)', opacity: 0.6, animation: 'fluid-motion 25s infinite ease-in-out', animationDelay: '-12s' }}></div>
        <div className="liquid-shape w-[650px] h-[650px] bg-blue-100 bottom-[-20%] left-[15%]" style={{ position: 'absolute', filter: 'blur(80px)', opacity: 0.6, animation: 'fluid-motion 25s infinite ease-in-out', animationDelay: '-18s' }}></div>
      </div>

      <div className="z-10 w-full flex flex-col items-center">
        <div className="liquid-glass-card flex flex-col md:flex-row overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.35), rgba(255, 255, 255, 0.15))', backdropFilter: 'blur(30px) saturate(180%)', WebkitBackdropFilter: 'blur(30px) saturate(180%)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '4rem', boxShadow: '0 40px 80px -20px rgba(0, 0, 0, 0.1), inset 0 1px 1px rgba(255,255,255,0.6), 0 0 30px rgba(255,255,255,0.4)', maxWidth: '1000px', width: '100%' }}>
          <div className="md:w-[45%] p-12 flex flex-col justify-between items-center text-center">
            <div className="flex flex-col items-center w-full">
              <div
                className="w-20 h-20 liquid-btn rounded-3xl flex items-center justify-center mb-6 text-white group cursor-default"
                style={{
                  background: 'linear-gradient(90deg, #6366f1, #818cf8, #4f46e5, #6366f1)',
                  backgroundSize: '300% 100%',
                  backgroundPosition: iconHover ? '100% 50%' : '0% 50%',
                  transition: 'background-position 0.8s ease, transform 0.3s ease, box-shadow 0.3s ease',
                  boxShadow: iconHover
                    ? '0 16px 32px -10px rgba(79, 70, 229, 0.45), inset 0 -4px 10px rgba(0, 0, 0, 0.18), inset 0 2px 10px rgba(255, 255, 255, 0.35)'
                    : '0 12px 24px -6px rgba(79, 70, 229, 0.4), inset 0 -4px 8px rgba(0, 0, 0, 0.15), inset 0 2px 8px rgba(255, 255, 255, 0.3)',
                  transform: iconHover ? 'translateY(-2px) scale(1.02)' : 'none'
                }}
                onMouseEnter={() => setIconHover(true)}
                onMouseLeave={() => setIconHover(false)}
              >
                <span className="material-symbols-outlined text-[44px] font-light">school</span>
              </div>
              <h2 className="text-slate-800 text-sm font-bold tracking-[0.4em] uppercase opacity-70 mb-2">Mente Preparada</h2>
              <p className="text-slate-500 text-sm font-light tracking-wide max-w-[200px]">Potencializando sua jornada de aprovação.</p>
            </div>
            <div className="w-full mt-12 insight-container p-8 flex flex-col items-center" style={{ background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '2rem' }}>
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-[20px] text-indigo-500">auto_awesome</span>
                <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-indigo-600/70">Daily Insight</span>
              </div>
              <blockquote className="text-slate-800 text-sm leading-relaxed italic font-medium">{`"${todayInsight}"`}</blockquote>
            </div>
          </div>

          <div className="hidden md:block divider-glass self-stretch my-16" style={{ width: '1px', background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.4), transparent)' }}></div>

          <div className="md:w-[55%] p-12 md:p-16 flex flex-col justify-center">
            <div className="mb-10">
              <h1 className="text-slate-900 text-3xl font-bold tracking-tight mb-3">Bem-vindo</h1>
              <p className="text-slate-600 text-base font-light">Identifique-se para acessar seu painel de estudos.</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">mail</span>
                <input
                  className="liquid-input w-full h-16 pl-14 pr-8 rounded-[2rem] text-slate-700 placeholder:text-slate-400 placeholder:font-light"
                  placeholder="E-mail de acesso"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="relative group">
                <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">lock</span>
                <input
                  className="liquid-input w-full h-16 pl-14 pr-8 rounded-[2rem] text-slate-700 placeholder:text-slate-400 placeholder:font-light"
                  placeholder="Sua senha"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {error && <p className="login-error text-red-500 text-sm px-2">{error}</p>}

              <div className="flex justify-between items-center px-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    className="rounded-full border-slate-300 text-indigo-600 focus:ring-indigo-500 bg-white/50 w-4 h-4"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                  />
                  <span className="text-slate-500 text-sm">Lembrar-me</span>
                </label>
                <Link className="text-indigo-600 text-sm font-medium hover:text-indigo-800 transition-colors" to="/forgot-password">Esqueceu a senha?</Link>
              </div>

              <div className="pt-4">
                <button
                  className="liquid-btn w-full h-16 text-white font-bold text-lg rounded-[2rem] transition-all duration-300 active:scale-[0.98]"
                  type="submit"
                  disabled={loading}
                  style={{
                    position: 'relative',
                    background: 'linear-gradient(90deg, #6366f1, #818cf8, #4f46e5, #6366f1)',
                    backgroundSize: '300% 100%',
                    backgroundPosition: ctaHover && !loading ? '100% 50%' : '0% 50%',
                    transition: 'background-position 0.8s ease, transform 0.3s ease, box-shadow 0.3s ease, filter 0.3s ease',
                    boxShadow: ctaHover && !loading
                      ? '0 18px 34px -10px rgba(79, 70, 229, 0.45), inset 0 -4px 10px rgba(0,0,0,0.18), inset 0 2px 10px rgba(255,255,255,0.35)'
                      : '0 12px 24px -8px rgba(79, 70, 229, 0.38), inset 0 -3px 8px rgba(0, 0, 0, 0.16), inset 0 2px 8px rgba(255, 255, 255, 0.3)',
                    transform: ctaHover && !loading ? 'translateY(-2px) scale(1.01)' : 'none',
                    filter: ctaHover && !loading ? 'saturate(120%) brightness(1.03)' : 'none'
                  }}
                  onMouseEnter={() => !loading && setCtaHover(true)}
                  onMouseLeave={() => setCtaHover(false)}
                  onFocus={() => !loading && setCtaHover(true)}
                  onBlur={() => setCtaHover(false)}
                >
                  {loading ? 'Entrando...' : 'Entrar na plataforma'}
                </button>
              </div>
            </form>

            <div className="mt-10 text-center">
              <p className="text-slate-500 text-sm font-light">
                Não possui uma conta? <Link className="text-slate-900 font-bold hover:text-indigo-600 transition-colors underline decoration-indigo-200 underline-offset-4" to="/register">Crie sua conta agora</Link>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-slate-400 text-[11px] font-bold tracking-[0.3em] uppercase">
            © 2024 PLATAFORMA DE EXCELÊNCIA • TECNOLOGIA PARA ESTUDOS
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
