import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { UserSummary } from '@shared/types/domain.js';
import { supabase } from '../lib/supabase';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [typingPassword, setTypingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [iconHover, setIconHover] = useState(false);
  const [ctaHover, setCtaHover] = useState(false);

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
      const { data, error: supeError } = await supabase.auth.signUp({
        email,
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

      setTimeout(() => {
        navigate('/', { replace: true });
      }, 300);
    } catch (err: any) {
      console.error(err);
      let errorMessage = 'Falha ao cadastrar';
      if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 md:p-10 relative" style={{ background: 'radial-gradient(circle at center, #f8fafc 0%, #e2e8f0 100%)', overflow: 'hidden' }}>
      <div className="liquid-bg-container" style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden' }}>
        <div className="liquid-shape w-[620px] h-[620px] bg-indigo-200 top-[-14%] left-[-10%]" style={{ position: 'absolute', filter: 'blur(80px)', opacity: 0.6, animation: 'fluid-motion 25s infinite ease-in-out' }}></div>
        <div className="liquid-shape w-[520px] h-[520px] bg-slate-300 bottom-[6%] right-[-9%]" style={{ position: 'absolute', filter: 'blur(80px)', opacity: 0.6, animation: 'fluid-motion 25s infinite ease-in-out', animationDelay: '-7s' }}></div>
        <div className="liquid-shape w-[480px] h-[480px] bg-purple-200 top-[14%] right-[6%]" style={{ position: 'absolute', filter: 'blur(80px)', opacity: 0.6, animation: 'fluid-motion 25s infinite ease-in-out', animationDelay: '-12s' }}></div>
        <div className="liquid-shape w-[620px] h-[620px] bg-blue-100 bottom-[-18%] left-[14%]" style={{ position: 'absolute', filter: 'blur(80px)', opacity: 0.6, animation: 'fluid-motion 25s infinite ease-in-out', animationDelay: '-18s' }}></div>
      </div>

      <div className="z-10 w-full flex flex-col items-center">
        <div className="liquid-glass-card flex flex-col md:flex-row overflow-hidden" style={{ background: 'linear-gradient(140deg, rgba(255,255,255,0.30), rgba(255,255,255,0.18))', backdropFilter: 'blur(26px) saturate(180%)', WebkitBackdropFilter: 'blur(26px) saturate(180%)', border: '1px solid rgba(255,255,255,0.38)', borderRadius: '4rem', boxShadow: '0 28px 70px -24px rgba(15,23,42,0.25), inset 0 1px 0 rgba(255,255,255,0.55), inset 0 -1px 18px rgba(255,255,255,0.18)', maxWidth: '900px', width: '100%' }}>
          <div className="md:w-[45%] p-12 flex flex-col justify-center gap-8 items-center text-center">
            <div className="flex flex-col items-center w-full">
              <div
                className={`w-20 h-20 liquid-btn rounded-3xl flex items-center justify-center mb-5 text-white group cursor-default ${typingPassword && password ? 'animate-pulse' : ''}`}
                style={{
                  background: 'linear-gradient(90deg, #6366f1, #818cf8, #4f46e5, #6366f1)',
                  backgroundSize: '300% 100%',
                  backgroundPosition: iconHover ? '100% 50%' : '0% 50%',
                  transition: 'background-position 0.8s ease, transform 0.3s ease, box-shadow 0.3s ease',
                  boxShadow: iconHover
                    ? '0 16px 30px -10px rgba(79, 70, 229, 0.45), inset 0 -3px 8px rgba(0,0,0,0.18), inset 0 2px 8px rgba(255,255,255,0.35)'
                    : '0 12px 20px -6px rgba(79, 70, 229, 0.35), inset 0 -3px 6px rgba(0, 0, 0, 0.15), inset 0 2px 6px rgba(255, 255, 255, 0.3)',
                  transform: iconHover ? 'translateY(-2px) scale(1.02)' : 'none'
                }}
                onMouseEnter={() => setIconHover(true)}
                onMouseLeave={() => setIconHover(false)}
              >
                <span className="material-symbols-outlined text-[44px] font-light">auto_awesome</span>
              </div>
              <h2 className="text-slate-800 text-sm font-bold tracking-[0.38em] uppercase opacity-70 mb-1">Nova jornada</h2>
              <p className="text-slate-500 text-sm font-light tracking-wide max-w-[220px]">Faça seu onboarding em segundos.</p>
            </div>

            <div className="w-full flex justify-center">
              <p className="text-slate-500 text-sm font-light m-0 text-center">
                Já possui uma conta? <Link className="text-slate-900 font-bold hover:text-emerald-600 transition-colors underline decoration-emerald-200 underline-offset-4" to="/login">Entrar</Link>
              </p>
            </div>
          </div>

          <div className="hidden md:block divider-glass self-stretch my-16" style={{ width: '1px', background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.4), transparent)' }}></div>

          <div className="md:w-[55%] p-12 md:p-14 flex flex-col justify-center">
            <div className="mb-8">
              <h1 className="text-slate-900 text-3xl font-bold tracking-tight mb-2">Crie sua conta</h1>
              <p className="text-slate-600 text-sm font-light">Organize seus estudos com um fluxo claro e personalizado.</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">person</span>
                <input
                  className="liquid-input w-full h-15 md:h-16 pl-14 pr-8 rounded-[2rem] text-slate-700 placeholder:text-slate-400 placeholder:font-light"
                  placeholder="Seu nome completo"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="relative group">
                <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">mail</span>
                <input
                  className="liquid-input w-full h-15 md:h-16 pl-14 pr-8 rounded-[2rem] text-slate-700 placeholder:text-slate-400 placeholder:font-light"
                  placeholder="Seu e-mail de estudante"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="relative group">
                <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">lock</span>
                <input
                  className="liquid-input w-full h-15 md:h-16 pl-14 pr-12 rounded-[2rem] text-slate-700 placeholder:text-slate-400 placeholder:font-light transition-all duration-200"
                  placeholder="Crie uma senha segura"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setTypingPassword(true);
                  }}
                  onFocus={() => setTypingPassword(true)}
                  onBlur={() => setTypingPassword(false)}
                  required
                  disabled={loading}
                  style={{ boxShadow: typingPassword && password ? '0 0 0 2px rgba(34,197,94,0.18)' : 'none' }}
                />

                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-600 transition-colors p-1 rounded-full bg-white/60 backdrop-blur"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  <span className="material-symbols-outlined text-base align-middle">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>

                {(typingPassword || password) && !isPasswordStrong && (
                  <div className="absolute left-0 right-0 top-full mt-2 z-30" style={{ pointerEvents: 'none' }}>
                    <div className="mx-auto max-w-full md:max-w-[520px] flex flex-wrap items-center gap-2.5 text-[11px] rounded-2xl px-4 py-3 shadow-lg" style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(18px) saturate(140%)', border: '1px solid rgba(148, 163, 184, 0.35)' }}>
                      {passwordChecks.map((rule) => (
                        <span key={rule.label} className="flex items-center gap-2" style={{ color: rule.pass ? '#22c55e' : '#94a3b8' }}>
                          <span style={{ width: '12px', height: '12px', borderRadius: '6px', border: `1px solid ${rule.pass ? '#22c55e' : '#475569'}`, background: rule.pass ? 'rgba(34,197,94,0.18)' : 'transparent' }}></span>
                          {rule.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative group">
                <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">verified_user</span>
                <input
                  className="liquid-input w-full h-15 md:h-16 pl-14 pr-12 rounded-[2rem] text-slate-700 placeholder:text-slate-400 placeholder:font-light"
                  placeholder="Confirme sua senha"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  disabled={loading}
                />

                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-600 transition-colors p-1 rounded-full bg-white/60 backdrop-blur"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={showConfirmPassword ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'}
                >
                  <span className="material-symbols-outlined text-base align-middle">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>

              {confirmPassword && !passwordsMatch && (
                <p className="text-red-500 text-xs px-2">As senhas precisam coincidir.</p>
              )}

              {error && <p className="text-red-500 text-sm px-2">{error}</p>}

              {!loading && isSubmitDisabled && (
                <p className="text-slate-500 text-xs text-center px-2">Para ativar o botão, preencha: {missingRequirements.join(', ')}.</p>
              )}

              <div className="pt-2 flex items-center justify-center">
                <button
                  className="liquid-btn h-16 px-8 text-white font-bold text-lg rounded-[2rem] transition-all duration-300 active:scale-[0.98]"
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
                  {loading ? 'Enviando...' : 'Cadastrar agora'}
                </button>
              </div>
            </form>
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

export default RegisterPage;
