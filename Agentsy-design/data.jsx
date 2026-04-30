// data.jsx — Sample data fixtures, using the spec verbatim
// (Forge Group: Hackney, King's Cross, Peckham; Sarah, Daniel, etc.)

const FORGE_DATA = {
  group: 'The Forge Group',
  owner: 'Maya',
  date: 'Wed 30 Apr',
  sites: [
    { id: 'hackney', name: 'Hackney', covers: 18, address: '142 Mare St, London E8' },
    { id: 'kx',      name: "King's Cross", covers: 21, address: '14 Caledonian Rd, London N1' },
    { id: 'peckham', name: 'Peckham', covers: 8, address: '57 Rye Lane, London SE15' },
  ],
  totalCovers: 47,

  reviews: [
    {
      id: 'r1', author: 'Sarah', site: 'Hackney', stars: 4, age: '2h',
      excerpt: 'Loved the lamb, service a bit slow at the start but the team made up for it. Will be back.',
      draft: "Hi Sarah — thank you for the lovely note about the lamb. You're right that we were a touch slow on the open; we've had a word with the team. Really hope to see you again soon. — Maya",
      sentiment: 'positive',
    },
    {
      id: 'r2', author: 'Daniel', site: "King's Cross", stars: 2, age: '5h',
      excerpt: "Felt rushed, wine was warm, the table next to us was very loud. Not what I'd hoped for a Friday.",
      draft: "Daniel, I'm sorry — that's not the night we wanted you to have. The wine should never go out warm and we're following up with the team about the pacing. I'd love the chance to put it right; please drop me a note when you're next free.",
      sentiment: 'negative', flagged: true,
    },
  ],

  winbacks: [
    { id: 'w1', name: 'Olu Adebayo', site: 'Hackney', last: '71 days ago', tag: 'Wine drinker',
      draft: "Olu — it's been a minute. The new spring menu lands Thursday and there's a Côtes du Rhône on the list with your name on it. Want me to hold a Friday two-top?" },
    { id: 'w2', name: 'Priya Shah', site: "King's Cross", last: '64 days ago', tag: 'VIP · birthday Apr',
      draft: "Priya — happy birthday week. We've kept your usual corner table free on Saturday if you'd like it. No pressure either way." },
    { id: 'w3', name: 'Tom & Rachel', site: 'Peckham', last: '83 days ago', tag: 'Regulars',
      draft: "Tom and Rachel — long time. The chef put a brown-butter tagliatelle on this week that I think you'd both lose your minds over. Saturday seven-thirty?" },
    { id: 'w4', name: 'Marcus Lee', site: 'Hackney', last: '60 days ago', tag: 'Wine drinker',
      draft: "Marcus — quick one: there's a small natural-wine pour-up on Wednesday, no charge. Want me to put your name down?" },
    { id: 'w5', name: 'Aisha Khan', site: "King's Cross", last: '67 days ago', tag: 'VIP',
      draft: "Aisha — we miss you. The room's quieter mid-week if you fancy a calmer evening. Tuesday or Wednesday work?" },
  ],

  social: [
    { id: 's1', site: 'Hackney', kind: 'Instagram caption',
      draft: "Brown butter, capers, a quiet Tuesday. The lamb is back on Thursday — first come, no holds." },
  ],

  anomalies: [
    { id: 'a1', kind: 'Integration', label: 'Square integration paused',
      detail: "Square logged us out at 06:14 this morning. Reconnecting takes about 60 seconds. While it's down, spend data is frozen on yesterday's totals." },
  ],

  guests: [
    { id: 'g1', initial: 'S', name: 'Sarah Whitcombe',  site: 'Hackney',     visits: 7,  spend: 412, tag: 'Wine drinker',  recency: 'sage', last: '2 days ago' },
    { id: 'g2', initial: 'D', name: 'Daniel Okafor',     site: "King's Cross", visits: 3,  spend: 187, tag: 'New regular?',  recency: 'amber', last: '5 days ago' },
    { id: 'g3', initial: 'O', name: 'Olu Adebayo',        site: 'Hackney',     visits: 14, spend: 980, tag: 'VIP',           recency: 'crimson', last: '71 days ago' },
    { id: 'g4', initial: 'P', name: 'Priya Shah',         site: "King's Cross", visits: 22, spend: 1640, tag: 'VIP',          recency: 'amber', last: '64 days ago' },
    { id: 'g5', initial: 'M', name: 'Marcus Lee',         site: 'Hackney',     visits: 9,  spend: 540, tag: 'Wine drinker',  recency: 'amber', last: '60 days ago' },
    { id: 'g6', initial: 'A', name: 'Aisha Khan',         site: "King's Cross", visits: 11, spend: 720, tag: 'VIP',           recency: 'crimson', last: '67 days ago' },
    { id: 'g7', initial: 'T', name: 'Tom & Rachel Hill',  site: 'Peckham',     visits: 16, spend: 1120, tag: 'Regulars',     recency: 'crimson', last: '83 days ago' },
    { id: 'g8', initial: 'J', name: 'Jamie Park',         site: 'Hackney',     visits: 2,  spend: 95,   tag: 'New',          recency: 'sage', last: 'today' },
  ],

  tonight: [
    { id: 't1', time: '18:00', name: 'Sarah Whitcombe', party: 2,  tags: ['Regular','Wine'], status: 'arrived' },
    { id: 't2', time: '18:30', name: 'Park / Anniversary', party: 4, tags: ['VIP','Anniversary'], status: 'expected' },
    { id: 't3', time: '19:00', name: 'Mehta', party: 3, tags: ['Severe nut allergy'], status: 'expected', flag: 'allergy' },
    { id: 't4', time: '19:00', name: 'Walker', party: 2, tags: [], status: 'expected' },
    { id: 't5', time: '19:30', name: 'Olu Adebayo', party: 2, tags: ['VIP','Recovery'], status: 'expected', flag: 'vip' },
    { id: 't6', time: '20:00', name: 'Davies (4)', party: 4, tags: ['Birthday'], status: 'expected' },
    { id: 't7', time: '20:30', name: 'Henderson', party: 6, tags: ['Walk-in nope'], status: 'expected' },
    { id: 't8', time: '21:00', name: 'Late seating · 2 tops', party: 0, tags: [], status: 'expected' },
  ],

  threads: [
    { id: 'c1', name: 'Sarah Whitcombe', last: 'Perfect, see you Thursday at 7.', time: '12m', unread: false, ai: true },
    { id: 'c2', name: 'Priya Shah',       last: "I'd love the corner table, thank you Maya 💛", time: '1h', unread: true, ai: false },
    { id: 'c3', name: 'James Foster',     last: 'Can I move the Saturday booking to 8pm?', time: '2h', unread: true, ai: false, needs: true },
    { id: 'c4', name: 'Marcus Lee',       last: 'Yes please put me down for Wed.', time: '4h', unread: false, ai: true },
    { id: 'c5', name: 'Olu Adebayo',      last: 'Friday two-top sounds great.', time: 'yesterday', unread: false, ai: true },
  ],

  campaigns: [
    { id: 'cm1', name: 'Spring win-back · 60-day silence', status: 'sending', recipients: 142, sent: 87, channel: 'WhatsApp', cost: '~£6' },
    { id: 'cm2', name: 'May birthdays · Hackney',          status: 'scheduled', recipients: 38, when: '2 May 11:00', channel: 'WhatsApp', cost: '~£1.60' },
    { id: 'cm3', name: 'Easter Sunday tasting menu',       status: 'sent', recipients: 312, channel: 'Email', cost: '£0' },
    { id: 'cm4', name: "Peckham — late-summer regulars",   status: 'paused', recipients: 64, channel: 'WhatsApp', cost: '~£2.60' },
  ],

  integrations: [
    { provider: 'ResDiary',                  type: 'Bookings', status: 'green',  sync: '2 min ago',  scopes: ['Bookings','Guests','Sites','Dietary'] },
    { provider: 'Square',                    type: 'POS',      status: 'red',    sync: '6h ago',     scopes: ['Transactions','Items'] , error: 'Square logged us out at 06:14' },
    { provider: 'Google Business Profile',   type: 'Reviews',  status: 'green',  sync: '4 min ago',  scopes: ['Reviews','Reply'] },
    { provider: 'WhatsApp',                  type: 'Messaging',status: 'green',  sync: 'live',       scopes: ['Send','Receive'] },
    { provider: 'Instagram',                 type: 'Read-only',status: 'amber',  sync: '2h ago',     scopes: ['Captions (read)'] },
    { provider: 'Email',                     type: 'Digest',   status: 'green',  sync: 'live',       scopes: ['Send'] },
  ],

  team: [
    { id: 'u1', name: 'Maya Hayward',     email: 'maya@theforge.co',     role: 'Owner',   sites: 'All sites',          last: 'now',          initial: 'M', tone: 'ink' },
    { id: 'u2', name: 'Sam Reyes',        email: 'sam@theforge.co',      role: 'Manager', sites: 'Hackney',             last: '2 hours ago',  initial: 'S', tone: '' },
    { id: 'u3', name: 'Jess Owino',       email: 'jess@theforge.co',     role: 'Host',    sites: 'Hackney',             last: 'last night',   initial: 'J', tone: 'sage' },
    { id: 'u4', name: 'David Park',       email: 'david@theforge.co',    role: 'Manager', sites: "King's Cross",        last: 'yesterday',    initial: 'D', tone: 'amber' },
    { id: 'u5', name: 'Aleksy Nowak',     email: 'aleksy@theforge.co',   role: 'Pending invite · expires in 5 days', sites: 'Peckham', last: '—', initial: '?', tone: '', pending: true },
  ],
};

window.FORGE = FORGE_DATA;
