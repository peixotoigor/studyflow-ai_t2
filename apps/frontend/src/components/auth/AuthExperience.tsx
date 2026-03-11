import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';

type AuthMetric = {
  value: string;
  label: string;
};

interface AuthExperienceProps {
  eyebrow: string;
  title: React.ReactNode;
  description: string;
  heroEyebrow: string;
  heroTitle: React.ReactNode;
  heroDescription: string;
  heroQuote: string;
  heroQuoteLabel: string;
  metrics: AuthMetric[];
  primaryAction: {
    label: string;
    to: string;
  };
  secondaryAction: {
    label: string;
    to: string;
  };
  footer: React.ReactNode;
  children: React.ReactNode;
}

export const AuthExperience: React.FC<AuthExperienceProps> = ({
  eyebrow,
  title,
  description,
  heroEyebrow,
  heroTitle,
  heroDescription,
  heroQuote,
  heroQuoteLabel,
  metrics,
  primaryAction,
  secondaryAction,
  footer,
  children,
}) => {
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

  return (
    <div className="credential-page">
      <div className="credential-glow credential-glow-left" />
      <div className="credential-glow credential-glow-right" />

      <div className="credential-shell">
        <div className="credential-frame">
          <motion.section className="credential-hero" initial="hidden" animate="visible" variants={stagger}>
            <motion.div className="credential-chip" variants={fadeInUp}>
              <span className="credential-chip-icon material-symbols-outlined">auto_awesome</span>
              StudyFlow AI
            </motion.div>

            <div className="credential-hero-main">
              <motion.div className="credential-badge" variants={fadeInUp}>
                <span className="credential-badge-dot" />
                <span>{heroEyebrow}</span>
              </motion.div>

              <motion.div className="credential-title-wrap" variants={fadeInUp}>
                <h1 className="credential-hero-title">{heroTitle}</h1>
                <span className="credential-title-underline" aria-hidden="true" />
              </motion.div>

              <motion.p className="credential-hero-copy" variants={fadeInUp}>{heroDescription}</motion.p>

              <motion.div className="credential-hero-actions" variants={fadeInUp}>
                <Link className="credential-hero-button credential-hero-button-primary" to={primaryAction.to}>{primaryAction.label}</Link>
                <Link className="credential-hero-button credential-hero-button-secondary" to={secondaryAction.to}>{secondaryAction.label}</Link>
              </motion.div>

              <motion.div className="credential-metric-grid" variants={stagger}>
                {metrics.map((metric) => (
                  <motion.div key={metric.label} className="credential-metric-card" variants={fadeInUp}>
                    <span className="credential-metric-value">{metric.value}</span>
                    <span className="credential-metric-label">{metric.label}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            <div className="credential-hero-visual" aria-hidden="true">
              <div className="credential-hero-ring" />
              <div className="credential-hero-orb" />
              <div className="credential-hero-block" />
              <div className="credential-hero-dots">
                {Array.from({ length: 9 }).map((_, index) => <span key={index} />)}
              </div>
              <div className="credential-quote-mark">“</div>
              <div className="credential-floating-card credential-floating-card-primary">
                <div className="credential-badge credential-badge-on-dark">
                  <span className="credential-badge-dot" />
                  <span>{heroQuoteLabel}</span>
                </div>
                <p className="credential-floating-copy">{heroQuote}</p>
              </div>
              <div className="credential-floating-card credential-floating-card-secondary">
                <div className="credential-chip credential-chip-compact">
                  <span className="credential-chip-icon material-symbols-outlined">trending_up</span>
                  Fluxo contínuo
                </div>
                <p className="credential-floating-copy">Planejamento, execução e revisão conectados em uma única jornada.</p>
              </div>
            </div>
          </motion.section>

          <motion.section className="credential-panel" initial="hidden" animate="visible" variants={fadeInUp}>
            <div className="credential-panel-inner">
              <div className="credential-badge credential-badge-panel">
                <span className="credential-badge-dot" />
                <span>{eyebrow}</span>
              </div>

              <div className="credential-title-wrap credential-title-wrap-panel">
                <h2 className="credential-panel-title">{title}</h2>
                <span className="credential-title-underline credential-title-underline-panel" aria-hidden="true" />
              </div>

              <p className="credential-panel-copy">{description}</p>

              {children}

              <footer className="credential-footer">{footer}</footer>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
};