import { redirect } from "next/navigation";

export default function Page() {
  redirect("/admin/operasional/donasi?status=PENDING_PAYMENT");
}
