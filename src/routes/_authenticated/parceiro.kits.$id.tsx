import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { KitForm } from "@/components/panel/KitForm";
import { EmptyState } from "@/components/site/KitCard";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/parceiro/kits/$id")({
  component: Editar,
});

function Editar() {
  const { id } = Route.useParams();
  const { data: k, isLoading } = useQuery({
    queryKey: ["kit-edit", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("kits").select("*, kit_items(*)").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  if (isLoading) return <div className="h-40 animate-pulse rounded-3xl bg-muted" />;
  if (!k) return <EmptyState title="Kit não encontrado" />;
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Editar kit</h1>
      <KitForm
        id={k.id}
        initial={{
          nome: k.nome, descricao: k.descricao, imagem: k.imagem ?? "", preco: String(k.preco),
          preco_referencia: k.preco_referencia ? String(k.preco_referencia) : "", estoque_total: String(k.estoque_total),
          diario: k.diario, data_disponibilidade: k.data_disponibilidade ?? "",
          retirada_inicio: k.retirada_inicio.slice(0, 5), retirada_fim: k.retirada_fim.slice(0, 5),
          ingredientes: k.ingredientes, alergenicos: k.alergenicos, conservacao: k.conservacao,
          items: [...k.kit_items].sort((a, b) => a.ordem - b.ordem).map((i) => ({ nome: i.nome, quantidade: String(i.quantidade), unidade: i.unidade })),
        }}
      />
    </div>
  );
}
