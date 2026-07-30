import { DonationDetailPage } from "@/components/admin/OperationsPages";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <DonationDetailPage id={id} />; }
