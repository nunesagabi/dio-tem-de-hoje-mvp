import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { KIT_IMAGES } from "@/lib/types";
import { errMsg } from "@/lib/format";

export type KitFormValues = {
  nome: string; descricao: string; imagem: string; preco: string; preco_referencia: string; estoque_total: string;
  diario: boolean; data_disponibilidade: string; retirada_inicio: string; retirada_fim: string;
  ingredientes: string; alergenicos: string; conservacao: string;
  items: { nome: string; quantidade: string; unidade: string }[];
};

export const emptyKit: KitFormValues = {
  nome: "", descricao: "", imagem: KIT_IMAGES[0].url, preco: "", preco_referencia: "", estoque_total: "",
  diario: false, data_disponibilidade: "", retirada_inicio: "17:00", retirada_fim: "19:00",
  ingredientes: "", alergenicos: "", conservacao: "", items: [{ nome: "", quantidade: "1", unidade: "un" }],
};

export function validateKit(v: KitFormValues, publish: boolean): string | null {
  if (v.nome.trim().length < 2) return "Informe o nome do kit.";
  const preco = Number(v.preco.replace(",", "."));
  if (!(preco > 0)) return "O preço deve ser maior que zero.";
  if (v.preco_referencia && !(Number(v.preco_referencia.replace(",", ".")) > preco)) return "O preço de referência deve ser maior que o preço de venda.";
  const est = Number(v.estoque_total);
  if (!Number.isInteger(est) || est < 0) return "O estoque deve ser um número inteiro.";
  if (!v.retirada_inicio || !v.retirada_fim) return "Informe a janela de retirada.";
  if (v.retirada_fim <= v.retirada_inicio) return "O horário final da retirada deve ser posterior ao inicial.";
  if (!v.diario && !v.data_disponibilidade) return "Informe a data de disponibilidade.";
  for (const it of v.items) {
    if (!it.nome.trim()) return "Todo item precisa de um nome.";
    if (!(Number(it.quantidade.replace(",", ".")) > 0)) return "A quantidade de cada item deve ser positiva.";
  }
  if (publish) {
    if (v.items.length < 1) return "Cadastre pelo menos um item para publicar.";
    if (est < 1) return "Para publicar, o estoque deve ser maior que zero.";
  }
  return null;
}

