import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import HeroGraphic from '../components/marketing/HeroGraphic';
import { SectionBadge } from '../components/marketing/SectionBadge';

const LandingPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [ctaEmail, setCtaEmail] = useState('');
  const [activeSection, setActiveSection] = useState('beneficios');
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
      badge: 'Rotina estabilizada',
      quote: 'Em poucas semanas eu parei de negociar comigo mesma antes de estudar. Entro, vejo o próximo bloco e executo.',
      author: 'Marina A.',
      role: 'Concurso fiscal',
      outcome: 'menos dispersão, mais constância semanal',
    },
    {
      badge: 'Mais convertida',
      quote: 'Foi a primeira vez que senti uma plataforma puxando minha rotina para frente em vez de me entregar mais uma tela para administrar.',
      author: 'Pedro R.',
      role: 'Carreira jurídica',
      outcome: 'retorno diário com menos atrito de decisão',
      featured: true,
    },
    {
      badge: 'Ciclo fechado',
      quote: 'Planejamento, revisão e simulado finalmente passaram a conversar. O estudo deixou de parecer fragmentado.',
      author: 'Luiza M.',
      role: 'Área policial',
      outcome: 'mais previsibilidade para corrigir rota',
    },
  ];

  const pricing = [
    {
      name: 'Essencial',
      badge: 'Entrada imediata',
      price: 'R$ 0',
      description: 'Para sair do improviso hoje e validar a lógica do fluxo antes de elevar o ritmo.',
      features: ['Cadastro rápido com continuidade visual', 'Base inicial para organizar matérias e prioridades', 'Primeiro fluxo de acesso pronto para uso'],
      cta: 'Começar hoje',
      note: 'Ideal para testar aderência com risco zero.',
      to: '/register',
    },
    {
      name: 'Progresso',
      badge: 'Mais escolhido',
      price: 'R$ 29',
      description: 'Para quem quer constância real, retorno diário mais fácil e um sistema que empurra a rotina para frente.',
      features: ['Execução guiada com menos atrito de decisão', 'Anotações, simulados e revisão no mesmo ciclo', 'Leitura rápida de progresso para manter cadência'],
      cta: token ? 'Abrir agora' : 'Assinar e entrar',
      note: 'O melhor ponto entre velocidade de entrada e profundidade de uso.',
      to: token ? '/app' : '/login',
      featured: true,
    },
    {
      name: 'Intensivo',
      badge: 'Operação máxima',
      price: 'R$ 59',
      description: 'Para cenários de pressão alta, múltiplas frentes e ajustes frequentes sem perder a visão do todo.',
      features: ['Operação orientada por evidência e histórico', 'Mais previsibilidade para recalibrar o plano', 'Ambiente preparado para rotina intensa e contínua'],
      cta: 'Quero esse nível',
      note: 'Pensado para quem já sabe que não pode depender de improviso.',
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

  const normalizedEmail = ctaEmail.trim().toLowerCase();
  const ctaPrimaryLabel = token ? 'Abrir meu app' : normalizedEmail ? 'Continuar cadastro' : 'Começar cadastro';
  const ctaHelper = token
    ? 'Sua sessão já está ativa. Use o CTA principal para voltar direto ao workspace.'
    : normalizedEmail
      ? `Vamos abrir o cadastro com ${normalizedEmail} já preenchido para reduzir atrito na entrada.`
      : 'Digite seu e-mail para acelerar o cadastro ou use um dos atalhos rápidos abaixo.';

  const handleCtaSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (token) {
      navigate('/app');
      return;
    }

    const query = normalizedEmail ? `?email=${encodeURIComponent(normalizedEmail)}` : '';
    navigate(`/register${query}`);
  };

  useEffect(() => {
    const sectionIds = ['beneficios', 'fluxo', 'faq', 'cta'];
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));

    if (!sections.length) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio);

        if (visibleEntries.length > 0) {
          setActiveSection(visibleEntries[0].target.id);
        }
      },
      {
        rootMargin: '-20% 0px -55% 0px',
        threshold: [0.2, 0.35, 0.5, 0.7],
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing-page">
      <div className="landing-glow landing-glow-left" />
      <div className="landing-glow landing-glow-right" />

      <header className="landing-header">
        <div className="landing-brand landing-brand-interactive">
          <span className="landing-brand-mark">SF</span>
          <span className="landing-brand-text">StudyFlow AI</span>
        </div>

        <nav className="landing-nav" aria-label="Navegação principal">
          <a className={activeSection === 'beneficios' ? 'is-active' : ''} href="#beneficios">Benefícios</a>
          <a className={activeSection === 'fluxo' ? 'is-active' : ''} href="#fluxo">Fluxo</a>
          <a className={activeSection === 'faq' ? 'is-active' : ''} href="#faq">FAQ</a>
          <a className={activeSection === 'cta' ? 'is-active' : ''} href="#cta">Começar</a>
        </nav>

        <div className="landing-header-actions">
          <Link className="landing-header-link" to="/login">Login</Link>
          <Link className="landing-header-button" to={token ? '/app' : '/register'}>
            <span>{token ? 'Abrir app' : 'Criar conta'}</span>
            <span className="material-symbols-outlined">arrow_outward</span>
          </Link>
        </div>
      </header>

      <main>
        <section className="landing-hero">
          <motion.div className="landing-hero-copy" initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeInUp}>
              <SectionBadge label="Minimalist Modern" />
            </motion.div>
            <motion.h1 className="landing-hero-title" variants={fadeInUp}>
              Pare de perder energia decidindo o que estudar e entre num fluxo que sustenta <span className="landing-gradient-text">constância</span>.
            </motion.h1>
            <motion.p className="landing-hero-description" variants={fadeInUp}>
              O StudyFlow AI organiza prioridade, mostra o próximo passo e reduz o atrito entre intenção e execução. Você entra, entende o foco do momento e continua estudando sem negociar com o caos da rotina.
            </motion.p>
          </motion.div>

          <HeroGraphic />
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
                <span className="landing-card-kicker">{item.badge}</span>
                <div className="landing-testimonial-quote-mark">“</div>
                <p>{item.quote}</p>
                <div className="landing-testimonial-meta">
                  <strong>{item.author}</strong>
                  <span>{item.role}</span>
                  <span className="landing-testimonial-outcome">{item.outcome}</span>
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
                  <span className="landing-card-kicker">{plan.badge}</span>
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
                <p className="landing-pricing-note">{plan.note}</p>
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
            <motion.p className="landing-final-copy" variants={fadeInUp}>Insira seu e-mail para continuar no fluxo principal com menos atrito. Se o seu objetivo for apenas entrar ou recuperar acesso, os atalhos continuam no mesmo sistema visual.</motion.p>
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
                disabled={Boolean(token)}
              />
              <button className="landing-primary-button landing-cta-button" type="submit">{ctaPrimaryLabel}</button>
            </form>
            <motion.p className="landing-cta-helper" variants={fadeInUp}><strong>Próximo passo:</strong> {ctaHelper}</motion.p>
            <motion.div className="landing-cta-quick-actions" variants={fadeInUp}>
              <Link className="landing-cta-chip" to={token ? '/app' : '/login'}>
                <span className="material-symbols-outlined">login</span>
                <span>{token ? 'Ir para o app' : 'Já tenho conta'}</span>
              </Link>
              <Link className="landing-cta-chip" to="/register">
                <span className="material-symbols-outlined">person_add</span>
                <span>Criar conta do zero</span>
              </Link>
              <Link className="landing-cta-chip" to="/forgot-password">
                <span className="material-symbols-outlined">lock_reset</span>
                <span>Recuperar acesso</span>
              </Link>
            </motion.div>
            <motion.div className="landing-hero-actions" variants={fadeInUp}>
              <Link className="landing-primary-button" to="/login">Entrar</Link>
              <Link className="landing-secondary-button" to="/forgot-password">Recuperar senha</Link>
            </motion.div>
          </div>
        </motion.section>
      </main>

      <footer className="landing-footer">
        <div className="landing-footer-brand">
          <span className="landing-footer-mark">SF</span>
          <span className="landing-footer-name">StudyFlow AI</span>
        </div>
        <span className="landing-footer-copy">&copy; {new Date().getFullYear()} StudyFlow AI. Todos os direitos reservados.</span>
        <nav className="landing-footer-links" aria-label="Links do rodapé">
          <Link to="/login">Login</Link>
          <Link to="/register">Cadastro</Link>
          <Link to="/forgot-password">Recuperar senha</Link>
        </nav>
      </footer>
    </div>
  );
};

export default LandingPage;