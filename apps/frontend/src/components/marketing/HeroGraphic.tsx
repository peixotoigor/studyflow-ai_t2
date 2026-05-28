import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { BarChart3, ChevronLeft, ChevronRight, Compass, Layers3, ShieldCheck } from 'lucide-react';

const nexusEase = [0.16, 1, 0.3, 1] as const;

type BenefitCard = {
  id: string;
  eyebrow: string;
  title: string;
  detail: string;
  metric: string;
  icon: React.ReactNode;
  accent: string;
};

const BENEFIT_CARDS: BenefitCard[] = [
  {
    id: 'clarity',
    eyebrow: 'Vantagem 01',
    title: 'Direcao antes da execucao.',
    detail: 'Abro a plataforma e o proximo passo ja esta claro. Minha rotina ficou menos emocional e muito mais executavel.',
    metric: 'Planejamento acionavel',
    icon: <Compass className="h-5 w-5" strokeWidth={2.2} />,
    accent: 'from-accent to-accent-secondary',
  },
  {
    id: 'focus',
    eyebrow: 'Vantagem 02',
    title: 'Constancia sem atrito.',
    detail: 'O que mais mudou foi a constancia. Nao gasto energia decidindo por onde comecar toda vez que sento para estudar.',
    metric: 'Menos friccao na rotina',
    icon: <Layers3 className="h-5 w-5" strokeWidth={2.2} />,
    accent: 'from-sky-400 to-accent-secondary',
  },
  {
    id: 'resilience',
    eyebrow: 'Vantagem 03',
    title: 'Pressao sob controle.',
    detail: 'Simulado, erro e revisao pararam de ficar espalhados. Agora eu enxergo o ciclo inteiro e ajusto rapido.',
    metric: 'Ciclo de revisao integrado',
    icon: <ShieldCheck className="h-5 w-5" strokeWidth={2.2} />,
    accent: 'from-slate-900 to-slate-700',
  },
  {
    id: 'insight',
    eyebrow: 'Vantagem 04',
    title: 'Evolucao visivel.',
    detail: 'A plataforma tem cara de produto premium, mas o valor real esta na clareza. Eu so entro e estudo.',
    metric: 'Progresso legivel',
    icon: <BarChart3 className="h-5 w-5" strokeWidth={2.2} />,
    accent: 'from-accent-secondary to-cyan-400',
  },
];

