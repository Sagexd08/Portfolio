import { motion } from 'framer-motion';

const JOURNAL_ENTRIES = [
  {
    title: 'Architecting for Resilience in 2026',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=400',
    readTime: '6 min read',
    date: 'April 14, 2026',
    url: 'https://oxifylabs.app/blog/resilience-2026',
  },
  {
    title: 'The Intersection of AI and Decentralized Finance',
    image: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=400',
    readTime: '8 min read',
    date: 'March 10, 2026',
    url: 'https://oxifylabs.app/blog/ai-defi-intersection',
  },
  {
    title: 'Understanding Multi-modal Neural Networks',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=400',
    readTime: '12 min read',
    date: 'Feb 22, 2026',
    url: 'https://oxifylabs.app/blog/multi-modal-nn',
  },
  {
    title: 'Building Scalable Intelligent Systems',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400',
    readTime: '5 min read',
    date: 'Jan 15, 2026',
    url: 'https://oxifylabs.app/blog/scalable-ai-systems',
  },
];

export default function Journal() {
  return (
    <section id="journal" className="bg-bg py-24 md:py-32 border-t border-stroke/20">
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
            <span className="text-xs text-muted uppercase tracking-[0.3em]">Journal</span>
          </div>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <h2 className="text-5xl md:text-7xl font-body font-light text-text-primary leading-none">
              Recent <em className="font-display-italic">thoughts</em>
            </h2>
            <a
              href="https://oxifylabs.app/blog"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex relative group items-center gap-2 rounded-full text-sm text-muted hover:text-text-primary transition-colors duration-200 px-6 py-3 border border-stroke"
            >
              <span className="absolute inset-[-1px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 accent-gradient" />
              <span className="relative z-10 flex items-center gap-1.5 bg-bg rounded-full px-6 py-3">
                View all articles <span>→</span>
              </span>
            </a>
          </div>
          <p className="text-base text-muted mt-6 max-w-xl">
            Reflections on technology, research, and the future of engineering.
          </p>
        </motion.div>

        {/* Entries */}
        <div className="space-y-4">
          {JOURNAL_ENTRIES.map((entry, i) => (
            <motion.a
              key={entry.title}
              href={entry.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group flex flex-col sm:flex-row items-start sm:items-center gap-6 p-4 md:p-6 bg-surface/30 hover:bg-surface border border-transparent hover:border-stroke rounded-[32px] sm:rounded-full transition-all duration-300 cursor-pointer block"
            >
              {/* Image Pill */}
              <div className="w-20 h-20 sm:w-16 sm:h-16 rounded-full overflow-hidden flex-shrink-0 border border-white/5">
                <img src={entry.image} alt={entry.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>

              {/* Title and Meta */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg md:text-xl font-medium text-text-primary mb-1 truncate group-hover:text-white transition-colors">
                  {entry.title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-muted font-medium">
                  <span>{entry.date}</span>
                  <span className="w-1 h-1 rounded-full bg-stroke" />
                  <span>{entry.readTime}</span>
                </div>
              </div>

              {/* Arrow */}
              <div className="w-10 h-10 rounded-full border border-stroke flex items-center justify-center text-muted group-hover:text-text-primary group-hover:border-white/20 transition-all">
                <span className="text-xl">↗</span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
