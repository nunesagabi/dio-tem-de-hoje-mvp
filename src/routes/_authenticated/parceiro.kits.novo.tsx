import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { KitForm, emptyKit } from "@/components/panel/KitForm";
import { NeedEstablishment, PendingNotice } from "@/components/panel/NeedEstablishment";
import { myEstablishmentQuery } from "@/lib/merchant";

export const Route = createFileRoute("/_authenticated/parceiro/kits/novo")({
  component: Novo,
});

function Novo() {
  const { data: est, isLoading } = useQuery(myEstablishmentQuery());
  if (isLoading) return <div className="h-40 animate-pulse rounded-3xl bg-muted" />;
  if (!est) return <NeedEstablishment />;
  return (
    <div>
      <PendingNotice status={est.status} />
      <h1 className="mb-6 text-3xl font-bold">Novo kit</h1>
      <KitForm initial={emptyKit} />
    </div>
  );
}
