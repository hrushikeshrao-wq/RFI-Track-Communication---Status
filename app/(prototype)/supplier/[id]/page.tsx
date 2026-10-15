import { SupplierProfile } from "@/components/supplier-profile";
import { SUPPLIERS } from "@/lib/suppliers";

export function generateStaticParams() {
  return SUPPLIERS.map((supplier) => ({ id: supplier.id }));
}

export default async function SupplierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SupplierProfile id={id} />;
}
