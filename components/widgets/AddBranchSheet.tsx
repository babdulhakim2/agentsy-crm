"use client";

import * as React from "react";
import { Sheet, Field } from "./Sheet";
import { Icon } from "../icons";

export interface BranchPayload {
  name: string;
  phone?: string;
  address?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (b: BranchPayload) => void;
}

export function AddBranchSheet({ open, onClose, onAdd }: Props) {
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) {
      setName("");
      setPhone("");
      setAddress("");
      setError(null);
    }
  }, [open]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Branch name is required.");
      return;
    }
    onAdd({
      name: name.trim(),
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
    });
    onClose();
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      eyebrow="New branch"
      title="Add a branch"
      subtitle="Add the site name and address. You can add more details later."
    >
      <form onSubmit={submit}>
        <Field label="Branch name" htmlFor="ab-name">
          <input
            id="ab-name"
            className="big-input"
            autoFocus
            placeholder="e.g. Soho"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Field label="Site phone (optional)" htmlFor="ab-phone">
          <input
            id="ab-phone"
            className="input"
            placeholder="+44 20 7946 0000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="tel"
          />
        </Field>
        <Field label="Address (optional)" htmlFor="ab-addr">
          <input
            id="ab-addr"
            className="input"
            placeholder="14 Carnaby Street, London W1F 9PR"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
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
          <Icon.Plus s={14} c="#fff" w={2.4} /> Add branch
        </button>
      </form>
    </Sheet>
  );
}
