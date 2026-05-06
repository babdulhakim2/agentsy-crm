"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FORGE } from "@/lib/data";
import { ThreadView } from "@/components/widgets/ThreadView";
import { SiteTag } from "@/components/widgets/SiteTag";
import { useSite } from "@/lib/site-context";

export default function InboxPage() {
  const F = FORGE;
  const router = useRouter();
  const { activeSiteName, filterByActiveSite } = useSite();
  const [isDesktop, setIsDesktop] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string>(F.threads[0].id);

  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => setIsDesktop(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const threads = filterByActiveSite(F.threads);
  const selected = threads.find((t) => t.id === selectedId) ?? threads[0];

  const handleClick = (id: string) => {
    if (isDesktop) {
      setSelectedId(id);
    } else {
      router.push(`/inbox/${id}`);
    }
  };

  return (
    <div className="screen-twocol paper-grain">
      <div className="screen-twocol__list">
        <div className="page-title">
          <div className="eyebrow">Inbox · WhatsApp + email · {activeSiteName}</div>
          <div className="h">I take the FAQs. You take the rest.</div>
        </div>
        <div style={{ flex: 1 }}>
          {threads.map((t) => {
            const active = isDesktop && t.id === selectedId;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => handleClick(t.id)}
                className={"list-row" + (active ? " active" : "")}
              >
                <div className="avatar">{t.name[0]}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 14, fontWeight: t.unread ? 700 : 500 }}>{t.name}</span>
                    <SiteTag site={t.site} subtle />
                    {t.ai && (
                      <span className="chip chip-sage" style={{ fontSize: 10.5, padding: "2px 6px" }}>
                        I took this
                      </span>
                    )}
                    {t.needs && (
                      <span className="chip chip-crimson" style={{ fontSize: 10.5, padding: "2px 6px" }}>
                        Needs you
                      </span>
                    )}
                    <span style={{ fontSize: 11, color: "var(--ink-3)", marginLeft: "auto" }}>{t.time}</span>
                  </div>
                  <div
                    style={{
                      fontSize: 12.5,
                      color: "var(--ink-3)",
                      marginTop: 3,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {t.last}
                  </div>
                </div>
                {t.unread && (
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 999,
                      background: "var(--terracotta)",
                      flexShrink: 0,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="screen-twocol__detail">
        {selected ? (
          <ThreadView thread={selected} />
        ) : (
          <div className="detail-empty">
            <div className="h">Pick a conversation</div>
            <div>Threads from WhatsApp and email show up here.</div>
          </div>
        )}
      </div>
    </div>
  );
}
