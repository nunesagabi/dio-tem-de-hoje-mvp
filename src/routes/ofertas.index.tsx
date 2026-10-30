import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { EmptyState, KitCard } from "@/components/site/KitCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { publicKitsQuery } from "@/lib/queries";
import { tipoLabel } from "@/lib/format";

export const Route = createFileRoute("/ofertas/")({
  head: () => ({
    meta: [
      { title: "Ofertas de hoje · tem de hoje." },
      { name: "description", content: "Kits de padarias e cafeterias com preço reduzido. Filtre por bairro e tipo de estabelecimento." },
      { property: "og:title", content: "Ofertas de hoje · tem de hoje." },
      { property: "og:description", content: "Catálogo demonstrativo de kits de padarias e cafeterias em São Paulo." },
    ],
  }),
  component: Ofertas,
});

const selectCls =
  "h-11 w-full rounded-xl border border-input bg-card px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function Ofertas() {
  const { data: kits, isLoading, error, refetch } = useQuery(publicKitsQuery());
  const [q, setQ] = useState("");
  const [bairro, setBairro] = useState("");
  const [tipo, setTipo] = useState("");

  const bairros = useMemo(
    () => [...new Set((kits ?? []).map((k) => k.establishment.bairro))].sort(),
    [kits],
  );
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (kits ?? []).filter(
      (k) =>
        (!bairro || k.establishment.bairro === bairro) &&
        (!tipo || k.establishment.tipo === tipo) &&
        (!term || k.nome.toLowerCase().includes(term) || k.establishment.nome.toLowerCase().includes(term)),
    );
  }, [kits, q, bairro, tipo]);

  return (
    <PublicLayout>
      <section className="container-page py-10">
        <h1 className="text-4xl font-bold">Ofertas de hoje</h1>
        <p className="mt-2 text-muted-foreground">Escolha um kit, reserve e retire no horário combinado.</p>

        <div className="mt-8 grid gap-4 rounded-3xl bg-card p-5 shadow-soft md:grid-cols-[2fr_1fr_1fr]">
          <div className="space-y-1.5">
            <Label htmlFor="busca">Buscar</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="busca" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nome do kit ou estabelecimento" className="h-11 rounded-xl pl-9 text-base" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bairro">Bairro</Label>
            <select id="bairro" className={selectCls} value={bairro} onChange={(e) => setBairro(e.target.value)}>
              <option value="">Todos os bairros</option>
              {bairros.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tipo">Tipo</Label>
            <select id="tipo" className={selectCls} value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="">Todos</option>
              {Object.entries(tipoLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading && [0, 1, 2].map((i) => <div key={i} className="aspect-[4/5] animate-pulse rounded-3xl bg-muted" />)}
          {filtered.map((k) => <KitCard key={k.id} kit={k} />)}
        </div>
        {error && (
          <EmptyState title="Não conseguimos carregar as ofertas">
            <Button className="mt-3" onClick={() => refetch()}>Tentar de novo</Button>
          </EmptyState>
        )}
        {kits && filtered.length === 0 && (
          <EmptyState title="Nenhum kit encontrado">
            Tente outro bairro ou limpe os filtros.
            <div><Button variant="outline" className="mt-4" onClick={() => { setQ(""); setBairro(""); setTipo(""); }}>Limpar filtros</Button></div>
          </EmptyState>
        )}
      </section>
    </PublicLayout>
  );
}
