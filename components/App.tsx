"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AGENDA, COUNTIES, PERSONAS, TIERS, CALL_SNIPPETS, FOLLOWUP_LINES,
  type Official, type PersonaId, type Sentiment,
  getOfficials, priority, draftEmail, callScript, replyFor,
} from "@/lib/data";

type Step = "setup" | "scan" | "map" | "campaign" | "console";

export default function App() {
  const [step, setStep] = useState<Step>("setup");
  const [county, setCounty] = useState(COUNTIES[0]);
  const [persona, setPersona] = useState<PersonaId>("renter");
  const { officials, seeded } = useMemo(() => getOfficials(county), [county]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSelected(new Set(officials.map((o) => o.id)));
  }, [officials]);

  const targets = officials.filter((o) => selected.has(o.id)).sort((a, b) => priority(b) - priority(a));

  return (
    <div className="min-h-dvh bg-slate-100">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-white shadow-sm">
        <Header step={step} onReset={() => setStep("setup")} />
        <main className="flex-1 px-4 pb-28 pt-4">
          {step === "setup" && (
            <Setup county={county} setCounty={setCounty} persona={persona} setPersona={setPersona} onGo={() => setStep("scan")} />
          )}
          {step === "scan" && <Scan county={county} count={officials.length} onDone={() => setStep("map")} />}
          {step === "map" && (
            <PowerMap
              officials={officials} seeded={seeded} county={county} selected={selected}
              toggle={(id) => setSelected((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; })}
              onNext={() => setStep("campaign")}
            />
          )}
          {step === "campaign" && <Campaign targets={targets} persona={persona} onLaunch={() => setStep("console")} />}
          {step === "console" && <Console targets={targets} />}
        </main>
        <footer className="px-4 pb-6 text-center text-[11px] leading-snug text-slate-400">
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

function Header({ step, onReset }: { step: Step; onReset: () => void }) {
  const idx = STEPS.findIndex((s) => s.id === (step === "scan" ? "setup" : step));
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 pb-3 pt-4 backdrop-blur">
      <div className="flex items-center justify-between">
        <button onClick={onReset} className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-700 text-sm font-bold text-white">BB</span>
          <span className="text-left">
            <span className="block text-[15px] font-semibold leading-tight text-slate-900">Build Baby Build</span>
            <span className="block text-[11px] leading-tight text-slate-500">Your autonomous housing lobbyist</span>
          </span>
        </button>
        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">● Agent ready</span>
      </div>
      <div className="mt-3 flex gap-1.5">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex-1">
            <div className={`h-1 rounded-full ${i <= idx ? "bg-blue-700" : "bg-slate-200"}`} />
            <div className={`mt-1 text-[10px] font-medium ${i <= idx ? "text-blue-700" : "text-slate-400"}`}>{s.label}</div>
          </div>
        ))}
      </div>
    </header>
  );
}

/* ---------------- Shared ---------------- */

function PrimaryButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md border-t border-slate-200 bg-white/95 px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
      <button onClick={onClick} className="w-full rounded-xl bg-blue-700 py-3.5 text-[15px] font-semibold text-white shadow-sm active:bg-blue-800">
        {children}
      </button>
    </div>
  );
}

const stanceStyle: Record<string, string> = {
  Champion: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Persuadable: "bg-amber-50 text-amber-700 ring-amber-200",
  Skeptic: "bg-rose-50 text-rose-700 ring-rose-200",
};
const sentStyle: Record<Sentiment, string> = {
  Supportive: "bg-emerald-50 text-emerald-700",
  Noncommittal: "bg-slate-100 text-slate-600",
  Opposed: "bg-rose-50 text-rose-700",
};

