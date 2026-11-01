import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { CHATS, SATIRE_NOTE, type Chat } from '../content/messages';
import { openApp } from '../desktop/store';
import type { AppProps } from '../desktop/types';

const REVEAL_MS = 650;
const BLUE = '#0b84ff';
const GRAY = '#e9e9eb';

const CSS = `
.im-bubble{position:relative;max-width:78%;padding:7px 13px;border-radius:18px;font-size:14px;line-height:1.3;overflow-wrap:anywhere;animation:im-pop .28s ease-out both}
.im-sent{align-self:flex-end;background:${BLUE};color:#fff}
.im-recv{align-self:flex-start;background:${GRAY};color:#111}
.im-sent.im-tail::before,.im-recv.im-tail::before,.im-sent.im-tail::after,.im-recv.im-tail::after{content:"";position:absolute;bottom:0;height:18px}
.im-sent.im-tail::before{right:-7px;width:20px;background:${BLUE};border-bottom-left-radius:16px 14px}
.im-sent.im-tail::after{right:-26px;width:26px;background:#fff;border-bottom-left-radius:10px}
.im-recv.im-tail::before{left:-7px;width:20px;background:${GRAY};border-bottom-right-radius:16px 14px}
.im-recv.im-tail::after{left:-26px;width:26px;background:#fff;border-bottom-right-radius:10px}
.im-dot{display:inline-block;width:7px;height:7px;margin:0 2px;border-radius:50%;background:#8e8e93;animation:im-bounce 1.2s infinite ease-in-out}
.im-dot:nth-child(2){animation-delay:.15s}.im-dot:nth-child(3){animation-delay:.3s}
@keyframes im-pop{from{opacity:0;transform:scale(.88) translateY(6px)}to{opacity:1;transform:none}}
@keyframes im-bounce{0%,60%,100%{transform:translateY(0);opacity:.5}30%{transform:translateY(-4px);opacity:1}}
@media (prefers-reduced-motion:reduce){.im-bubble,.im-dot{animation:none}}
`;

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function Avatar({ chat, size }: { chat: Chat; size: number }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{ width: size, height: size, fontSize: size * 0.38, background: `linear-gradient(160deg, ${chat.tint[0]}, ${chat.tint[1]})` }}
    >
      {chat.initials}
    </span>
  );
}

function Thread({ chat, reduced }: { chat: Chat; reduced: boolean }) {
  const total = chat.messages.length;
  // step 0..total = messages revealed; total + 1 = typing indicator shown
  const [step, setStep] = useState(reduced ? total + 1 : 0);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced || step > total) return undefined;
    const id = window.setTimeout(() => setStep((s) => s + 1), REVEAL_MS);
    return () => window.clearTimeout(id);
  }, [step, total, reduced]);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [step]);

  const shown = Math.min(step, total);
  const done = step >= total;

  return (
    <div
      ref={logRef}
      role="log"
      aria-live="polite"
      aria-label={`Messages sent to ${chat.name}`}
      className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto px-4 py-3"
      style={{ background: '#fff' }}
    >
      <p className="mb-1 text-center text-[11px] text-neutral-500">
        <b className="font-semibold">iMessage</b> · {chat.time}
      </p>
      {chat.messages.slice(0, shown).map((text, i) => (
        <div key={i} className="flex flex-col gap-1.5">
          <div className={`im-bubble im-sent ${i === shown - 1 ? 'im-tail' : ''}`}>{text}</div>
        </div>
      ))}
      {done ? (
        <>
          <p className="self-end pr-1 text-[11px] font-medium text-neutral-500">{chat.receipt}</p>
          <button
            type="button"
            onClick={() => openApp('contact')}
            className="im-bubble self-end rounded-full border px-4 py-1.5 text-[13px] font-semibold"
            style={{ borderColor: BLUE, color: BLUE, background: '#fff' }}
          >
            Open Contact
          </button>
        </>
      ) : null}
      {step > total ? (
        <div className="im-bubble im-recv im-tail mt-1" role="img" aria-label={`${chat.name} is typing, but nobody has replied`}>
          <span className="im-dot" />
          <span className="im-dot" />
          <span className="im-dot" />
        </div>
      ) : null}
    </div>
  );
}

