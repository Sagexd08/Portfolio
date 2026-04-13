import * as THREE from "three";
import { useRef, useMemo, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { EffectComposer, N8AO } from "@react-three/postprocessing";
import {
  BallCollider,
  Physics,
  RigidBody,
  CylinderCollider,
  RapierRigidBody,
} from "@react-three/rapier";
import { motion } from "framer-motion";
import { techStack, techCategories } from '../data/data';
import * as SiIcons from 'react-icons/si';
import { LuTerminal } from 'react-icons/lu';

// 3D Texture Mapping
const imageUrls = [
  "/images/react.png",
  "/images/nextjs.png",
  "/images/nodejs.png",
  "/images/typescript.png",
  "/images/python.png",
  "/images/postgresql.png",
  "/images/tailwind.png",
  "/images/framer.png",
  "/images/solidity.png",
  "/images/fastapi.png",
  "/images/web3dotjs.png",
  "/images/pytorch.png",
  "/images/tensorflow.png",
  "/images/opencv.png",
  "/images/huggingface.png",
  "/images/langchain.png",
  "/images/git.png"
];

const categoryColors: Record<string, any> = {
  language: {
    bar: 'from-blue-500 to-indigo-500',
    badge: 'bg-blue-950/60 text-blue-300 border-blue-800/40',
    icon: 'text-blue-400',
  },
  framework: {
    bar: 'from-violet-500 to-purple-500',
    badge: 'bg-violet-950/60 text-violet-300 border-violet-800/40',
    icon: 'text-violet-400',
  },
  ai: {
    bar: 'from-amber-500 to-orange-500',
    badge: 'bg-amber-950/60 text-amber-300 border-amber-800/40',
    icon: 'text-amber-400',
  },
  tool: {
    bar: 'from-emerald-500 to-teal-500',
    badge: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40',
    icon: 'text-emerald-400',
  },
  cloud: {
    bar: 'from-sky-500 to-cyan-500',
    badge: 'bg-sky-950/60 text-sky-300 border-sky-800/40',
    icon: 'text-sky-400',
  },
};

function getTechIcon(iconKey?: string) {
  if (!iconKey) return <LuTerminal />;
  
  const overrides: Record<string, string> = {
    'nextdotjs': 'SiNextdotjs',
    'web3dotjs': 'SiWeb3dotjs',
    'cplusplus': 'SiCplusplus',
    'amazonwebservices': 'SiAmazonwebservices',
    'fastapi': 'SiFastapi',
    'huggingface': 'SiHuggingface',
    'stablediffusion': 'SiStabilityai'
  };

  const formattedKey = overrides[iconKey] || ('Si' + iconKey.charAt(0).toUpperCase() + iconKey.slice(1));
  const IconComponent = (SiIcons as any)[formattedKey];
  
  return IconComponent ? <IconComponent /> : <LuTerminal />;
}

const sphereGeometry = new THREE.SphereGeometry(1, 28, 28);
const scalePool = [0.8, 1, 1.2];

function SphereGeo({
  vec = new THREE.Vector3(),
  scale,
  material,
  isActive,
}: { vec?: THREE.Vector3; scale: number; material: THREE.MeshPhysicalMaterial; isActive: boolean }) {
  const api = useRef<RapierRigidBody | null>(null);

  useFrame((_state, delta) => {
    if (!isActive || !api.current) return;
    delta = Math.min(0.1, delta);
    const impulse = vec
      .copy(api.current.translation())
      .normalize()
      .multiply(
        new THREE.Vector3(
          -50 * delta * scale,
          -150 * delta * scale,
          -50 * delta * scale
        )
      );

    api.current?.applyImpulse(impulse, true);
  });

  return (
    <RigidBody
      linearDamping={0.75}
      angularDamping={0.15}
      friction={0.2}
      position={[
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20 - 10,
        (Math.random() - 0.5) * 10
      ]}
      ref={api}
      colliders={false}
    >
      <BallCollider args={[scale]} />
      <CylinderCollider
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 0, 1.2 * scale]}
        args={[0.15 * scale, 0.275 * scale]}
      />
      <mesh
        castShadow
        receiveShadow
        scale={scale}
        geometry={sphereGeometry}
        material={material}
        rotation={[0.3, 1, 1]}
      />
    </RigidBody>
  );
}

function Pointer({ vec = new THREE.Vector3(), isActive }: { vec?: THREE.Vector3; isActive: boolean }) {
  const ref = useRef<RapierRigidBody>(null);

  useFrame(({ pointer, viewport }) => {
    if (!isActive) return;
    const targetVec = vec.lerp(
      new THREE.Vector3(
        (pointer.x * viewport.width) / 2,
        (pointer.y * viewport.height) / 2,
        0
      ),
      0.2
    );
    ref.current?.setNextKinematicTranslation(targetVec);
  });

  return (
    <RigidBody
      position={[100, 100, 100]}
      type="kinematicPosition"
      colliders={false}
      ref={ref}
    >
      <BallCollider args={[2]} />
    </RigidBody>
  );
}

