"use client";

import type { Customer } from "./types";
import { phoneIdentityKey } from "./phone";

const LOCAL_CUSTOMERS_KEY = "agentsy.localCustomers";
const DELETED_CUSTOMERS_KEY = "agentsy.deletedCustomers";

export function readLocalCustomers(): Customer[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_CUSTOMERS_KEY);
    const parsed = raw ? (JSON.parse(raw) as Customer[]) : [];
    return Array.isArray(parsed) ? parsed.filter(isCustomerLike) : [];
  } catch {
    return [];
  }
}

export function writeLocalCustomers(customers: Customer[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCAL_CUSTOMERS_KEY, JSON.stringify(customers));
}

export function prependLocalCustomer(customer: Customer): Customer[] {
  return upsertLocalCustomer(customer);
}

export function upsertLocalCustomer(customer: Customer): Customer[] {
  clearDeletedCustomer(customer);
  const existing = readLocalCustomers();
  const phone = customerPhoneKey(customer.phone);
  const withoutDuplicate = existing.filter((item) => {
    if (item.id === customer.id) return false;
    if (phone && customerPhoneKey(item.phone) === phone) return false;
    return true;
  });
  const next = [customer, ...withoutDuplicate];
  writeLocalCustomers(next);
  return next;
}

export function deleteLocalCustomer(customer: Customer): Customer[] {
  const deleted = new Set(readDeletedCustomerKeys());
  deleted.add(customer.id);
  const phone = customerPhoneKey(customer.phone);
  if (phone) deleted.add(`phone:${phone}`);
  writeDeletedCustomerKeys([...deleted]);

  const next = readLocalCustomers().filter((item) => {
    if (item.id === customer.id) return false;
    if (phone && customerPhoneKey(item.phone) === phone) return false;
    return true;
  });
  writeLocalCustomers(next);
  return next;
}

export function isCustomerDeleted(customer: Customer): boolean {
  const deleted = new Set(readDeletedCustomerKeys());
  const phone = customerPhoneKey(customer.phone);
  return deleted.has(customer.id) || Boolean(phone && deleted.has(`phone:${phone}`));
}

export function customerPhoneKey(phone?: string): string {
  return phoneIdentityKey(phone);
}

function readDeletedCustomerKeys(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(DELETED_CUSTOMERS_KEY);
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    return Array.isArray(parsed) ? parsed.filter((key) => typeof key === "string") : [];
  } catch {
    return [];
  }
}

function writeDeletedCustomerKeys(keys: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DELETED_CUSTOMERS_KEY, JSON.stringify(keys));
}

function clearDeletedCustomer(customer: Customer) {
  const phone = customerPhoneKey(customer.phone);
  const next = readDeletedCustomerKeys().filter((key) => key !== customer.id && key !== `phone:${phone}`);
  writeDeletedCustomerKeys(next);
}

function isCustomerLike(value: unknown): value is Customer {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<Customer>;
  return Boolean(candidate.id && candidate.name && candidate.initial && candidate.site);
}
