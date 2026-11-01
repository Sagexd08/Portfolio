import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { DEFAULT_STYLE, setMiniMeStyle, useWidgetPrefs, type MiniMeStyle } from './prefs';
import { Card, muted } from './Card';

const SHIRTS = ['#b3262e', '#1d4ed8', '#0f766e', '#7c3aed', '#111827', '#f59e0b'];
const SKINS = ['#f1c9a5', '#e0ac86', '#c68642', '#8d5524', '#5c3a21'];
const HAIRS = ['#1c1a1a', '#4a2c17', '#a56b2a', '#d9b25f', '#7a7a7a'];

function plaidTexture(base: string): THREE.CanvasTexture | null {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const g = canvas.getContext('2d');
  if (!g) return null;
  g.fillStyle = base;
  g.fillRect(0, 0, 128, 128);
  g.fillStyle = 'rgba(0,0,0,0.28)';
  g.fillRect(0, 28, 128, 22);
  g.fillRect(28, 0, 22, 128);
  g.fillStyle = 'rgba(255,255,255,0.18)';
  g.fillRect(0, 88, 128, 6);
  g.fillRect(88, 0, 6, 128);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function webglSupported(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

const reducedMotion = (): boolean => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

function Avatar({ style, still }: { style: MiniMeStyle; still: boolean }) {
  const root = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const arm = useRef<THREE.Group>(null);
  const hand = useRef<THREE.Group>(null);
  const eyes = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const plaid = useMemo(() => plaidTexture(style.shirt), [style.shirt]);

  useEffect(() => () => plaid?.dispose(), [plaid]);
  useEffect(() => {
    const move = (e: PointerEvent): void => {
      pointer.current = { x: (e.clientX / window.innerWidth) * 2 - 1, y: (e.clientY / window.innerHeight) * 2 - 1 };
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, []);

  useFrame(({ clock }) => {
    const t = still ? 0 : clock.elapsedTime;
    if (root.current) root.current.position.y = -0.75 + Math.sin(t * 1.6) * 0.03;
    if (head.current) {
      head.current.rotation.y += (pointer.current.x * 0.6 - head.current.rotation.y) * 0.08;
      head.current.rotation.x += (pointer.current.y * 0.3 - head.current.rotation.x) * 0.08;
    }
    if (arm.current) arm.current.rotation.z = 2.3 + Math.sin(t * 3) * 0.07;
    if (arm.current && hand.current) hand.current.rotation.z = -arm.current.rotation.z;
    if (eyes.current) eyes.current.scale.y = Math.sin(t * 0.9) > 0.985 ? 0.1 : 1;
  });

  const shirt = { color: plaid ? '#ffffff' : style.shirt, map: plaid ?? undefined, roughness: 0.85 };
  return (
    <group ref={root}>
      <mesh position={[0, 0.2, 0]}>
        <capsuleGeometry args={[0.5, 0.7, 8, 16]} />
        <meshStandardMaterial {...shirt} />
      </mesh>
      <mesh position={[0, 0.78, 0]}>
        <cylinderGeometry args={[0.16, 0.2, 0.2, 16]} />
        <meshStandardMaterial color={style.skin} roughness={0.7} />
      </mesh>
      <group ref={head} position={[0, 1.35, 0]}>
        <mesh>
          <sphereGeometry args={[0.55, 32, 24]} />
          <meshStandardMaterial color={style.skin} roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.03, -0.04]} rotation={[-0.35, 0, 0]}>
          <sphereGeometry args={[0.58, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          <meshStandardMaterial color={style.hair} roughness={0.9} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.55, -0.02, 0]}>
            <sphereGeometry args={[0.1, 16, 12]} />
            <meshStandardMaterial color={style.skin} roughness={0.7} />
          </mesh>
        ))}
        <group ref={eyes}>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.19, 0.08, 0.5]}>
              <sphereGeometry args={[0.06, 12, 12]} />
              <meshStandardMaterial color="#14110f" />
            </mesh>
          ))}
        </group>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.19, 0.08, 0.52]}>
            <torusGeometry args={[0.15, 0.018, 12, 32]} />
            <meshStandardMaterial color="#1f2937" metalness={0.4} roughness={0.4} />
          </mesh>
        ))}
        <mesh position={[0, 0.09, 0.52]}>
          <boxGeometry args={[0.08, 0.02, 0.02]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
        <mesh position={[0, -0.04, 0.54]}>
          <sphereGeometry args={[0.055, 12, 12]} />
          <meshStandardMaterial color={style.skin} roughness={0.7} />
        </mesh>
        <mesh position={[0, -0.18, 0.5]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.2, 0.025, 8, 24, Math.PI]} />
          <meshStandardMaterial color="#7a2e2e" />
        </mesh>
      </group>
      <group position={[-0.62, 0.55, 0]} rotation={[0, 0, 0.25]}>
        <mesh position={[0, -0.4, 0]}>
          <capsuleGeometry args={[0.13, 0.55, 6, 12]} />
          <meshStandardMaterial {...shirt} />
        </mesh>
        <mesh position={[0, -0.82, 0]}>
          <sphereGeometry args={[0.14, 16, 12]} />
          <meshStandardMaterial color={style.skin} roughness={0.7} />
        </mesh>
      </group>
      <group ref={arm} position={[0.62, 0.55, 0]} rotation={[0, 0, 2.3]}>
        <mesh position={[0, -0.4, 0]}>
          <capsuleGeometry args={[0.13, 0.55, 6, 12]} />
          <meshStandardMaterial {...shirt} />
        </mesh>
        <group ref={hand} position={[0, -0.82, 0]}>
          <mesh>
            <sphereGeometry args={[0.16, 16, 12]} />
            <meshStandardMaterial color={style.skin} roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.2, 0.02]}>
            <capsuleGeometry args={[0.06, 0.14, 6, 10]} />
            <meshStandardMaterial color={style.skin} roughness={0.7} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

