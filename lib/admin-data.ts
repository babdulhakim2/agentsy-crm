// Demo data for the platform admin dashboard. Pure local state until Convex is wired.

export interface AdminBranch {
  name: string;
  covers?: number;
}

export interface AdminRestaurant {
  id: string;
  name: string;
  branches: AdminBranch[];
  ownerName: string;
  ownerEmail: string;
  status: "active" | "pending" | "paused";
  plan: string;
  monthlyGBP: number;
  onboardedAt: string;
}

export const ADMIN_RESTAURANTS: AdminRestaurant[] = [
  {
    id: "nwc",
    name: "New Wok's Cooking",
    branches: [{ name: "Islington", covers: 38 }],
    ownerName: "Juliet",
    ownerEmail: "juliet@newwokscooking.co",
    status: "active",
    plan: "Solo",
    monthlyGBP: 249,
    onboardedAt: "12 Apr 2026",
  },
  {
    id: "forge",
    name: "The Forge Group",
    branches: [
      { name: "Hackney", covers: 18 },
      { name: "King's Cross", covers: 21 },
      { name: "Peckham", covers: 8 },
    ],
    ownerName: "Maya Hayward",
    ownerEmail: "maya@theforge.co",
    status: "active",
    plan: "Group · 3 sites",
    monthlyGBP: 747,
    onboardedAt: "3 Mar 2026",
  },
  {
    id: "pho88",
    name: "Pho 88",
    branches: [{ name: "Soho" }],
    ownerName: "Linh Tran",
    ownerEmail: "linh@pho88.co",
    status: "pending",
    plan: "— pending",
    monthlyGBP: 0,
    onboardedAt: "28 Apr 2026",
  },
];
