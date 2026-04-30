// onboarding.jsx — O-02 8-step onboarding flow + WhatsApp brief chat surface

const { useState: useStateO } = React;

function Onboarding({ onDone, initialStep = 1 }) {
  const [step, setStep] = useStateO(initialStep);
  const [data, setData] = useStateO({
    group: 'The Forge Group',
    tz: 'Europe/London',
    phone: '+44 7700 900123',
    booking: 'ResDiary',
    pos: 'Square',
    voice: 'warm',
  });

  const set = (k, v) => setData(d => ({ ...d, [k]: v }));
  const next = () => setStep(s => Math.min(8, s+1));
  const prev = () => setStep(s => Math.max(1, s-1));

  return (
    <div className="screen-root paper-grain">
      {/* Header */}
      <div style={{ padding: '14px 20px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <window.AgentsyMark size={26}/>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 16 }}>Agentsy</div>
        <div style={{ marginLeft: 'auto', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-3)' }}>Step {step} of 8</div>
      </div>
      <div style={{ padding: '0 20px 16px' }}>
        <div className="steps">
          {Array.from({length: 8}).map((_, i) => (
            <div key={i} className={'step ' + (i+1 < step ? 'done' : i+1 === step ? 'active' : '')} />
          ))}
        </div>
      </div>

      <div className="scroll" style={{ flex: 1, padding: '0 20px 16px' }}>
        {step === 1 && <Step1 onNext={next}/>}
        {step === 2 && <Step2 data={data} set={set}/>}
        {step === 3 && <Step3/>}
        {step === 4 && <Step4 data={data} set={set}/>}
        {step === 5 && <Step5 data={data} set={set}/>}
        {step === 6 && <Step6/>}
        {step === 7 && <Step7/>}
        {step === 8 && <Step8 data={data} set={set} onFinish={onDone}/>}
      </div>

      {/* Sticky CTA */}
      <div style={{ padding: '12px 20px 22px', borderTop: '1px solid var(--rule)', display: 'flex', gap: 8, background: 'var(--card-2)' }}>
        {step > 1 && <button className="btn btn-ghost" onClick={prev} style={{ flex: '0 0 auto' }}>Back</button>}
        {step < 8 ? (
          <button className="btn btn-terracotta" onClick={next} style={{ flex: 1 }}>
            {step === 1 ? "Let's go" : 'Continue'}
          </button>
        ) : (
          <button className="btn btn-terracotta" onClick={onDone} style={{ flex: 1 }}>
            <window.Icon.Sparkle s={14} c="#fff"/> Train and finish setup
          </button>
        )}
      </div>
    </div>
  );
}

function StepHeader({ eyebrow, title, sub }) {
  return (
    <div style={{ marginTop: 8, marginBottom: 22 }}>
      <div className="eyebrow" style={{ marginBottom: 6 }}>{eyebrow}</div>
      <div style={{ fontFamily: 'var(--serif)', fontSize: 30, lineHeight: 1.1, letterSpacing: '-0.01em' }}>{title}</div>
      {sub && <div style={{ fontSize: 14, color: 'var(--ink-3)', marginTop: 8, lineHeight: 1.5 }}>{sub}</div>}
    </div>
  );
}

function Step1() {
  return (
    <div>
      <StepHeader eyebrow="Welcome" title={<>Your back office,<br/><span className="serif-i">while you run the floor.</span></>} sub="Eight steps. About 30 minutes. By the last one I'll have a draft review reply waiting for you."/>
      <div className="card" style={{ padding: 16, background: 'var(--card-2)' }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>What you'll connect</div>
        {[
          ['Bookings', 'ResDiary, Collins, OpenTable…'],
          ['POS (optional)', 'Square, Lightspeed, Toast'],
          ['Google Business Profile', 'so I can reply to reviews in your voice'],
          ['WhatsApp', 'so I can send you the morning brief'],
        ].map(([k, v], i, a) => (
          <div key={k} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: i<a.length-1 ? '1px solid var(--rule)' : 'none' }}>
            <window.Icon.Check s={16} c="var(--sage)"/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>{k}</div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>{v}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Step2({ data, set }) {
  return (
    <div>
      <StepHeader eyebrow="Step 2 · Group" title="Tell me about your group." sub="Two minutes, then we're moving."/>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="field"><label>Group name</label><input className="input" value={data.group} onChange={e => set('group', e.target.value)}/></div>
        <div className="field"><label>Time zone</label>
          <select className="select" value={data.tz} onChange={e => set('tz', e.target.value)}>
            <option>Europe/London</option><option>Europe/Dublin</option><option>Europe/Paris</option>
          </select>
        </div>
        <div className="field"><label>Where should I send your daily brief? <span style={{ color: 'var(--ink-3)', fontWeight: 400 }}>(your WhatsApp)</span></label>
          <input className="input" value={data.phone} onChange={e => set('phone', e.target.value)}/>
        </div>
      </div>
    </div>
  );
}

function Step3() {
  const [sites, setSites] = useStateO([
    { name: 'Hackney',     addr: '142 Mare St, London E8',         gbp: 'verified' },
    { name: "King's Cross", addr: '14 Caledonian Rd, London N1',     gbp: 'verified' },
    { name: 'Peckham',     addr: '57 Rye Lane, London SE15',       gbp: 'pending' },
  ]);
  return (
    <div>
      <StepHeader eyebrow="Step 3 · Sites" title="Add your sites." sub="I'll match each to a Google Business Profile so I can read reviews."/>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sites.map((s, i) => (
          <div key={i} className="card" style={{ padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <window.Icon.Building s={20} c="var(--ink-3)"/>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{s.name}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{s.addr}</div>
              </div>
              {s.gbp === 'verified'
                ? <span className="chip chip-sage"><window.Icon.Check s={11}/> GBP matched</span>
                : <span className="chip chip-amber">Match GBP</span>}
            </div>
          </div>
        ))}
        <button className="card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 10, border: '1px dashed var(--rule-2)', background: 'transparent', cursor: 'pointer' }}>
          <window.Icon.Plus s={18}/>
          <span style={{ fontSize: 14, fontWeight: 500 }}>Add another site</span>
        </button>
      </div>
    </div>
  );
}

function Step4({ data, set }) {
  const providers = [
    { id: 'ResDiary', auth: 'OAuth · 2 min', detail: "I'll pull bookings, guests and dietary notes." },
    { id: 'Access Collins', auth: 'API key · 5 min', detail: 'Bookings, guests, payments and deposits.' },
    { id: 'OpenTable', auth: 'Email export · daily', detail: 'Limited per OpenTable T&Cs — daily import.' },
    { id: 'SevenRooms', auth: 'OAuth · partner programme', detail: "Bookings, guest profiles, tags." },
    { id: 'Eat App', auth: 'API key · 5 min', detail: 'Bookings, guests, dietary, tags.' },
    { id: 'Other', auth: 'CSV upload', detail: "We'll figure it out." },
  ];
  return (
    <div>
      <StepHeader eyebrow="Step 4 · Bookings" title="Where do bookings live today?" sub="Pick one. I'll pull guests, bookings and history."/>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {providers.map(p => (
          <div key={p.id} onClick={() => set('booking', p.id)} className={'radio-card' + (data.booking === p.id ? ' selected' : '')}>
            <div className="ring"/>
            <window.ProviderMark name={p.id} size={32}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{p.id}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{p.auth}</div>
            </div>
          </div>
        ))}
      </div>
      {data.booking && (
        <div className="card fade-up" style={{ padding: 14, marginTop: 14, background: 'var(--card-2)' }}>
          <div className="eyebrow" style={{ marginBottom: 6 }}>Test connection</div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 10 }}>Once connected, I'll show your 3 most recent bookings here as proof.</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {['Tonight 19:30 · Park / Anniversary · 4', 'Tonight 19:00 · Mehta · 3 (allergy)', 'Tomorrow 12:30 · Kelly · 2'].map(t => (
              <div key={t} style={{ fontSize: 12.5, fontFamily: 'var(--mono)', color: 'var(--ink-3)' }}>· {t}</div>
            ))}
          </div>
        </div>
      )}
      <button style={{ marginTop: 16, background: 'none', border: 'none', color: 'var(--ink-3)', fontSize: 13, cursor: 'pointer' }}>← I'll do this later</button>
    </div>
  );
}

function Step5({ data, set }) {
  const providers = [
    { id: 'Square', auth: 'OAuth · 60 seconds' },
    { id: 'Lightspeed', auth: 'OAuth · K-Series' },
    { id: 'Toast', auth: 'OAuth · US-leaning' },
    { id: 'Other', auth: 'Skip — spend stats stay blank' },
  ];
  return (
    <div>
      <StepHeader eyebrow="Step 5 · POS (optional)" title="Where do payments land?" sub="Skip if your till's old. POS only adds spend data."/>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {providers.map(p => (
          <div key={p.id} onClick={() => set('pos', p.id)} className={'radio-card' + (data.pos === p.id ? ' selected' : '')}>
            <div className="ring"/>
            <window.ProviderMark name={p.id} size={32}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{p.id}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{p.auth}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Step6() {
  return (
    <div>
      <StepHeader eyebrow="Step 6 · Reviews" title="Connect Google Business Profile." sub="One per site, so I can reply in your voice. We never auto-post until you say so."/>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { name: 'Hackney', status: 'connected' },
          { name: "King's Cross", status: 'connected' },
          { name: 'Peckham', status: 'verify' },
        ].map(s => (
          <div key={s.name} className="card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
            <window.ProviderMark name="Google Business Profile" size={32}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{s.name}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>Reply to reviews · read performance</div>
            </div>
            {s.status === 'connected'
              ? <span className="chip chip-sage"><window.Icon.Check s={11}/> Connected</span>
              : <button className="btn btn-terracotta" style={{ padding: '7px 12px', fontSize: 12.5 }}>Verify</button>}
          </div>
        ))}
      </div>
    </div>
  );
}

function Step7() {
  return (
    <div>
      <StepHeader eyebrow="Step 7 · WhatsApp" title="Hook up WhatsApp." sub="I'll handle the BSP wiring. Takes 1–5 days, but the rest of Agentsy works without it."/>
      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <window.ProviderMark name="WhatsApp" size={36}/>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>WhatsApp Business API</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>via 360dialog · UK pricing</div>
          </div>
          <span className="chip chip-amber">In review</span>
        </div>
        <div className="field">
          <label>Business phone for the brief</label>
          <input className="input" defaultValue="+44 7700 900123"/>
        </div>
        <div style={{ marginTop: 14, padding: 12, background: 'var(--paper-2)', borderRadius: 8, fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.5 }}>
          <span className="serif-i">While we wait — I'll send your brief by email until WhatsApp clears review.</span>
        </div>
      </div>
      <div style={{ marginTop: 14 }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Templates I'll pre-submit for approval</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {['booking_confirmation','booking_reminder_24h','no_show_check','post_visit_thanks','win_back_60d','birthday','seasonal_push'].map(t => (
            <span key={t} className="chip" style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Step8({ data, set }) {
  return (
    <div>
      <StepHeader eyebrow="Step 8 · Voice" title="Train your voice." sub="I'll write in your voice — review replies, WhatsApp, captions. To do that, I need a few examples."/>

      <div className="eyebrow" style={{ marginBottom: 8 }}>Easiest</div>
      <div className="card" style={{ padding: 14, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
        <window.Icon.Sparkle s={16} c="var(--terracotta)"/>
        <div style={{ flex: 1, fontSize: 13.5 }}>Use my Google reviews + GBP replies <span style={{ color: 'var(--ink-3)' }}>(I'll fetch them — 184 found)</span></div>
        <span className="chip chip-sage"><window.Icon.Check s={11}/> Ready</span>
      </div>

      <div className="eyebrow" style={{ marginBottom: 8 }}>Better</div>
      <div className="card" style={{ padding: 14, marginBottom: 18 }}>
        <div style={{ fontSize: 13.5, fontWeight: 500, marginBottom: 8 }}>Paste 3 captions you've written</div>
        <textarea className="textarea" rows={3} placeholder="One caption per line…"/>
      </div>

      <div className="eyebrow" style={{ marginBottom: 8 }}>3 vibe questions</div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 8 }}>Pick the one that sounds most like you.</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['warm','cheeky','formal','plain-spoken'].map(v => (
            <button key={v} onClick={() => set('voice', v)} className={data.voice === v ? 'chip chip-terra' : 'chip'} style={{ border: 'none', cursor: 'pointer', padding: '7px 14px' }}>{v}</button>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 14, background: 'var(--terracotta-tint)', borderColor: 'rgba(184,95,58,0.2)' }}>
        <div className="eyebrow" style={{ color: 'var(--terracotta)', marginBottom: 6 }}>Time-to-value · what's next</div>
        <div style={{ fontSize: 13.5, lineHeight: 1.5, color: 'var(--ink)' }}>
          When you tap <b>Train and finish setup</b>, I'll show you a real past review of yours with a draft reply written in the voice we just learned. <span className="serif-i">That's the moment.</span>
        </div>
      </div>
    </div>
  );
}

// ── WhatsApp Brief surface (N-01) — generic chat UI ─────────
function WhatsAppBrief({ onOpenApp }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#075E54', color: '#fff' }}>
      {/* WhatsApp-ish header (generic) */}
      <div style={{ padding: '12px 14px 10px', display: 'flex', alignItems: 'center', gap: 10, background: '#075E54' }}>
        <window.Icon.ChevronLeft s={20} c="#fff"/>
        <div style={{ width: 38, height: 38, borderRadius: 999, background: '#f5f0e6', color: '#b85f3a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 18 }}>A</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 15 }}>Agentsy</div>
          <div style={{ fontSize: 11.5, opacity: 0.7 }}>online · last seen this morning</div>
        </div>
        <window.Icon.Phone s={18} c="#fff"/>
      </div>

      <div className="chat-bg scroll" style={{ flex: 1, padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ alignSelf: 'center', fontSize: 11, color: 'var(--ink-3)', background: 'rgba(255,255,255,0.7)', padding: '4px 10px', borderRadius: 4, marginBottom: 4 }}>Wed 30 Apr · 08:30</div>

        <div className="chat-bubble" style={{ maxWidth: '88%', whiteSpace: 'pre-line', lineHeight: 1.55 }}>
{`Morning Maya. Today across The Forge Group:

· 47 covers — Hackney 18, King's X 21, Peck 8
· 2 reviews need you (1 four-star, 1 two-star)
· 5 regulars I'd nudge today
· 1 social post drafted for Hackney
· ⚠ Square integration paused — fix needed`}
          <div className="chat-time">08:30</div>
        </div>

        <div className="chat-bubble" style={{ maxWidth: '88%' }}>
          Reply <b>YES</b> to send everything I've drafted, or tap to open: <span style={{ color: '#075E54', textDecoration: 'underline', cursor: 'pointer' }} onClick={onOpenApp}>forge.agentsy.app/today/0430</span>
          <div className="chat-time">08:30</div>
        </div>

        <div className="chat-bubble me" style={{ maxWidth: '40%' }}>
          YES
          <div className="chat-time">08:34 ✓✓</div>
        </div>

        <div className="chat-bubble" style={{ maxWidth: '78%' }}>
          On it. I'll let you know when each one lands.
          <div className="chat-time">08:34</div>
        </div>

        <div className="chat-bubble" style={{ maxWidth: '78%' }}>
          ✓ Sarah's reply posted to Google · Hackney<br/>
          ✓ Olu nudged · WhatsApp · awaiting reply
          <div className="chat-time">08:35</div>
        </div>
      </div>

      {/* compose bar */}
      <div style={{ padding: '8px 10px 14px', display: 'flex', alignItems: 'center', gap: 6, background: '#075E54' }}>
        <div style={{ flex: 1, background: '#fff', borderRadius: 999, padding: '8px 14px', fontSize: 13, color: 'var(--ink-3)' }}>Message</div>
        <div style={{ width: 38, height: 38, borderRadius: 999, background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <window.Icon.Phone s={16} c="#fff"/>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Onboarding, WhatsAppBrief });
