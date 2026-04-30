// desktop-screens.jsx — S-06 Campaigns, S-07 Brand voice, S-08 Sites + integrations,
// S-09 Team. All laid out in a desktop sidebar shell.

const { useState: uSD } = React;

function DesktopShell({ active, onNav, children }) {
  const items = [
    { id: 'today', label: 'Today', Icon: window.Icon.Home },
    { id: 'guests', label: 'Guests', Icon: window.Icon.Users },
    { id: 'reviews', label: 'Reviews', Icon: window.Icon.Star },
    { id: 'inbox', label: 'Inbox', Icon: window.Icon.Inbox },
  ];
  const more = [
    { id: 'campaigns', label: 'Campaigns', Icon: window.Icon.Send },
    { id: 'voice', label: 'Brand voice', Icon: window.Icon.Sparkle },
    { id: 'sites', label: 'Sites', Icon: window.Icon.Building, badge: 1 },
    { id: 'team', label: 'Team', Icon: window.Icon.Users },
    { id: 'settings', label: 'Settings', Icon: window.Icon.Settings },
  ];
  return (
    <div className="screen-root" style={{ flexDirection: 'row' }}>
      <aside style={{ width: 232, background: 'var(--card)', borderRight: '1px solid var(--rule)', display: 'flex', flexDirection: 'column', padding: '20px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px 18px' }}>
          <window.AgentsyMark size={26}/>
          <div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 17 }}>Agentsy</div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>The Forge Group</div>
          </div>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {items.map(i => <NavItem key={i.id} {...i} active={active===i.id} onClick={() => onNav(i.id)}/>)}
          <div style={{ height: 1, background: 'var(--rule)', margin: '12px 8px' }}/>
          <div style={{ fontSize: 10.5, color: 'var(--ink-4)', padding: '4px 10px 6px', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'var(--mono)' }}>More</div>
          {more.map(i => <NavItem key={i.id} {...i} active={active===i.id} onClick={() => onNav(i.id)}/>)}
        </nav>
        <div style={{ marginTop: 'auto', padding: 12, background: 'var(--paper-2)', borderRadius: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="avatar ink">M</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Maya Hayward</div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>Owner</div>
            </div>
          </div>
        </div>
      </aside>
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {children}
      </main>
    </div>
  );
}

function NavItem({ label, Icon, active, onClick, badge }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 10px', borderRadius: 8,
      background: active ? 'var(--paper-2)' : 'transparent',
      border: 'none', cursor: 'pointer',
      color: active ? 'var(--ink)' : 'var(--ink-2)',
      fontSize: 13.5, fontWeight: active ? 600 : 500,
      textAlign: 'left',
    }}>
      <Icon s={17} w={1.7}/>
      <span style={{ flex: 1 }}>{label}</span>
      {badge && <span style={{ width: 7, height: 7, borderRadius: 999, background: 'var(--crimson)' }}/>}
    </button>
  );
}

