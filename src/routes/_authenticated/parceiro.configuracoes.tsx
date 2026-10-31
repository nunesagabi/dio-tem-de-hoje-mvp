import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/site/KitCard";
import { supabase } from "@/integrations/supabase/client";
import { myEstablishmentQuery } from "@/lib/merchant";
import { errMsg, tipoLabel } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/parceiro/configuracoes")({
  component: Config,
});

const empty = { nome: "", tipo: "padaria", descricao: "", endereco: "", bairro: "", cidade: "São Paulo", telefone: "", horario_funcionamento: "" };

function Config() {
  const qc = useQueryClient();
  const { data: est, isLoading } = useQuery(myEstablishmentQuery());
  const [v, setV] = useState(empty);
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (est) setV({ ...empty, ...est }); }, [est]);
  if (isLoading) return <div className="h-40 animate-pulse rounded-3xl bg-muted" />;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (v.nome.trim().length < 2 || v.endereco.trim().length < 3 || v.bairro.trim().length < 2) return toast.error("Preencha nome, endereço e bairro.");
    setSaving(true);
    const { error } = await supabase.rpc("register_establishment", { _data: v });
    setSaving(false);
    if (error) return toast.error(errMsg(error));
    toast.success(est ? "Dados atualizados." : "Cadastro enviado para análise!");
    qc.invalidateQueries();
  }

  const f = (k: keyof typeof empty, label: string, max = 120) => (
    <div className="space-y-1.5"><Label htmlFor={k}>{label}</Label><Input id={k} className="h-11" maxLength={max} value={v[k]} onChange={(e) => setV({ ...v, [k]: e.target.value })} /></div>
  );

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center gap-3"><h1 className="text-3xl font-bold">Estabelecimento</h1>{est && <StatusBadge status={est.status} />}</div>
      <form onSubmit={save} className="space-y-4 rounded-3xl bg-card p-6 shadow-soft">
        {f("nome", "Nome comercial")}
        <div className="space-y-1.5"><Label htmlFor="tipo">Tipo</Label>
          <select id="tipo" className="h-11 w-full rounded-md border border-input bg-card px-3" value={v.tipo} onChange={(e) => setV({ ...v, tipo: e.target.value })}>
            {Object.entries(tipoLabel).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select></div>
        <div className="space-y-1.5"><Label htmlFor="descricao">Descrição</Label><Textarea id="descricao" maxLength={600} value={v.descricao} onChange={(e) => setV({ ...v, descricao: e.target.value })} /></div>
        {f("endereco", "Endereço", 200)}
        <div className="grid grid-cols-2 gap-3">{f("bairro", "Bairro", 80)}{f("cidade", "Cidade", 80)}</div>
        <div className="grid grid-cols-2 gap-3">{f("telefone", "Telefone comercial", 20)}{f("horario_funcionamento", "Horário de funcionamento")}</div>
        <Button type="submit" disabled={saving}>{saving && <Loader2 className="animate-spin" />}{est ? "Salvar alterações" : "Enviar cadastro"}</Button>
      </form>
    </div>
  );
}
