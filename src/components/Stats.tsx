import { motion } from 'framer-motion';
import { LuPackage, LuCpu, LuLayers } from 'react-icons/lu';
import CountUp from './CountUp';

const stats = [
  { value: 51, label: 'Repositories', icon: <LuPackage /> },
  { value: 8, label: 'AI/ML Projects', icon: <LuCpu /> },
  { value: 15, label: 'Full-stack Apps', icon: <LuLayers /> },
];

export default function Stats() {
  return (
    <section id="stats" className="bg-bg py-24 md:py-32 border-b border-stroke/20">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-20">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.8, delay: i * 0.12, ease: 'easeOut' }}
              className="text-center md:text-left group"
            >
              <div className="text-3xl text-muted group-hover:text-text-primary group-hover:scale-110 transition-all duration-300 inline-block mb-4">
                {stat.icon}
              </div>
              <div className="text-6xl md:text-7xl lg:text-8xl font-display mb-3 tabular-nums leading-none">
                <CountUp
                  from={0}
                  to={stat.value}
                  duration={2}
                  className="bg-clip-text text-transparent accent-gradient leading-tight inline-block"
                />
                <span className="text-text-primary ml-1">+</span>
              </div>
              <div className="text-xs text-muted uppercase tracking-[0.3em] font-semibold">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