// ── Campaigns (S-06) ──────────────────────────────────────
function CampaignsDesktop({ onNav }) {
  const F = window.FORGE;
  const [building, setBuilding] = uSD(false);
  return (
    <DesktopShell active="campaigns" onNav={onNav}>
      <DesktopHeader eyebrow="Campaigns" title="Targeted, opt-in pushes." sub="Win-back the silent regulars. Birthday a few VIPs. Never spam." right={
        <button className="btn btn-terracotta" onClick={() => setBuilding(true)}><window.Icon.Plus s={16} c="#fff"/> New campaign</button>
      }/>
      <div className="scroll" style={{ flex: 1, padding: '0 32px 32px' }}>
        {!building ? (
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '12px 18px', borderBottom: '1px solid var(--rule)', fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: 'var(--mono)' }}>
              <div>Campaign</div><div>Status</div><div>Recipients</div><div>Channel</div><div>Cost</div>
            </div>
            {F.campaigns.map(c => (
              <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '14px 18px', borderBottom: '1px solid var(--rule)', alignItems: 'center', cursor: 'pointer' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{c.when || (c.sent ? `${c.sent} of ${c.recipients} sent` : '—')}</div>
                </div>
                <div>
                  <span className={'chip ' + (c.status === 'sending' ? 'chip-amber' : c.status === 'sent' ? 'chip-sage' : c.status === 'paused' ? 'chip-crimson' : '')}>
                    {c.status === 'sending' && <span className="dot dot-amber"/>}
                    {c.status}
                  </span>
                </div>
                <div style={{ fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>{c.recipients}</div>
                <div style={{ fontSize: 13 }}>{c.channel}</div>
                <div style={{ fontSize: 13, fontFamily: 'var(--serif)' }}>{c.cost}</div>
              </div>
            ))}
          </div>
        ) : (
          <CampaignBuilder onClose={() => setBuilding(false)}/>
        )}
        {!building && (
          <div className="card" style={{ marginTop: 18, padding: 18, background: 'var(--card-2)' }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Templates</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {[
                { t: 'Win-back', s: '60-day silent regulars', emoji: '↺' },
                { t: 'Birthday', s: 'VIPs in the next 14 days', emoji: '✦' },
                { t: 'Seasonal', s: 'Menu drop, soft list', emoji: '◐' },
                { t: 'Custom', s: 'Build from scratch', emoji: '+' },
              ].map(t => (
                <div key={t.t} className="card" style={{ padding: 14, cursor: 'pointer' }}>
                  <div style={{ fontSize: 22, fontFamily: 'var(--serif)', color: 'var(--terracotta)', marginBottom: 4 }}>{t.emoji}</div>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{t.t}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{t.s}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DesktopShell>
  );
}

function CampaignBuilder({ onClose }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 22 }}>
      <div className="card" style={{ padding: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <button className="btn-soft" onClick={onClose} style={{ width: 32, height: 32, borderRadius: 999, border: 'none', display:'flex', alignItems:'center', justifyContent:'center' }}><window.Icon.X s={16}/></button>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 22 }}>New campaign · Win-back</div>
        </div>

        <div className="eyebrow" style={{ marginBottom: 8 }}>1 · Audience</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18 }}>
          <span className="chip chip-terra">Last visit · 60+ days ago</span>
          <span className="chip chip-terra">Lifetime visits ≥ 3</span>
          <span className="chip chip-terra">Has WhatsApp opt-in</span>
          <span className="chip">All sites</span>
          <button className="chip chip-ghost" style={{ border: '1px dashed var(--rule-2)' }}><window.Icon.Plus s={11}/> Filter</button>
        </div>

        <div className="eyebrow" style={{ marginBottom: 8 }}>2 · Channel</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
          <div className="radio-card selected" style={{ flex: 1 }}><div className="ring"/><window.ProviderMark name="WhatsApp" size={28}/><div style={{ flex: 1 }}><div style={{ fontSize: 13.5, fontWeight: 600 }}>WhatsApp</div><div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>~£0.04 / message</div></div></div>
          <div className="radio-card" style={{ flex: 1 }}><div className="ring"/><window.ProviderMark name="Email" size={28}/><div style={{ flex: 1 }}><div style={{ fontSize: 13.5, fontWeight: 600 }}>Email</div><div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>Free · their domain</div></div></div>
        </div>

        <div className="eyebrow" style={{ marginBottom: 8 }}>3 · Message <span style={{ color: 'var(--terracotta)', textTransform: 'none', letterSpacing: 0 }}>· in your voice</span></div>
        <textarea className="textarea" rows={5} defaultValue={"Hi {{first_name}} — it's been a minute. The new spring menu lands Thursday and we kept a Friday two-top free in case you'd like it. — Maya"} style={{ marginBottom: 18 }}/>

        <div className="eyebrow" style={{ marginBottom: 8 }}>4 · Schedule</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="input" defaultValue="2 May 2026" style={{ flex: 2 }}/>
          <input className="input" defaultValue="11:00" style={{ flex: 1 }}/>
        </div>
      </div>
      <div>
        <div className="card" style={{ padding: 18, position: 'sticky', top: 0 }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>Audience preview</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 14 }}>
            <span style={{ fontFamily: 'var(--serif)', fontSize: 42, fontVariantNumeric: 'tabular-nums' }}>142</span>
            <span style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>guests match</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 10 }}>Sample 5</div>
          {window.FORGE.guests.slice(0, 5).map(g => (
            <div key={g.id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '7px 0' }}>
              <div className="avatar" style={{ width: 28, height: 28, fontSize: 11.5 }}>{g.initial}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 500 }}>{g.name}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{g.last}</div>
              </div>
            </div>
          ))}
          <div style={{ height: 1, background: 'var(--rule)', margin: '14px 0' }}/>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 6 }}>Estimated cost</div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 22 }}>~£6.00</div>
          <button className="btn btn-terracotta" style={{ width: '100%', marginTop: 14 }}>Schedule send</button>
          <div style={{ fontSize: 11, color: 'var(--ink-3)', textAlign: 'center', marginTop: 8, fontStyle: 'italic' }}>Confirm modal: 142 guests, 2 May 11:00.</div>
        </div>
      </div>
    </div>
  );
}

