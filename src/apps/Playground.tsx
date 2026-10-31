import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// A tiny MLP (2 -> 8 -> 8 -> 1, tanh/tanh/sigmoid) with hand-written backprop and momentum SGD.
// No ML library: this is the whole network.

type Point = { x: number; y: number; label: 0 | 1 };
type Dataset = 'xor' | 'circle' | 'spiral';

const SIZE = 340;
const GRID = 34;
const HIDDEN = [8, 8];
const STEPS_PER_FRAME = 12;
const MOMENTUM = 0.9;

function rng(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeData(kind: Dataset): Point[] {
  const rand = rng(7);
  const noise = () => (rand() - 0.5) * 0.18;
  const pts: Point[] = [];
  for (let i = 0; i < 220; i++) {
    if (kind === 'xor') {
      const x = rand() * 2 - 1;
      const y = rand() * 2 - 1;
      pts.push({ x, y, label: x * y > 0 ? 1 : 0 });
    } else if (kind === 'circle') {
      const r = rand() < 0.5 ? rand() * 0.45 : 0.7 + rand() * 0.28;
      const a = rand() * Math.PI * 2;
      pts.push({ x: Math.cos(a) * r + noise(), y: Math.sin(a) * r + noise(), label: r < 0.55 ? 1 : 0 });
    } else {
      const arm = i % 2 === 0 ? 0 : 1;
      const t = rand() * 3.2 + 0.2;
      const a = t * 2 + arm * Math.PI;
      pts.push({ x: (Math.cos(a) * t) / 3.4 + noise(), y: (Math.sin(a) * t) / 3.4 + noise(), label: arm === 0 ? 1 : 0 });
    }
  }
  return pts;
}

class Net {
  sizes = [2, ...HIDDEN, 1];
  w: number[][][] = [];
  b: number[][] = [];
  vw: number[][][] = [];
  vb: number[][] = [];

  constructor(seed = 11) {
    const rand = rng(seed);
    for (let l = 1; l < this.sizes.length; l++) {
      const fanIn = this.sizes[l - 1];
      const scale = Math.sqrt(2 / fanIn);
      this.w.push(Array.from({ length: this.sizes[l] }, () => Array.from({ length: fanIn }, () => (rand() * 2 - 1) * scale)));
      this.b.push(new Array(this.sizes[l]).fill(0));
      this.vw.push(this.w[l - 1].map((row) => row.map(() => 0)));
      this.vb.push(new Array(this.sizes[l]).fill(0));
    }
  }

  forward(input: number[]): number[][] {
    const acts = [input];
    for (let l = 0; l < this.w.length; l++) {
      const last = l === this.w.length - 1;
      acts.push(
        this.w[l].map((row, j) => {
          const z = row.reduce((s, wij, i) => s + wij * acts[l][i], this.b[l][j]);
          return last ? 1 / (1 + Math.exp(-z)) : Math.tanh(z);
        }),
      );
    }
    return acts;
  }

  predict(x: number, y: number): number {
    const acts = this.forward([x, y]);
    return acts[acts.length - 1][0];
  }

  /** One full-batch step of binary cross-entropy with momentum SGD. Returns the mean loss. */
  step(data: Point[], lr: number): number {
    const gw = this.w.map((layer) => layer.map((row) => row.map(() => 0)));
    const gb = this.b.map((layer) => layer.map(() => 0));
    let loss = 0;
    for (const p of data) {
      const acts = this.forward([p.x, p.y]);
      const out = Math.min(Math.max(acts[acts.length - 1][0], 1e-7), 1 - 1e-7);
      loss += -(p.label * Math.log(out) + (1 - p.label) * Math.log(1 - out));
      let delta = [out - p.label];
      for (let l = this.w.length - 1; l >= 0; l--) {
        delta.forEach((d, j) => {
          gb[l][j] += d;
          this.w[l][j].forEach((_, i) => (gw[l][j][i] += d * acts[l][i]));
        });
        if (l > 0) delta = acts[l].map((a, i) => (1 - a * a) * delta.reduce((s, d, j) => s + d * this.w[l][j][i], 0));
      }
    }
    const n = data.length;
    for (let l = 0; l < this.w.length; l++) {
      this.w[l].forEach((row, j) => {
        row.forEach((_, i) => {
          this.vw[l][j][i] = MOMENTUM * this.vw[l][j][i] - (lr * gw[l][j][i]) / n;
          row[i] += this.vw[l][j][i];
        });
        this.vb[l][j] = MOMENTUM * this.vb[l][j] - (lr * gb[l][j]) / n;
        this.b[l][j] += this.vb[l][j];
      });
    }
    return loss / n;
  }
}

function accuracy(net: Net, data: Point[]): number {
  return data.filter((p) => (net.predict(p.x, p.y) > 0.5 ? 1 : 0) === p.label).length / data.length;
}

export default function PlaygroundApp() {
  const [kind, setKind] = useState<Dataset>('spiral');
  const [lr, setLr] = useState(0.6);
  const [running, setRunning] = useState(false);
  const [stats, setStats] = useState({ epoch: 0, loss: NaN, acc: 0 });
  const canvas = useRef<HTMLCanvasElement>(null);
  const net = useRef(new Net());
  const epoch = useRef(0);
  const lrRef = useRef(lr);
  lrRef.current = lr;
  const data = useMemo(() => makeData(kind), [kind]);

  const draw = useCallback(() => {
    const ctx = canvas.current?.getContext('2d');
    if (!ctx) return;
    const cell = SIZE / GRID;
    for (let gx = 0; gx < GRID; gx++) {
      for (let gy = 0; gy < GRID; gy++) {
        const p = net.current.predict(((gx + 0.5) / GRID) * 2 - 1, 1 - ((gy + 0.5) / GRID) * 2);
        ctx.fillStyle = `rgba(${Math.round(75 + (1 - p) * 120)}, ${Math.round(110 + (1 - p) * 20)}, ${Math.round(166 - (1 - p) * 40)}, ${0.18 + Math.abs(p - 0.5) * 0.55})`;
        ctx.clearRect(gx * cell, gy * cell, cell, cell);
        ctx.fillRect(gx * cell, gy * cell, cell + 0.5, cell + 0.5);
      }
    }
    for (const p of data) {
      ctx.beginPath();
      ctx.arc(((p.x + 1) / 2) * SIZE, ((1 - p.y) / 2) * SIZE, 3, 0, Math.PI * 2);
      ctx.fillStyle = p.label ? '#4b6ea6' : '#c8704a';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      ctx.stroke();
    }
  }, [data]);

  const reset = useCallback(() => {
    net.current = new Net();
    epoch.current = 0;
    setStats({ epoch: 0, loss: NaN, acc: accuracy(net.current, data) });
    draw();
  }, [data, draw]);

  useEffect(reset, [reset]);

  useEffect(() => {
    if (!running) return;
    let frame = 0;
    const tick = (): void => {
      let loss = 0;
      for (let i = 0; i < STEPS_PER_FRAME; i++) loss = net.current.step(data, lrRef.current);
      epoch.current += STEPS_PER_FRAME;
      setStats({ epoch: epoch.current, loss, acc: accuracy(net.current, data) });
      draw();
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running, data, draw]);

  return (
    <div className="flex flex-col items-center gap-3 p-4">
      <p className="m-0 max-w-[520px] text-center text-[13px]" style={{ color: 'var(--muted)' }}>
        A 2-8-8-1 network with hand-written backprop, trained in your browser. No ML library, no server.
      </p>
      <canvas ref={canvas} width={SIZE} height={SIZE} role="img" aria-label="Decision boundary of the neural network over the dataset" className="rounded-lg" style={{ width: SIZE, maxWidth: '100%', border: '1px solid var(--hairline)', background: 'var(--surface-2)' }} />
      <div className="flex flex-wrap items-center justify-center gap-2 text-[13px]">
        <label>
          Dataset{' '}
          <select value={kind} onChange={(event) => { setKind(event.target.value as Dataset); setRunning(false); }} className="rounded-md px-1 py-1" style={{ border: '1px solid var(--hairline)', background: 'var(--surface)' }}>
            <option value="xor">XOR</option>
            <option value="circle">Circle</option>
            <option value="spiral">Spiral</option>
          </select>
        </label>
        <label>
          LR {lr.toFixed(2)}{' '}
          <input type="range" min={0.05} max={1.5} step={0.05} value={lr} onChange={(event) => setLr(Number(event.target.value))} />
        </label>
        <button type="button" onClick={() => setRunning((value) => !value)} className="rounded-lg px-3 py-1" style={{ background: 'var(--accent)', color: '#fff' }}>{running ? 'Pause' : 'Train'}</button>
        <button type="button" onClick={() => { setRunning(false); reset(); }} className="rounded-lg px-3 py-1" style={{ border: '1px solid var(--hairline)' }}>Reset</button>
      </div>
      <p className="mono m-0 text-[12px]" role="status" aria-live="off">
        epoch {stats.epoch} · loss {Number.isNaN(stats.loss) ? '–' : stats.loss.toFixed(4)} · accuracy {(stats.acc * 100).toFixed(1)}%
      </p>
    </div>
  );
}
