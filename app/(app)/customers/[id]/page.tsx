"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { FORGE } from "@/lib/data";
import { CustomerDetailView } from "@/components/widgets/CustomerDetailView";
import { deleteLocalCustomer, readLocalCustomers, upsertLocalCustomer } from "@/lib/customer-storage";
import type { Customer } from "@/lib/types";
import { customerFromBackend } from "@/lib/customer-adapter";
import { isConvexReady } from "@/lib/convex";

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const F = FORGE;
  const id = params?.id;
  const [localCustomers, setLocalCustomers] = React.useState<Customer[]>([]);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    if (!isConvexReady()) setLocalCustomers(readLocalCustomers());
  }, []);

  if (mounted && isConvexReady() && id && !id.startsWith("local-")) {
    return <BackendCustomerDetail id={id} onBack={() => router.push("/customers")} />;
  }

  const c = [...localCustomers, ...(!isConvexReady() ? F.customers : [])].find((x) => x.id === id);

  const handleEditCustomer = async (customer: Customer) => {
    setLocalCustomers(upsertLocalCustomer(customer));
  };

  const handleDeleteCustomer = async (customer: Customer) => {
    setLocalCustomers(deleteLocalCustomer(customer));
    router.push("/customers");
  };

  if (!c) {
    return (
      <div className="screen-mobile paper-grain">
        <div className="detail-empty">
          <div className="h">Customer not found</div>
          <button type="button" className="btn btn-terracotta" onClick={() => router.push("/customers")}>
            Back to customers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen-mobile paper-grain">
      <CustomerDetailView
        customer={c}
        onBack={() => router.push("/customers")}
        showBack
        onEditCustomer={handleEditCustomer}
        onDeleteCustomer={handleDeleteCustomer}
      />
    </div>
  );
}

function BackendCustomerDetail({ id, onBack }: { id: string; onBack: () => void }) {
  const router = useRouter();
  const row = useQuery(api.customers.get, { id: id as Id<"customers"> });
  const current = useQuery(api.users.current);

  if (row === undefined || current === undefined) {
    return (
      <div className="screen-mobile paper-grain">
        <div className="detail-empty">
          <div className="h">Loading customer</div>
        </div>
      </div>
    );
  }

  if (!row) {
    return (
      <div className="screen-mobile paper-grain">
        <div className="detail-empty">
          <div className="h">Customer not found</div>
          <button type="button" className="btn btn-terracotta" onClick={onBack}>
            Back to customers
          </button>
        </div>
      </div>
    );
  }

  const tenant = current?.tenants.find((candidate) => candidate.group);
  const siteById = new Map((tenant?.sites ?? []).map((site) => [site._id, site.name]));
  const customer = customerFromBackend(row, siteById, tenant?.sites[0]?.name ?? "Main site");

  const handleEditCustomer = async (next: Customer) => {
    await updateBackendCustomer(next);
  };

  const handleDeleteCustomer = async () => {
    await deleteBackendCustomer(id);
    router.push("/customers");
  };

  return (
    <div className="screen-mobile paper-grain">
      <CustomerDetailView
        customer={customer}
        onBack={onBack}
        showBack
        onEditCustomer={handleEditCustomer}
        onDeleteCustomer={handleDeleteCustomer}
      />
    </div>
  );
}

async function updateBackendCustomer(customer: Customer) {
  const res = await fetch("/api/customers/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: customer.id,
      phone: customer.phone,
      name: customer.name,
      email: customer.email,
      tags: customer.tag ? [customer.tag] : [],
      customerSource: customer.source,
      address: customer.address,
      birthMonth: customer.birthMonth,
      birthDay: customer.birthDay,
      pipelineStage: customer.pipelineStage,
    }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Could not update customer.");
  }
}

async function deleteBackendCustomer(id: string) {
  const res = await fetch("/api/customers/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Could not delete customer.");
  }
}
