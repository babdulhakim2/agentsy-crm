// mobile-screens.jsx — Reviews, Guests, Guest detail, Inbox, More (mobile)

const { useState: uS } = React;

// ── Reviews (S-04) ─────────────────────────────────────────
function ReviewsMobile({ onNav }) {
  const F = window.FORGE;
  const [tab, setTab] = uS('needs');
  const [done, setDone] = uS({});

  const tabs = [
    { id: 'needs', label: 'Needs reply', count: F.reviews.filter(r => !done[r.id]).length },
    { id: 'sent',  label: 'Sent', count: 47 },
    { id: 'all',   label: 'All', count: 184 },
  ];

  return (
    <div className="screen-root paper-grain">
      <div style={{ padding: '14px 18px 6px' }}>
        <div className="eyebrow">Reviews</div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 28, lineHeight: 1.1, marginTop: 4 }}>Reply within 24h, in your voice.</div>
      </div>
      <div style={{ display:'flex', gap: 4, padding: '10px 14px 0', borderBottom: '1px solid var(--rule)' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            border: 'none', background: 'none', padding: '10px 14px', fontFamily: 'var(--sans)',
            fontSize: 13.5, fontWeight: 500,
            color: tab===t.id ? 'var(--ink)' : 'var(--ink-3)',
            borderBottom: tab===t.id ? '2px solid var(--terracotta)' : '2px solid transparent',
            marginBottom: -1, cursor: 'pointer',
          }}>{t.label} <span style={{ color: 'var(--ink-4)', marginLeft: 4 }}>{t.count}</span></button>
        ))}
      </div>

      <div className="scroll" style={{ flex: 1, padding: '14px' }}>
        {tab==='needs' && (
          <>
            <div style={{ display:'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
              <button className="chip" style={{ border:'none', cursor:'pointer' }}><window.Icon.Filter s={12}/> All sites</button>
              <button className="chip" style={{ border:'none', cursor:'pointer' }}>★ Any rating</button>
              <button className="chip" style={{ border:'none', cursor:'pointer' }}>Source · GBP</button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap: 12 }}>
              {F.reviews.filter(r => !done[r.id]).map(r => (
                <div key={r.id} className="card" style={{ padding: 14 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom: 6 }}>
                    <window.StarRow value={r.stars}/>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{r.author}</span>
                    <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>· {r.site} · {r.age}</span>
                    {r.flagged && <span className="chip chip-crimson" style={{ marginLeft: 'auto' }}>Take a beat</span>}
                  </div>
                  <div style={{ fontSize: 13.5, color: 'var(--ink-2)', marginBottom: 10, lineHeight: 1.45 }}>"{r.excerpt}"</div>
                  <div style={{ borderLeft: '2px solid var(--terracotta)', paddingLeft: 10, marginBottom: 10 }}>
                    <div className="eyebrow" style={{ marginBottom: 4, display:'flex', gap:5, alignItems:'center' }}>
                      <window.Icon.Sparkle s={11} c="var(--terracotta)"/> Draft · in your voice
                    </div>
                    <div style={{ fontSize: 13.5, lineHeight: 1.5 }}>{r.draft}</div>
                  </div>
                  <div style={{ display:'flex', gap: 6 }}>
                    <button className="btn-soft" style={{ flex:1, border:'none', padding: '9px', borderRadius: 8, fontSize: 13, fontWeight: 500 }}><window.Icon.Refresh s={13}/></button>
                    <button className="btn-soft" style={{ flex:1.5, border:'none', padding: '9px', borderRadius: 8, fontSize: 13, fontWeight: 500 }}>Edit</button>
                    <button style={{ flex:2, border:'none', padding: '9px', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff', background:'var(--terracotta)' }} onClick={() => setDone(d => ({...d, [r.id]: true}))}>Approve & post</button>
                  </div>
                </div>
              ))}
              {F.reviews.filter(r => !done[r.id]).length === 0 && (
                <div style={{ textAlign:'center', padding: '40px 20px', color: 'var(--ink-3)' }}>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 22, color:'var(--ink)', marginBottom: 6 }}>All clear.</div>
                  <div className="serif-i">No reviews waiting — last reply 47 minutes ago.</div>
                </div>
              )}
            </div>

            <div className="card" style={{ marginTop: 18, padding: 14, background: 'var(--card-2)' }}>
              <div style={{ display:'flex', alignItems:'flex-start', gap: 10 }}>
                <button className="toggle"></button>
                <div style={{ flex:1, fontSize: 13, lineHeight: 1.45 }}>
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>Auto-send replies to 4★ and 5★</div>
                  <div style={{ color: 'var(--ink-3)' }}>I'll switch this on for you after 30 days of high approval.</div>
                </div>
              </div>
            </div>
          </>
        )}

        {tab==='sent' && (
          <div style={{ display:'flex', flexDirection:'column', gap: 10 }}>
            {[
              { who: 'Iris M.', site: 'Hackney', stars: 5, age: '47m ago', txt: "Iris, thank you — couldn't agree more about the bread. Hope to see you again." },
              { who: 'Tom B.', site: 'Peckham', stars: 5, age: '3h ago', txt: "Tom — really kind of you to say. Pass our thanks to the team you came with." },
              { who: 'Anonymous', site: "King's Cross", stars: 4, age: 'yesterday', txt: "Thank you for the lovely note about the wine list. We'll keep it sharp." },
            ].map((s, i) => (
              <div key={i} className="card" style={{ padding: 12, opacity: 0.85 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                  <window.StarRow value={s.stars}/>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{s.who}</span>
                  <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>· {s.site}</span>
                  <span className="chip chip-sage" style={{ marginLeft:'auto' }}><window.Icon.Check s={11}/> Sent {s.age}</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>{s.txt}</div>
              </div>
            ))}
          </div>
        )}

        {tab==='all' && (
          <div style={{ textAlign:'center', padding: '40px 20px', color: 'var(--ink-3)', fontSize: 13 }}>
            All 184 reviews · filter to a site or rating to drill in.
          </div>
        )}
      </div>

      <window.BottomTabs active="reviews" onNav={onNav}/>
    </div>
  );
}

