import { motion } from 'framer-motion';
import { experienceTimeline as experience } from '../data/data';

export default function ExperienceTimeline() {
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

          {/* Right: Timeline Content */}
          <div className="lg:w-2/3 relative">
            {/* Vertical Line */}
            <div className="absolute left-[11px] top-4 bottom-4 w-px bg-stroke/30" />

            <div className="space-y-16">
              {experience.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                  className="relative pl-12 group"
                >
                  {/* Dot */}
                  <div className="absolute left-[3px] top-3 w-[15px] h-[15px] rounded-full border-2 border-stroke bg-bg group-hover:border-white transition-colors duration-300 z-10" />
                  
                  {/* Content Box */}
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-stroke/20 pb-4">
                      <div className="space-y-1">
                        <h4 className="text-xl md:text-2xl font-medium text-text-primary group-hover:text-white transition-colors">
                          {item.title}
                        </h4>
                        <h5 className="text-sm md:text-base text-muted uppercase tracking-wider font-semibold">
                          {item.org}
                        </h5>
                      </div>
                      <h3 className="text-lg md:text-xl font-display-italic text-muted/60 whitespace-nowrap">
                        {item.year}
                      </h3>
                    </div>
                    
                    <p className="text-muted text-sm md:text-base leading-relaxed max-w-2xl">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