export function KitForm({ id, initial }: { id?: string; initial: KitFormValues }) {
  const [v, setV] = useState(initial);
  const [saving, setSaving] = useState<null | "rascunho" | "publicado">(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const qc = useQueryClient();
  const set = <K extends keyof KitFormValues>(k: K, val: KitFormValues[K]) => setV({ ...v, [k]: val });

  async function save(status: "rascunho" | "publicado") {
    const err = validateKit(v, status === "publicado");
    if (err) { setError(err); return; }
    setError("");
    setSaving(status);
    const { items, ...rest } = v;
    const { error } = await supabase.rpc("save_kit", {
      _id: id ?? (null as unknown as string),
      _data: { ...rest, preco: rest.preco.replace(",", "."), preco_referencia: rest.preco_referencia.replace(",", "."), estoque_total: Number(rest.estoque_total), status },
      _items: items.map((i) => ({ ...i, quantidade: Number(i.quantidade.replace(",", ".")) })),
    });
    setSaving(null);
    if (error) { setError(errMsg(error)); return; }
    toast.success(status === "publicado" ? "Kit salvo e publicado!" : "Kit salvo.");
    qc.invalidateQueries({ queryKey: ["my-kits"] });
    qc.invalidateQueries({ queryKey: ["public-kits"] });
    navigate({ to: "/parceiro/kits" });
  }

  const inp = "h-11 text-base";
  return (
    <form className="grid gap-6 lg:grid-cols-2" onSubmit={(e) => e.preventDefault()} noValidate>
      <div className="space-y-4 rounded-3xl bg-card p-6 shadow-soft">
        <div className="space-y-1.5"><Label htmlFor="nome">Nome do kit</Label><Input id="nome" className={inp} value={v.nome} maxLength={120} onChange={(e) => set("nome", e.target.value)} /></div>
        <div className="space-y-1.5"><Label htmlFor="desc">Descrição</Label><Textarea id="desc" value={v.descricao} maxLength={600} onChange={(e) => set("descricao", e.target.value)} /></div>
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Imagem ilustrativa</legend>
          <div className="grid grid-cols-3 gap-2">
            {KIT_IMAGES.map((img) => (
              <button type="button" key={img.url} onClick={() => set("imagem", img.url)} aria-pressed={v.imagem === img.url}
                className={`overflow-hidden rounded-2xl border-4 ${v.imagem === img.url ? "border-primary" : "border-transparent"}`}>
                <img src={img.url} alt={img.label} className="aspect-[4/3] w-full object-cover" />
              </button>
            ))}
          </div>
          <Input className={inp} placeholder="ou cole o link de uma foto (https://…)" value={KIT_IMAGES.some((i) => i.url === v.imagem) ? "" : v.imagem} onChange={(e) => set("imagem", e.target.value)} />
        </fieldset>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5"><Label htmlFor="preco">Preço (R$)</Label><Input id="preco" inputMode="decimal" className={inp} value={v.preco} onChange={(e) => set("preco", e.target.value)} /></div>
          <div className="space-y-1.5"><Label htmlFor="pref">Preço ref. (opcional)</Label><Input id="pref" inputMode="decimal" className={inp} value={v.preco_referencia} onChange={(e) => set("preco_referencia", e.target.value)} /></div>
          <div className="space-y-1.5"><Label htmlFor="est">Estoque</Label><Input id="est" type="number" min={0} className={inp} value={v.estoque_total} onChange={(e) => set("estoque_total", e.target.value)} /></div>
        </div>
        <label className="flex items-center gap-2 text-sm"><Checkbox checked={v.diario} onCheckedChange={(c) => set("diario", c === true)} /> Oferta diária (disponível todos os dias)</label>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5"><Label htmlFor="data">Data</Label><Input id="data" type="date" disabled={v.diario} className={inp} value={v.data_disponibilidade} onChange={(e) => set("data_disponibilidade", e.target.value)} /></div>
          <div className="space-y-1.5"><Label htmlFor="ini">Retirada de</Label><Input id="ini" type="time" className={inp} value={v.retirada_inicio} onChange={(e) => set("retirada_inicio", e.target.value)} /></div>
          <div className="space-y-1.5"><Label htmlFor="fim">até</Label><Input id="fim" type="time" className={inp} value={v.retirada_fim} onChange={(e) => set("retirada_fim", e.target.value)} /></div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="space-y-3 rounded-3xl bg-card p-6 shadow-soft">
          <h2 className="font-semibold">Itens do kit</h2>
          {v.items.map((it, i) => (
            <div key={i} className="grid grid-cols-[1fr_5rem_5rem_auto] gap-2">
              <Input aria-label={`Item ${i + 1}`} placeholder="Ex.: Croissant" value={it.nome} maxLength={100} onChange={(e) => set("items", v.items.map((x, j) => j === i ? { ...x, nome: e.target.value } : x))} />
              <Input aria-label="Quantidade" inputMode="decimal" value={it.quantidade} onChange={(e) => set("items", v.items.map((x, j) => j === i ? { ...x, quantidade: e.target.value } : x))} />
              <Input aria-label="Unidade" value={it.unidade} maxLength={10} onChange={(e) => set("items", v.items.map((x, j) => j === i ? { ...x, unidade: e.target.value } : x))} />
              <Button type="button" variant="ghost" size="icon" aria-label="Remover item" onClick={() => set("items", v.items.filter((_, j) => j !== i))}><Trash2 /></Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => set("items", [...v.items, { nome: "", quantidade: "1", unidade: "un" }])}><Plus /> Adicionar item</Button>
        </div>
        <div className="space-y-3 rounded-3xl bg-card p-6 shadow-soft">
          <div className="space-y-1.5"><Label htmlFor="ing">Ingredientes</Label><Textarea id="ing" value={v.ingredientes} maxLength={600} onChange={(e) => set("ingredientes", e.target.value)} /></div>
          <div className="space-y-1.5"><Label htmlFor="ale">Alergênicos</Label><Input id="ale" value={v.alergenicos} maxLength={300} onChange={(e) => set("alergenicos", e.target.value)} /></div>
          <div className="space-y-1.5"><Label htmlFor="con">Conservação</Label><Input id="con" value={v.conservacao} maxLength={300} onChange={(e) => set("conservacao", e.target.value)} /></div>
        </div>
        {error && <p role="alert" className="rounded-2xl bg-destructive/10 p-4 text-sm font-semibold text-destructive">{error}</p>}
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="outline" disabled={!!saving} onClick={() => save("rascunho")}>{saving === "rascunho" && <Loader2 className="animate-spin" />} Salvar rascunho</Button>
          <Button type="button" disabled={!!saving} onClick={() => save("publicado")}>{saving === "publicado" && <Loader2 className="animate-spin" />} Salvar e publicar</Button>
        </div>
      </div>
    </form>
  );
}