function Pill({ s }: { s: string }) {
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${stanceStyle[s]}`}>{s}</span>;
}

/* ---------------- Setup ---------------- */

function Setup(p: { county: string; setCounty: (c: string) => void; persona: PersonaId; setPersona: (x: PersonaId) => void; onGo: () => void }) {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Developers have lobbyists.<br />Now renters do too.</h1>
        <p className="mt-2 text-sm text-slate-600">Pick a county and an agenda. The agent finds everyone with power over housing and runs a personalized outreach campaign.</p>
      </div>

      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">County</span>
        <select value={p.county} onChange={(e) => p.setCounty(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-[15px] text-slate-900">
          {COUNTIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </label>

      <div>
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Agenda</span>
        <div className="mt-1.5 flex items-center gap-3 rounded-xl border-2 border-blue-700 bg-blue-50 px-3 py-3">
          <span className="text-xl">🏗️</span>
          <div>
            <div className="text-[15px] font-semibold text-slate-900">{AGENDA}</div>
            <div className="text-xs text-slate-600">More homes, faster approvals, lower rents</div>
          </div>
        </div>
      </div>

      <div>
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">I&apos;m lobbying as</span>
        <div className="mt-1.5 grid gap-2">
          {PERSONAS.map((x) => (
            <button key={x.id} onClick={() => p.setPersona(x.id)}
              className={`rounded-xl border px-3 py-3 text-left text-[15px] ${p.persona === x.id ? "border-blue-700 bg-blue-50 font-semibold text-blue-900" : "border-slate-300 text-slate-700"}`}>
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
      <div className="mx-auto mb-6 h-14 w-14 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />
      <ul className="space-y-2">
        {lines.slice(0, n).map((l, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
            <span className="text-emerald-600">✓</span>{l}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------- Power Map ---------------- */

function PowerMap(p: { officials: Official[]; seeded: boolean; county: string; selected: Set<string>; toggle: (id: string) => void; onNext: () => void }) {
  const [open, setOpen] = useState<Official | null>(null);
  const counts = { Champion: 0, Persuadable: 0, Skeptic: 0 } as Record<string, number>;
  p.officials.forEach((o) => counts[o.stance]++);
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Power map</h2>
        <p className="text-sm text-slate-600">{p.officials.length} people with power over housing in {p.county.split(",")[0]}.</p>
        {!p.seeded && <p className="mt-1 rounded-lg bg-amber-50 px-2 py-1 text-xs text-amber-800">Generated roster — verified data available for Orange County.</p>}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {(["Champion", "Persuadable", "Skeptic"] as const).map((s) => (
          <div key={s} className={`rounded-xl p-2.5 text-center ring-1 ${stanceStyle[s]}`}>
            <div className="text-xl font-bold">{counts[s]}</div>
            <div className="text-[11px] font-medium">{s}s</div>
          </div>
        ))}
      </div>

      {TIERS.map((tier) => {
        const list = p.officials.filter((o) => o.tier === tier).sort((a, b) => priority(b) - priority(a));
        if (!list.length) return null;
        return (
          <section key={tier}>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{tier} · {list.length}</h3>
            <div className="space-y-2">
              {list.map((o) => (
                <div key={o.id} className={`flex items-center gap-3 rounded-xl border p-3 ${p.selected.has(o.id) ? "border-slate-200" : "border-slate-200 opacity-40"}`}>
                  <button onClick={() => setOpen(o)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                    <Avatar name={o.name} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[14px] font-semibold text-slate-900">{o.name}</div>
                      <div className="truncate text-xs text-slate-500">{o.title}</div>
                      <div className="mt-1 flex items-center gap-2"><Pill s={o.stance} /><span className="text-[11px] text-slate-500">Priority {priority(o)}</span></div>
                    </div>
                  </button>
                  <input type="checkbox" checked={p.selected.has(o.id)} onChange={() => p.toggle(o.id)} className="h-5 w-5 accent-blue-700" />
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {open && <Sheet o={open} onClose={() => setOpen(null)} />}
      <PrimaryButton onClick={p.onNext}>Draft campaign for {p.selected.size} targets →</PrimaryButton>
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(" ").filter((w) => /^[A-Z]/.test(w)).slice(0, 2).map((w) => w[0]).join("");
  const hue = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-xs font-bold text-white" style={{ background: `hsl(${hue} 45% 45%)` }}>
      {initials}
    </div>
  );
}

function Bar({ label, v }: { label: string; v: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-600"><span>{label}</span><span>{v}/10</span></div>
      <div className="mt-1 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-blue-700" style={{ width: `${v * 10}%` }} /></div>
    </div>
  );
}

function Sheet({ o, onClose }: { o: Official; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-slate-900/40" onClick={onClose}>
      <div className="w-full max-w-md rounded-t-2xl bg-white p-5 pb-8" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-300" />
        <div className="flex items-center gap-3">
          <Avatar name={o.name} />
          <div>
            <div className="text-lg font-bold text-slate-900">{o.name}</div>
            <div className="text-sm text-slate-500">{o.title} · {o.jurisdiction}</div>
          </div>
        </div>
        <div className="mt-3"><Pill s={o.stance} /></div>
        <div className="mt-4 space-y-3">
          <Bar label="Influence over housing" v={o.influence} />
          <Bar label="Persuadability" v={o.persuadability} />
        </div>
        <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm">
          <div className="text-xs font-semibold uppercase text-slate-500">Why they matter</div>
          <p className="mt-1 text-slate-800">{o.why}</p>
          <div className="mt-3 text-xs font-semibold uppercase text-slate-500">Angle</div>
          <p className="mt-1 text-slate-800">{o.hook}</p>
        </div>
        <button onClick={onClose} className="mt-4 w-full rounded-xl border border-slate-300 py-3 text-sm font-semibold text-slate-700">Close</button>
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

function Campaign({ targets, persona, onLaunch }: { targets: Official[]; persona: PersonaId; onLaunch: () => void }) {
  const [i, setI] = useState(0);
  const [tab, setTab] = useState<"email" | "call">("email");
  const o = targets[i];
  if (!o) return <p className="text-sm text-slate-600">No targets selected.</p>;
  const email = draftEmail(o, persona);
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Campaign drafts</h2>
        <p className="text-sm text-slate-600">{targets.length} personalized emails, {targets.length} call scripts, ranked by priority.</p>
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {targets.map((t, k) => (
          <button key={t.id} onClick={() => setI(k)} className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium ${k === i ? "border-blue-700 bg-blue-700 text-white" : "border-slate-300 text-slate-700"}`}>
            {t.name.split(" ").slice(-1)[0]}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200">
        <div className="flex items-center gap-3 border-b border-slate-200 p-3">
          <Avatar name={o.name} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-slate-900">{o.name}</div>
            <div className="truncate text-xs text-slate-500">{o.title}</div>
          </div>
          <Pill s={o.stance} />
        </div>
        <div className="flex border-b border-slate-200 text-sm">
          {(["email", "call"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 font-medium ${tab === t ? "border-b-2 border-blue-700 text-blue-700" : "text-slate-500"}`}>
              {t === "email" ? "✉️ Email" : "📞 Call script"}
            </button>
          ))}
        </div>
        <div className="p-3">
          {tab === "email" ? (
            <>
              <div className="text-xs text-slate-500">Subject</div>
              <div className="mb-2 text-sm font-semibold text-slate-900">{email.subject}</div>
              <pre className="whitespace-pre-wrap font-sans text-[13px] leading-relaxed text-slate-800"><Typewriter key={o.id + persona} text={email.body} /></pre>
            </>
          ) : (
            <p className="text-[13px] leading-relaxed text-slate-800"><Typewriter key={o.id + "call"} text={callScript(o)} /></p>
          )}
        </div>
      </div>

      <div className="rounded-xl bg-blue-50 p-3 text-xs text-blue-900">
        <b>Plan:</b> Email all targets → call top {Math.min(10, targets.length)} offices → auto follow-up on replies within 48h → draft public comments for next meetings.
      </div>

      <PrimaryButton onClick={onLaunch}>🚀 Launch campaign</PrimaryButton>
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

  useEffect(() => {
    const iv = setInterval(() => {
      const k = tick.current++;
      const now = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" });
      const push = (e: Omit<Ev, "id" | "t">) => setFeed((f) => [{ ...e, id: evId.current++, t: now }, ...f].slice(0, 60));
      const o = targets[k % N];
      if (!o) return;

      const E = Math.ceil(N / 3);
      if (k < E) {
        const batch = targets.slice(k * 3, k * 3 + 3);
        setEmails((x) => Math.min(N, x + batch.length));
        batch.forEach((b) => push({ icon: "✉️", who: b.name, text: "Personalized email delivered" }));
        return;
      }
      const j = k - E;
      if (j < callTotal * 2) {
        if (j % 2 === 0) {
          const c = targets[j / 2];
          setCalls((x) => x + 1);
          const vm = (j / 2) % 3 === 2;
          push({ icon: vm ? "📼" : "📞", who: c.name, text: vm ? "Voicemail left (0:42)" : `Call connected (${1 + (j % 3)}:${String(10 + j * 7 % 50).padStart(2, "0")})`, sub: vm ? undefined : CALL_SNIPPETS[(j / 2) % CALL_SNIPPETS.length] });
        } else {
          const r = targets[(j * 3) % N];
          setOpened((x) => Math.min(N, x + 2));
          const rep = replyFor(r, j);
          const ev = { icon: "💬", who: r.name, text: rep.text, tag: rep.s };
          push({ ...ev, text: `Replied — ${rep.s.toLowerCase()}` });
          setReplies((rs) => [{ ...ev, id: evId.current++, t: now }, ...rs]);
        }
        return;
      }
      // endless phase: follow-ups, opens, more replies, public comments
      const m = j % 4;
      if (m === 0) { setOpened((x) => Math.min(N, x + 1)); push({ icon: "👀", who: o.name, text: "Email opened" }); }
      else if (m === 1) { push({ icon: "🤖", who: o.name, text: FOLLOWUP_LINES[j % FOLLOWUP_LINES.length] }); }
      else if (m === 2) { setComments((x) => x + 1); push({ icon: "📝", who: o.jurisdiction, text: "Public comment submitted for next meeting" }); }
      else {
        const rep = replyFor(o, j);
        const ev = { icon: "💬", who: o.name, text: rep.text, tag: rep.s };
        push({ ...ev, text: `Replied — ${rep.s.toLowerCase()}` });
        setReplies((rs) => [{ ...ev, id: evId.current++, t: now }, ...rs].slice(0, 40));
      }
    }, 700);
    return () => clearInterval(iv);
  }, [targets, N, callTotal]);

  const sup = replies.filter((r) => r.tag === "Supportive").length;
  const non = replies.filter((r) => r.tag === "Noncommittal").length;
  const opp = replies.filter((r) => r.tag === "Opposed").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Campaign live</h2>
        <span className="flex items-center gap-1.5 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700"><span className="h-2 w-2 animate-pulse rounded-full bg-rose-600" />LIVE</span>
      </div>

      <div className="space-y-3 rounded-2xl border border-slate-200 p-3">
        <Progress label="✉️ Emails sent" v={emails} max={N} />
        <Progress label="👀 Opened" v={opened} max={N} />
        <Progress label="📞 Office calls" v={calls} max={callTotal} />
        <Progress label="📝 Public comments" v={comments} max={Math.max(6, comments)} />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Stat n={sup} label="Supportive" cls="text-emerald-700" />
        <Stat n={non} label="Noncommittal" cls="text-slate-700" />
        <Stat n={opp} label="Opposed" cls="text-rose-700" />
      </div>

      <div className="flex rounded-xl bg-slate-100 p-1 text-sm">
        {(["feed", "replies"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 rounded-lg py-1.5 font-medium ${tab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>
            {t === "feed" ? "Activity" : `Inbox (${replies.length})`}
          </button>
        ))}
      </div>

      {tab === "feed" ? (
        <ul className="space-y-2">
          {feed.map((e) => (
            <li key={e.id} className="animate-[fadein_.3s_ease-out] rounded-xl border border-slate-200 p-2.5">
              <div className="flex items-start gap-2">
                <span className="text-base leading-5">{e.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-2"><span className="truncate text-[13px] font-semibold text-slate-900">{e.who}</span><span className="shrink-0 text-[10px] text-slate-400">{e.t}</span></div>
                  <div className="text-[13px] text-slate-600">{e.text}</div>
                  {e.sub && <div className="mt-1 rounded-lg bg-slate-50 px-2 py-1 text-[12px] italic text-slate-600">{e.sub}</div>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="space-y-2">
          {replies.length === 0 && <li className="py-6 text-center text-sm text-slate-400">Waiting for replies…</li>}
          {replies.map((r) => (
            <li key={r.id} className="rounded-xl border border-slate-200 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-[13px] font-semibold text-slate-900">{r.who}</span>
                {r.tag && <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${sentStyle[r.tag]}`}>{r.tag}</span>}
              </div>
              <p className="mt-1 text-[13px] text-slate-700">&ldquo;{r.text}&rdquo;</p>
              <div className="mt-1 text-[10px] text-slate-400">{r.t} · simulated</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Progress({ label, v, max }: { label: string; v: number; max: number }) {
  const pct = max ? Math.min(100, (v / max) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs font-medium text-slate-700"><span>{label}</span><span className="tabular-nums">{v}/{max}</span></div>
      <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-blue-700 transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Stat({ n, label, cls }: { n: number; label: string; cls: string }) {
  return (
    <div className="rounded-xl border border-slate-200 p-2.5 text-center">
      <div className={`text-2xl font-bold tabular-nums ${cls}`}>{n}</div>
      <div className="text-[11px] text-slate-500">{label}</div>
    </div>
  );
}
