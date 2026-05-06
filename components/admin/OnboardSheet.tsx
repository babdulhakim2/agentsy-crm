"use client";

import * as React from "react";
import { Sheet, Field } from "../widgets/Sheet";
import { Icon } from "../icons";
import type { AdminRestaurant } from "@/lib/admin-data";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreate: (r: AdminRestaurant) => void;
}

const TODAY = new Date().toLocaleDateString("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function OnboardSheet({ open, onClose, onCreate }: Props) {
  const [name, setName] = React.useState("");
  const [ownerName, setOwnerName] = React.useState("");
  const [ownerEmail, setOwnerEmail] = React.useState("");
  const [branchName, setBranchName] = React.useState("");
  const [branchAddress, setBranchAddress] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) {
      setName("");
      setOwnerName("");
      setOwnerEmail("");
      setBranchName("");
      setBranchAddress("");
      setError(null);
    }
  }, [open]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !ownerEmail.trim() || !branchName.trim()) {
      setError("Restaurant name, owner email and first branch are required.");
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(ownerEmail.trim())) {
      setError("That email looks off.");
      return;
    }
    onCreate({
      id: `local-${Date.now()}`,
      name: name.trim(),
      branches: [{ name: branchName.trim() }],
      ownerName: ownerName.trim() || ownerEmail.split("@")[0],
      ownerEmail: ownerEmail.trim(),
      status: "pending",
      plan: "— pending",
      monthlyGBP: 0,
      onboardedAt: TODAY,
    });
    onClose();
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      eyebrow="New restaurant"
      title="Onboard a restaurant"
      subtitle="Creates the tenant + first branch + sends the owner a magic-link invite."
    >
      <form onSubmit={submit}>
        <Field label="Restaurant name" htmlFor="ob-name">
          <input
            id="ob-name"
            className="big-input"
            autoFocus
            placeholder="e.g. New Wok's Cooking"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Field label="First branch" htmlFor="ob-branch">
          <input
            id="ob-branch"
            className="big-input"
            placeholder="e.g. Islington"
            value={branchName}
            onChange={(e) => setBranchName(e.target.value)}
          />
        </Field>
        <Field
          label="Branch address (optional)"
          htmlFor="ob-addr"
          hint="Used for Google Business Profile matching."
        >
          <input
            id="ob-addr"
            className="input"
            placeholder="220 Upper Street, London N1 1RU"
            value={branchAddress}
            onChange={(e) => setBranchAddress(e.target.value)}
          />
        </Field>
        <Field label="Owner name" htmlFor="ob-owner-name">
          <input
            id="ob-owner-name"
            className="input"
            placeholder="Juliet"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
          />
        </Field>
        <Field
          label="Owner email"
          htmlFor="ob-owner-email"
          hint="Magic-link invite goes here."
        >
          <input
            id="ob-owner-email"
            className="input"
            type="email"
            placeholder="juliet@newwokscooking.co"
            value={ownerEmail}
            onChange={(e) => setOwnerEmail(e.target.value)}
          />
        </Field>

        {error && (
          <div
            role="alert"
            style={{
              fontSize: 13,
              color: "var(--crimson)",
              background: "var(--crimson-tint)",
              padding: "10px 12px",
              borderRadius: 10,
              marginBottom: 12,
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          className="btn btn-terracotta"
          style={{ width: "100%", padding: "14px", fontSize: 15 }}
        >
          <Icon.Plus s={14} c="#fff" w={2.4} /> Create &amp; invite
        </button>
        <div
          style={{
            fontSize: 11,
            color: "var(--ink-3)",
            textAlign: "center",
            marginTop: 8,
            lineHeight: 1.4,
          }}
        >
          Defaults to Solo plan (£249/mo) until they add a second branch.
        </div>
      </form>
    </Sheet>
  );
}
