"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { FORGE } from "@/lib/data";
import { CustomerDetailView } from "@/components/widgets/CustomerDetailView";
import { deleteLocalCustomer, readLocalCustomers, upsertLocalCustomer } from "@/lib/customer-storage";
import type { Customer } from "@/lib/types";

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const F = FORGE;
  const id = params?.id;
  const [localCustomers, setLocalCustomers] = React.useState<Customer[]>([]);

  React.useEffect(() => {
    setLocalCustomers(readLocalCustomers());
  }, []);

  const c = [...localCustomers, ...F.customers].find((x) => x.id === id) ?? F.customers[2];

  const handleEditCustomer = async (customer: Customer) => {
    setLocalCustomers(upsertLocalCustomer(customer));
  };

  const handleDeleteCustomer = async (customer: Customer) => {
    setLocalCustomers(deleteLocalCustomer(customer));
    router.push("/customers");
  };

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
