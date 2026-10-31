import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { NeedEstablishment, PendingNotice } from "@/components/panel/NeedEstablishment";
import { EmptyState, StatusBadge } from "@/components/site/KitCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { myEstablishmentQuery, myKitsQuery } from "@/lib/merchant";
import { errMsg, formatBRL, formatShortDate, formatTime } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/parceiro/kits/")({
  component: Kits,
});

function Kits() {
  const qc = useQueryClient();
  const { data: est, isLoading } = useQuery(myEstablishmentQuery());
  const { data: kits } = useQuery(myKitsQuery(est?.id));
  if (isLoading) return <div className="h-40 animate-pulse rounded-3xl bg-muted" />;
  if (!est) return <NeedEstablishment />;

  async function setStatus(id: string, status: "publicado" | "encerrado" | "rascunho") {
    const { error } = await supabase.rpc("set_kit_status", { _id: id, _status: status });
    if (error) return toast.error(errMsg(error));
    toast.success(status === "publicado" ? "Kit publicado!" : status === "encerrado" ? "Kit desativado." : "Kit voltou para rascunho.");
    qc.invalidateQueries({ queryKey: ["my-kits"] });
  }

  return (
    <div>
      <PendingNotice status={est.status} />
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Kits</h1>
        <Button asChild><Link to="/parceiro/kits/novo">Novo kit</Link></Button>
      </div>
      <div className="mt-6 grid gap-4">
        {kits?.length === 0 && <EmptyState title="Você ainda não cadastrou kits">Crie o primeiro e publique quando estiver pronto.</EmptyState>}
        {kits?.map((k) => (
          <div key={k.id} className="flex flex-col gap-4 rounded-3xl bg-card p-5 shadow-soft md:flex-row md:items-center">
            {k.imagem && <img src={k.imagem} alt="" className="h-20 w-28 rounded-2xl object-cover" />}
            <div className="flex-1">
              <div className="flex items-center gap-2"><h2 className="text-lg font-semibold">{k.nome}</h2><StatusBadge status={k.status} /></div>
              <p className="text-sm text-muted-foreground">
                {formatBRL(k.preco)} · estoque {k.estoque_total} · {k.diario ? "todos os dias" : formatShortDate(k.data_disponibilidade)} · {formatTime(k.retirada_inicio)}–{formatTime(k.retirada_fim)} · {k.kit_items.length} itens
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm"><Link to="/parceiro/kits/$id" params={{ id: k.id }}>Editar</Link></Button>
              {k.status !== "publicado" && <Button size="sm" onClick={() => setStatus(k.id, "publicado")}>Publicar</Button>}
              {k.status === "publicado" && <Button size="sm" variant="secondary" onClick={() => setStatus(k.id, "encerrado")}>Desativar</Button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
