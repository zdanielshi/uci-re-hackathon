"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AGENDAS, COUNTIES, PERSONAS, TIERS, CALL_SNIPPETS, FOLLOWUP_LINES,
  type Official, type PersonaId, type AgendaId, type Sentiment,
  getOfficials, priority, draftEmail, callScript, replyFor,
} from "@/lib/data";

type Step = "setup" | "scan" | "map" | "campaign" | "console";

export default function App() {
  const [step, setStep] = useState<Step>("setup");
  const [county, setCounty] = useState(COUNTIES[0]);
  const [persona, setPersona] = useState<PersonaId>("renter");
  const [agenda, setAgenda] = useState<AgendaId>("zoning");
  const { officials, seeded } = useMemo(() => getOfficials(county), [county]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSelected(new Set(officials.map((o) => o.id)));
  }, [officials]);

  // Navigation synced with browser history so the header back button and iOS swipe-back both work.
  const go = (next: Step, replace = false) => {
    setStep(next);
    try {
      // Preserve Next.js router state (__NA etc.) so its popstate handler doesn't force a reload.
      const st = { ...(history.state ?? {}), step: next };
      if (replace) history.replaceState(st, ""); else history.pushState(st, "");
    } catch {}
  };
  const back = () => {
    if (history.state?.step) history.back();
    else setStep(PREV[step] ?? "setup");
  };
  useEffect(() => {
    try { history.replaceState({ ...(history.state ?? {}), step: "setup" }, ""); } catch {}
    const onPop = (e: PopStateEvent) => {
      const s = (e.state?.step as Step | undefined) ?? "setup";
      setStep(s === "scan" ? "setup" : s);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  useEffect(() => { window.scrollTo(0, 0); }, [step]);

  const targets = officials.filter((o) => selected.has(o.id)).sort((a, b) => priority(b) - priority(a));

  return (
    <div className="min-h-dvh bg-leaf">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-cream">
        <Header step={step} onBack={step === "setup" || step === "scan" ? undefined : back} onReset={() => go("setup")} />
        <main className="flex-1 px-4 pb-28 pt-5">
          {step === "setup" && (
            <Setup county={county} setCounty={setCounty} agenda={agenda} setAgenda={setAgenda} persona={persona} setPersona={setPersona} onGo={() => go("scan")} />
          )}
          {step === "scan" && <Scan county={county} count={officials.length} onDone={() => go("map", true)} />}
          {step === "map" && (
            <PowerMap
              officials={officials} seeded={seeded} county={county} selected={selected}
              toggle={(id) => setSelected((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; })}
              onNext={() => go("campaign")} onBack={back}
            />
          )}
          {step === "campaign" && <Campaign targets={targets} persona={persona} agenda={agenda} onLaunch={() => go("console")} onBack={back} />}
          {step === "console" && <Console targets={targets} />}
        </main>
        <footer className="px-4 pb-6 text-center font-mono text-[10px] leading-snug text-sage">
          Demo only. All outreach is simulated — no messages are sent. Stances and replies are illustrative.
        </footer>
      </div>
    </div>
  );
}

/* ---------------- Header ---------------- */

const STEPS: { id: Step; label: string }[] = [
  { id: "setup", label: "Setup" },
  { id: "map", label: "Targets" },
  { id: "campaign", label: "Campaign" },
  { id: "console", label: "Launch" },
];

const PREV: Partial<Record<Step, Step>> = { map: "setup", campaign: "map", console: "campaign" };

function Header({ step, onBack, onReset }: { step: Step; onBack?: () => void; onReset: () => void }) {
  const idx = STEPS.findIndex((s) => s.id === (step === "scan" ? "setup" : step));
  return (
    <header className="sticky top-0 z-20 border-b-[3px] border-ink bg-pine px-4 pb-3 pt-4">
      <div className="flex items-center justify-between gap-2">
        {onBack && (
          <button onClick={onBack} aria-label="Back" className="-ml-1 grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-ink bg-sun text-ink shadow-[2px_2px_0_#14231a] active:translate-x-px active:translate-y-px active:shadow-none">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
        )}
        <button onClick={onReset} className="mr-auto flex min-w-0 items-center gap-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-[2.5px] border-ink bg-sun font-display text-[17px] text-ink">B³</span>
          <span className="text-left">
            <span className="display block text-[22px] leading-none text-sun">Build Baby Build</span>
            <span className="mt-0.5 block truncate font-mono text-[10px] leading-tight text-pine-light">Your autonomous housing lobbyist</span>
          </span>
        </button>
        {!onBack && <span className="shrink-0 rounded-full border-2 border-ink bg-sun px-2 py-0.5 font-mono text-[10px] font-bold text-ink">● READY</span>}
      </div>
      <div className="mt-3 flex gap-1.5">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex-1">
            <div className={`h-1.5 rounded-full ${i <= idx ? "bg-sun" : "bg-white/25"}`} />
            <div className={`mt-1 font-mono text-[10px] font-bold uppercase tracking-wider ${i <= idx ? "text-sun" : "text-pine-light/70"}`}>{s.label}</div>
          </div>
        ))}
      </div>
    </header>
  );
}

