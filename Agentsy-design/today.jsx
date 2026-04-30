// today.jsx — S-01 Today (mobile). Hero of the product.

const { useState } = React;

function TodayMobile({ onNav }) {
  const F = window.FORGE;
  const [open, setOpen] = useState({ reviews: true, winbacks: false, social: false, anomalies: false });
  const [approved, setApproved] = useState({});
  const [skipped, setSkipped] = useState({});
  const [editing, setEditing] = useState(null);
  const [allClear, setAllClear] = useState(false);

  const reviewsLeft = F.reviews.filter(r => !approved[r.id] && !skipped[r.id]);
  const winbacksLeft = F.winbacks.filter(r => !approved[r.id] && !skipped[r.id]);
  const socialLeft = F.social.filter(r => !approved[r.id] && !skipped[r.id]);
  const remaining = reviewsLeft.length + winbacksLeft.length + socialLeft.length;

  const flash = (id) => {
    setApproved(a => ({...a, [id]: true}));
  };

  return (
    <div className="screen-root paper-grain">
      {/* Header */}
      <div style={{ padding: '14px 18px 10px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <window.AgentsyMark size={26}/>
        <div style={{ flex: 1 }}>
          <div className="eyebrow">{F.date} · The Forge Group</div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 22, lineHeight: 1.1, marginTop: 2 }}>Good morning, Maya.</div>
        </div>
        <button className="btn-soft" onClick={() => onNav('settings')} style={{ width: 36, height: 36, borderRadius: 999, border: 'none', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <window.Icon.Settings s={18}/>
        </button>
      </div>

      <div className="scroll" style={{ flex: 1, padding: '4px 0 12px' }}>
        {/* Hero */}
        <div style={{ padding: '0 18px 18px' }}>
          <div className="card" style={{ padding: '18px 18px 16px', background: 'var(--card-2)' }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Today's covers</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 14 }}>
              <span style={{ fontFamily: 'var(--serif)', fontSize: 56, lineHeight: 1, fontWeight: 400, fontVariantNumeric: 'tabular-nums' }}>{F.totalCovers}</span>
              <span style={{ color: 'var(--ink-3)', fontSize: 14 }}>across 3 sites</span>
            </div>
            <div style={{ display: 'flex', gap: 0, marginBottom: 16 }}>
              {F.sites.map((s,i) => (
                <div key={s.id} style={{ flex: 1, paddingRight: 10, borderRight: i<2 ? '1px solid var(--rule)' : 'none', paddingLeft: i>0 ? 10 : 0 }}>
                  <div style={{ fontSize: 20, fontFamily: 'var(--serif)', fontVariantNumeric: 'tabular-nums' }}>{s.covers}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 1 }}>{s.name}</div>
                </div>
              ))}
            </div>
            {!allClear ? (
              <button className="btn btn-terracotta" onClick={() => setAllClear(true)} style={{ width: '100%' }}>
                <window.Icon.Check s={17}/> Approve everything I've drafted
              </button>
            ) : (
              <div className="chip chip-sage" style={{ width: '100%', justifyContent: 'center', padding: '11px', fontSize: 13 }}>
                <window.Icon.Check s={15}/> Sent. Undo for 5 minutes.
              </div>
            )}
            <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 10, textAlign: 'center' }}>
              <span className="serif-i">Last refreshed 3 min ago — pull to refresh.</span>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <window.SectionHeader icon="reviews" title="Reviews to send" count={`${reviewsLeft.length} of ${F.reviews.length}`} expanded={open.reviews} onClick={() => setOpen(o=>({...o, reviews: !o.reviews}))}/>
        {open.reviews && <div style={{ padding: '4px 14px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {F.reviews.map(r => {
            const isApproved = approved[r.id];
            const isSkipped = skipped[r.id];
            if (isSkipped) return null;
            return (
              <div key={r.id} className={"card fade-up" + (isApproved ? ' approve-flash' : '')} style={{ padding: 14, opacity: isApproved ? 0.55 : 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <window.StarRow value={r.stars}/>
                  <span style={{ fontSize: 12.5, fontWeight: 600 }}>{r.author}</span>
                  <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>· {r.site} · {r.age}</span>
                  {r.flagged && <span className="chip chip-crimson" style={{ marginLeft: 'auto' }}>Soft start</span>}
                </div>
                <div style={{ fontSize: 13.5, color: 'var(--ink-2)', marginBottom: 10, lineHeight: 1.45 }}>"{r.excerpt}"</div>

                <div style={{ borderLeft: '2px solid var(--terracotta)', paddingLeft: 10, marginBottom: 10 }}>
                  <div className="eyebrow" style={{ marginBottom: 4, display:'flex', alignItems:'center', gap:5 }}>
                    <window.Icon.Sparkle s={11} c="var(--terracotta)"/> Draft reply
                  </div>
                  {editing === r.id ? (
                    <textarea className="textarea" defaultValue={r.draft} autoFocus style={{ fontSize: 13.5 }}/>
                  ) : (
                    <div style={{ fontSize: 13.5, lineHeight: 1.5 }}>{r.draft}</div>
                  )}
                </div>

                {!isApproved && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn-soft" style={{ flex: 1, border: 'none', padding: '9px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500, display:'flex', alignItems:'center', justifyContent:'center', gap:5 }} onClick={() => setEditing(editing === r.id ? null : r.id)}>
                      <window.Icon.Edit s={14}/> {editing === r.id ? 'Done' : 'Edit'}
                    </button>
                    <button className="btn-terracotta" style={{ flex: 1.4, border: 'none', padding: '9px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500, color: '#fff', background:'var(--terracotta)', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }} onClick={() => flash(r.id)}>
                      <window.Icon.Check s={14}/> Approve
                    </button>
                    <button className="btn-soft" style={{ flex: 1, border: 'none', padding: '9px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500 }} onClick={() => setSkipped(s=>({...s, [r.id]: true}))}>
                      Skip
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>}

        {/* Win-backs */}
        <window.SectionHeader title="Regulars I'd nudge today" count={`${winbacksLeft.length} of ${F.winbacks.length}`} expanded={open.winbacks} onClick={() => setOpen(o=>({...o, winbacks: !o.winbacks}))}/>
        {open.winbacks && <div style={{ padding: '4px 14px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {F.winbacks.map(w => {
            if (skipped[w.id]) return null;
            const ok = approved[w.id];
            return (
              <div key={w.id} className={"card fade-up" + (ok ? ' approve-flash' : '')} style={{ padding: 14, opacity: ok ? 0.55 : 1 }}>
                <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom: 8 }}>
                  <div className="avatar">{w.name[0]}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{w.name}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{w.site} · last seen {w.last}</div>
                  </div>
                  <span className="chip">{w.tag}</span>
                </div>
                <div style={{ borderLeft: '2px solid var(--terracotta)', paddingLeft: 10, marginBottom: 10, fontSize: 13.5, lineHeight: 1.5 }}>
                  {w.draft}
                </div>
                {!ok && (
                  <div style={{ display:'flex', gap:6 }}>
                    <button className="btn-soft" style={{ flex:1, border:'none', padding: '9px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500 }}>Edit</button>
                    <button style={{ flex:1.4, border:'none', padding: '9px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500, color: '#fff', background:'var(--terracotta)' }} onClick={() => flash(w.id)}>Send WhatsApp</button>
                    <button className="btn-soft" style={{ flex:1, border:'none', padding: '9px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500 }} onClick={() => setSkipped(s=>({...s, [w.id]: true}))}>Skip</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>}

        {/* Social */}
        <window.SectionHeader title="Social posts drafted" count={socialLeft.length} expanded={open.social} onClick={() => setOpen(o=>({...o, social: !o.social}))}/>
        {open.social && <div style={{ padding: '4px 14px 14px' }}>
          {F.social.map(s => (
            <div key={s.id} className="card" style={{ padding: 14 }}>
              <div style={{ display:'flex', gap:10, marginBottom: 10 }}>
                <div className="placeholder-img" style={{ width: 86, height: 86, fontSize: 9 }}>IG photo<br/>· lamb shot ·</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{s.kind} · {s.site}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>Phase 2 · I'll show you the draft, you copy & paste</div>
                </div>
              </div>
              <div style={{ borderLeft: '2px solid var(--terracotta)', paddingLeft: 10, fontSize: 13.5, lineHeight: 1.5 }}>{s.draft}</div>
            </div>
          ))}
        </div>}

        {/* Anomalies */}
        <window.SectionHeader title="Anomalies" count={F.anomalies.length} expanded={open.anomalies} onClick={() => setOpen(o=>({...o, anomalies: !o.anomalies}))}/>
        {open.anomalies && <div style={{ padding: '4px 14px 14px' }}>
          {F.anomalies.map(a => (
            <div key={a.id} className="card" style={{ padding: 14, background: 'var(--crimson-tint)', borderColor: 'rgba(162, 58, 46, 0.2)' }}>
              <div style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom: 6 }}>
                <window.Icon.AlertTriangle s={18} c="var(--crimson)"/>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--crimson)' }}>{a.label}</div>
                  <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 4, lineHeight: 1.4 }}>{a.detail}</div>
                </div>
              </div>
              <button className="btn-terracotta" style={{ marginTop: 4, padding: '8px 14px', fontSize: 13, borderRadius: 8, border: 'none', color: '#fff', background:'var(--terracotta)' }} onClick={() => onNav('sites')}>Reconnect Square</button>
            </div>
          ))}
        </div>}

        <div style={{ height: 24 }}/>
      </div>

      {/* Bottom tab bar */}
      <BottomTabs active="today" onNav={onNav}/>
    </div>
  );
}

function BottomTabs({ active, onNav }) {
  const tab = (id, label, IconComp) => (
    <button className={active===id?'active':''} onClick={() => onNav(id)}>
      <IconComp s={20} w={1.6}/>
      <span>{label}</span>
    </button>
  );
  return (
    <div className="tabbar">
      {tab('today', 'Today', window.Icon.Home)}
      {tab('guests', 'Guests', window.Icon.Users)}
      {tab('reviews', 'Reviews', window.Icon.Star)}
      {tab('inbox', 'Inbox', window.Icon.Inbox)}
      {tab('more', 'More', window.Icon.More)}
    </div>
  );
}

Object.assign(window, { TodayMobile, BottomTabs });