// ── Guests list (S-02) ────────────────────────────────────
function GuestsMobile({ onNav }) {
  const F = window.FORGE;
  const [q, setQ] = uS('');
  const [filter, setFilter] = uS('all');

  const filtered = F.guests.filter(g => {
    if (q && !g.name.toLowerCase().includes(q.toLowerCase())) return false;
    if (filter === 'risk' && g.recency !== 'crimson') return false;
    return true;
  });

  return (
    <div className="screen-root paper-grain">
      <div style={{ padding: '14px 18px 6px' }}>
        <div className="eyebrow">Guests · 8,304 across all sites</div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 28, lineHeight: 1.1, marginTop: 4 }}>Find anyone in two seconds.</div>
      </div>
      <div style={{ padding: '10px 14px' }}>
        <div style={{ position: 'relative' }}>
          <span style={{ position:'absolute', left: 12, top: '50%', transform:'translateY(-50%)', color: 'var(--ink-3)' }}><window.Icon.Search s={16}/></span>
          <input className="input" placeholder="Name, phone, email…" style={{ paddingLeft: 36 }} value={q} onChange={e=>setQ(e.target.value)}/>
        </div>
        <div style={{ display:'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All' },
            { id: 'risk', label: 'At-risk' },
            { id: 'vip', label: 'VIPs' },
            { id: 'wine', label: 'Wine' },
          ].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} className={filter===f.id ? 'chip chip-terra' : 'chip'} style={{ border: 'none', cursor: 'pointer' }}>{f.label}</button>
          ))}
        </div>
      </div>

      <div className="scroll" style={{ flex: 1 }}>
        {filtered.map(g => (
          <button key={g.id} onClick={() => onNav('guest', g.id)} style={{
            width:'100%', textAlign:'left', background:'none', border:'none',
            padding: '12px 18px', display:'flex', alignItems:'center', gap: 12,
            borderBottom: '1px solid var(--rule)', cursor: 'pointer',
          }}>
            <div className="avatar">{g.initial}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display:'flex', alignItems:'center', gap: 7 }}>
                <span className={`dot dot-${g.recency}`}/>
                <span style={{ fontSize: 14.5, fontWeight: 600 }}>{g.name}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>
                {g.site} · {g.visits} visits · £{g.spend} · {g.last}
              </div>
            </div>
            <span className="chip">{g.tag}</span>
          </button>
        ))}
        <div style={{ padding: '14px 18px', fontSize: 12, color: 'var(--ink-3)', fontStyle: 'italic' }}>
          Still importing — 2,140 of 8,300 guests synced.
        </div>
      </div>

      <window.BottomTabs active="guests" onNav={onNav}/>
    </div>
  );
}