/* ---------------- Shared ---------------- */

function PrimaryButton({ children, onClick, onBack }: { children: React.ReactNode; onClick: () => void; onBack?: () => void }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-md gap-2.5 border-t-[3px] border-ink bg-cream px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3">
      {onBack && (
        <button onClick={onBack} className="sticker press shrink-0 px-4 py-3 font-display text-[18px] uppercase text-ink">
          ← Back
        </button>
      )}
      <button onClick={onClick} className="press min-w-0 flex-1 truncate rounded-[14px] border-[2.5px] border-ink bg-pine px-3 py-3 font-display text-[20px] uppercase tracking-wide text-sun shadow-[4px_4px_0_#14231a]">
        {children}
      </button>
    </div>
  );
}

const stanceStyle: Record<string, string> = {
  Champion: "bg-good-soft text-good",
  Persuadable: "bg-sun-soft text-[#8a6a00]",
  Skeptic: "bg-bad-soft text-bad",
};
const sentStyle: Record<Sentiment, string> = {
  Supportive: "bg-good-soft text-good",
  Noncommittal: "bg-mist text-sage",
  Opposed: "bg-bad-soft text-bad",
};

function Pill({ s }: { s: string }) {
  return <span className={`rounded-full border-[1.5px] border-ink px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${stanceStyle[s]}`}>{s}</span>;
}

/* ---------------- Setup ---------------- */

