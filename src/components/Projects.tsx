import { motion } from 'framer-motion';
import { featuredProjects, type Project } from '../data/data';
import { LuGithub, LuExternalLink, LuLayers, LuBrain, LuDatabase, LuImage, LuLock, LuCommand, LuSearch, LuGlobe, LuBox } from 'react-icons/lu';

function getProjectIcon(id: string) {
  const map: Record<string, React.ReactNode> = {
    'archi-dev': <LuLayers />,
    'serene-mind': <LuBrain />,
    'dacap': <LuDatabase />,
    'lexigraph': <LuImage />,
    'zelda': <LuLock />,
    'sage-ai': <LuCommand />,
    'shortlist-ai': <LuSearch />,
    'autofi': <LuGlobe />,
  };
  return map[id] || <LuBox />;
}

function ProjectCard({ project, index, span }: { project: Project; index: number; span: string }) {
  // Map index to image placeholders for visual richness
  const IMAGE_PLACEHOLDERS = [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=1200',
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1], delay: index * 0.1 }}
      className={`group relative ${span} min-h-[400px] overflow-hidden rounded-3xl border border-stroke bg-surface`}
    >
      {/* Background Image */}
      <img
        src={IMAGE_PLACEHOLDERS[index % IMAGE_PLACEHOLDERS.length]}
        alt={project.title}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
      />

      {/* Halftone Overlay */}
      <div className="halftone absolute inset-0 opacity-20 mix-blend-multiply pointer-events-none" />

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-bg/70 opacity-0 backdrop-blur-lg transition-opacity duration-300 group-hover:opacity-100 flex flex-col justify-center items-center p-8">
        <div className="relative p-[2px] rounded-full overflow-hidden mb-6">
          <div className="absolute inset-0 accent-gradient animate-gradient-shift" />
          <div className="relative bg-white text-bg px-6 py-2 rounded-full font-medium text-sm flex items-center gap-2">
            View — <em className="font-display-italic not-italic-override">{project.title}</em>
          </div>
        </div>
        
        <p className="text-center text-sm text-text-primary/80 mb-6 max-w-xs">{project.description}</p>
        
        <div className="flex gap-4">
          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
            <LuGithub />
          </a>
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
              <LuExternalLink />
            </a>
          )}
        </div>
      </div>

      {/* Content Fallback / Visible Header */}
      <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent group-hover:opacity-0 transition-opacity">
        <div className="flex items-center gap-3 mb-2">
           <div className="text-xl text-text-primary/70">{getProjectIcon(project.id)}</div>
           <h3 className="text-xl font-semibold text-text-primary">{project.title}</h3>
        </div>
        <div className="flex gap-2">
          {project.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-[10px] uppercase tracking-wider text-muted py-1">{tag}</span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function Projects() {
  const featured = featuredProjects.filter((p) => p.featured).slice(0, 4);
  const spans = ['md:col-span-7', 'md:col-span-5', 'md:col-span-5', 'md:col-span-7'];

  return (
    <section id="projects" className="bg-bg py-24 md:py-32">
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
            <span className="text-xs text-muted uppercase tracking-[0.3em]">Selected Work</span>
          </div>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <h2 className="text-5xl md:text-7xl font-body font-light text-text-primary leading-none">
              Featured <em className="font-display-italic">projects</em>
            </h2>
            <a
              href="https://github.com/Sagexd08"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex relative group items-center gap-2 rounded-full text-sm text-muted hover:text-text-primary transition-colors duration-200 px-6 py-3 border border-stroke"
            >
              <span className="absolute inset-[-1px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 accent-gradient" />
              <span className="relative z-10 flex items-center gap-1.5 bg-bg rounded-full px-6 py-3">
                View all work <span>→</span>
              </span>
            </a>
          </div>
          <p className="text-base text-muted mt-6 max-w-xl">
            A selection of projects I've worked on, from concept to launch.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6">
          {featured.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} span={spans[i % spans.length]} />
          ))}
        </div>
      </div>
    </section>
  );
}
