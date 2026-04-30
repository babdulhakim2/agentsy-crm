// app.jsx — Top-level shell. Maps screens onto frames laid out in a Design Canvas.

const { useState: uSA } = React;

function ScreenRouter({ initial = 'today', frame, focused }) {
  const [screen, setScreen] = uSA(initial);
  const [param, setParam] = uSA(null);

  const onNav = (id, p) => {
    setParam(p || null);
    if (id === 'host') { setScreen('host'); return; }
    if (id === 'onboarding') { setScreen('onboarding'); return; }
    setScreen(id);
  };

  let s = null;
  if (frame === 'mobile') {
    if (screen === 'today') s = <window.TodayMobile onNav={onNav}/>;
    else if (screen === 'guests') s = <window.GuestsMobile onNav={onNav}/>;
    else if (screen === 'guest') s = <window.GuestDetail guestId={param} onNav={onNav}/>;
    else if (screen === 'reviews') s = <window.ReviewsMobile onNav={onNav}/>;
    else if (screen === 'inbox') s = <window.InboxMobile onNav={onNav}/>;
    else if (screen === 'more') s = <window.MoreMobile onNav={onNav}/>;
    else if (screen === 'onboarding') s = <window.Onboarding onDone={() => setScreen('today')}/>;
    else s = <window.MoreMobile onNav={onNav}/>;
  } else if (frame === 'desktop') {
    if (screen === 'campaigns') s = <window.CampaignsDesktop onNav={onNav}/>;
    else if (screen === 'voice') s = <window.VoiceDesktop onNav={onNav}/>;
    else if (screen === 'sites') s = <window.SitesDesktop onNav={onNav} focused={focused}/>;
    else if (screen === 'team') s = <window.TeamDesktop onNav={onNav}/>;
    else s = <window.SitesDesktop onNav={onNav}/>;
  }
  return s;
}

// Wraps a mobile screen in the iOS frame at canvas size
function MobileFrame({ initial, focused }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
      <window.IOSDevice width={390} height={820}>
        <ScreenRouter frame="mobile" initial={initial} focused={focused}/>
      </window.IOSDevice>
    </div>
  );
}

function DesktopFrame({ initial, focused }) {
  return (
    <div style={{ padding: 16, display: 'flex', justifyContent: 'center' }}>
      <div style={{
        width: 1280, height: 800, borderRadius: 14, overflow: 'hidden',
        boxShadow: '0 30px 60px rgba(26,22,18,0.18), 0 0 0 1px rgba(26,22,18,0.1)',
        background: 'var(--paper)',
      }}>
        <ScreenRouter frame="desktop" initial={initial} focused={focused}/>
      </div>
    </div>
  );
}

function TabletFrame() {
  return (
    <div style={{ padding: 20, display: 'flex', justifyContent: 'center' }}>
      <div style={{
        width: 1180, height: 820, borderRadius: 28, padding: 14, background: '#0a0805',
        boxShadow: '0 30px 60px rgba(0,0,0,0.3)',
      }}>
        <div style={{ width: '100%', height: '100%', borderRadius: 18, overflow: 'hidden' }}>
          <window.HostStand onNav={() => {}}/>
        </div>
      </div>
    </div>
  );
}

function PhoneFrame({ children, w = 390, h = 820 }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
      <window.IOSDevice width={w} height={h}>{children}</window.IOSDevice>
    </div>
  );
}

