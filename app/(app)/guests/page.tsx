"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FORGE } from "@/lib/data";
import { Icon } from "@/components/icons";
import { GuestDetailView } from "@/components/widgets/GuestDetailView";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "risk", label: "At-risk" },
  { id: "vip", label: "VIPs" },
  { id: "wine", label: "Wine" },
] as const;

type FilterId = (typeof FILTERS)[number]["id"];

export default function GuestsPage() {
  const F = FORGE;
  const router = useRouter();
  const [q, setQ] = React.useState("");
  const [filter, setFilter] = React.useState<FilterId>("all");
  const [isDesktop, setIsDesktop] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string>(F.guests[0].id);

  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => setIsDesktop(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const filtered = F.guests.filter((g) => {
    if (q && !g.name.toLowerCase().includes(q.toLowerCase())) return false;
    if (filter === "risk" && g.recency !== "crimson") return false;
    if (filter === "vip" && !g.tag.toLowerCase().includes("vip")) return false;
    if (filter === "wine" && !g.tag.toLowerCase().includes("wine")) return false;
    return true;
  });

  const selected = F.guests.find((g) => g.id === selectedId) ?? F.guests[0];

  const handleRowClick = (id: string) => {
    if (isDesktop) {
      setSelectedId(id);
    } else {
      router.push(`/guests/${id}`);
    }
  };

  return (
    <div className="screen-twocol paper-grain">
      <div className="screen-twocol__list">
        <div className="page-title">
          <div className="eyebrow">Guests · 8,304 across all sites</div>
          <div className="h">Find anyone in two seconds.</div>
        </div>

        <div style={{ padding: "10px 14px" }}>
          <div style={{ position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--ink-3)",
              }}
            >
              <Icon.Search s={16} />
            </span>
            <input
              className="input"
              placeholder="Name, phone, email…"
              style={{ paddingLeft: 36 }}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search guests"
            />
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={filter === f.id ? "chip chip-terra" : "chip"}
                style={{ cursor: "pointer" }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          {filtered.map((g) => {
            const active = isDesktop && g.id === selectedId;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => handleRowClick(g.id)}
                className={"list-row" + (active ? " active" : "")}
              >
                <div className="avatar">{g.initial}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span className={`dot dot-${g.recency}`} />
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{g.name}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>
                    {g.site} · {g.visits} visits · £{g.spend} · {g.last}
                  </div>
                </div>
                <span className="chip" style={{ flexShrink: 0 }}>
                  {g.tag}
                </span>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ padding: 36, textAlign: "center", color: "var(--ink-3)" }}>
              <div className="serif-i">Nobody by that name yet.</div>
            </div>
          )}
          <div
            style={{
              padding: "14px 18px",
              fontSize: 12,
              color: "var(--ink-3)",
              fontStyle: "italic",
            }}
          >
            Still importing — 2,140 of 8,300 guests synced.
          </div>
        </div>
      </div>

      <div className="screen-twocol__detail">
        {selected ? (
          <GuestDetailView guest={selected} />
        ) : (
          <div className="detail-empty">
            <div className="h">Select a guest</div>
            <div>Pick a name from the list to see their full profile.</div>
          </div>
        )}
      </div>
    </div>
  );
}
