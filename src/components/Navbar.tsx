import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { profile } from '../data/data';
import Magnetic from './Magnetic';

const navLinks = [
  { label: 'Home', href: '#hero' },
  { label: 'Projects', href: '#projects' },
  { label: 'Experience', href: '#experience' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('Home');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);

      const sections = ['hero', 'projects', 'experience', 'journal', 'explorations'];
      for (const id of sections.reverse()) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 200) {
          const map: Record<string, string> = {
            hero: 'Home',
            projects: 'Projects',
            experience: 'Experience',
            journal: 'Journal',
            explorations: 'Visuals',
          };
          setActive(map[id] || 'Home');
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (href: string) => {
    const id = href.replace('#', '');
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 md:pt-5 px-4"
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
    >
      <div
        className={`inline-flex items-center rounded-full backdrop-blur-md border border-white/10 bg-surface/80 px-1.5 py-1.5 gap-0.5 transition-all duration-300 ${
          scrolled ? 'shadow-xl shadow-black/40 border-white/20' : ''
        }`}
      >
        {/* Logo */}
        <Magnetic strength={0.15}>
          <button
            onClick={() => scrollTo('#hero')}
            className="relative group w-8 h-8 rounded-full flex items-center justify-center hover:scale-105 transition-transform duration-200 mr-1 flex-shrink-0"
            aria-label="Home"
          >
            <span className="absolute inset-0 rounded-full p-[1px] group-hover:p-[1.5px] transition-all duration-300">
              <span className="absolute inset-0 rounded-full accent-gradient opacity-60 group-hover:opacity-100 transition-opacity" />
            </span>
            <span className="relative z-10 w-6 h-6 bg-bg rounded-full flex items-center justify-center">
              <span className="font-display italic text-[10px] text-text-primary font-medium">{profile.initials}</span>
            </span>
          </button>
        </Magnetic>

        <span className="hidden sm:block w-px h-4 bg-stroke mx-1 flex-shrink-0" />

        {navLinks.map((link) => (
          <button
            key={link.label}
            onClick={() => { scrollTo(link.href); setActive(link.label); }}
            className={`text-[11px] sm:text-xs rounded-full px-3 sm:px-4 py-1.5 transition-all duration-200 whitespace-nowrap ${
              active === link.label
                ? 'text-text-primary bg-white/10 font-medium'
                : 'text-muted hover:text-text-primary hover:bg-white/5'
            }`}
          >
            {link.label}
          </button>
        ))}

        <span className="hidden sm:block w-px h-4 bg-stroke mx-1 flex-shrink-0" />

        {/* Resume */}
        <Magnetic strength={0.2}>
          <a
            href="/Resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="relative group text-xs rounded-full transition-colors duration-200 whitespace-nowrap"
          >
            <span className="relative z-10 flex items-center gap-1.5 bg-white/5 hover:bg-white/10 rounded-full px-3 py-1.5 text-[11px] sm:text-xs text-muted hover:text-text-primary border border-white/5 transition-all">
              Resume <span className="text-[10px] opacity-60">↗</span>
            </span>
          </a>
        </Magnetic>
      </div>
    </motion.nav>
  );
}
