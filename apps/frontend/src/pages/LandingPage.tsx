import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { SectionBadge } from '../components/marketing/SectionBadge';

const LandingPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [ctaEmail, setCtaEmail] = useState('');
  const shouldReduceMotion = useReducedMotion();
  const easeOut: [number, number, number, number] = [0.16, 1, 0.3, 1];
  const fadeInUp = shouldReduceMotion
    ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
    : {
        hidden: { opacity: 0, y: 28 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: easeOut } },
      };
  const stagger = shouldReduceMotion
    ? { hidden: {}, visible: {} }
    : {
        hidden: {},
        visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
      };
  const viewport = shouldReduceMotion ? undefined : { once: true, amount: 0.15, margin: '-60px' };

  const features = [
    {
      icon: 'school',
      title: 'Planejamento vivo',
      description: 'Organize metas, matérias e ritmo semanal em uma estrutura clara que evolui com sua rotina.',
    },
    {
      icon: 'frame_inspect',
      title: 'Execução guiada',
      description: 'Cada sessão mostra o próximo passo, reduz atrito de decisão e mantém o foco onde importa.',
    },
    {
      icon: 'analytics',
      title: 'Revisão orientada por dados',
      description: 'Erros, simulados e resumos ficam conectados para fechar o ciclo entre estudo e desempenho.',
    },
  ];

  const benefits = [
    'Estrutura visual clara para reduzir atrito de decisão',
    'Gradiente azul aplicado só onde a interface precisa chamar atenção',
    'Histórico, métricas e execução conectados em um único fluxo',
  ];

  const steps = [
    {
      title: 'Importe seu contexto',
      description: 'Monte a base do edital, assuntos e prioridades sem criar uma pilha dispersa de ferramentas.',
    },
    {
      title: 'Execute com previsibilidade',
      description: 'Use um fluxo contínuo que conecta planejamento, estudo ativo, anotações e revisão.',
    },
    {
      title: 'Ajuste com evidência',
      description: 'Acompanhe métricas, histórico e sinais de progresso para recalibrar o plano com precisão.',
    },
  ];

  const testimonials = [
    {
      quote: 'O StudyFlow tirou minha rotina do improviso e transformou cada sessão em execução objetiva.',
      author: 'Marina A.',
      role: 'Concurso fiscal',
    },
    {
      quote: 'A interface tem presença, mas não distrai. Tudo parece desenhado para eu continuar estudando.',
      author: 'Pedro R.',
      role: 'Carreira jurídica',
      featured: true,
    },
    {
      quote: 'Planejamento, revisão e simulado finalmente ficaram no mesmo sistema com clareza real.',
      author: 'Luiza M.',
      role: 'Área policial',
    },
  ];

  const pricing = [
    {
      name: 'Essencial',
      price: 'R$ 0',
      description: 'Para conhecer a estrutura e iniciar a organização da rotina.',
      features: ['Landing + cadastro no mesmo padrão visual', 'Fluxo inicial de acesso', 'Base para planejamento'],
      cta: 'Começar grátis',
      to: '/register',
    },
    {
      name: 'Progresso',
      price: 'R$ 29',
      description: 'Para quem precisa de constância, leitura rápida de progresso e execução guiada.',
      features: ['Ritmo de estudo centralizado', 'Anotações, simulados e revisão', 'Camada visual premium e viva'],
      cta: 'Entrar agora',
      to: token ? '/app' : '/login',
      featured: true,
    },
    {
      name: 'Intensivo',
      price: 'R$ 59',
      description: 'Para cenários de alta exigência com múltiplas frentes e recalibração constante.',
      features: ['Operação orientada por dados', 'Maior previsibilidade do plano', 'Execução com menos atrito'],
      cta: 'Falar com a equipe',
      to: '/register',
    },
  ];

  const faqs = [
    {
      question: 'O que muda entre a landing e o fluxo de acesso?',
      answer: 'Nada em termos de linguagem visual. A landing apresenta o produto e o login, cadastro e recuperação continuam a mesma direção estética, com o mesmo contraste, tipografia e ritmo de interação.',
    },
    {
      question: 'A proposta é só visual ou também funcional?',
      answer: 'As duas coisas. A estética organiza prioridade, reduz ruído e melhora leitura do próximo passo, mas o fluxo continua conectado à autenticação real da aplicação.',
    },
    {
      question: 'Esse estilo funciona em telas menores?',
      answer: 'Sim. A composição preserva os elementos de assinatura no desktop e simplifica a estrutura no mobile sem perder contraste, gradiente e hierarquia visual.',
    },
  ];

  const handleCtaSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedEmail = ctaEmail.trim().toLowerCase();
    const query = normalizedEmail ? `?email=${encodeURIComponent(normalizedEmail)}` : '';
    navigate(`/register${query}`);
  };

  return (
    <div className="landing-page">
      <div className="landing-glow landing-glow-left" />
      <div className="landing-glow landing-glow-right" />

      <header className="landing-header">
        <div className="landing-brand">
          <span className="landing-brand-mark">SF</span>
          <span className="landing-brand-text">StudyFlow AI</span>
        </div>

        <nav className="landing-nav" aria-label="Navegação principal">
          <a href="#beneficios">Benefícios</a>
          <a href="#fluxo">Fluxo</a>
          <a href="#faq">FAQ</a>
          <a href="#cta">Começar</a>
        </nav>

        <div className="landing-header-actions">
          <Link className="landing-header-link" to="/login">Login</Link>
          <Link className="landing-header-button" to={token ? '/app' : '/register'}>{token ? 'Abrir app' : 'Criar conta'}</Link>
        </div>
      </header>

      <main>
        <section className="landing-hero">
          <motion.div className="landing-hero-copy" initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeInUp}>
              <SectionBadge label="Minimalist Modern" />
            </motion.div>
            <motion.h1 className="landing-hero-title" variants={fadeInUp}>
              Estrutura para estudar, presença para sustentar <span className="landing-gradient-text">ritmo</span>.
            </motion.h1>
            <motion.p className="landing-hero-description" variants={fadeInUp}>
              Uma landing page pública desenhada com a mesma assinatura do arquivo de referência: tipografia memorável, contraste intencional, azul elétrico e movimento sutil para transformar clareza em percepção de valor.
            </motion.p>
            <motion.div className="landing-hero-actions" variants={fadeInUp}>
              <Link className="landing-primary-button" to="/login">Fazer login</Link>
              <Link className="landing-secondary-button" to="/register">Criar cadastro</Link>
            </motion.div>
            <motion.div className="landing-hero-stats" variants={stagger}>
              {[
                { value: '1 fluxo', label: 'do acesso à execução' },
                { value: '24/7', label: 'plataforma disponível' },
                { value: 'AA', label: 'contraste e foco visível' },
              ].map((item) => (
                <motion.div key={item.label} className="landing-stat-card" variants={fadeInUp}>
                  <span className="landing-stat-value">{item.value}</span>
                  <span className="landing-stat-label">{item.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div className="landing-hero-visual" initial="hidden" animate="visible" variants={fadeInUp}>
            <div className="landing-hero-panel">
              <div className="landing-hero-ring" />
              <div className="landing-hero-orb" />
              <div className="landing-hero-dots">
                {Array.from({ length: 9 }).map((_, index) => <span key={index} />)}
              </div>
              <div className="landing-floating landing-floating-primary">
                <SectionBadge label="Aprovação guiada" />
                <p>O próximo passo fica visível, o contexto fica organizado e o ritmo deixa de depender de improviso.</p>
              </div>
              <div className="landing-floating landing-floating-secondary">
                <span className="landing-trend-chip"><span className="material-symbols-outlined">north_east</span> progresso contínuo</span>
                <p>Interface viva, sofisticada e objetiva para estudar sem dispersão.</p>
              </div>
              <div className="landing-accent-block" />
            </div>
          </motion.div>
        </section>

        <motion.section className="landing-contrast-section" initial="hidden" whileInView="visible" viewport={viewport} variants={stagger}>
          <div className="landing-contrast-inner">
            <motion.div variants={fadeInUp}><SectionBadge label="Ritmo e impacto" /></motion.div>
            <motion.h2 className="landing-section-title" variants={fadeInUp}>Uma base pública forte e um acesso com a mesma <span className="landing-gradient-text">identidade</span> visual.</motion.h2>
            <motion.div className="landing-contrast-grid" variants={stagger}>
              {[
                { value: '01', label: 'Landing pública com CTA claro para login e cadastro' },
                { value: '02', label: 'Páginas de autenticação reconstruídas sem depender da interface antiga' },
                { value: '03', label: 'Mesmo DNA visual do arquivo update_front em todo o funil' },
                { value: '04', label: 'Motion sutil, badges, gradientes e contraste invertido' },
              ].map((item) => (
                <motion.div key={item.value} className="landing-contrast-card landing-hover-card" variants={fadeInUp}>
                  <span className="landing-contrast-value">{item.value}</span>
                  <p>{item.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        <motion.section className="landing-section" id="beneficios" initial="hidden" whileInView="visible" viewport={viewport} variants={stagger}>
          <motion.div variants={fadeInUp}><SectionBadge label="Benefícios" /></motion.div>
          <motion.h2 className="landing-section-title" variants={fadeInUp}>Minimalismo com pulso, sem cair no visual previsível de template.</motion.h2>
          <motion.div className="landing-feature-grid" variants={stagger}>
            {features.map((feature, index) => (
              <motion.article key={feature.title} className={`landing-feature-card landing-hover-card${index === 0 ? ' is-featured' : ''}`} variants={fadeInUp}>
                <span className="landing-feature-icon material-symbols-outlined">{feature.icon}</span>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.article>
            ))}
          </motion.div>
        </motion.section>

        <motion.section className="landing-section landing-benefits-section" initial="hidden" whileInView="visible" viewport={viewport} variants={stagger}>
          <div className="landing-benefits-grid">
            <motion.div className="landing-benefits-copy" variants={stagger}>
              <motion.div variants={fadeInUp}><SectionBadge label="Por que funciona" /></motion.div>
              <motion.h2 className="landing-section-title" variants={fadeInUp}>Clareza na estrutura, ousadia no detalhe e um visual que sustenta <span className="landing-gradient-text">presença</span> premium.</motion.h2>
              <motion.p className="landing-hero-description" variants={fadeInUp}>
                O documento de referência não pede apenas uma página limpa. Ele pede uma experiência contemporânea, com tipografia memorável, contraste ritmado, assimetria e uma sensação clara de produto premium.
              </motion.p>
              <motion.div className="landing-benefit-list" variants={stagger}>
                {benefits.map((benefit) => (
                  <motion.div key={benefit} className="landing-benefit-item" variants={fadeInUp}>
                    <span className="landing-benefit-icon material-symbols-outlined">check_circle</span>
                    <span>{benefit}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div className="landing-benefits-visual" variants={fadeInUp}>
              <div className="landing-benefits-visual-shell">
                <div className="landing-benefits-card landing-benefits-card-main">
                  <span className="landing-feature-icon material-symbols-outlined">acute</span>
                  <h3>Leitura rápida de prioridade</h3>
                  <p>Os elementos mais importantes ganham contraste, gradiente e elevação. O resto permanece limpo.</p>
                </div>
                <div className="landing-benefits-card landing-benefits-card-offset">
                  <span className="landing-trend-chip"><span className="material-symbols-outlined">north_east</span> foco visível</span>
                  <p>Motion e assimetria criam tensão visual sem sacrificar legibilidade.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        <motion.section className="landing-section" id="fluxo" initial="hidden" whileInView="visible" viewport={viewport} variants={stagger}>
          <motion.div variants={fadeInUp}><SectionBadge label="Como funciona" /></motion.div>
          <motion.h2 className="landing-section-title" variants={fadeInUp}>Do primeiro clique até a rotina de estudo, tudo obedece ao mesmo sistema visual.</motion.h2>
          <motion.div className="landing-steps-grid" variants={stagger}>
            {steps.map((step, index) => (
              <motion.article key={step.title} className="landing-step-card landing-hover-card" variants={fadeInUp}>
                <div className="landing-step-topline">
                  <span className="landing-step-number">0{index + 1}</span>
                  {index < steps.length - 1 ? <span className="landing-step-connector"><span className="material-symbols-outlined">east</span></span> : null}
                </div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </motion.article>
            ))}
          </motion.div>
        </motion.section>

        <motion.section className="landing-section landing-testimonials-section" initial="hidden" whileInView="visible" viewport={viewport} variants={stagger}>
          <motion.div variants={fadeInUp}><SectionBadge label="Prova social" /></motion.div>
          <motion.h2 className="landing-section-title" variants={fadeInUp}>Minimalismo com pulso também precisa soar <span className="landing-gradient-text">memorável</span>.</motion.h2>
          <motion.div className="landing-testimonials-grid" variants={stagger}>
            {testimonials.map((item) => (
              <motion.article key={item.author} className={`landing-testimonial-card landing-hover-card${item.featured ? ' is-featured' : ''}`} variants={fadeInUp}>
                <div className="landing-testimonial-quote-mark">“</div>
                <p>{item.quote}</p>
                <div className="landing-testimonial-meta">
                  <strong>{item.author}</strong>
                  <span>{item.role}</span>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </motion.section>

        <motion.section className="landing-section landing-pricing-section" initial="hidden" whileInView="visible" viewport={viewport} variants={stagger}>
          <motion.div variants={fadeInUp}><SectionBadge label="Planos" /></motion.div>
          <motion.h2 className="landing-section-title" variants={fadeInUp}>Camadas de entrada desenhadas com o mesmo critério visual da plataforma.</motion.h2>
          <motion.div className="landing-pricing-grid" variants={stagger}>
            {pricing.map((plan) => (
              <motion.article key={plan.name} className={`landing-pricing-card landing-hover-card${plan.featured ? ' is-featured' : ''}`} variants={fadeInUp}>
                <div>
                  <h3>{plan.name}</h3>
                  <p className="landing-pricing-price">{plan.price}<span>/mês</span></p>
                  <p className="landing-pricing-copy">{plan.description}</p>
                </div>
                <div className="landing-pricing-features">
                  {plan.features.map((feature) => (
                    <div key={feature} className="landing-pricing-feature">
                      <span className="material-symbols-outlined">done</span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <Link className={plan.featured ? 'landing-primary-button' : 'landing-secondary-button'} to={plan.to}>{plan.cta}</Link>
              </motion.article>
            ))}
          </motion.div>
        </motion.section>

        <motion.section className="landing-section landing-faq-section" id="faq" initial="hidden" whileInView="visible" viewport={viewport} variants={stagger}>
          <motion.div variants={fadeInUp}><SectionBadge label="FAQ" /></motion.div>
          <motion.h2 className="landing-section-title" variants={fadeInUp}>Perguntas frequentes com a mesma estrutura <span className="landing-gradient-text">refinada</span>.</motion.h2>
          <motion.div className="landing-faq-grid" variants={stagger}>
            {faqs.map((item) => (
              <motion.details key={item.question} className="landing-faq-card landing-hover-card" variants={fadeInUp}>
                <summary>
                  <span>{item.question}</span>
                  <span className="material-symbols-outlined">add</span>
                </summary>
                <p>{item.answer}</p>
              </motion.details>
            ))}
          </motion.div>
        </motion.section>

        <motion.section className="landing-final-cta" id="cta" initial="hidden" whileInView="visible" viewport={viewport} variants={stagger}>
          <div className="landing-final-cta-card">
            <motion.div variants={fadeInUp}><SectionBadge label="Começar agora" /></motion.div>
            <motion.h2 className="landing-section-title" variants={fadeInUp}>Uma landing page realmente alinhada ao spec precisa terminar com um fechamento <span className="landing-gradient-text">forte</span>.</motion.h2>
            <motion.p className="landing-final-copy" variants={fadeInUp}>Insira seu e-mail para começar o cadastro no mesmo fluxo visual. Se preferir, também é possível entrar ou recuperar o acesso sem quebrar a coerência da experiência.</motion.p>
            <form className="landing-cta-form" onSubmit={handleCtaSubmit}>
              <label className="sr-only" htmlFor="landing-cta-email">E-mail para começar o cadastro</label>
              <input
                id="landing-cta-email"
                className="landing-cta-input"
                type="email"
                value={ctaEmail}
                onChange={(event) => setCtaEmail(event.target.value)}
                placeholder="voce@exemplo.com"
                inputMode="email"
                autoComplete="email"
              />
              <button className="landing-primary-button landing-cta-button" type="submit">Começar cadastro</button>
            </form>
            <motion.div className="landing-hero-actions" variants={fadeInUp}>
              <Link className="landing-primary-button" to="/login">Entrar</Link>
              <Link className="landing-secondary-button" to="/forgot-password">Recuperar senha</Link>
            </motion.div>
          </div>
        </motion.section>
      </main>
    </div>
  );
};

export default LandingPage;