export default function Messages(_props: AppProps) {
  const [activeId, setActiveId] = useState<string>(CHATS[0].id);
  const [query, setQuery] = useState('');
  const [seen, setSeen] = useState<ReadonlySet<string>>(() => new Set([CHATS[0].id]));
  const [draft, setDraft] = useState('');
  const reduced = useMemo(prefersReducedMotion, []);
  const listRef = useRef<HTMLDivElement>(null);

  const q = query.trim().toLowerCase();
  const visible = CHATS.filter(
    (c) => !q || c.name.toLowerCase().includes(q) || c.subtitle.toLowerCase().includes(q) || c.messages.some((m) => m.toLowerCase().includes(q)),
  );
  const active = CHATS.find((c) => c.id === activeId) ?? CHATS[0];

  const select = (id: string): void => {
    setActiveId(id);
    setSeen((prev) => new Set(prev).add(id));
  };

  const onListKey = (e: KeyboardEvent<HTMLDivElement>): void => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const items = Array.from(listRef.current?.querySelectorAll<HTMLButtonElement>('button') ?? []);
    const at = items.indexOf(document.activeElement as HTMLButtonElement);
    if (at < 0) return;
    e.preventDefault();
    items[(at + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus();
  };

  return (
    <div className="flex h-full min-h-0 flex-col text-neutral-900" style={{ background: '#fff' }}>
      <style>{CSS}</style>
      <div className="flex min-h-0 flex-1">
        <aside className="flex w-[240px] shrink-0 flex-col border-r border-neutral-200" style={{ background: '#f5f5f7' }} aria-label="Conversations">
          <div className="p-2.5">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              aria-label="Search conversations"
              className="w-full rounded-lg bg-black/[0.06] px-3 py-1.5 text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-[#0b84ff]"
            />
          </div>
          <div ref={listRef} role="list" onKeyDown={onListKey} className="min-h-0 flex-1 overflow-y-auto px-1.5 pb-2">
            {visible.length === 0 ? <p className="px-3 py-4 text-center text-xs text-neutral-500">No conversations match.</p> : null}
            {visible.map((c) => {
              const selected = c.id === activeId;
              const unread = seen.has(c.id) ? 0 : c.messages.length;
              return (
                <div role="listitem" key={c.id}>
                  <button
                    type="button"
                    onClick={() => select(c.id)}
                    aria-current={selected ? 'true' : undefined}
                    aria-label={`${c.name}, ${c.subtitle}${unread ? `, ${unread} unread` : ''}`}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#0b84ff]"
                    style={{ background: selected ? BLUE : 'transparent', color: selected ? '#fff' : undefined }}
                  >
                    <Avatar chat={c} size={38} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-[13px] font-semibold">{c.name}</span>
                        <span className="shrink-0 text-[11px]" style={{ opacity: 0.7 }}>{c.time}</span>
                      </span>
                      <span className="flex items-center justify-between gap-2">
                        <span className="line-clamp-2 text-[12px]" style={{ opacity: 0.75 }}>{c.messages[0]}</span>
                        {unread ? (
                          <span aria-hidden="true" className="shrink-0 rounded-full px-1.5 text-[11px] font-bold text-white" style={{ background: selected ? '#ffffff55' : BLUE }}>
                            {unread}
                          </span>
                        ) : null}
                      </span>
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col" aria-label={`Conversation with ${active.name}`}>
          <header className="flex items-center gap-3 border-b border-neutral-200 px-4 py-2" style={{ background: '#f9f9fb' }}>
            <Avatar chat={active} size={34} />
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-[13px] font-semibold">{active.name}</h2>
              <p className="truncate text-[11px] text-neutral-500">{active.subtitle}</p>
            </div>
            <button
              type="button"
              onClick={() => openApp('contact')}
              className="shrink-0 rounded-full px-3 py-1 text-[12px] font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
              style={{ background: BLUE }}
            >
              Hire me
            </button>
          </header>

          <Thread key={active.id} chat={active} reduced={reduced} />

          <form
            className="flex items-center gap-2 border-t border-neutral-200 px-3 py-2"
            onSubmit={(e) => {
              e.preventDefault();
              setDraft('');
              openApp('contact');
            }}
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Message Sohom (opens Contact)"
              aria-label="Compose a message to Sohom"
              className="min-w-0 flex-1 rounded-full border border-neutral-300 px-3.5 py-1.5 text-[13px] outline-none focus-visible:border-[#0b84ff] focus-visible:ring-2 focus-visible:ring-[#0b84ff]/40"
            />
            <button
              type="submit"
              aria-label="Send and open Contact"
              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-white outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
              style={{ background: BLUE }}
            >
              <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" />
              </svg>
            </button>
          </form>
        </section>
      </div>
      <p className="border-t border-neutral-200 px-3 py-1 text-center text-[11px] text-neutral-500" style={{ background: '#f5f5f7' }}>
        {SATIRE_NOTE}
      </p>
    </div>
  );
}
