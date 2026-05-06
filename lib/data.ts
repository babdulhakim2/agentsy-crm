// Sample data fixtures — modeled on the pilot customer:
// "New Wok's Cooking" (fictional multi-site Halal Chinese restaurant group).
// The Agentsy product brand is separate; this is just the demo tenant.

import type { ForgeData } from "./types";

export const FORGE: ForgeData = {
  group: "New Wok's Cooking",
  owner: "Juliet",
  date: "Wed 30 Apr",
  sites: [
    {
      id: "islington",
      name: "Islington",
      covers: 38,
      address: "220 Upper Street, London N1 1RU",
    },
    {
      id: "camden",
      name: "Camden",
      covers: 24,
      address: "71 Parkway, London NW1 7PP",
    },
    {
      id: "shoreditch",
      name: "Shoreditch",
      covers: 31,
      address: "12 Redchurch Street, London E2 7DJ",
    },
  ],
  totalCovers: 93,

  reviews: [
    {
      id: "r1",
      author: "Sarah Ahmed",
      site: "Islington",
      stars: 4,
      age: "2h",
      excerpt:
        "Loved the lamb chow mein, service was a bit slow at the start but the team made up for it. Will be back.",
      draft:
        "Hi Sarah — thank you for the lovely note about the lamb chow mein. You're right that we were a touch slow on the open; we've had a word with the team. Really hope to see you again soon. — Juliet",
      sentiment: "positive",
    },
    {
      id: "r2",
      author: "Daniel",
      site: "Camden",
      stars: 2,
      age: "5h",
      excerpt:
        "Felt rushed, my Singapore noodles came out lukewarm and the table next to us was very loud. Not what I'd hoped for a Friday.",
      draft:
        "Daniel, I'm sorry — that's not the night we wanted you to have. The noodles should never go out lukewarm and we're following up with the kitchen about the pacing. I'd love the chance to put it right; please drop me a note when you're next free.",
      sentiment: "negative",
      flagged: true,
    },
  ],

  winbacks: [
    {
      id: "w1",
      name: "Olu Adebayo",
      site: "Islington",
      last: "71 days ago",
      tag: "Lamb regular",
      draft:
        "Olu — it's been a minute. The new dragon-spiced lamb lands Thursday and there's a corner two-top with your name on it. Friday work?",
    },
    {
      id: "w2",
      name: "Priya Shah",
      site: "Camden",
      last: "64 days ago",
      tag: "VIP · birthday Apr",
      draft:
        "Priya — happy birthday week. We've kept your usual corner table free on Saturday if you'd like it. No pressure either way.",
    },
    {
      id: "w3",
      name: "Tom & Rachel",
      site: "Shoreditch",
      last: "83 days ago",
      tag: "Family regulars",
      draft:
        "Tom and Rachel — long time. The chef put a salt-and-pepper lamb on this week that I think you'd both lose your minds over. Saturday seven-thirty?",
    },
    {
      id: "w4",
      name: "Marcus Lee",
      site: "Islington",
      last: "60 days ago",
      tag: "Spice fan",
      draft:
        "Marcus — quick one: there's a small Sichuan tasting on Wednesday, no charge. Want me to put your name down?",
    },
    {
      id: "w5",
      name: "Hannah Khan",
      site: "Shoreditch",
      last: "67 days ago",
      tag: "VIP",
      draft:
        "Hannah — we miss you. The room's quieter mid-week if you fancy a calmer evening. Tuesday or Wednesday work?",
    },
  ],

  social: [
    {
      id: "s1",
      site: "Islington",
      kind: "Instagram · Reel cover",
      draft:
        "Sweet, sour, sizzle. The takeaway combo with crispy chicken, fried rice and three spring rolls — under £15. Open till midnight.",
      imageUrl: "/sample-food/sweet-sour-takeaway.png",
      imageAlt: "Sweet & sour chicken takeaway with fried rice",
    },
    {
      id: "s2",
      site: "Camden",
      kind: "Instagram · Story",
      draft:
        "Ginger, spring onion, soy. Beef stir fry done the way our chef has been making it for twenty-six years. On the menu all week.",
      imageUrl: "/sample-food/ginger-beef.png",
      imageAlt: "Ginger beef stir fry with rice",
    },
    {
      id: "s3",
      site: "Shoreditch",
      kind: "Instagram · Carousel",
      draft:
        "Dim sum brunch is back. Three baskets, a bubble tea and the spring rolls. Saturdays 11–3, walk-ins welcome.",
      imageUrl: "/sample-food/dim-sum-brunch.png",
      imageAlt: "Dim sum baskets with bubble tea and spring rolls",
    },
    {
      id: "s4",
      site: "Camden",
      kind: "Instagram · Reel cover",
      draft:
        "Mapo tofu, lo mein, kung pao. The Sichuan three-way landing Tuesday — sit-in or take it home, your shout.",
      imageUrl: "/sample-food/sichuan-trio.png",
      imageAlt: "Mapo tofu, chow mein and kung pao chicken",
    },
  ],

  customers: [
    { id: "g1", initial: "S", name: "Sarah Ahmed", site: "Islington", visits: 7, spend: 312, tag: "Lamb regular", recency: "sage", last: "2 days ago", birthMonth: 7, pipelineStage: "active", source: "instagram" },
    { id: "g2", initial: "D", name: "Daniel Okafor", site: "Camden", visits: 3, spend: 142, tag: "New regular?", recency: "amber", last: "5 days ago", pipelineStage: "active", source: "google" },
    { id: "g3", initial: "O", name: "Olu Adebayo", site: "Islington", visits: 14, spend: 740, tag: "VIP", recency: "crimson", last: "71 days ago", birthMonth: 11, pipelineStage: "recovery", source: "referral" },
    { id: "g4", initial: "P", name: "Priya Shah", site: "Camden", visits: 22, spend: 1180, tag: "VIP · birthday Apr", recency: "amber", last: "64 days ago", birthMonth: 5, birthDay: 3, pipelineStage: "vip", source: "walk-in" },
    { id: "g5", initial: "M", name: "Marcus Lee", site: "Camden", visits: 9, spend: 408, tag: "Spice fan", recency: "amber", last: "60 days ago", pipelineStage: "at-risk", source: "instagram" },
    { id: "g6", initial: "H", name: "Hannah Khan", site: "Shoreditch", visits: 11, spend: 540, tag: "VIP", recency: "crimson", last: "67 days ago", birthMonth: 5, birthDay: 6, pipelineStage: "recovery", source: "referral" },
    { id: "g7", initial: "T", name: "Tom & Rachel Hill", site: "Shoreditch", visits: 16, spend: 820, tag: "Family regulars", recency: "crimson", last: "83 days ago", pipelineStage: "at-risk", source: "walk-in" },
    { id: "g8", initial: "J", name: "Jamie Park", site: "Shoreditch", visits: 2, spend: 78, tag: "New", recency: "sage", last: "today", birthMonth: 5, birthDay: 2, pipelineStage: "lead", source: "booking" },
  ],

  tonight: [
    { id: "t1", time: "18:00", name: "Sarah Ahmed", party: 2, tags: ["Regular", "Lamb"], status: "arrived" },
    { id: "t2", time: "18:30", name: "Park / Anniversary", party: 4, tags: ["VIP", "Anniversary"], status: "expected" },
    { id: "t3", time: "19:00", name: "Mehta", party: 3, tags: ["Severe nut allergy"], status: "expected", flag: "allergy" },
    { id: "t4", time: "19:00", name: "Walker", party: 2, tags: [], status: "expected" },
    { id: "t5", time: "19:30", name: "Olu Adebayo", party: 2, tags: ["VIP", "Recovery"], status: "expected", flag: "vip" },
    { id: "t6", time: "20:00", name: "Davies (4)", party: 4, tags: ["Birthday"], status: "expected" },
    { id: "t7", time: "20:30", name: "Henderson", party: 6, tags: ["Walk-in nope"], status: "expected" },
    { id: "t8", time: "21:00", name: "Late seating · 2 tops", party: 0, tags: [], status: "expected" },
  ],

  threads: [
    { id: "c1", site: "Islington", name: "Sarah Ahmed", last: "Perfect, see you Thursday at 7.", time: "12m", unread: false, ai: true },
    { id: "c2", site: "Camden", name: "Priya Shah", last: "I'd love the corner table, thank you Juliet 💛", time: "1h", unread: true, ai: false },
    { id: "c3", site: "Shoreditch", name: "James Foster", last: "Can I move the Saturday booking to 8pm?", time: "2h", unread: true, ai: false, needs: true },
    { id: "c4", site: "Camden", name: "Marcus Lee", last: "Yes please put me down for Wed.", time: "4h", unread: false, ai: true },
    { id: "c5", site: "Islington", name: "Olu Adebayo", last: "Friday two-top sounds great.", time: "yesterday", unread: false, ai: true },
  ],

  campaigns: [
    { id: "cm1", site: "All sites", name: "Spring win-back · 60-day silence", status: "sending", recipients: 142, sent: 87, channel: "WhatsApp", cost: "~£6" },
    { id: "cm2", site: "Islington", name: "May birthdays · Islington", status: "scheduled", recipients: 38, when: "2 May 11:00", channel: "WhatsApp", cost: "~£1.60" },
    { id: "cm3", site: "All sites", name: "Eid family menu", status: "sent", recipients: 312, channel: "Email", cost: "£0" },
    { id: "cm4", site: "Camden", name: "Late-summer regulars · Camden", status: "paused", recipients: 64, channel: "WhatsApp", cost: "~£2.60" },
  ],

  integrations: [
    { provider: "ResDiary", type: "Bookings", status: "green", sync: "2 min ago", scopes: ["Bookings", "Customers", "Sites", "Dietary"] },
    { provider: "Square", type: "POS", status: "red", sync: "6h ago", scopes: ["Transactions", "Items"], error: "Square logged us out at 06:14" },
    { provider: "Google Business Profile", type: "Reviews", status: "green", sync: "4 min ago", scopes: ["Reviews", "Reply"] },
    { provider: "WhatsApp", type: "Messaging", status: "green", sync: "live", scopes: ["Send", "Receive"] },
    { provider: "Instagram", type: "Read-only", status: "amber", sync: "2h ago", scopes: ["Captions (read)"] },
    { provider: "Email", type: "Digest", status: "green", sync: "live", scopes: ["Send"] },
  ],

  team: [
    { id: "u1", name: "Juliet", email: "juliet@newwokscooking.co", role: "Owner", sites: "All sites", last: "now", initial: "J", tone: "ink" },
    { id: "u2", name: "Sam Reyes", email: "sam@newwokscooking.co", role: "Manager", sites: "Islington · Camden", last: "2 hours ago", initial: "S", tone: "" },
    { id: "u3", name: "Jess Owino", email: "jess@newwokscooking.co", role: "Host", sites: "Islington", last: "last night", initial: "J", tone: "sage" },
    { id: "u5", name: "Aleksy Nowak", email: "aleksy@newwokscooking.co", role: "Pending invite · expires in 5 days", sites: "Shoreditch", last: "—", initial: "?", tone: "", pending: true },
  ],

  birthdays: [
    {
      id: "b1",
      site: "Shoreditch",
      customerId: "g8",
      customerName: "Jamie Park",
      when: "Friday",
      voucher: "Free spring rolls + bubble tea",
      draft:
        "Jamie — early happy birthday from us. Spring rolls and a bubble tea on us when you're next in this week, just show this message. — Juliet",
    },
    {
      id: "b2",
      site: "Camden",
      customerId: "g4",
      customerName: "Priya Shah",
      when: "Saturday",
      voucher: "10% off + free dim sum basket",
      draft:
        "Priya — happy birthday week. We've kept your usual corner table free Saturday and a dim sum basket plus 10% off the bill is on us. No need to book a thing — just show this message. — Juliet",
    },
    {
      id: "b3",
      site: "Shoreditch",
      customerId: "g6",
      customerName: "Hannah Khan",
      when: "next Tues",
      voucher: "Free dessert of choice",
      draft:
        "Hannah — birthday week. Mango pudding or our new black sesame ice cream is on us when you're next in. Show this message at the till. — Juliet",
    },
  ],
};
