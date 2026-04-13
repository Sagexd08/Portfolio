import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';

gsap.registerPlugin(ScrollTrigger);

const EXPLORATIONS = [
  'https://images.unsplash.com/photo-1614728263952-84ea256f9679?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1620121692029-d088224ddc74?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1633167606207-d840b5070fc2?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1618556450991-2f1af64e8191?auto=format&fit=crop&q=80&w=800',
];

export default function Explorations() {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Pin center content
      ScrollTrigger.create({
        trigger: containerRef.current,
        pin: contentRef.current,
        start: 'top top',
        end: 'bottom bottom',
        pinSpacing: false,
      });

      // Parallax movement for columns
      gsap.to(leftColRef.current, {
        y: -400,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });

      gsap.to(rightColRef.current, {
        y: -200,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });

      // Image-level parallax (background visuals)
      const parallaxImages = gsap.utils.toArray<HTMLImageElement>('.exploration-parallax');

      parallaxImages.forEach((img, index) => {
        const strength = 8 + (index % 3) * 4;

        gsap.fromTo(
          img,
          { yPercent: -strength, scale: 1.08 },
          {
            yPercent: strength,
            ease: 'none',
            scrollTrigger: {
              trigger: img,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} id="explorations" className="relative min-h-[300vh] bg-bg overflow-hidden">
      {/* Layer 1: Pinned Center */}
      <div ref={contentRef} className="h-screen flex items-center justify-center sticky top-0 z-10">
        <div className="text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-xs text-muted uppercase tracking-[0.3em] mb-4"
          >
            Explorations
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-display-italic text-text-primary mb-6"
          >
            Visual <em className="not-italic-override">playground</em>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-base text-muted max-w-sm mx-auto mb-8"
          >
            A collection of experiments in motion, light, and geometry.
          </motion.p>
          <motion.a
            href="https://github.com/Sagexd08"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="inline-block text-xs text-text-primary uppercase tracking-[0.2em] border-b border-white/20 pb-1 hover:border-white transition-colors"
          >
            GitHub Profile ↗
          </motion.a>
        </div>
      </div>

      {/* Layer 2: Parallax Columns */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1400px] px-6 h-full z-0">
        <div className="grid grid-cols-2 gap-12 md:gap-40 h-full">
          {/* Left Column */}
          <div ref={leftColRef} className="space-y-24 md:space-y-32 pt-[20vh]">
            {EXPLORATIONS.slice(0, 3).map((img, i) => (
              <div
                key={i}
                className="aspect-square relative group overflow-hidden rounded-2xl grayscale hover:grayscale-0 transition-all duration-700 hover:rotate-2"
              >
                <img
                  src={img}
                  alt="Exploration"
                  className="exploration-parallax w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 will-change-transform"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <span className="text-white text-xs uppercase tracking-[0.2em]">View Lightbox</span>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column */}
          <div ref={rightColRef} className="space-y-24 md:space-y-32 pt-[60vh]">
            {EXPLORATIONS.slice(3, 6).map((img, i) => (
              <div
                key={i}
                className="aspect-square relative group overflow-hidden rounded-2xl grayscale hover:grayscale-0 transition-all duration-700 hover:-rotate-2"
              >
                <img
                  src={img}
                  alt="Exploration"
                  className="exploration-parallax w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 will-change-transform"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <span className="text-white text-xs uppercase tracking-[0.2em]">View Lightbox</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
