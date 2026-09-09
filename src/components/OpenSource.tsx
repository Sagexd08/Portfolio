import { motion } from 'framer-motion';
import { LuArrowUpRight } from 'react-icons/lu';
import { openSource } from '../data/data';

export default function OpenSource() {
  return (
    <section id="open-source" className="bg-bg py-24 md:py-32 border-t border-stroke/20">
      <div className="max-w-[1240px] mx-auto px-6 md:px-10 lg:px-16">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-stroke" />
            <span className="text-xs text-muted uppercase tracking-[0.3em]">Open Source</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-body font-light text-text-primary leading-none">
            Upstream <em className="font-display-italic">fixes</em>
          </h2>
          <p className="text-base text-muted mt-6 max-w-xl">
            Bugs found, reproduced, and fixed in developer-tooling and AI-eval codebases.
          </p>
        </motion.div>

        {/* Contribution list */}
        <div className="border-t border-stroke/20">
          {openSource.map((item, i) => (
            <motion.a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.8, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="group block border-b border-stroke/20 py-8 md:py-10 transition-colors duration-300 hover:bg-white/[0.02]"
            >
              <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-10">
                {/* Repo */}
                <div className="md:w-1/3 shrink-0">
                  <span className="text-xs font-mono text-muted/70 tracking-tight break-all group-hover:text-text-primary/80 transition-colors duration-300">
                    {item.repo}
                  </span>
                </div>

                {/* Body */}
                <div className="md:flex-1 min-w-0">
                  <h3 className="text-lg md:text-xl font-medium text-text-primary leading-snug mb-3 flex items-start gap-2">
                    <span>{item.title}</span>
                    <LuArrowUpRight className="mt-1 shrink-0 text-muted/50 group-hover:text-text-primary group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all duration-300" />
                  </h3>
                  <p className="text-sm text-muted leading-relaxed max-w-2xl mb-4">
                    {item.description}
                  </p>
                  <span className="text-[11px] uppercase tracking-[0.2em] text-muted/60 font-mono">
                    {item.meta}
                  </span>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
