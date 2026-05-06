import { redirect } from "next/navigation";

export default function LegacyGuestsRedirect(): never {
  redirect("/customers");
}
