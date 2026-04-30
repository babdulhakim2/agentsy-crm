// host-stand.jsx — S-10 Tablet host stand (Jess). Dark-friendly.

const { useState: uSH } = React;

function HostStand({ onNav }) {
  const F = window.FORGE;
  const [sel, setSel] = uSH(null);
  const seated = F.tonight.filter(t => t.status === 'arrived').length;
  const expected = F.tonight.filter(t => t.status === 'expected').length;

  return (
    <div className="screen-root dark" style={{ background: '#1a1612', color: '#f5f0e6', overflow: 'hidden' }}>
      <div style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid rgba(245,240,230,0.08)' }}>
        <window.AgentsyMark size={26}/>
        <div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 22 }}>Host stand · Hackney</div>
          <div style={{ fontSize: 12, color: 'rgba(245,240,230,0.6)' }}>Wed 30 Apr · 18:14 · Service in progress</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 22 }}>
          <Stat label="Seated" value={seated}/>
          <Stat label="Expected" value={expected}/>
          <Stat label="Walk-ins" value={3}/>
          <button className="btn-soft" onClick={() => onNav('today')} style={{ background: 'rgba(245,240,230,0.08)', color: '#f5f0e6', border: 'none', padding: '8px 14px', borderRadius: 8, fontSize: 12.5 }}>Exit</button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: sel ? '1fr 360px' : '1fr', overflow: 'hidden' }}>
        <div className="scroll" style={{ padding: '14px 24px 24px' }}>
          {F.tonight.map((t, i) => {
            const isCurrent = t.time === '18:00' || t.time === '18:30';
            const past = t.status === 'arrived';
            return (
              <button key={t.id} onClick={() => setSel(t.id)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 18,
                padding: '18px 18px', borderBottom: '1px solid rgba(245,240,230,0.06)',
                background: sel === t.id ? 'rgba(184,95,58,0.15)' : 'transparent',
                border: 'none', borderLeft: isCurrent ? '3px solid #b85f3a' : '3px solid transparent',
                cursor: 'pointer', textAlign: 'left',
                color: '#f5f0e6',
                opacity: past ? 0.55 : 1,
              }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 30, fontVariantNumeric: 'tabular-nums', minWidth: 90, color: isCurrent ? '#d18465' : '#f5f0e6' }}>{t.time}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 22, fontWeight: 500, marginBottom: 4 }}>{t.name}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {t.party > 0 && <span className="chip" style={{ background: 'rgba(245,240,230,0.08)', color: '#f5f0e6' }}>Party of {t.party}</span>}
                    {t.tags.map(tg => {
                      const danger = tg.toLowerCase().includes('allerg');
                      return <span key={tg} className="chip" style={{
                        background: danger ? 'rgba(162,58,46,0.25)' : tg === 'VIP' ? 'rgba(184,95,58,0.22)' : 'rgba(245,240,230,0.08)',
                        color: danger ? '#f1ddd0' : tg === 'VIP' ? '#f1ddd0' : '#d6cdb9',
                        fontWeight: danger ? 600 : 400,
                      }}>{danger && '⚠ '}{tg}</span>;
                    })}
                  </div>
                </div>
                {past
                  ? <span className="chip" style={{ background: 'rgba(107,122,90,0.3)', color: '#d8ddc9' }}><window.Icon.Check s={11} c="#d8ddc9"/> Seated</span>
                  : <window.Icon.ChevronRight s={20} c="rgba(245,240,230,0.4)"/>}
              </button>
            );
          })}
        </div>

        {sel && (
          <div style={{ borderLeft: '1px solid rgba(245,240,230,0.08)', background: 'rgba(245,240,230,0.03)', padding: '20px 22px', overflow: 'auto' }}>
            {(() => {
              const t = F.tonight.find(x => x.id === sel);
              if (!t) return null;
              return (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <button onClick={() => setSel(null)} style={{ background: 'transparent', border: 'none', color: 'rgba(245,240,230,0.6)', cursor: 'pointer' }}><window.Icon.X s={20} c="rgba(245,240,230,0.6)"/></button>
                    <span style={{ marginLeft: 'auto', fontFamily: 'var(--mono)', fontSize: 11, color: 'rgba(245,240,230,0.5)', letterSpacing: '0.08em' }}>{t.time} · party {t.party || '?'}</span>
                  </div>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 30, marginBottom: 4 }}>{t.name}</div>
                  <div style={{ fontSize: 13, color: 'rgba(245,240,230,0.6)', marginBottom: 18 }}>3rd visit · last seen 18 Feb</div>

                  {t.tags.some(tg => tg.toLowerCase().includes('allerg')) && (
                    <div style={{ padding: 14, background: 'rgba(162,58,46,0.25)', borderRadius: 12, marginBottom: 16 }}>
                      <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'var(--mono)', color: '#f1ddd0', marginBottom: 4 }}>⚠ Allergy · pinned</div>
                      <div style={{ fontFamily: 'var(--serif)', fontSize: 18, lineHeight: 1.3 }}>SEVERE NUT ALLERGY — please flag in the kitchen.</div>
                    </div>
                  )}

                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'var(--mono)', color: 'rgba(245,240,230,0.5)', marginBottom: 8 }}>Last 3 visits</div>
                    {[
                      ['18 Feb', 'Hackney · 2', '£148'],
                      ['03 Jan', 'Hackney · 4', '£312'],
                      ['12 Dec', "King's X · 2", '£97'],
                    ].map(([d, w, s]) => (
                      <div key={d} style={{ display: 'flex', padding: '8px 0', borderBottom: '1px solid rgba(245,240,230,0.06)', fontSize: 13.5 }}>
                        <span style={{ width: 60, color: 'rgba(245,240,230,0.5)' }}>{d}</span>
                        <span style={{ flex: 1 }}>{w}</span>
                        <span style={{ fontFamily: 'var(--serif)' }}>{s}</span>
                      </div>
                    ))}
                  </div>

                  <button className="btn btn-terracotta" style={{ width: '100%', marginBottom: 8 }}>Mark seated</button>
                  <button style={{ width: '100%', padding: '12px', borderRadius: 999, border: '1px solid rgba(245,240,230,0.18)', background: 'transparent', color: '#f5f0e6', fontSize: 14, fontWeight: 500, marginBottom: 18, cursor: 'pointer' }}>Mark left</button>

                  <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'var(--mono)', color: 'rgba(245,240,230,0.5)', marginBottom: 10 }}>Post-visit · one tap</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { l: 'Great visit', c: '#d8ddc9', bg: 'rgba(107,122,90,0.25)' },
                      { l: 'Recovery needed', c: '#f1ddd0', bg: 'rgba(162,58,46,0.25)' },
                      { l: 'New regular?', c: '#f0e3c4', bg: 'rgba(184,133,50,0.22)' },
                    ].map(b => (
                      <button key={b.l} style={{ padding: '12px', borderRadius: 10, border: 'none', background: b.bg, color: b.c, fontSize: 14, fontWeight: 500, textAlign: 'left', cursor: 'pointer' }}>{b.l}</button>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10.5, color: 'rgba(245,240,230,0.55)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--mono)', marginTop: 3 }}>{label}</div>
    </div>
  );
}

Object.assign(window, { HostStand });
