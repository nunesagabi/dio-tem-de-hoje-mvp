import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { NeedEstablishment } from "@/components/panel/NeedEstablishment";
import { ReservationsTable, type ResRow } from "@/components/panel/ReservationsTable";
import { myEstablishmentQuery, myReservationsQuery } from "@/lib/merchant";

export const Route = createFileRoute("/_authenticated/parceiro/reservas")({
  component: Reservas,
});

function Reservas() {
  const { data: est, isLoading } = useQuery(myEstablishmentQuery());
  const { data: rows } = useQuery(myReservationsQuery(est?.id));
  if (isLoading) return <div className="h-40 animate-pulse rounded-3xl bg-muted" />;
  if (!est) return <NeedEstablishment />;
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Reservas</h1>
      <ReservationsTable rows={(rows ?? []) as ResRow[]} />
    </div>
  );
}
