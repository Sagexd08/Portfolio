import { useEffect, useRef, useCallback, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';

gsap.registerPlugin(ScrollTrigger);

const EXPLORATIONS = [
  'https://images.unsplash.com/photo-1614728263952-84ea256f9679?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1620121692029-d088224ddc74?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1633167606207-d840b5070fc2?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1618556450991-2f1af64e8191?auto=format&fit=crop&q=80&w=800',
];

// Floating ambient orb — purely decorative depth layer
function AmbientOrb({ x, y, size, delay }: { x: string; y: string; size: number; delay: number }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: x, top: y,
        width: size, height: size,
        background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)',
        filter: 'blur(40px)',
      }}
      animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
      transition={{ duration: 6 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  );
}

// 3D tilt + magnetic drag on mouse move
function TiltCard({
  children,
  rotateDir,
  index,
}: {
  children: React.ReactNode;
  rotateDir: 1 | -1;
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = cardRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      gsap.to(el, {
        rotateY: x * 18 * rotateDir,
        rotateX: -y * 14,
        scale: 1.04,
        x: x * 8,
        y: y * 6,
        duration: 0.35,
        ease: 'power2.out',
        transformPerspective: 900,
      });
    },
    [rotateDir]
  );

  const onMouseEnter = useCallback(() => setHovered(true), []);

  const onMouseLeave = useCallback(() => {
    setHovered(false);
    gsap.to(cardRef.current, {
      rotateY: 0,
      rotateX: 0,
      scale: 1,
      x: 0,
      y: 0,
      duration: 0.9,
      ease: 'elastic.out(1, 0.5)',
    });
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={onMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
      data-hovered={hovered}
      data-index={index}
    >
      {children}
    </div>
  );
}

// Scramble text effect on hover
function ScrambleLabel({ text }: { text: string }) {
  const chars = '01_/\\|█▓░';
  const [display, setDisplay] = useState(text);
  const frameRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scramble = useCallback(() => {
    let iter = 0;
    const max = text.length * 3;
    frameRef.current = setInterval(() => {
      setDisplay(
        text
          .split('')
          .map((c, i) =>
            i < iter / 3
              ? c
              : chars[Math.floor(Math.random() * chars.length)]
          )
          .join('')
      );
      if (iter >= max) {
        clearInterval(frameRef.current!);
        setDisplay(text);
      }
      iter++;
    }, 30);
  }, [text]);

  useEffect(() => () => { if (frameRef.current) clearInterval(frameRef.current); }, []);

  return (
    <span
      className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/80 cursor-default select-none"
      onMouseEnter={scramble}
    >
      {display}
    </span>
  );
}

export default function Explorations() {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);
  const [activeCard, setActiveCard] = useState<number | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 55, damping: 18 });

  // Pinned heading parallax
  const headingY      = useTransform(smoothProgress, [0, 1], [0, -80]);
  const headingOpacity= useTransform(smoothProgress, [0, 0.12, 0.78, 1], [0, 1, 1, 0]);
  const headingScale  = useTransform(smoothProgress, [0, 0.12, 0.78, 1], [0.94, 1, 1, 0.96]);

  // Section progress bar
  const barWidth = useTransform(smoothProgress, [0, 1], ['0%', '100%']);

  // Heading letter stagger (split into chars)
  const titleWords = ['Visual', 'playground'];

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: containerRef.current,
        pin: contentRef.current,
        start: 'top top',
        end: 'bottom bottom',
        pinSpacing: false,
      });

      // Asymmetric column speeds
      gsap.fromTo(leftColRef.current, { y: 60 }, {
        y: -580,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top bottom', end: 'bottom top',
          scrub: 1.4,
        },
      });

      gsap.fromTo(rightColRef.current, { y: 220 }, {
        y: -300,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top bottom', end: 'bottom top',
          scrub: 0.7,
        },
      });

      // Per-image inner parallax — stronger variation
      gsap.utils.toArray<HTMLElement>('.exploration-parallax').forEach((img, i) => {
        const s = 14 + (i % 3) * 8;
        gsap.fromTo(img, { yPercent: -s, scale: 1.15 }, {
          yPercent: s,
          ease: 'none',
          scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: true },
        });
      });

      // Card reveal: clip-path wipe + blur fade
      gsap.utils.toArray<HTMLElement>('.exploration-card').forEach((card, i) => {
        gsap.fromTo(
          card,
          { opacity: 0, clipPath: 'inset(100% 0% 0% 0%)', filter: 'blur(12px)', y: 30 },
          {
            opacity: 1,
            clipPath: 'inset(0% 0% 0% 0%)',
            filter: 'blur(0px)',
            y: 0,
            duration: 1.1,
            ease: 'power4.out',
            delay: (i % 3) * 0.1,
            scrollTrigger: { trigger: card, start: 'top 90%', toggleActions: 'play none none none' },
          }
        );
      });

      // Scroll-driven rotation — more dramatic ±4deg
      gsap.utils.toArray<HTMLElement>('.exploration-card-wrapper').forEach((wrap, i) => {
        const dir = i % 2 === 0 ? 1 : -1;
        gsap.fromTo(wrap, { rotate: dir * 3 }, {
          rotate: -dir * 3,
          ease: 'none',
          scrollTrigger: { trigger: wrap, start: 'top bottom', end: 'bottom top', scrub: true },
        });
      });

      // Horizontal slide on the section label lines
      gsap.fromTo('.exploration-line-left',
        { scaleX: 0, transformOrigin: 'right center' },
        { scaleX: 1, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: contentRef.current, start: 'top 80%', toggleActions: 'play none none none' } }
      );
      gsap.fromTo('.exploration-line-right',
        { scaleX: 0, transformOrigin: 'left center' },
        { scaleX: 1, duration: 1, delay: 0.15, ease: 'power3.out',
          scrollTrigger: { trigger: contentRef.current, start: 'top 80%', toggleActions: 'play none none none' } }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      id="explorations"
      className="relative min-h-[340vh] bg-bg overflow-hidden"
    >
      {/* Section-scoped progress bar */}
      <div className="sticky top-0 w-full h-[1px] z-50 bg-stroke/10 pointer-events-none">
        <motion.div
          className="h-full bg-white/30 origin-left"
          style={{ width: barWidth }}
        />
      </div>

      {/* Ambient depth orbs */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <AmbientOrb x="10%"  y="20%" size={400} delay={0}   />
        <AmbientOrb x="70%"  y="50%" size={500} delay={2}   />
        <AmbientOrb x="30%"  y="75%" size={350} delay={1.2} />
      </div>

      {/* Pinned center content */}
      <div
        ref={contentRef}
        className="h-screen flex items-center justify-center sticky top-0 z-10 pointer-events-none"
      >
        <motion.div
          className="text-center px-6 pointer-events-auto"
          style={{ y: headingY, opacity: headingOpacity, scale: headingScale }}
        >
          {/* Label with animated lines */}
          <div className="text-[10px] text-muted uppercase tracking-[0.45em] mb-6 flex items-center justify-center gap-4">
            <span className="exploration-line-left block w-8 h-px bg-gradient-to-r from-transparent to-stroke/60" />
            Explorations
            <span className="exploration-line-right block w-8 h-px bg-gradient-to-l from-transparent to-stroke/60" />
          </div>

          {/* Title — word by word */}
          <h2 className="font-display-italic leading-[0.9] mb-6 overflow-hidden">
            {titleWords.map((word, wi) => (
              <motion.span
                key={word}
                className="inline-block mr-4"
                initial={{ y: '110%', opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: wi * 0.18, ease: [0.16, 1, 0.3, 1] }}
              >
                {wi === 0 ? (
                  <span className="text-5xl md:text-7xl lg:text-8xl text-text-primary">{word}</span>
                ) : (
                  <em className="text-5xl md:text-7xl lg:text-8xl not-italic text-text-primary/70">
                    {word}
                  </em>
                )}
              </motion.span>
            ))}
          </h2>

          {/* Sub copy */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="text-sm text-muted max-w-xs mx-auto mb-9 leading-relaxed"
          >
            Experiments in motion, light, and geometry.
          </motion.p>

          {/* CTA with animated border */}
          <motion.a
            href="https://github.com/Sagexd08"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="relative inline-flex items-center gap-2 text-[11px] text-text-primary uppercase tracking-[0.3em] group px-5 py-2.5 overflow-hidden"
          >
            {/* Animated border using pseudo elements via box shadow */}
            <span className="absolute inset-0 border border-stroke/30 group-hover:border-[#4a8fc4]/60 transition-colors duration-500 rounded-sm" />
            <span className="absolute bottom-0 left-0 h-px w-0 bg-white/60 group-hover:w-full transition-all duration-500" />
            <span>GitHub Profile</span>
            <motion.span
              animate={{ x: [0, 3, 0], y: [0, -3, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              ↗
            </motion.span>
          </motion.a>
        </motion.div>
      </div>

      {/* Parallax image columns */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1400px] px-6 h-full z-0">
        <div className="grid grid-cols-2 gap-10 md:gap-36 h-full">

          {/* Left column */}
          <div ref={leftColRef} className="space-y-20 md:space-y-28 pt-[15vh]">
            {EXPLORATIONS.slice(0, 3).map((img, i) => (
              <div key={i} className="exploration-card-wrapper">
                <TiltCard rotateDir={1} index={i}>
                  <div
                    className="exploration-card aspect-[4/5] relative overflow-hidden rounded-xl grayscale hover:grayscale-0 transition-[filter,box-shadow] duration-700 cursor-pointer"
                    style={{
                      boxShadow: activeCard === i
                        ? '0 0 40px 4px rgba(255,255,255,0.06), 0 20px 60px rgba(0,0,0,0.5)'
                        : '0 8px 32px rgba(0,0,0,0.4)',
                    }}
                    onMouseEnter={() => setActiveCard(i)}
                    onMouseLeave={() => setActiveCard(null)}
                  >
                    <img
                      src={img}
                      alt={`Exploration ${i + 1}`}
                      className="exploration-parallax w-full h-full object-cover will-change-transform"
                    />
                    {/* Gradient overlay with number */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 flex flex-col justify-between p-5">
                      <div className="flex justify-end">
                        <span className="text-[9px] text-white/50 font-mono tracking-widest">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <ScrambleLabel text={`FRAME · ${String(i + 1).padStart(2, '0')} / ${String(EXPLORATIONS.length).padStart(2, '0')}`} />
                    </div>

                    {/* Shimmer sweep on hover */}
                    <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none overflow-hidden rounded-xl">
                      <div className="absolute -inset-full top-0 h-full w-1/3 bg-gradient-to-r from-transparent via-white/8 to-transparent skew-x-[-20deg] animate-[shimmer_1.4s_ease_forwards]" />
                    </div>
                  </div>
                </TiltCard>
              </div>
            ))}
          </div>

          {/* Right column — offset down */}
          <div ref={rightColRef} className="space-y-20 md:space-y-28 pt-[55vh]">
            {EXPLORATIONS.slice(3, 6).map((img, i) => (
              <div key={i} className="exploration-card-wrapper">
                <TiltCard rotateDir={-1} index={i + 3}>
                  <div
                    className="exploration-card aspect-[4/5] relative overflow-hidden rounded-xl grayscale hover:grayscale-0 transition-[filter,box-shadow] duration-700 cursor-pointer"
                    style={{
                      boxShadow: activeCard === i + 3
                        ? '0 0 40px 4px rgba(255,255,255,0.06), 0 20px 60px rgba(0,0,0,0.5)'
                        : '0 8px 32px rgba(0,0,0,0.4)',
                    }}
                    onMouseEnter={() => setActiveCard(i + 3)}
                    onMouseLeave={() => setActiveCard(null)}
                  >
                    <img
                      src={img}
                      alt={`Exploration ${i + 4}`}
                      className="exploration-parallax w-full h-full object-cover will-change-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 flex flex-col justify-between p-5">
                      <div className="flex justify-end">
                        <span className="text-[9px] text-white/50 font-mono tracking-widest">
                          {String(i + 4).padStart(2, '0')}
                        </span>
                      </div>
                      <ScrambleLabel text={`FRAME · ${String(i + 4).padStart(2, '0')} / ${String(EXPLORATIONS.length).padStart(2, '0')}`} />
                    </div>
                    <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none overflow-hidden rounded-xl">
                      <div className="absolute -inset-full top-0 h-full w-1/3 bg-gradient-to-r from-transparent via-white/8 to-transparent skew-x-[-20deg] animate-[shimmer_1.4s_ease_forwards]" />
                    </div>
                  </div>
                </TiltCard>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Active card glow that follows scroll — decorative */}
      <AnimatePresence>
        {activeCard !== null && (
          <motion.div
            key="glow"
            className="fixed inset-0 pointer-events-none z-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              background: 'radial-gradient(ellipse 600px 400px at 50% 50%, rgba(255,255,255,0.02) 0%, transparent 70%)',
            }}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