function Swatches({ label, colors, value, onPick }: { label: string; colors: readonly string[]; value: string; onPick: (c: string) => void }) {
  return (
    <div className="flex items-center gap-1" role="group" aria-label={label}>
      <span className="w-9 text-[10px]" style={muted}>{label}</span>
      {colors.map((c) => (
        <button key={c} type="button" aria-label={`${label} ${c}`} aria-pressed={value === c} onClick={() => onPick(c)} className="h-4 w-4 rounded-full" style={{ background: c, outline: value === c ? '2px solid var(--accent, #0a84ff)' : '1px solid rgba(255,255,255,0.35)', outlineOffset: 1 }} />
      ))}
    </div>
  );
}

export default function MiniMe() {
  const { style } = useWidgetPrefs();
  const ok = useMemo(webglSupported, []);
  const still = useMemo(reducedMotion, []);
  return (
    <Card label="Mini me">
      <div className="relative h-[190px] overflow-hidden rounded-xl" style={{ background: 'linear-gradient(160deg, color-mix(in srgb, var(--accent) 35%, transparent), transparent)' }}>
        {ok ? (
          <Canvas dpr={[1, 2]} camera={{ position: [0, 0.9, 4.4], fov: 34 }} frameloop={still ? 'demand' : 'always'} aria-label="3D cartoon of Sohom giving a thumbs up" role="img">
            <ambientLight intensity={0.9} />
            <directionalLight position={[2, 3, 4]} intensity={1.6} />
            <Avatar style={style} still={still} />
          </Canvas>
        ) : (
          <p className="m-0 flex h-full items-center justify-center text-[44px]" role="img" aria-label="Sohom giving a thumbs up">🙂👍</p>
        )}
        <span className="absolute bottom-2 left-2 rounded-full px-2 py-[2px] text-[11px] font-semibold text-white" style={{ background: 'rgba(0,0,0,0.45)' }}>I&apos;m okay 👍</span>
      </div>
      <div className="mt-2 space-y-1">
        <Swatches label="Shirt" colors={SHIRTS} value={style.shirt} onPick={(shirt) => setMiniMeStyle({ shirt })} />
        <Swatches label="Skin" colors={SKINS} value={style.skin} onPick={(skin) => setMiniMeStyle({ skin })} />
        <Swatches label="Hair" colors={HAIRS} value={style.hair} onPick={(hair) => setMiniMeStyle({ hair })} />
        <button type="button" onClick={() => setMiniMeStyle(DEFAULT_STYLE)} className="text-[10.5px] underline" style={muted}>Reset look</button>
      </div>
    </Card>
  );
}