const HeroGraphic: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const fadeInUp = shouldReduceMotion
    ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
    : {
        hidden: { opacity: 0, y: 28 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.7, ease: nexusEase },
        },
      };

  useEffect(() => {
    if (isPaused) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setActiveCardIndex((currentIndex) => (currentIndex + 1) % BENEFIT_CARDS.length);
    }, 2600);

    return () => window.clearInterval(interval);
  }, [isPaused]);

  useEffect(() => {
    const panel = panelRef.current;
    const canvas = canvasRef.current;

    if (!panel || !canvas) {
      return undefined;
    }

    const context = canvas.getContext('2d');

    if (!context) {
      return undefined;
    }

    let animationFrameId = 0;
    let width = 160;
    let height = 160;
    let time = 0;
    const speed = shouldReduceMotion ? 0.006 : 0.05;
    const mouse = { x: width / 2, y: height / 2 };
    const targetMouse = { x: width / 2, y: height / 2 };
    let hasMouse = false;

    const blobs = [
      { color: '#0052FF', phase: 0 },
      { color: '#4D7CFF', phase: 1.9 },
      { color: '#22D3EE', phase: 3.8 },
      { color: '#0F172A', phase: 5.7 },
    ] as const;

    const resize = () => {
      width = 160;
      height = 160;
      canvas.width = width;
      canvas.height = height;
      mouse.x = width / 2;
      mouse.y = height / 2;
      targetMouse.x = width / 2;
      targetMouse.y = height / 2;
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = panel.getBoundingClientRect();
      hasMouse = true;
      targetMouse.x = ((event.clientX - rect.left) / rect.width) * width;
      targetMouse.y = ((event.clientY - rect.top) / rect.height) * height;
    };

    const handlePointerLeave = () => {
      hasMouse = false;
      targetMouse.x = width / 2;
      targetMouse.y = height / 2;
    };

    const draw = () => {
      time += speed;
      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = 'screen';

      mouse.x += (targetMouse.x - mouse.x) * 0.05;
      mouse.y += (targetMouse.y - mouse.y) * 0.05;

      blobs.forEach((blob) => {
        const movementX =
          Math.sin(time + blob.phase) * 0.98 + Math.sin(time * 1.18 + blob.phase * 2.5) * 0.82;
        const movementY =
          Math.cos(time + blob.phase) * 0.98 + Math.cos(time * 1.22 + blob.phase * 2.45) * 0.8;

        let x = width / 2 + movementX * (width * 0.46);
        let y = height / 2 + movementY * (height * 0.46);

        if (!shouldReduceMotion && hasMouse) {
          const deltaX = mouse.x - x;
          const deltaY = mouse.y - y;
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
          const maxDistance = width * 0.6;

          if (distance < maxDistance) {
            const force = (maxDistance - distance) / maxDistance;
            x += deltaX * force * 0.56;
            y += deltaY * force * 0.56;
          }
        }

        const radius = width * 0.82;
        const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, blob.color);
        gradient.addColorStop(0.82, `${blob.color}55`);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');

        context.fillStyle = gradient;
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
      });

      animationFrameId = window.requestAnimationFrame(draw);
    };

    resize();
    panel.addEventListener('pointermove', handlePointerMove);
    panel.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('resize', resize);
    animationFrameId = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      panel.removeEventListener('pointermove', handlePointerMove);
      panel.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('resize', resize);
    };
  }, [shouldReduceMotion]);

  const activeCard = BENEFIT_CARDS[activeCardIndex] ?? BENEFIT_CARDS[0];
  const goToPreviousCard = () => {
    setActiveCardIndex((currentIndex) =>
      currentIndex === 0 ? BENEFIT_CARDS.length - 1 : currentIndex - 1
    );
  };

  const goToNextCard = () => {
    setActiveCardIndex((currentIndex) => (currentIndex + 1) % BENEFIT_CARDS.length);
  };

  const renderCardBody = (card: BenefitCard, isMuted = false) => (
    <>
      <div className={`absolute inset-x-7 top-0 h-1 rounded-b-full bg-gradient-to-r ${card.accent} ${isMuted ? 'opacity-72' : 'opacity-95'}`} />

      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className={`m-0 text-[11px] font-semibold uppercase tracking-[0.24em] ${isMuted ? 'text-slate-300' : 'text-slate-400'}`}>{card.eyebrow}</p>
          <p className={`m-0 mt-3 text-[1.12rem] font-semibold leading-7 tracking-[-0.02em] ${isMuted ? 'text-slate-500' : 'text-slate-950'}`}>{card.title}</p>
        </div>

        <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${card.accent} text-white ${isMuted ? 'opacity-70 shadow-none' : 'shadow-[0_12px_28px_rgba(0,82,255,0.18)]'}`}>
          {card.icon}
        </div>
      </div>

      <p className={`mt-4 text-[15px] leading-7 ${isMuted ? 'text-slate-600/90' : 'text-slate-900/90'}`}>{card.detail}</p>

      <div className={`mt-auto flex items-center justify-between rounded-[1rem] px-4 py-3 pt-4 ${isMuted ? 'bg-slate-100/90' : 'bg-slate-50/85'}`}>
        <div>
          <p className={`m-0 text-[11px] font-semibold uppercase tracking-[0.24em] ${isMuted ? 'text-slate-300' : 'text-slate-400'}`}>Resultado</p>
          <p className={`m-0 mt-1 text-sm font-medium ${isMuted ? 'text-slate-500' : 'text-slate-700'}`}>{card.metric}</p>
        </div>

        {!isMuted ? (
          <div className="flex items-center gap-2">
            {BENEFIT_CARDS.map((item, index) => (
              <button
                key={item.id}
                type="button"
                aria-label={`Mostrar vantagem ${item.title}`}
                onClick={() => setActiveCardIndex(index)}
                onMouseEnter={() => {
                  setIsPaused(true);
                  setActiveCardIndex(index);
                }}
                onMouseLeave={() => setIsPaused(false)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  item.id === card.id ? 'w-8 bg-accent' : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 opacity-35">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
            <span className="h-2.5 w-8 rounded-full bg-slate-300" />
          </div>
        )}
      </div>
    </>
  );

  return (
    <motion.div className="relative hidden lg:block" initial="hidden" animate="visible" variants={fadeInUp}>
      <div ref={panelRef} className="relative mx-auto w-full max-w-[42rem] overflow-hidden rounded-[2.75rem] border border-white/70 bg-[#031225] px-8 py-8 shadow-[0_28px_80px_rgba(15,23,42,0.12)]">
        <div className="absolute inset-0 rounded-[2.75rem] bg-[radial-gradient(circle_at_0%_0%,#0052FF,transparent_68%),radial-gradient(circle_at_100%_0%,#4D7CFF,transparent_68%),radial-gradient(circle_at_100%_100%,#08101f,transparent_72%),radial-gradient(circle_at_0%_100%,#22D3EE,transparent_70%)]" />
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0 h-full w-full rounded-[2.75rem] opacity-100 blur-[52px]"
        />
        <div className="pointer-events-none absolute inset-0 rounded-[2.75rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.42),rgba(241,245,249,0.5))]" />
        <div className="pointer-events-none absolute inset-0 rounded-[2.75rem] bg-[radial-gradient(circle_at_50%_46%,rgba(255,255,255,0.08),transparent_58%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 rounded-t-[2.75rem] bg-gradient-to-b from-white/28 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 rounded-b-[2.75rem] bg-gradient-to-t from-white/30 to-transparent" />

        <div className="relative flex min-h-[24rem] items-center justify-center">
          <button
            type="button"
            aria-label="Mostrar card anterior"
            onClick={goToPreviousCard}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="absolute -left-6 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center bg-transparent text-slate-900 transition-transform duration-200 hover:scale-110"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2.8} />
          </button>

          <button
            type="button"
            aria-label="Mostrar proximo card"
            onClick={goToNextCard}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="absolute -right-6 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center bg-transparent text-accent transition-transform duration-200 hover:scale-110"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={2.8} />
          </button>

          <div className="relative flex h-[24rem] w-full items-center justify-center overflow-hidden">
            <div className="pointer-events-none absolute inset-0 rounded-[2rem] border border-white/20" />
            <div className="relative flex items-center justify-center">
              <motion.article
                key={activeCard.id}
                initial={shouldReduceMotion ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 14, scale: 0.97 }}
                animate={shouldReduceMotion ? { opacity: 1, y: 0, scale: 1 } : { opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: nexusEase }}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                className="z-20 flex min-h-[348px] w-[24.5rem] flex-col overflow-hidden rounded-[1.65rem] border border-accent/15 bg-white p-8 text-left shadow-[0_28px_70px_rgba(0,82,255,0.14)]"
              >
                {renderCardBody(activeCard)}
              </motion.article>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HeroGraphic;