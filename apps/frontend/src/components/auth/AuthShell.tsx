import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

type AuthMetric = {
  value: string;
  label: string;
};

interface AuthShellProps {
  compact?: boolean;
  heroActions?: React.ReactNode;
  panelEyebrow: string;
  panelTitle: React.ReactNode;
  panelDescription: string;
  heroEyebrow: string;
  heroTitle: React.ReactNode;
  heroDescription: string;
  heroQuote: string;
  heroQuoteLabel?: string;
  metrics: AuthMetric[];
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const AuthShell: React.FC<AuthShellProps> = ({
  compact = false,
  heroActions,
  panelEyebrow,
  panelTitle,
  panelDescription,
  heroEyebrow,
  heroTitle,
  heroDescription,
  heroQuote,
  heroQuoteLabel = 'Insight do dia',
  metrics,
  children,
  footer,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const easeOut: [number, number, number, number] = [0.16, 1, 0.3, 1];
  const fadeInUp = shouldReduceMotion
    ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
    : {
        hidden: { opacity: 0, y: 28 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: easeOut } },
      };
  const fadeIn = shouldReduceMotion
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.7, ease: easeOut } },
      };
  const stagger = shouldReduceMotion
    ? { hidden: {}, visible: {} }
    : {
        hidden: {},
        visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
      };

  return (
    <div className="auth-page">
      <div className="auth-glow auth-glow-one" />
      <div className="auth-glow auth-glow-two" />

      <div className="auth-shell">
        <div className={`auth-frame${compact ? ' auth-frame-compact' : ''}`}>
          <motion.section
            className="auth-hero"
            aria-label="Resumo visual da plataforma"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <div className="auth-chip">
              <span className="auth-chip-icon material-symbols-outlined">bolt</span>
              Estudo orientado por dados
            </div>

            <motion.div className="auth-hero-copy" variants={stagger} initial="hidden" animate="visible">
              <motion.div className="auth-eyebrow" variants={fadeInUp}>
                <span className="auth-eyebrow-dot" />
                {heroEyebrow}
              </motion.div>

              <div className="auth-spacer auth-spacer-lg" />
              <motion.div className="auth-title-block" variants={fadeInUp}>
                <h1 className="auth-display-title">{heroTitle}</h1>
                <span className="auth-gradient-underline" aria-hidden="true" />
              </motion.div>
              <div className="auth-spacer auth-spacer-md" />
              <motion.p className="auth-lead" variants={fadeInUp}>{heroDescription}</motion.p>

              {heroActions ? <motion.div className="auth-hero-actions" variants={fadeInUp}>{heroActions}</motion.div> : null}

              <motion.div className="auth-metric-grid" variants={stagger}>
                {metrics.map((metric) => (
                  <motion.div key={metric.label} className="auth-metric-card" variants={fadeInUp}>
                    <span className="auth-metric-value">{metric.value}</span>
                    <span className="auth-metric-label">{metric.label}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <div className="auth-hero-visual" aria-hidden="true">
              <div className="auth-hero-ring" />
              <div className="auth-hero-orbit" />
              <div className="auth-hero-corner-block" />
              <div className="auth-hero-quote-mark">“</div>
              <div className="auth-hero-dot-grid">
                {Array.from({ length: 9 }).map((_, index) => (
                  <span key={index} />
                ))}
              </div>

              <div className="auth-floating-card auth-floating-card-primary">
                <div className="auth-eyebrow">
                  <span className="auth-eyebrow-dot" />
                  {heroQuoteLabel}
                </div>
                <div className="auth-spacer auth-spacer-md" />
                <p className="auth-lead">{heroQuote}</p>
              </div>

              <div className="auth-floating-card auth-floating-card-secondary">
                <div className="auth-chip">
                  <span className="material-symbols-outlined">trending_up</span>
                  Ritmo consistente
                </div>
                <div className="auth-spacer auth-spacer-sm" />
                <p className="auth-lead">Planejamento, execução e revisão conectados em um único fluxo.</p>
              </div>
            </div>
          </motion.section>

          <motion.section
            className="auth-panel"
            aria-label="Acesso à conta"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <div className="auth-panel-body">
              <header className="auth-header">
                <div className="auth-eyebrow">
                  <span className="auth-eyebrow-dot" />
                  {panelEyebrow}
                </div>
                <div className="auth-title-block auth-title-block-panel">
                  <h2 className="auth-panel-title">{panelTitle}</h2>
                  <span className="auth-gradient-underline auth-gradient-underline-panel" aria-hidden="true" />
                </div>
                <p className="auth-copy">{panelDescription}</p>
              </header>

              {children}

              {footer ? <footer className="auth-footer-links">{footer}</footer> : null}
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
};