function App() {
  return (
    <window.DesignCanvas>
      <window.DCSection id="hero" title="Hero loop · Daily morning brief" subtitle="The product. WhatsApp lands at 08:30 → tap → in-app brief → one-tap approve. Tap any artboard to focus.">
        <window.DCArtboard id="whatsapp" label="N-01 · WhatsApp brief" width={390} height={820}>
          <PhoneFrame>
            <window.WhatsAppBrief onOpenApp={() => {}}/>
          </PhoneFrame>
        </window.DCArtboard>
        <window.DCArtboard id="today" label="S-01 · Today (in-app brief)" width={390} height={820}>
          <MobileFrame initial="today"/>
        </window.DCArtboard>
        <window.DCArtboard id="reviews" label="S-04 · Reviews · Edit & approve" width={390} height={820}>
          <MobileFrame initial="reviews"/>
        </window.DCArtboard>
      </window.DCSection>

      <window.DCSection id="onboarding" title="Onboarding · 8 steps in ≤ 30 minutes" subtitle="Time-to-first-value: a real review of yours, with a draft reply, before step 8 ends.">
        <window.DCArtboard id="ob1" label="Step 1 · Welcome" width={390} height={820}>
          <PhoneFrame>
            <OnboardingAt step={1}/>
          </PhoneFrame>
        </window.DCArtboard>
        <window.DCArtboard id="ob4" label="Step 4 · Bookings · The integration moment" width={390} height={820}>
          <PhoneFrame>
            <OnboardingAt step={4}/>
          </PhoneFrame>
        </window.DCArtboard>
        <window.DCArtboard id="ob6" label="Step 6 · Google Business Profile" width={390} height={820}>
          <PhoneFrame>
            <OnboardingAt step={6}/>
          </PhoneFrame>
        </window.DCArtboard>
        <window.DCArtboard id="ob8" label="Step 8 · Brand voice training" width={390} height={820}>
          <PhoneFrame>
            <OnboardingAt step={8}/>
          </PhoneFrame>
        </window.DCArtboard>
      </window.DCSection>

      <window.DCSection id="guests" title="Guests · unified profile across sites" subtitle="One person, every visit, every site. Tag, message, recover.">
        <window.DCArtboard id="gl" label="S-02 · Guests list" width={390} height={820}>
          <MobileFrame initial="guests"/>
        </window.DCArtboard>
        <window.DCArtboard id="gd" label="S-03 · Guest detail · at-risk regular" width={390} height={820}>
          <MobileFrame initial="guest"/>
        </window.DCArtboard>
        <window.DCArtboard id="inbox" label="S-05 · Inbox + thread" width={390} height={820}>
          <MobileFrame initial="inbox"/>
        </window.DCArtboard>
      </window.DCSection>

      <window.DCSection id="ops" title="Operator side · desktop" subtitle="Where Maya plans the week on a Sunday. Sites & integrations is the heart of trust.">
        <window.DCArtboard id="sites" label="S-08 · Sites & integrations · Square broken" width={1280} height={800}>
          <DesktopFrame initial="sites" focused="square"/>
        </window.DCArtboard>
        <window.DCArtboard id="campaigns" label="S-06 · Campaigns · win-back builder" width={1280} height={800}>
          <DesktopFrame initial="campaigns"/>
        </window.DCArtboard>
        <window.DCArtboard id="voice" label="S-07 · Brand voice · sample bench" width={1280} height={800}>
          <DesktopFrame initial="voice"/>
        </window.DCArtboard>
        <window.DCArtboard id="team" label="S-09 · Team & access" width={1280} height={800}>
          <DesktopFrame initial="team"/>
        </window.DCArtboard>
      </window.DCSection>

      <window.DCSection id="host" title="Host stand · tablet · dark mode" subtitle="Jess, on the door. Tap a guest as they walk in. Tag them after they leave.">
        <window.DCArtboard id="hs" label="S-10 · Host stand · with guest sheet" width={1180} height={820}>
          <TabletFrame/>
        </window.DCArtboard>
      </window.DCSection>

      <window.DCSection id="systems" title="Design system · component fragments" subtitle="The atoms — terracotta on cream, ink type, mono metadata, sage/amber/crimson signals.">
        <window.DCArtboard id="comps" label="Components · buttons, chips, cards" width={720} height={460}>
          <ComponentSheet/>
        </window.DCArtboard>
        <window.DCArtboard id="palette" label="Palette · cream paper, ink, terracotta" width={720} height={300}>
          <PaletteSheet/>
        </window.DCArtboard>
      </window.DCSection>
    </window.DesignCanvas>
  );
}

function OnboardingAt({ step }) {
  return <window.Onboarding onDone={() => {}} key={'ob-'+step} initialStep={step}/>;
}

// Component sheet
function ComponentSheet() {
  return (
    <div style={{ padding: 24, background: 'var(--paper)', height: '100%', overflow: 'auto', fontFamily: 'var(--sans)' }}>
      <div className="eyebrow" style={{ marginBottom: 6 }}>Buttons</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        <button className="btn btn-terracotta">Primary action</button>
        <button className="btn btn-primary">Ink</button>
        <button className="btn btn-ghost">Ghost</button>
        <button className="btn btn-soft">Soft</button>
      </div>
      <div className="eyebrow" style={{ marginBottom: 6 }}>Chips</div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 18, flexWrap: 'wrap' }}>
        <span className="chip">Default</span>
        <span className="chip chip-terra">Terracotta</span>
        <span className="chip chip-sage">Sage · positive</span>
        <span className="chip chip-amber">Amber · stale</span>
        <span className="chip chip-crimson">Crimson · take care</span>
        <span className="chip chip-ghost">Ghost</span>
      </div>
      <div className="eyebrow" style={{ marginBottom: 6 }}>Card</div>
      <div className="card" style={{ padding: 14, marginBottom: 14 }}>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 18, marginBottom: 4 }}>Card title</div>
        <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>Cream paper · 1px ink rule · 16px radius.</div>
      </div>
      <div className="eyebrow" style={{ marginBottom: 6 }}>Health pills</div>
      <div style={{ display: 'flex', gap: 6 }}>
        <span className="health" style={{ background: 'var(--sage-tint)', color: 'var(--sage)', border: 'none' }}><span className="dot dot-sage"/> Healthy</span>
        <span className="health" style={{ background: 'var(--amber-tint)', color: 'var(--amber)', border: 'none' }}><span className="dot dot-amber"/> Stale</span>
        <span className="health" style={{ background: 'var(--crimson-tint)', color: 'var(--crimson)', border: 'none' }}><span className="dot dot-crimson"/> Broken</span>
      </div>
    </div>
  );
}

function PaletteSheet() {
  const sw = (label, val, fg = '#1a1612') => (
    <div style={{ flex: 1, padding: 18, background: val, color: fg, height: 110, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', borderRadius: 10, border: '1px solid rgba(26,22,18,0.08)' }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 11, opacity: 0.6 }}>{val}</div>
      <div style={{ fontSize: 13, fontWeight: 500 }}>{label}</div>
    </div>
  );
  return (
    <div style={{ padding: 24, background: 'var(--paper)', height: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 10 }}>
        {sw('Paper', '#f5f0e6')}
        {sw('Card', '#fbf7ef')}
        {sw('Ink', '#1a1612', '#f5f0e6')}
        {sw('Ink-3', '#6b6258', '#f5f0e6')}
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        {sw('Terracotta', '#b85f3a', '#fff')}
        {sw('Sage', '#6b7a5a', '#fff')}
        {sw('Amber', '#b88532', '#fff')}
        {sw('Crimson', '#a23a2e', '#fff')}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
