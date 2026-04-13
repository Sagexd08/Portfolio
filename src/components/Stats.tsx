import { useRef } from 'react';
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect } from 'react';

const stats = [
  {
    value: 51,
    label: 'Open-source contributions',
    sub: 'across GitHub',
    accent: 'from-[#1a3a5c] to-[#4a8fc4]',
  },
  {
    value: 8,
    label: 'AI/ML systems shipped',
    sub: 'in production',
    accent: 'from-[#1a3a5c] to-[#4a8fc4]',
  },
  {
    value: 15,
    label: 'Full-stack products built',
    sub: 'end-to-end',
    accent: 'from-[#1a3a5c] to-[#4a8fc4]',
  },
];

function AnimatedNumber({ value, inView }: { value: number; inView: boolean }) {
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) => Math.floor(v));
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!inView) return;
    const ctrl = animate(motionVal, value, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
      delay: 0.2,
    });
    return ctrl.stop;
  }, [inView, value, motionVal]);

  // subscribe and update DOM directly for perf
  useEffect(() => {
    return rounded.on('change', (v) => {
      if (ref.current) ref.current.textContent = String(v);
    });
  }, [rounded]);

  return <span ref={ref}>0</span>;
}

export default function Stats() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section
      id="stats"
      ref={sectionRef}
      className="bg-bg py-24 md:py-36 border-b border-stroke/20 overflow-hidden"
    >
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">

        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="text-[10px] uppercase tracking-[0.4em] text-muted mb-16 flex items-center gap-4"
        >
          <span className="block w-8 h-px bg-stroke/60" />
          by the numbers
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.9, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="group relative px-0 md:px-8 first:pl-0 last:pr-0 py-8 md:py-0
                         border-b md:border-b-0 md:border-r border-stroke/20
                         last:border-none first:md:border-l-0"
            >
              {/* Hover fill */}
              <motion.div
                className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 rounded-sm"
                transition={{ duration: 0.3 }}
              />

              {/* Index marker */}
              <div className="text-[10px] text-muted/40 tracking-widest mb-6 font-mono">
                0{i + 1}
              </div>

              {/* Number */}
              <div className="flex items-end gap-1 mb-5 leading-none">
                <span
                  className={`text-7xl md:text-8xl font-display bg-gradient-to-br ${stat.accent} bg-clip-text text-transparent tabular-nums`}
                >
                  <AnimatedNumber value={stat.value} inView={inView} />
                </span>
                <span className="text-4xl md:text-5xl font-display text-text-primary/50 mb-1">+</span>
              </div>

              {/* Animated underline */}
              <motion.div
                className={`h-px bg-gradient-to-r ${stat.accent} mb-5`}
                initial={{ scaleX: 0, originX: 0 }}
                animate={inView ? { scaleX: 1 } : {}}
                transition={{ duration: 0.8, delay: 0.4 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
              />

              {/* Label */}
              <div className="text-sm text-text-primary/80 font-light leading-snug mb-1">
                {stat.label}
              </div>
              <div className="text-xs text-muted tracking-widest uppercase">
                {stat.sub}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
