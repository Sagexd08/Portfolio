import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { motion } from 'framer-motion';
import { profile } from '../data/data';
import Magnetic from './Magnetic';

const HLS_SRC = 'https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8';

const MARQUEE_TEXT = 'BUILDING THE FUTURE • ';

export default function Footer() {
  const marqueeRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // GSAP marquee
  useEffect(() => {
    if (!marqueeRef.current) return;
    const ctx = gsap.context(() => {
      gsap.to(marqueeRef.current, {
        xPercent: -50,
        duration: 40,
        ease: 'none',
        repeat: -1,
      });
    });
    return () => ctx.revert();
  }, []);

  // Footer video (same source, flipped)
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

  return (
    <footer id="contact" className="relative bg-bg pt-16 md:pt-24 pb-8 md:pb-12 overflow-hidden">
      {/* Background video (flipped) */}
      <div className="absolute left-0 right-0 h-[600px] overflow-hidden pointer-events-none" style={{ bottom: 0 }}>
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto object-cover -translate-x-1/2 -translate-y-1/2 scale-y-[-1] opacity-25"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-bg to-transparent" />
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">

        {/* Marquee */}
        <div className="overflow-hidden mb-20 opacity-10 select-none" aria-hidden="true">
          <div ref={marqueeRef} className="flex whitespace-nowrap" style={{ width: '200%' }}>
            {Array(20).fill(MARQUEE_TEXT).map((text, i) => (
              <span key={i} className="text-5xl md:text-7xl lg:text-8xl font-display italic text-text-primary mr-4">
                {text}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mb-20">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-xs text-muted uppercase tracking-[0.3em] mb-6"
          >
            Get in touch
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-display italic text-text-primary mb-10"
          >
            Say hello.
          </motion.h2>

          <Magnetic strength={0.4}>
            <motion.a
              href={`mailto:${profile.email}`}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative group inline-flex items-center gap-3 rounded-full text-base border-2 border-stroke text-text-primary hover:border-transparent transition-all duration-300 hover:scale-105"
            >
              <span className="absolute inset-[-2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 accent-gradient" />
              <span className="relative z-10 flex items-center gap-3 bg-bg rounded-full px-8 py-4">
                {profile.email}
                <span className="text-xl">↗</span>
              </span>
            </motion.a>
          </Magnetic>
        </div>

        {/* Footer bar */}
        <div className="border-t border-stroke/40 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Social links */}
          <div className="flex items-center gap-6">
            <a
              href={profile.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-text-primary transition-colors duration-200 text-sm"
            >
              GitHub
            </a>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-text-primary transition-colors duration-200 text-sm"
            >
              LinkedIn
            </a>
            <a
              href="/Resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-text-primary transition-colors duration-200 text-sm"
            >
              Resume
            </a>
          </div>

          {/* Availability */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-sm text-muted">Open to opportunities</span>
          </div>

          {/* Copyright */}
          <p className="text-xs text-muted/60">
            © {new Date().getFullYear()} Sohom Chatterjee
          </p>
        </div>
      </div>
    </footer>
  );
}