// ── Guest detail (S-03) ───────────────────────────────────
function GuestDetail({ guestId, onNav }) {
  const F = window.FORGE;
  const g = F.guests.find(x => x.id === guestId) || F.guests[2];
  return (
    <div className="screen-root paper-grain">
      <div style={{ padding: '14px 14px 0', display:'flex', alignItems:'center', gap: 8 }}>
        <button className="btn-soft" onClick={() => onNav('guests')} style={{ width: 36, height: 36, borderRadius: 999, border: 'none', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <window.Icon.ChevronLeft s={18}/>
        </button>
        <span className="eyebrow" style={{ marginLeft: 'auto' }}>Guest · #{g.id}</span>
        <button className="btn-soft" style={{ width: 36, height: 36, borderRadius: 999, border: 'none', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <window.Icon.More s={18}/>
        </button>
      </div>

      <div className="scroll" style={{ flex: 1, padding: '12px 18px 16px' }}>
        <div style={{ display:'flex', gap: 14, alignItems:'center' }}>
          <div className="avatar" style={{ width: 64, height: 64, fontSize: 24 }}>{g.initial}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 26, lineHeight: 1.1 }}>{g.name}</div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 4, display:'flex', gap: 6, alignItems: 'center' }}>
              <span className={`dot dot-${g.recency}`}/> Last seen {g.last} · {g.site}
            </div>
          </div>
        </div>

        {g.recency === 'crimson' && (
          <div className="card" style={{ marginTop: 14, padding: 12, background: 'var(--crimson-tint)', borderColor: 'rgba(162,58,46,0.2)', display:'flex', alignItems:'center', gap: 10 }}>
            <window.Icon.AlertTriangle s={16} c="var(--crimson)"/>
            <span style={{ fontSize: 13, color: 'var(--ink-2)' }}><b>{g.last}</b> — I'd say hi.</span>
          </div>
        )}

        {/* Stats */}
        <div className="card" style={{ marginTop: 14, padding: '14px 0' }}>
          {[
            ['Lifetime visits', g.visits],
            ['Lifetime spend', `£${g.spend}`],
            ['Avg party', '2.4'],
            ['Top dish', 'Côte de boeuf'],
          ].map(([k,v], i, arr) => (
            <div key={k} style={{ display:'flex', justifyContent:'space-between', padding: '8px 16px', borderBottom: i<arr.length-1 ? '1px solid var(--rule)' : 'none', fontSize: 13.5 }}>
              <span style={{ color: 'var(--ink-3)' }}>{k}</span>
              <span style={{ fontFamily: 'var(--serif)', fontSize: 15 }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Allergies */}
        <div className="card" style={{ marginTop: 14, padding: 14, background: 'var(--amber-tint)', borderColor: 'rgba(184,133,50,0.3)' }}>
          <div className="eyebrow" style={{ color: 'var(--amber)', marginBottom: 4 }}>Dietary · pinned</div>
          <div style={{ fontSize: 14.5, fontFamily: 'var(--serif)' }}>No known allergies. Strong wine preferences.</div>
        </div>

        {/* Tags */}
        <div style={{ display:'flex', gap: 6, marginTop: 14, flexWrap: 'wrap' }}>
          <span className="chip chip-terra">{g.tag}</span>
          <span className="chip">Côte de boeuf · 3x</span>
          <span className="chip">Reduces noise</span>
          <button className="chip chip-ghost" style={{ border: '1px dashed var(--rule-2)' }}><window.Icon.Plus s={11}/> Tag</button>
        </div>

        {/* Visit timeline */}
        <div style={{ marginTop: 22 }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>Visits · last 4</div>
          {[
            { d: '18 Feb', site: 'Hackney', party: 2, spend: '£148', notes: '"Great visit" — Jess', svr: 'Anya' },
            { d: '03 Jan', site: 'Hackney', party: 4, spend: '£312', notes: 'Wine pairing menu', svr: 'Marco' },
            { d: '12 Dec', site: "King's Cross", party: 2, spend: '£97', notes: '—', svr: 'Lou' },
            { d: '24 Nov', site: 'Hackney', party: 6, spend: '£420', notes: 'Birthday', svr: 'Anya' },
          ].map((v, i) => (
            <div key={i} style={{ display:'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--rule)' }}>
              <div style={{ width: 50, fontSize: 12.5, color: 'var(--ink-3)' }}>{v.d}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>{v.site} · party of {v.party}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{v.notes} · server {v.svr}</div>
              </div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 14 }}>{v.spend}</div>
            </div>
          ))}
        </div>

        <div style={{ display:'flex', gap: 8, marginTop: 22 }}>
          <button className="btn btn-terracotta" style={{ flex:1 }} onClick={() => onNav('inbox')}><window.Icon.Send s={14}/> Send WhatsApp</button>
          <button className="btn btn-ghost"><window.Icon.Plus s={14}/> Note</button>
        </div>
      </div>
      <window.BottomTabs active="guests" onNav={onNav}/>
    </div>
  );
}

// ── Inbox + Thread (S-05) ─────────────────────────────────
function InboxMobile({ onNav }) {
  const F = window.FORGE;
  const [openId, setOpenId] = uS(null);
  if (openId) return <ThreadView id={openId} onClose={() => setOpenId(null)} onNav={onNav}/>;
  return (
    <div className="screen-root paper-grain">
      <div style={{ padding: '14px 18px 6px' }}>
        <div className="eyebrow">Inbox · WhatsApp + email</div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 28, lineHeight: 1.1, marginTop: 4 }}>I take the FAQs. You take the rest.</div>
      </div>
      <div className="scroll" style={{ flex: 1 }}>
        {F.threads.map(t => (
          <button key={t.id} onClick={() => setOpenId(t.id)} style={{
            width:'100%', background:'none', border:'none', textAlign:'left',
            padding: '12px 18px', display:'flex', gap: 12, alignItems:'center',
            borderBottom: '1px solid var(--rule)', cursor:'pointer',
          }}>
            <div className="avatar">{t.name[0]}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display:'flex', alignItems:'center', gap: 6 }}>
                <span style={{ fontSize: 14.5, fontWeight: t.unread ? 700 : 500 }}>{t.name}</span>
                {t.ai && <span className="chip chip-sage" style={{ fontSize: 10.5, padding: '2px 6px' }}>I took this</span>}
                {t.needs && <span className="chip chip-crimson" style={{ fontSize: 10.5, padding: '2px 6px' }}>Needs you</span>}
                <span style={{ fontSize: 11, color: 'var(--ink-3)', marginLeft: 'auto' }}>{t.time}</span>
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.last}</div>
            </div>
            {t.unread && <span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--terracotta)', flexShrink: 0 }}/>}
          </button>
        ))}
      </div>
      <window.BottomTabs active="inbox" onNav={onNav}/>
    </div>
  );
}