const Scene = ({ isActive, sphereCount, enablePostFx }: { isActive: boolean, sphereCount: number, enablePostFx: boolean }) => {
  const textures = useMemo(() => {
    const loader = new THREE.TextureLoader();
    return imageUrls.map((url) => loader.load(url));
  }, []);

  const materials = useMemo(() => {
    return textures.map(
      (texture) =>
        new THREE.MeshPhysicalMaterial({
          map: texture,
          emissive: "#ffffff",
          emissiveMap: texture,
          emissiveIntensity: 0.1,
          metalness: 0.5,
          roughness: 0.4,
          clearcoat: 0.3,
        })
    );
  }, [textures]);

  const materialIndexes = useMemo(
    () => Array.from({ length: sphereCount }, () => Math.floor(Math.random() * materials.length)),
    [sphereCount, materials.length]
  );

  return (
    <>
      <ambientLight intensity={1} />
      <spotLight position={[20, 20, 25]} penumbra={1} angle={0.25} color="white" castShadow shadow-mapSize={[512, 512]} intensity={2} />
      <directionalLight position={[0, 5, -4]} intensity={2} />
      <Physics gravity={[0, 0, 0]}>
        <Pointer isActive={isActive} />
        {Array.from({ length: sphereCount }).map((_, i) => (
          <SphereGeo
            key={i}
            scale={scalePool[i % scalePool.length]}
            material={materials[materialIndexes[i]]}
            isActive={isActive}
          />
        ))}
      </Physics>
      <Environment preset="night" />
    </>
  );
};

const TechStack = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isSectionVisible, setIsSectionVisible] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [sphereCount, setSphereCount] = useState(30);

  const isActive = isSectionVisible && isPageVisible;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const tabletQuery = window.matchMedia("(max-width: 1024px)");
    
    const updateDensity = () => {
      if (mediaQuery.matches) setSphereCount(15);
      else if (tabletQuery.matches) setSphereCount(22);
      else setSphereCount(32);
    };

    const observer = new IntersectionObserver(([entry]) => setIsSectionVisible(entry.isIntersecting), { threshold: 0.1 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    
    updateDensity();
    mediaQuery.addEventListener("change", updateDensity);
    tabletQuery.addEventListener("change", updateDensity);

    const onVisibilityChange = () => setIsPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener("change", updateDensity);
      tabletQuery.removeEventListener("change", updateDensity);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return (
    <section id="tech" ref={sectionRef} className="bg-bg py-24 md:py-32 relative flex flex-col items-center">
      <div className="max-w-[1200px] w-full mx-auto px-6 md:px-10 lg:px-16 relative z-10 pointer-events-none">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1 }} className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-stroke" />
            <span className="text-xs text-muted uppercase tracking-[0.3em]">Arsenal</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-body font-light text-text-primary leading-tight">
            My tech <br />
            <span className="font-display italic text-muted">stack</span>
          </h2>
        </motion.div>
      </div>

      {/* Physics Container */}
      <div className="w-full h-[500px] md:h-[700px] cursor-grab active:cursor-grabbing mb-16">
        <Canvas
          shadows
          gl={{ alpha: true, stencil: false, depth: true, antialias: true, powerPreference: "high-performance" }}
          camera={{ position: [0, 0, 20], fov: 35, near: 1, far: 100 }}
          dpr={[1, 2]}
        >
          <Suspense fallback={null}>
            <Scene isActive={isActive} sphereCount={sphereCount} enablePostFx={true} />
          </Suspense>
        </Canvas>
      </div>

      {/* Detailed Grid */}
      <div className="max-w-[1240px] w-full mx-auto px-6 md:px-10 lg:px-16 relative z-10">
        <div className="grid grid-cols-1 gap-20">
          {techCategories.map((cat, catIdx) => {
            const items = techStack.filter((t) => t.category === cat.key);
            const colors = categoryColors[cat.key];
            
            return (
              <motion.div key={cat.key} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: catIdx * 0.1 }}>
                <div className="flex items-center gap-4 mb-10">
                  <h3 className="text-[10px] text-muted font-bold uppercase tracking-[0.4em] whitespace-nowrap">{cat.label}</h3>
                  <div className="h-px w-full bg-stroke/30" />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((tech, i) => (
                    <motion.div
                      key={tech.name}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: i * 0.05 }}
                      className="group bg-surface/30 backdrop-blur-md border border-stroke/50 rounded-2xl p-6 hover:border-white/20 transition-all duration-500"
                    >
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-4">
                          <div className={`text-3xl ${colors.icon} group-hover:scale-110 transition-transform duration-500`}>
                            {getTechIcon(tech.iconKey)}
                          </div>
                          <div>
                            <span className="text-base font-medium text-text-primary block">{tech.name}</span>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-opacity-20 ${colors.badge} mt-1 inline-block`}>
                              {tech.level}% Proficiency
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="h-1 bg-stroke/40 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full bg-gradient-to-r ${colors.bar}`}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${tech.level}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.5, delay: 0.2, ease: "circOut" }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TechStack;
