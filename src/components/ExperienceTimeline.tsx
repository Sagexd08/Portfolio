import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { experienceTimeline as experience } from '../data/data';

const INITIAL_SHOW = 3;

export default function ExperienceTimeline() {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? experience : experience.slice(0, INITIAL_SHOW);

  return (
    <section id="experience" className="bg-bg py-24 md:py-32 overflow-hidden">
      <div className="max-w-[1240px] mx-auto px-6 md:px-10 lg:px-16">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">

          {/* Left: Sticky Header */}
          <div className="lg:w-1/3 lg:sticky lg:top-32 h-fit">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: 'easeOut' }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-px bg-stroke" />
                <span className="text-xs text-muted uppercase tracking-[0.3em]">Timeline</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-body font-light text-text-primary leading-[1.1] mb-8">
                My career <span className="font-display-italic text-muted">&</span><br />
                <em className="font-display-italic not-italic-override">experience</em>
              </h2>
              <p className="text-muted text-base max-w-sm">
                A journey through leadership, research, and technical community initiatives.
              </p>
            </motion.div>
          </div>

          {/* Right: Timeline */}
          <div className="lg:w-2/3 relative">
            {/* Vertical line — sits in the left gutter, outside text flow */}
            <div className="absolute -left-5 top-2 bottom-4 w-px bg-stroke/30 hidden lg:block" />

            <div className="space-y-0">
              <AnimatePresence initial={false}>
                {visible.map((item, i) => (
                  <motion.div
                    key={item.title + item.org}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.55, delay: i < INITIAL_SHOW ? i * 0.08 : (i - INITIAL_SHOW) * 0.07, ease: [0.16, 1, 0.3, 1] }}
                    className="relative pb-14 group"
                  >
                    {/* Dot — floats in the gutter, doesn't affect text flow */}
                    <div className="absolute -left-[23px] top-[6px] w-[15px] h-[15px] rounded-full border-2 border-stroke bg-bg group-hover:border-white transition-colors duration-300 z-10 hidden lg:block" />

                    {/* Header row — title+org left, date right, same baseline */}
                    <div className="flex items-baseline justify-between gap-4 mb-3">
                      <div className="min-w-0">
                        <h4 className="text-lg md:text-xl font-medium text-text-primary group-hover:text-white transition-colors leading-snug">
                          {item.title}
                        </h4>
                        <p className="text-xs text-muted uppercase tracking-[0.2em] font-semibold mt-0.5">
                          {item.org}
                        </p>
                      </div>
                      <span className="text-sm font-display-italic text-muted/60 whitespace-nowrap shrink-0">
                        {item.year}
                      </span>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-stroke/15 mb-4" />

                    {/* Description */}
                    <p className="text-muted text-sm leading-relaxed max-w-xl">
                      {item.description}
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Show more / less */}
            {experience.length > INITIAL_SHOW && (
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="mt-2"
              >
                <button
                  onClick={() => setExpanded((v) => !v)}
                  className="group flex items-center gap-3 text-xs text-muted uppercase tracking-[0.25em] hover:text-text-primary transition-colors duration-300"
                >
                  <span className="block w-5 h-px bg-stroke/50 group-hover:w-8 group-hover:bg-text-primary transition-all duration-300" />
                  {expanded
                    ? 'Show less'
                    : `Show ${experience.length - INITIAL_SHOW} more`}
                  <motion.span
                    animate={{ rotate: expanded ? 180 : 0 }}
                    transition={{ duration: 0.35 }}
                    className="inline-block"
                  >
                    ↓
                  </motion.span>
                </button>
              </motion.div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