function ThreadView({ id, onClose, onNav }) {
  const F = window.FORGE;
  const t = F.threads.find(x => x.id === id);
  return (
    <div className="screen-root">
      {/* header */}
      <div style={{ padding: '12px 14px', display:'flex', alignItems:'center', gap: 10, borderBottom: '1px solid var(--rule)', background: 'var(--card-2)' }}>
        <button className="btn-soft" onClick={onClose} style={{ width: 36, height: 36, borderRadius: 999, border: 'none', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <window.Icon.ChevronLeft s={18}/>
        </button>
        <div className="avatar">{t.name[0]}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14.5, fontWeight: 600 }}>{t.name}</div>
          <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>WhatsApp · 24h window: 18h left</div>
        </div>
        <button className="btn-soft" style={{ width: 36, height: 36, borderRadius: 999, border: 'none', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <window.Icon.Phone s={16}/>
        </button>
      </div>

      <div className="chat-bg scroll" style={{ flex: 1, padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="chat-bubble">
          Hi! Could I move my Saturday booking to 8pm instead of 7? Three of us.
          <div className="chat-time">10:32</div>
        </div>
        <div className="chat-bubble me">
          Hi James — yes, you're moved to 8pm Saturday for 3. See you then.
          <div className="chat-time">10:33 ✓✓</div>
        </div>
        <div style={{ alignSelf: 'center', fontSize: 11, color: 'var(--ink-3)', background: 'rgba(255,255,255,0.6)', padding: '3px 10px', borderRadius: 999 }}>
          <span className="serif-i">I drafted that one. Maya approved.</span>
        </div>
        <div className="chat-bubble">
          Perfect, thanks. Also — is the chef's tasting still running?
          <div className="chat-time">10:35</div>
        </div>
        <div style={{ alignSelf: 'center', fontSize: 11, color: 'var(--terracotta)', padding: '6px 10px' }}>
          <window.Icon.Sparkle s={11} c="var(--terracotta)"/> Suggested reply, tap to send
        </div>
        <div className="chat-bubble" style={{ border: '1.5px dashed var(--terracotta)', background: 'var(--terracotta-tint)' }}>
          Yes — runs Wednesday and Thursday this week. £65 a head, 7 courses. Want me to add it to your Saturday booking?
          <div className="chat-time">draft</div>
        </div>
      </div>

      <div style={{ padding: '10px 12px 18px', background: 'var(--card-2)', borderTop: '1px solid var(--rule)', display:'flex', gap: 8, alignItems: 'center' }}>
        <button className="btn-soft" style={{ width: 36, height: 36, borderRadius: 999, border: 'none', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <window.Icon.Plus s={18}/>
        </button>
        <input className="input" placeholder="Message" style={{ flex: 1, borderRadius: 999, padding: '10px 14px' }}/>
        <button style={{ width: 36, height: 36, borderRadius: 999, border: 'none', background: 'var(--terracotta)', color: '#fff', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <window.Icon.Send s={16} c="#fff"/>
        </button>
      </div>
    </div>
  );
}

// ── More menu (gateway to desktop screens) ───────────────
function MoreMobile({ onNav }) {
  const items = [
    { id: 'campaigns', label: 'Campaigns', sub: '4 active · 2 scheduled', Icon: window.Icon.Send },
    { id: 'voice',     label: 'Brand voice', sub: 'Trained · last refreshed 4 days ago', Icon: window.Icon.Sparkle },
    { id: 'sites',     label: 'Sites & integrations', sub: '3 sites · 1 needs attention', Icon: window.Icon.Building, badge: 1 },
    { id: 'team',      label: 'Team', sub: '5 people · 1 invite pending', Icon: window.Icon.Users },
    { id: 'settings',  label: 'Settings · billing', sub: 'Per-site · Pro plan', Icon: window.Icon.Settings },
    { id: 'host',      label: 'Open host stand (tablet)', sub: 'For Jess on the door', Icon: window.Icon.Calendar },
    { id: 'onboarding', label: 'Re-run onboarding', sub: 'Add a 4th site', Icon: window.Icon.Plus },
  ];
  return (
    <div className="screen-root paper-grain">
      <div style={{ padding: '14px 18px 12px' }}>
        <div className="eyebrow">More</div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 28, lineHeight: 1.1, marginTop: 4 }}>The rest of the back office.</div>
      </div>
      <div className="scroll" style={{ flex: 1 }}>
        {items.map(it => (
          <button key={it.id} onClick={() => onNav(it.id)} style={{
            width:'100%', background:'none', border:'none', textAlign:'left',
            padding: '14px 18px', display:'flex', gap: 14, alignItems:'center',
            borderBottom: '1px solid var(--rule)', cursor:'pointer',
          }}>
            <div className="logo-tile" style={{ background: 'var(--paper-2)' }}>
              <it.Icon s={18}/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14.5, fontWeight: 600, display:'flex', alignItems:'center', gap: 7 }}>
                {it.label}
                {it.badge && <span style={{ width: 7, height: 7, borderRadius: 999, background: 'var(--crimson)' }}/>}
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{it.sub}</div>
            </div>
            <window.Icon.ChevronRight s={16} c="var(--ink-3)"/>
          </button>
        ))}
      </div>
      <window.BottomTabs active="more" onNav={onNav}/>
    </div>
  );
}

Object.assign(window, { ReviewsMobile, GuestsMobile, GuestDetail, InboxMobile, MoreMobile });
