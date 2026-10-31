import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Stat } from "@/components/panel/PanelShell";
import { NeedEstablishment, PendingNotice } from "@/components/panel/NeedEstablishment";
import { StatusBadge } from "@/components/site/KitCard";
import { Button } from "@/components/ui/button";
import { myEstablishmentQuery, myKitsQuery, myReservationsQuery } from "@/lib/merchant";
import { formatBRL } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/parceiro/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { data: est, isLoading } = useQuery(myEstablishmentQuery());
  const { data: kits } = useQuery(myKitsQuery(est?.id));
  const { data: res } = useQuery(myReservationsQuery(est?.id));
  if (isLoading) return <div className="h-40 animate-pulse rounded-3xl bg-muted" />;
  if (!est) return <NeedEstablishment />;
  return (
    <div>
      <PendingNotice status={est.status} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">{est.nome}</h1>
          <div className="mt-1"><StatusBadge status={est.status} /></div>
        </div>
        <Button asChild><Link to="/parceiro/kits/novo">Novo kit</Link></Button>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Kits ativos" value={kits?.filter((k) => k.status === "publicado").length ?? 0} />
        <Stat label="Reservas" value={res?.length ?? 0} />
        <Stat label="Retiradas concluídas" value={res?.filter((r) => r.status === "retirada").length ?? 0} />
      </div>
      <h2 className="mt-10 text-xl font-semibold">Suas ofertas</h2>
      <div className="mt-4 space-y-3">
        {kits?.length === 0 && <p className="text-muted-foreground">Nenhum kit ainda.</p>}
        {kits?.map((k) => (
          <Link key={k.id} to="/parceiro/kits/$id" params={{ id: k.id }} className="flex items-center justify-between rounded-2xl bg-card p-4 hover:shadow-soft">
            <span className="font-semibold">{k.nome}</span>
            <span className="flex items-center gap-3 text-sm">{formatBRL(k.preco)} <StatusBadge status={k.status} /></span>
          </Link>
        ))}
      </div>
    </div>
  );
}