function Setup(p: { county: string; setCounty: (c: string) => void; agenda: AgendaId; setAgenda: (a: AgendaId) => void; persona: PersonaId; setPersona: (x: PersonaId) => void; onGo: () => void }) {
  return (
    <div className="space-y-6">
      <div>
        <span className="inline-block -rotate-2 rounded-full bg-ink px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-sun">Paid for by renters, probably</span>
        <h1 className="display mt-3 text-[44px] text-ink">Developers have lobbyists.<br /><span className="text-pine">Now renters do too.</span></h1>
        <p className="mt-3 text-[15px] leading-snug text-sage">Pick a county and an agenda. The agent finds everyone with power over housing and runs a personalized outreach campaign.</p>
      </div>

      <label className="block">
        <span className="lbl">County</span>
        <div className="relative mt-2">
          <select value={p.county} onChange={(e) => p.setCounty(e.target.value)} className="sticker w-full appearance-none px-3.5 py-3 pr-10 text-[16px] font-semibold text-ink">
          {COUNTIES.map((c) => <option key={c}>{c}</option>)}
        </select>
          <svg className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#14231a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
        </div>
      </label>

      <div>
        <span className="lbl">Agenda</span>
        <div className="mt-2 grid gap-3">
          {AGENDAS.map((a) => (
            <button key={a.id} onClick={() => p.setAgenda(a.id)}
              className={`press flex items-center gap-3 px-3 py-3 text-left ${p.agenda === a.id ? "sticker-sel" : "sticker"}`}>
              <span className="text-xl">{a.emoji}</span>
              <span>
                <span className="block text-[15px] font-extrabold leading-tight text-ink">{a.label}</span>
                <span className={`mt-0.5 block text-[12px] ${p.agenda === a.id ? "text-ink/75" : "text-sage"}`}>{a.sub}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="lbl">I&apos;m lobbying as</span>
        <div className="mt-2 grid gap-3">
          {PERSONAS.map((x) => (
            <button key={x.id} onClick={() => p.setPersona(x.id)}
              className={`press px-3.5 py-3 text-left text-[15px] font-extrabold text-ink ${p.persona === x.id ? "sticker-sel" : "sticker"}`}>
              {x.label}
            </button>
          ))}
        </div>
      </div>

      <PrimaryButton onClick={p.onGo}>Find the decision-makers →</PrimaryButton>
    </div>
  );
}

/* ---------------- Scan ---------------- */

function Scan({ county, count, onDone }: { county: string; count: number; onDone: () => void }) {
  const lines = [
    `Resolving jurisdictions in ${county.split(",")[0]}…`,
    "Pulling Board of Supervisors roster…",
    "Mapping state Senate & Assembly districts…",
    "Indexing city councils & mayors…",
    "Finding housing agencies & regional planners…",
    "Scoring influence × persuadability…",
    `Found ${count} decision-makers.`,
  ];
  const [n, setN] = useState(0);
  useEffect(() => {
    if (n >= lines.length) { const t = setTimeout(onDone, 600); return () => clearTimeout(t); }
    const t = setTimeout(() => setN((x) => x + 1), 420);
    return () => clearTimeout(t);
  }, [n, lines.length, onDone]);
  return (
    <div className="pt-10">
      <div className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-[5px] border-ink border-t-sun border-r-sun" />
      <div className="display mb-5 text-center text-[30px] text-ink">Canvassing the county…</div>
      <ul className="sticker space-y-2 p-4">
        {lines.slice(0, n).map((l, i) => (
          <li key={i} className="flex items-start gap-2 font-mono text-[12px] text-ink">
            <span className="font-bold text-good">✓</span>{l}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------- Power Map ---------------- */

function PowerMap(p: { officials: Official[]; seeded: boolean; county: string; selected: Set<string>; toggle: (id: string) => void; onNext: () => void; onBack: () => void }) {
  const [open, setOpen] = useState<Official | null>(null);
  const counts = { Champion: 0, Persuadable: 0, Skeptic: 0 } as Record<string, number>;
  p.officials.forEach((o) => counts[o.stance]++);
  return (
    <div className="space-y-5">
      <div>
        <h2 className="display text-[36px] text-ink">Power map</h2>
        <p className="mt-1 text-sm text-sage">{p.officials.length} people with power over housing in {p.county.split(",")[0]}.</p>
        {!p.seeded && <p className="mt-2 rounded-lg border-2 border-ink bg-sun-soft px-2 py-1 font-mono text-[11px] text-ink">Generated roster — verified data available for Orange County.</p>}
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {(["Champion", "Persuadable", "Skeptic"] as const).map((s) => (
          <div key={s} className="sticker p-2 text-center">
            <div className={`font-display text-[32px] leading-tight ${s === "Champion" ? "text-good" : s === "Skeptic" ? "text-bad" : "text-[#b08800]"}`}>{counts[s]}</div>
            <div className="font-mono text-[10px] font-bold uppercase text-sage">{s}s</div>
          </div>
        ))}
      </div>

      {TIERS.map((tier) => {
        const list = p.officials.filter((o) => o.tier === tier).sort((a, b) => priority(b) - priority(a));
        if (!list.length) return null;
        return (
          <section key={tier}>
            <h3 className="lbl mb-2.5">{tier} · {list.length}</h3>
            <div className="space-y-3">
              {list.map((o) => (
                <div key={o.id} className={`sticker flex items-center gap-3 p-3 ${p.selected.has(o.id) ? "" : "opacity-45"}`}>
                  <button onClick={() => setOpen(o)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                    <Avatar name={o.name} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[15px] font-extrabold text-ink">{o.name}</div>
                      <div className="truncate text-xs text-sage">{o.title}</div>
                      <div className="mt-1.5 flex items-center gap-2"><Pill s={o.stance} /><span className="font-mono text-[10px] font-bold text-sage">PRIORITY {priority(o)}</span></div>
                    </div>
                  </button>
                  <input type="checkbox" checked={p.selected.has(o.id)} onChange={() => p.toggle(o.id)} className="h-6 w-6 accent-[#0d5c3a]" />
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {open && <Sheet o={open} onClose={() => setOpen(null)} />}
      <PrimaryButton onClick={p.onNext} onBack={p.onBack}>Draft {p.selected.size} messages →</PrimaryButton>
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(" ").filter((w) => /^[A-Z]/.test(w)).slice(0, 2).map((w) => w[0]).join("");
  const hue = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-[2.5px] border-ink font-display text-[15px] text-white" style={{ background: `hsl(${hue} 42% 38%)` }}>
      {initials}
    </div>
  );
}

function Bar({ label, v }: { label: string; v: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs font-semibold text-ink"><span>{label}</span><span className="font-mono">{v}/10</span></div>
      <div className="mt-1.5 h-3.5 overflow-hidden rounded-full border-2 border-ink bg-mist"><div className="h-full rounded-full bg-sun" style={{ width: `${v * 10}%` }} /></div>
    </div>
  );
}

function Sheet({ o, onClose }: { o: Official; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/50" onClick={onClose}>
      <div className="w-full max-w-md rounded-t-3xl border-x-[3px] border-t-[3px] border-ink bg-cream p-5 pb-8" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-ink" />
        <div className="flex items-center gap-3">
          <Avatar name={o.name} />
          <div>
            <div className="display text-[26px] text-ink">{o.name}</div>
            <div className="text-sm text-sage">{o.title} · {o.jurisdiction}</div>
          </div>
        </div>
        <div className="mt-3"><Pill s={o.stance} /></div>
        <div className="mt-4 space-y-3">
          <Bar label="Influence over housing" v={o.influence} />
          <Bar label="Persuadability" v={o.persuadability} />
        </div>
        <div className="sticker mt-4 p-3 text-sm">
          <div className="lbl">Why they matter</div>
          <p className="mt-1 text-ink">{o.why}</p>
          <div className="lbl mt-3">Angle</div>
          <p className="mt-1 text-ink">{o.hook}</p>
        </div>
        <button onClick={onClose} className="sticker press mt-5 w-full py-3 font-display text-[18px] uppercase text-ink">Close</button>
      </div>
    </div>
  );
}

/* ---------------- Campaign ---------------- */

function Typewriter({ text }: { text: string }) {
  const [n, setN] = useState(0);
  useEffect(() => { setN(0); }, [text]);
  useEffect(() => {
    if (n >= text.length) return;
    const t = setTimeout(() => setN((x) => Math.min(text.length, x + 6)), 12);
    return () => clearTimeout(t);
  }, [n, text]);
  return <>{text.slice(0, n)}{n < text.length && <span className="animate-pulse">▍</span>}</>;
}

function Campaign({ targets, persona, agenda, onLaunch, onBack }: { targets: Official[]; persona: PersonaId; agenda: AgendaId; onLaunch: () => void; onBack: () => void }) {
  const [i, setI] = useState(0);
  const [tab, setTab] = useState<"email" | "call">("email");
  const o = targets[i];
  if (!o) return <p className="text-sm text-sage">No targets selected.</p>;
  const email = draftEmail(o, persona, agenda);
  return (
    <div className="space-y-5">
      <div>
        <h2 className="display text-[36px] text-ink">Campaign drafts</h2>
        <p className="mt-1 text-sm text-sage">{targets.length} personalized emails, {targets.length} call scripts, ranked by priority.</p>
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 pt-0.5">
        {targets.map((t, k) => (
          <button key={t.id} onClick={() => setI(k)} className={`shrink-0 rounded-full border-2 border-ink px-3 py-1.5 text-xs font-extrabold ${k === i ? "bg-sun text-ink shadow-[2px_2px_0_#14231a]" : "bg-paper text-ink"}`}>
            {t.name.split(" ").slice(-1)[0]}
          </button>
        ))}
      </div>

      <div className="sticker overflow-hidden">
        <div className="flex items-center gap-3 border-b-[2.5px] border-ink p-3">
          <Avatar name={o.name} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[15px] font-extrabold text-ink">{o.name}</div>
            <div className="truncate text-xs text-sage">{o.title}</div>
          </div>
          <Pill s={o.stance} />
        </div>
        <div className="flex border-b-[2.5px] border-ink text-sm">
          {(["email", "call"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2.5 font-extrabold ${tab === t ? "bg-sun text-ink" : "bg-paper text-sage"}`}>
              {t === "email" ? "✉️ Email" : "📞 Call script"}
            </button>
          ))}
        </div>
        <div className="p-3">
          {tab === "email" ? (
            <>
              <div className="lbl">Subject</div>
              <div className="mb-3 mt-0.5 text-[15px] font-extrabold text-ink">{email.subject}</div>
              <pre className="whitespace-pre-wrap font-sans text-[13px] leading-relaxed text-ink"><Typewriter key={o.id + persona + agenda} text={email.body} /></pre>
            </>
          ) : (
            <p className="text-[13px] leading-relaxed text-ink"><Typewriter key={o.id + "call" + agenda} text={callScript(o, agenda)} /></p>
          )}
        </div>
      </div>

      <div className="rounded-[14px] border-[2.5px] border-dashed border-ink bg-sun-soft p-3 text-xs text-ink">
        <b className="font-mono uppercase">Plan:</b> Email all targets → call top {Math.min(10, targets.length)} offices → auto follow-up on replies within 48h → draft public comments for next meetings.
      </div>

      <PrimaryButton onClick={onLaunch} onBack={onBack}>🚀 Launch campaign</PrimaryButton>
    </div>
  );
}

/* ---------------- Console ---------------- */

type Ev = { id: number; t: string; icon: string; who: string; text: string; tag?: Sentiment; sub?: string };

function Console({ targets }: { targets: Official[] }) {
  const N = targets.length;
  const callTotal = Math.min(10, N);
  const [emails, setEmails] = useState(0);
  const [opened, setOpened] = useState(0);
  const [calls, setCalls] = useState(0);
  const [comments, setComments] = useState(0);
  const [feed, setFeed] = useState<Ev[]>([]);
  const [replies, setReplies] = useState<Ev[]>([]);
  const [tab, setTab] = useState<"feed" | "replies">("feed");
  const tick = useRef(0);
  const evId = useRef(0);
  const mayor = useMemo(
    () => targets.find((t) => t.id === "agran") ?? targets.find((t) => t.tier === "City" && /mayor/i.test(t.name + t.title)) ?? targets.find((t) => t.tier === "City"),
    [targets]
  );
  const pool = useMemo(() => { const p = targets.filter((t) => t.id !== mayor?.id); return p.length ? p : targets; }, [targets, mayor]);
  const [win, setWin] = useState<Ev | null>(null);

  useEffect(() => {
    if (!mayor) return;
    const t = setTimeout(() => {
      const now = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" });
      const label = mayor.name.includes("Mayor") ? "the Mayor" : `Mayor ${mayor.name.split(" ").slice(-1)[0]}`;
      const ev: Ev = {
        id: evId.current++, t: now, icon: "🎉", who: mayor.name, tag: "Supportive",
        text: `${label} is supportive. Let's meet next week — we'd like to bring this to City Council as an agenda item. Our scheduler will reach out today.`,
        sub: mayor.title,
      };
      setReplies((rs) => [ev, ...rs]);
      setFeed((f) => [{ ...ev, id: evId.current++, text: "Replied — SUPPORTIVE ⭐ Meeting + council agenda item" }, ...f]);
      setWin(ev);
      try { navigator.vibrate?.([80, 40, 120]); } catch {}
    }, 15000);
    return () => clearTimeout(t);
  }, [mayor]);

  const [gold, setGold] = useState<Ev | null>(null);
  useEffect(() => {
    const t = setTimeout(() => {
      const now = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" });
      const ev: Ev = {
        id: evId.current++, t: now, icon: "🇺🇸", who: "President Donald J. Trump", tag: "Supportive",
        text: "GREAT idea! Nobody knows housing like me. We are going to SLASH home prices — bigly, like never before. Build, baby, build! Thank you for your attention to this matter!",
        sub: "Parody · simulated",
      };
      setReplies((rs) => [ev, ...rs]);
      setFeed((f) => [{ ...ev, id: evId.current++, text: "Replied — SUPPORTIVE 🇺🇸 \"Thank you for your attention to this matter!\"" }, ...f]);
      setWin(null);
      setGold(ev);
      try { navigator.vibrate?.([120, 60, 120, 60, 250]); } catch {}
    }, 22000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    // Jittered scheduler: irregular gaps, occasional quick bursts and short lulls, so activity doesn't tick like a metronome.
    const rand = (min: number, max: number) => min + Math.random() * (max - min);
    let sent = 0;
    let emailTicks = 0;
    let timer: ReturnType<typeof setTimeout>;

    const nextDelay = () => {
      if (sent < N) return rand(250, 750); // email blast: brisk, uneven
      const r = Math.random();
      if (r < 0.18) return rand(180, 380); // burst
      if (r < 0.3) return rand(1300, 2100); // lull
      return rand(500, 1100);
    };

    const step = () => {
      const k = tick.current++;
      const now = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" });
      const push = (e: Omit<Ev, "id" | "t">) => setFeed((f) => [{ ...e, id: evId.current++, t: now }, ...f].slice(0, 60));
      const o = targets[Math.floor(Math.random() * N)];
      if (!o) return;

      if (sent < N) {
        const size = 1 + Math.floor(Math.random() * 4); // 1-4 emails per tick
        const batch = targets.slice(sent, sent + size);
        sent += batch.length;
        emailTicks++;
        setEmails((x) => Math.min(N, x + batch.length));
        batch.forEach((b) => push({ icon: "✉️", who: b.name, text: "Personalized email delivered" }));
        return;
      }
      const j = k - emailTicks;
      if (j < callTotal * 2) {
        if (j % 2 === 0) {
          const c = targets[j / 2];
          setCalls((x) => x + 1);
          const vm = Math.random() < 0.3;
          const dur = `${Math.floor(rand(0, 3))}:${String(Math.floor(rand(5, 59))).padStart(2, "0")}`;
          push({ icon: vm ? "📼" : "📞", who: c.name, text: vm ? `Voicemail left (0:${Math.floor(rand(28, 58))})` : `Call connected (${dur})`, sub: vm ? undefined : CALL_SNIPPETS[Math.floor(Math.random() * CALL_SNIPPETS.length)] });
        } else {
          const r = pool[(j * 3) % pool.length];
          setOpened((x) => Math.min(N, x + 1 + Math.floor(Math.random() * 3)));
          const rep = replyFor(r, j);
          const ev = { icon: "💬", who: r.name, text: rep.text, tag: rep.s };
          push({ ...ev, text: `Replied — ${rep.s.toLowerCase()}` });
          setReplies((rs) => [{ ...ev, id: evId.current++, t: now }, ...rs]);
        }
        return;
      }
      // endless phase: weighted random mix of opens, follow-ups, public comments, replies
      const r = Math.random();
      if (r < 0.3) { setOpened((x) => Math.min(N, x + 1)); push({ icon: "👀", who: o.name, text: "Email opened" }); }
      else if (r < 0.55) { push({ icon: "🤖", who: o.name, text: FOLLOWUP_LINES[Math.floor(Math.random() * FOLLOWUP_LINES.length)] }); }
      else if (r < 0.72) { setComments((x) => x + 1); push({ icon: "📝", who: o.jurisdiction, text: "Public comment submitted for next meeting" }); }
      else {
        const ro = pool[Math.floor(Math.random() * pool.length)];
        const rep = replyFor(ro, j);
        const ev = { icon: "💬", who: ro.name, text: rep.text, tag: rep.s };
        push({ ...ev, text: `Replied — ${rep.s.toLowerCase()}` });
        setReplies((rs) => [{ ...ev, id: evId.current++, t: now }, ...rs].slice(0, 40));
      }
    };

    const schedule = () => { timer = setTimeout(() => { step(); schedule(); }, nextDelay()); };
    schedule();
    return () => clearTimeout(timer);
  }, [targets, N, callTotal, pool]);

  const sup = replies.filter((r) => r.tag === "Supportive").length;
  const non = replies.filter((r) => r.tag === "Noncommittal").length;
  const opp = replies.filter((r) => r.tag === "Opposed").length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="display text-[36px] text-ink">Campaign live</h2>
        <span className="flex items-center gap-1.5 rounded-full border-2 border-ink bg-coral px-2.5 py-1 font-mono text-[11px] font-bold text-ink shadow-[2px_2px_0_#14231a]"><span className="h-2 w-2 animate-pulse rounded-full bg-ink" />LIVE</span>
      </div>

      <div className="sticker space-y-3.5 p-3.5">
        <Progress label="✉️ Emails sent" v={emails} max={N} />
        <Progress label="👀 Opened" v={opened} max={N} />
        <Progress label="📞 Office calls" v={calls} max={callTotal} />
        <Progress label="📝 Public comments" v={comments} max={Math.max(6, comments)} />
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <Stat n={sup} label="Supportive" cls="text-good" />
        <Stat n={non} label="Noncommittal" cls="text-ink" />
        <Stat n={opp} label="Opposed" cls="text-bad" />
      </div>

      <div className="flex rounded-full border-[2.5px] border-ink bg-paper p-1 text-sm">
        {(["feed", "replies"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 rounded-full py-1.5 font-extrabold ${tab === t ? "bg-ink text-sun" : "text-sage"}`}>
            {t === "feed" ? "Activity" : `Inbox (${replies.length})`}
          </button>
        ))}
      </div>

      {tab === "feed" ? (
        <ul className="space-y-2.5">
          {feed.map((e) => (
            <li key={e.id} className="sticker animate-[fadein_.3s_ease-out] p-2.5">
              <div className="flex items-start gap-2">
                <span className="text-base leading-5">{e.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-2"><span className="truncate text-[13px] font-extrabold text-ink">{e.who}</span><span className="shrink-0 font-mono text-[10px] text-sage">{e.t}</span></div>
                  <div className="text-[13px] text-sage">{e.text}</div>
                  {e.sub && <div className="mt-1.5 rounded-lg bg-sun-soft px-2 py-1 text-[12px] italic text-ink/80">{e.sub}</div>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="space-y-2.5">
          {replies.length === 0 && <li className="py-6 text-center font-mono text-sm text-sage">Waiting for replies…</li>}
          {replies.map((r) => (
            <li key={r.id} className="sticker p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-[13px] font-extrabold text-ink">{r.who}</span>
                {r.tag && <span className={`shrink-0 rounded-full border-[1.5px] border-ink px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${sentStyle[r.tag]}`}>{r.tag}</span>}
              </div>
              <p className="mt-1 text-[13px] text-ink">&ldquo;{r.text}&rdquo;</p>
              <div className="mt-1 font-mono text-[10px] text-sage">{r.t} · simulated</div>
            </li>
          ))}
        </ul>
      )}
      {gold && <GoldModal ev={gold} onView={() => { setGold(null); setTab("replies"); }} onClose={() => setGold(null)} />}
      {win && mayor && <WinModal ev={win} mayor={mayor} onView={() => { setWin(null); setTab("replies"); }} onClose={() => setWin(null)} />}
    </div>
  );
}

const CONFETTI_COLORS = ["#ffd23f", "#0d5c3a", "#ff5a5f", "#14231a", "#ffffff", "#7fd1a6"];

function WinModal({ ev, mayor, onView, onClose }: { ev: Ev; mayor: Official; onView: () => void; onClose: () => void }) {
  const pieces = useMemo(() => Array.from({ length: 80 }, (_, i) => ({
    left: Math.random() * 100,
    delay: Math.random() * 0.6,
    dur: 2.2 + Math.random() * 1.6,
    size: 6 + Math.random() * 6,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    rot: Math.random() * 360,
    round: i % 3 === 0,
  })), []);
  const label = mayor.name.includes("Mayor") ? "The Mayor" : `Mayor ${mayor.name.split(" ").slice(-1)[0]}`;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 px-6" onClick={onClose}>
      <div className="pointer-events-none fixed inset-0 z-10 overflow-hidden">
        {pieces.map((c, i) => (
          <span key={i} className="absolute top-[-20px] block" style={{
            left: `${c.left}%`, width: c.size, height: c.round ? c.size : c.size * 0.45, background: c.color,
            borderRadius: c.round ? "9999px" : "2px", transform: `rotate(${c.rot}deg)`,
            animation: `confetti ${c.dur}s ${c.delay}s cubic-bezier(.2,.6,.4,1) forwards`,
          }} />
        ))}
      </div>
      <div className="relative w-full max-w-sm animate-[pop_.45s_cubic-bezier(.2,1.4,.4,1)] rounded-3xl border-[3px] border-ink bg-cream p-6 text-center shadow-[6px_6px_0_#14231a]" onClick={(e) => e.stopPropagation()}>
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 -rotate-3 rounded-full border-[2.5px] border-ink bg-coral px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-widest text-ink">Big win</div>
        <div className="text-4xl">🎉</div>
        <div className="display mt-2 text-[30px] text-ink">Wow! <span className="text-pine">{label}</span> said they&apos;re supportive!</div>
        <div className="mt-4 flex items-center justify-center gap-3">
          <Avatar name={mayor.name} />
          <div className="text-left">
            <div className="text-sm font-extrabold text-ink">{mayor.name}</div>
            <div className="text-xs text-sage">{mayor.title}</div>
          </div>
        </div>
        <p className="sticker-sel mt-4 p-3 text-left text-[14px] font-medium leading-relaxed text-ink">&ldquo;{ev.text}&rdquo;</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2 text-[11px] font-bold">
          <span className="whitespace-nowrap rounded-full border-2 border-ink bg-paper px-2 py-1 text-ink">📅 Meeting requested</span>
          <span className="whitespace-nowrap rounded-full border-2 border-ink bg-paper px-2 py-1 text-ink">🏛️ Council agenda</span>
        </div>
        <button onClick={onView} className="press mt-5 w-full rounded-[14px] border-[2.5px] border-ink bg-pine py-3 font-display text-[20px] uppercase tracking-wide text-sun shadow-[4px_4px_0_#14231a]">View reply</button>
        <button onClick={onClose} className="mt-2 w-full py-2 text-sm font-bold text-sage">Keep the campaign going</button>
      </div>
    </div>
  );
}

const GOLD = ["#f5d061", "#d4af37", "#b8860b", "#fff4c2", "#c8102e", "#0a3161"];

function GoldModal({ ev, onView, onClose }: { ev: Ev; onView: () => void; onClose: () => void }) {
  const pieces = useMemo(() => Array.from({ length: 120 }, (_, i) => ({
    left: Math.random() * 100, delay: Math.random() * 0.8, dur: 2.4 + Math.random() * 2,
    size: 7 + Math.random() * 7, color: GOLD[i % GOLD.length], rot: Math.random() * 360, star: i % 6 === 0,
  })), []);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-5" onClick={onClose}>
      <div className="pointer-events-none fixed inset-0 z-10 overflow-hidden">
        {pieces.map((c, i) => c.star ? (
          <span key={i} className="absolute top-[-24px] block text-lg" style={{ left: `${c.left}%`, color: "#f5d061", animation: `confetti ${c.dur}s ${c.delay}s cubic-bezier(.2,.6,.4,1) forwards` }}>★</span>
        ) : (
          <span key={i} className="absolute top-[-20px] block" style={{
            left: `${c.left}%`, width: c.size, height: c.size * 0.45, background: c.color, borderRadius: "2px",
            transform: `rotate(${c.rot}deg)`, animation: `confetti ${c.dur}s ${c.delay}s cubic-bezier(.2,.6,.4,1) forwards`,
          }} />
        ))}
      </div>
      <div className="relative w-full max-w-sm animate-[pop_.5s_cubic-bezier(.2,1.5,.4,1)] rounded-3xl p-[3px] shadow-[0_0_60px_rgba(212,175,55,.6)]"
        style={{ background: "linear-gradient(135deg,#fff4c2,#d4af37 30%,#8a6d1d 50%,#f5d061 70%,#b8860b)" }}
        onClick={(e) => e.stopPropagation()}>
        <div className="rounded-[22px] bg-[#0b1a33] p-6 text-center">
          <div className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#d4af37]">★ ★ ★ Breaking ★ ★ ★</div>
          <div className="mt-3 font-serif text-[28px] font-black uppercase leading-tight tracking-tight"
            style={{ background: "linear-gradient(180deg,#fff4c2,#f5d061 40%,#b8860b)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
            The President<br />says YES!
          </div>
          <div className="mt-4 flex items-center justify-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full font-serif text-sm font-black text-[#0b1a33] ring-2 ring-[#f5d061]"
              style={{ background: "linear-gradient(135deg,#fff4c2,#d4af37,#b8860b)" }}>DJT</div>
            <div className="text-left">
              <div className="text-sm font-bold text-white">Donald J. Trump</div>
              <div className="text-xs text-[#d4af37]">President of the United States</div>
            </div>
          </div>
          <p className="mt-4 rounded-2xl border border-[#d4af37]/40 bg-white/5 p-4 text-left font-serif text-[16px] font-semibold leading-relaxed text-[#fff4c2]">&ldquo;{ev.text}&rdquo;</p>
          <div className="mt-3 flex justify-center gap-2 text-[11px] font-bold">
            <span className="rounded-full bg-[#d4af37]/15 px-2 py-1 text-[#f5d061]">🇺🇸 Federal attention</span>
            <span className="rounded-full bg-[#d4af37]/15 px-2 py-1 text-[#f5d061]">🏗️ Build, baby, build</span>
          </div>
          <button onClick={onView} className="mt-5 w-full rounded-xl py-3 text-[15px] font-black uppercase tracking-wide text-[#0b1a33] active:opacity-90"
            style={{ background: "linear-gradient(180deg,#fff4c2,#f5d061 40%,#d4af37 70%,#b8860b)" }}>Tremendous. View reply</button>
          <button onClick={onClose} className="mt-2 w-full py-2 text-sm font-medium text-[#d4af37]/80">Keep the campaign going</button>
          <div className="mt-1 text-[10px] text-white/40">Parody · simulated reply</div>
        </div>
      </div>
    </div>
  );
}

function Progress({ label, v, max }: { label: string; v: number; max: number }) {
  const pct = max ? Math.min(100, (v / max) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-[13px] font-bold text-ink"><span>{label}</span><span className="font-mono tabular-nums">{v}/{max}</span></div>
      <div className="mt-1.5 h-4 overflow-hidden rounded-full border-2 border-ink bg-mist">
        <div className={`h-full rounded-full bg-sun transition-all duration-700 ${pct > 0 ? "border-r-2 border-ink" : ""}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Stat({ n, label, cls }: { n: number; label: string; cls: string }) {
  return (
    <div className="sticker p-2 text-center">
      <div className={`font-display text-[34px] leading-tight tabular-nums ${cls}`}>{n}</div>
      <div className="text-[11px] text-sage">{label}</div>
    </div>
  );
}
