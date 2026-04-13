import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { profile } from '../data/data';
import Magnetic from './Magnetic';

const HLS_SRC = 'https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8';
const ROLES = ['Creative', 'Fullstack Developer', 'AI/ML Researcher', 'Founder @ Oxify Labs'];

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [roleIndex, setRoleIndex] = useState(0);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // GSAP Entrance
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from('.name-reveal', {
        opacity: 0,
        y: 50,
        duration: 1.2,
        delay: 0.1,
      })
        .from('.blur-in', {
          opacity: 0,
          filter: 'blur(10px)',
          y: 20,
          duration: 1,
          stagger: 0.1,
        }, '-=0.8');

      // Scroll indicator line highlight
      gsap.to('.animate-scroll-down', {
        y: '200%',
        duration: 1.5,
        ease: 'none',
        repeat: -1,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // HLS logic
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    import('hls.js').then(({ default: Hls }) => {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(HLS_SRC);
        hls.attachMedia(video);
        return () => hls.destroy();
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = HLS_SRC;
      }
    });
  }, []);

  // Role Cycling
  useEffect(() => {
    const timer = setInterval(() => {
      setRoleIndex((prev) => (prev + 1) % ROLES.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="hero" ref={containerRef} className="relative w-full h-screen overflow-hidden bg-bg">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto object-cover -translate-x-1/2 -translate-y-1/2"
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-bg to-transparent" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center">
        <div className="blur-in text-xs text-muted uppercase tracking-[0.3em] mb-8">
          COMPUTER SCIENCE CLASS OF '28
        </div>

        <div className="blur-in inline-flex items-center gap-3 mb-6 px-3 py-1.5 rounded-full border border-white/10 bg-surface/40 backdrop-blur-md">
          <img
            src={profile.avatarUrl}
            alt={`${profile.name} profile`}
            className="w-7 h-7 rounded-full object-cover border border-white/20"
            loading="eager"
            decoding="async"
          />
          <span className="text-[11px] text-muted uppercase tracking-[0.18em]">{profile.location}</span>
        </div>

        <h1 className="name-reveal text-6xl md:text-8xl lg:text-9xl font-display-italic leading-[0.9] tracking-tight text-text-primary mb-6">
          {profile.name}
        </h1>

        <div className="blur-in text-lg md:text-2xl text-text-primary/90 font-light mb-8 flex items-center justify-center gap-2 leading-none">
          <span className="shrink-0">A</span>
          <div className="relative h-8 md:h-9 overflow-hidden">
            <span className="invisible font-display-italic italic whitespace-nowrap">
              {ROLES.reduce((a, b) => (a.length >= b.length ? a : b))}
            </span>
            <AnimatePresence mode="wait">
              <motion.span
                key={ROLES[roleIndex]}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="absolute inset-0 flex items-center font-display-italic text-text-primary italic whitespace-nowrap"
              >
                {ROLES[roleIndex]}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        <p className="blur-in text-sm md:text-base text-muted max-w-md mb-12 text-balance lg:px-4">
          Designing seamless digital interactions by focusing on the unique nuances which bring systems to life.
        </p>

        {/* CTA Buttons */}
        <div className="blur-in flex flex-col sm:flex-row items-center gap-4">
          <Magnetic strength={0.2}>
            <button
              type="button"
              onClick={() => scrollToSection('projects')}
              className="relative group px-10 py-4 rounded-full bg-text-primary text-bg font-medium text-sm transition-all duration-300 hover:scale-105 overflow-hidden"
            >
              <span className="absolute inset-0 bg-bg opacity-0 group-hover:opacity-10 transition-opacity" />
              See Works
            </button>
          </Magnetic>

          <Magnetic strength={0.2}>
            <button
              type="button"
              onClick={() => scrollToSection('contact')}
              className="relative group px-10 py-4 rounded-full border-2 border-stroke bg-bg/40 backdrop-blur-sm text-text-primary font-medium text-sm transition-all duration-300 hover:scale-105 hover:border-transparent"
            >
              <span className="absolute inset-[-2px] rounded-full accent-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10">Reach out...</span>
            </button>
          </Magnetic>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-[10px] text-muted uppercase tracking-[0.2em] opacity-40">SCROLL</span>
        <div className="w-px h-10 bg-stroke/40 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1/2 accent-gradient animate-scroll-down" />
        </div>
      </div>
    </section>
  );
}