// ── Brand voice (S-07) ────────────────────────────────────
function VoiceDesktop({ onNav }) {
  return (
    <DesktopShell active="voice" onNav={onNav}>
      <DesktopHeader eyebrow="Brand voice" title="How I sound when I write for you." sub="Trained on 184 examples · last refreshed 4 days ago" right={
        <button className="btn btn-ghost"><window.Icon.Refresh s={16}/> Re-train</button>
      }/>
      <div className="scroll" style={{ flex: 1, padding: '0 32px 32px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: 22 }}>
        <div>
          <div className="card" style={{ padding: 22, marginBottom: 18 }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>Voice summary</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 22, lineHeight: 1.35 }}>
              Warm, plain-spoken, with dry British humour.<br/>
              <span className="serif-i" style={{ color: 'var(--ink-3)' }}>Never exclamation marks. Always signs off "Maya".</span>
            </div>
          </div>

          <div className="eyebrow" style={{ marginBottom: 10 }}>Sample bench · rate to tune</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { kind: 'Review reply · 5★', body: "Iris, thank you — couldn't agree more about the bread. Hope to see you again. — Maya" },
              { kind: 'Review reply · 2★', body: "I'm sorry, that's not the night we wanted you to have. The wine should never go out warm. I'd love a chance to put it right." },
              { kind: 'WhatsApp reminder', body: "Quick reminder — table for 4 tomorrow at 19:30, Hackney. Reply CHANGE if you need to move it." },
              { kind: 'Win-back', body: "It's been a minute. Spring menu lands Thursday — saved you a Friday two-top in case." },
              { kind: 'IG caption', body: "Brown butter, capers, a quiet Tuesday. The lamb is back on Thursday — first come, no holds." },
              { kind: 'No-show check', body: "Hey — your table's still here, no rush. Running late or do you need to move?" },
            ].map((s, i) => (
              <div key={i} className="card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span className="chip">{s.kind}</span>
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                    <button className="btn-soft" style={{ width: 30, height: 30, border: 'none', borderRadius: 8 }}>👍</button>
                    <button className="btn-soft" style={{ width: 30, height: 30, border: 'none', borderRadius: 8 }}>👎</button>
                  </div>
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--ink-2)' }}>{s.body}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="card" style={{ padding: 18, marginBottom: 14 }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>Learned from</div>
            {[
              ['Google reviews + replies', '184 examples'],
              ['Instagram captions', '47 examples'],
              ['Manual paste', '3 captions'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--rule)', fontSize: 13 }}>
                <span>{k}</span>
                <span style={{ color: 'var(--ink-3)' }}>{v}</span>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: 18, marginBottom: 14 }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>Toggles</div>
            {[
              ['Never use emojis', true],
              ['Always sign with "Maya"', true],
              ['Cap sentences at 22 words', false],
              ['Use Oxford comma', false],
            ].map(([k, on]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--rule)' }}>
                <span style={{ flex: 1, fontSize: 13 }}>{k}</span>
                <button className={'toggle' + (on ? ' on' : '')}/>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: 18 }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>Banned words</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {['delicious','journey','unleash','curated','elevate'].map(w => (
                <span key={w} className="chip chip-crimson">{w} <window.Icon.X s={11}/></span>
              ))}
              <button className="chip chip-ghost" style={{ border: '1px dashed var(--rule-2)' }}><window.Icon.Plus s={11}/> Add</button>
            </div>
          </div>
        </div>
      </div>
    </DesktopShell>
  );
}

// ── Sites + Integrations (S-08) ───────────────────────────
function SitesDesktop({ onNav, focused }) {
  const F = window.FORGE;
  const [opened, setOpened] = uSD(focused === 'square' ? 'Square' : null);
  return (
    <DesktopShell active="sites" onNav={onNav}>
      <DesktopHeader
        eyebrow="Sites & integrations"
        title="Every connection, every problem, in one view."
        sub="Anything broken interrupts the morning brief. Everything else just works."
        right={<button className="btn btn-ghost"><window.Icon.Plus s={16}/> Add a site</button>}
      />
      <div className="scroll" style={{ flex: 1, padding: '0 32px 32px' }}>
        {/* Sites overview */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 22 }}>
          {F.sites.map(s => (
            <div key={s.id} className="card" style={{ padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <window.Icon.Building s={18} c="var(--ink-3)"/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 17 }}>{s.name}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{s.address}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {[
                  { t: 'GBP', c: 'sage' },
                  { t: 'Bookings', c: 'sage' },
                  { t: 'POS', c: s.id === 'hackney' ? 'crimson' : 'sage' },
                  { t: 'WhatsApp', c: 'sage' },
                ].map(p => (
                  <span key={p.t} className={'health'} style={{
                    background: p.c === 'sage' ? 'var(--sage-tint)' : p.c === 'crimson' ? 'var(--crimson-tint)' : 'var(--amber-tint)',
                    color: p.c === 'sage' ? 'var(--sage)' : p.c === 'crimson' ? 'var(--crimson)' : 'var(--amber)',
                    border: 'none',
                  }}>
                    <span className={'dot dot-' + p.c} style={{ width: 6, height: 6 }}/>
                    {p.t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Integrations table */}
        <div className="card">
          <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--rule)' }}>
            <div className="eyebrow">All integrations · 6 connected, 1 needs attention</div>
            <button className="btn-soft" style={{ marginLeft: 'auto', border: 'none', padding: '6px 12px', borderRadius: 8, fontSize: 12.5 }}><window.Icon.Plus s={13}/> Add integration</button>
          </div>
          {F.integrations.map(it => (
            <div key={it.provider}>
              <div onClick={() => setOpened(opened === it.provider ? null : it.provider)} style={{
                display: 'grid', gridTemplateColumns: '40px 2fr 1fr 1fr 1.5fr 100px',
                padding: '14px 18px', borderBottom: opened === it.provider ? 'none' : '1px solid var(--rule)', alignItems: 'center', cursor: 'pointer', gap: 14,
              }}>
                <window.ProviderMark name={it.provider} size={36}/>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{it.provider}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{it.type}</div>
                </div>
                <div>
                  <span className={'health'} style={{
                    background: it.status === 'green' ? 'var(--sage-tint)' : it.status === 'red' ? 'var(--crimson-tint)' : 'var(--amber-tint)',
                    color: it.status === 'green' ? 'var(--sage)' : it.status === 'red' ? 'var(--crimson)' : 'var(--amber)',
                    border: 'none',
                  }}>
                    <span className={'dot dot-' + (it.status === 'green' ? 'sage' : it.status === 'red' ? 'crimson' : 'amber')}/>
                    {it.status === 'green' ? 'Healthy' : it.status === 'red' ? 'Broken' : 'Stale'}
                  </span>
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>Last sync · {it.sync}</div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>{it.scopes.join(' · ')}</div>
                <div style={{ textAlign: 'right' }}>
                  {it.status === 'red'
                    ? <button className="btn btn-terracotta" style={{ padding: '6px 12px', fontSize: 12 }}>Reconnect</button>
                    : <button className="btn-soft" style={{ border: 'none', padding: '6px 12px', borderRadius: 8, fontSize: 12 }}>Manage</button>}
                </div>
              </div>
              {opened === it.provider && (
                <div className="fade-up" style={{ padding: '14px 18px 18px 90px', background: 'var(--paper-2)', borderBottom: '1px solid var(--rule)' }}>
                  {it.status === 'red' && (
                    <div className="card" style={{ padding: 14, marginBottom: 12, background: 'var(--crimson-tint)', borderColor: 'rgba(162,58,46,0.2)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <window.Icon.AlertTriangle s={16} c="var(--crimson)"/>
                        <div style={{ flex: 1, fontSize: 13, color: 'var(--ink-2)' }}>
                          <b>{it.error}</b> — reconnecting takes about 60 seconds. While Square's down, spend data is frozen on yesterday's totals.
                        </div>
                        <button className="btn btn-terracotta" style={{ padding: '7px 14px', fontSize: 12.5 }}>Reconnect</button>
                      </div>
                    </div>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                    <div>
                      <div className="eyebrow" style={{ marginBottom: 6 }}>Scopes granted</div>
                      <div style={{ fontSize: 12.5 }}>{it.scopes.map(s => '· ' + s).join('  ')}</div>
                    </div>
                    <div>
                      <div className="eyebrow" style={{ marginBottom: 6 }}>Last successful sync</div>
                      <div style={{ fontSize: 12.5 }}>{it.sync}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button className="btn-soft" style={{ border: 'none', padding: '7px 12px', borderRadius: 8, fontSize: 12 }}>Test connection</button>
                      <button className="btn-ghost" style={{ padding: '7px 12px', fontSize: 12, color: 'var(--crimson)', border: '1px solid rgba(162,58,46,0.2)', borderRadius: 8, background: 'transparent' }}>Disconnect</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Marketplace */}
        <div className="card" style={{ marginTop: 22, padding: 22, background: 'var(--card-2)' }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>Available · click to connect</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
            {['ResDiary','Access Collins','OpenTable','SevenRooms','Eat App','Square','Lightspeed','Toast','Google Business Profile','WhatsApp','Instagram','Email'].map(p => (
              <button key={p} className="card" style={{ padding: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', background: 'var(--card)' }}>
                <window.ProviderMark name={p} size={36}/>
                <div style={{ fontSize: 11.5, fontWeight: 500, textAlign: 'center' }}>{p}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </DesktopShell>
  );
}

// ── Team (S-09) ───────────────────────────────────────────
function TeamDesktop({ onNav }) {
  const F = window.FORGE;
  return (
    <DesktopShell active="team" onNav={onNav}>
      <DesktopHeader eyebrow="Team & access" title="Add managers and hosts without giving everyone everything." sub="Owner · Manager · Host. Site-scoped." right={
        <button className="btn btn-terracotta"><window.Icon.Plus s={16} c="#fff"/> Invite</button>
      }/>
      <div className="scroll" style={{ flex: 1, padding: '0 32px 32px' }}>
        <div className="card">
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.4fr 1fr 60px', padding: '12px 18px', borderBottom: '1px solid var(--rule)', fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: 'var(--mono)' }}>
            <div>Member</div><div>Role</div><div>Sites</div><div>Last active</div><div></div>
          </div>
          {F.team.map(u => (
            <div key={u.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.4fr 1fr 60px', padding: '14px 18px', borderBottom: '1px solid var(--rule)', alignItems: 'center', opacity: u.pending ? 0.7 : 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className={'avatar ' + u.tone}>{u.initial}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{u.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{u.email}</div>
                </div>
              </div>
              <div>
                <span className={'chip ' + (u.role === 'Owner' ? 'chip-terra' : '')}>{u.role.split(' · ')[0]}</span>
              </div>
              <div style={{ fontSize: 13 }}>{u.sites}</div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>{u.last}</div>
              <div style={{ textAlign: 'right' }}>
                <button className="btn-soft" style={{ width: 28, height: 28, border: 'none', borderRadius: 8 }}><window.Icon.More s={14}/></button>
              </div>
            </div>
          ))}
        </div>
        <div className="card" style={{ marginTop: 18, padding: 18, background: 'var(--card-2)', display: 'flex', alignItems: 'center', gap: 14 }}>
          <window.Icon.Sparkle s={20} c="var(--terracotta)"/>
          <div style={{ flex: 1, fontSize: 13.5, lineHeight: 1.5 }}>
            <b>Tip.</b> <span className="serif-i">Add Sam at Hackney so she can see her site without bothering you.</span>
          </div>
          <button className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 13 }}>Invite a manager</button>
        </div>
      </div>
    </DesktopShell>
  );
}

function DesktopHeader({ eyebrow, title, sub, right }) {
  return (
    <div style={{ padding: '24px 32px 22px', borderBottom: '1px solid var(--rule)', display: 'flex', alignItems: 'flex-end', gap: 22 }}>
      <div style={{ flex: 1 }}>
        <div className="eyebrow" style={{ marginBottom: 6 }}>{eyebrow}</div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 30, lineHeight: 1.15, letterSpacing: '-0.01em' }}>{title}</div>
        {sub && <div style={{ fontSize: 13.5, color: 'var(--ink-3)', marginTop: 6 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

Object.assign(window, { CampaignsDesktop, VoiceDesktop, SitesDesktop, TeamDesktop, DesktopShell, DesktopHeader });
