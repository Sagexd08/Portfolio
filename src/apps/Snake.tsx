import { useCallback, useEffect, useRef, useState } from 'react';
import type { AppProps } from '../desktop/types';

const GRID = 20;
const CELL = 18;
const TICK_MS = 110;
const BEST_KEY = 'portfolio.snake.best';

type Point = { x: number; y: number };
const DIRS: Record<string, Point> = {
  ArrowUp: { x: 0, y: -1 }, w: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 }, a: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 },
};

const freshSnake = (): Point[] => [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];

function placeFood(snake: Point[]): Point {
  for (;;) {
    const food = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
    if (!snake.some((p) => p.x === food.x && p.y === food.y)) return food;
  }
}

function readBest(): number {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

export default function Snake(_props: AppProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const game = useRef({ snake: freshSnake(), dir: { x: 1, y: 0 }, next: { x: 1, y: 0 }, food: { x: 15, y: 10 } });
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(readBest);
  const [running, setRunning] = useState(false);
  const [over, setOver] = useState(false);

  const draw = useCallback(() => {
    const ctx = canvas.current?.getContext('2d');
    if (!ctx) return;
    const { snake, food } = game.current;
    ctx.fillStyle = '#16181d';
    ctx.fillRect(0, 0, GRID * CELL, GRID * CELL);
    ctx.fillStyle = '#e5645a';
    ctx.beginPath();
    ctx.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, CELL / 2 - 3, 0, Math.PI * 2);
    ctx.fill();
    snake.forEach((p, i) => {
      ctx.fillStyle = i === 0 ? '#8fd6b4' : '#3d9a78';
      ctx.fillRect(p.x * CELL + 1, p.y * CELL + 1, CELL - 2, CELL - 2);
    });
  }, []);

  const reset = useCallback(() => {
    const snake = freshSnake();
    game.current = { snake, dir: { x: 1, y: 0 }, next: { x: 1, y: 0 }, food: placeFood(snake) };
    setScore(0);
    setOver(false);
    setRunning(true);
    draw();
  }, [draw]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      const g = game.current;
      g.dir = g.next;
      const head = { x: g.snake[0].x + g.dir.x, y: g.snake[0].y + g.dir.y };
      const hit = head.x < 0 || head.y < 0 || head.x >= GRID || head.y >= GRID || g.snake.some((p) => p.x === head.x && p.y === head.y);
      if (hit) {
        setRunning(false);
        setOver(true);
        return;
      }
      const ate = head.x === g.food.x && head.y === g.food.y;
      g.snake = [head, ...(ate ? g.snake : g.snake.slice(0, -1))];
      if (ate) {
        g.food = placeFood(g.snake);
        setScore((s) => s + 1);
      }
      draw();
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [running, draw]);

  useEffect(() => {
    if (!over) return;
    setBest((prev) => {
      const next = Math.max(prev, score);
      try {
        localStorage.setItem(BEST_KEY, String(next));
      } catch {
        // Best score just won't persist.
      }
      return next;
    });
  }, [over, score]);

  const steer = useCallback((key: string) => {
    const dir = DIRS[key];
    const g = game.current;
    if (dir && !(dir.x === -g.dir.x && dir.y === -g.dir.y)) g.next = dir;
  }, []);

  const onKeyDown = (event: React.KeyboardEvent): void => {
    if (event.key === ' ') {
      event.preventDefault();
      if (over) reset();
      else setRunning((r) => !r);
      return;
    }
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    if (DIRS[key]) {
      event.preventDefault();
      steer(key);
      if (!running && !over) setRunning(true);
    }
  };

  const pad = (key: string): void => {
    steer(key);
    if (!running && !over) setRunning(true);
  };

  return (
    <div tabIndex={0} onKeyDown={onKeyDown} aria-label="Snake game. Arrow keys or WASD to steer, space to pause." className="flex h-full flex-col items-center justify-center gap-3 p-4 outline-none" style={{ background: 'var(--surface)', color: 'var(--ink)' }}>
      <div className="flex w-[360px] max-w-full items-center justify-between text-[13px]">
        <span>Tokens eaten: <strong>{score}</strong></span>
        <span style={{ color: 'var(--muted)' }}>Best {best}</span>
      </div>
      <div className="relative">
        <canvas ref={canvas} width={GRID * CELL} height={GRID * CELL} className="max-w-full rounded-lg" style={{ border: '1px solid var(--hairline)' }} />
        {!running && (
          <button type="button" onClick={reset} className="absolute inset-0 flex flex-col items-center justify-center rounded-lg text-white" style={{ background: 'rgba(0,0,0,0.55)' }}>
            <span className="text-[18px] font-semibold">{over ? 'Diverged. Try again' : score ? 'Paused' : 'Train the snake'}</span>
            <span className="text-[12px] opacity-80">Click or press space</span>
          </button>
        )}
      </div>
      <div className="grid grid-cols-3 gap-1 sm:hidden" aria-label="Touch controls">
        <span />
        <button type="button" onClick={() => pad('ArrowUp')} className="h-10 w-10 rounded-lg" style={{ background: 'var(--surface-2)', border: '1px solid var(--hairline)' }}>↑</button>
        <span />
        <button type="button" onClick={() => pad('ArrowLeft')} className="h-10 w-10 rounded-lg" style={{ background: 'var(--surface-2)', border: '1px solid var(--hairline)' }}>←</button>
        <button type="button" onClick={() => pad('ArrowDown')} className="h-10 w-10 rounded-lg" style={{ background: 'var(--surface-2)', border: '1px solid var(--hairline)' }}>↓</button>
        <button type="button" onClick={() => pad('ArrowRight')} className="h-10 w-10 rounded-lg" style={{ background: 'var(--surface-2)', border: '1px solid var(--hairline)' }}>→</button>
      </div>
      <p className="m-0 text-[12px]" style={{ color: 'var(--muted)' }}>Arrow keys / WASD · Space pauses</p>
    </div>
  );
}
