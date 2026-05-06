import { redirect } from "next/navigation";

export default function LegacyGuestRedirect({ params }: { params: { id: string } }): never {
  redirect(`/customers/${params.id}`);
}
