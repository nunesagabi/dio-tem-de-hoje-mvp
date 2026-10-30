import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { errMsg, tipoLabel } from "@/lib/format";

export const Route = createFileRoute("/parceiros")({
  head: () => ({
    meta: [
      { title: "Quero anunciar meus kits · tem de hoje." },
      { name: "description", content: "Padarias e cafeterias: solicite participação no projeto demonstrativo tem de hoje." },
      { property: "og:title", content: "Anuncie seus kits · tem de hoje." },
      { property: "og:description", content: "Menos desperdício, mais oportunidades para o seu negócio." },
    ],
  }),
  component: Parceiros,
});

const schema = z.object({
  estabelecimento: z.string().trim().min(2, "Informe o nome do estabelecimento.").max(120),
  responsavel: z.string().trim().min(2, "Informe o nome do responsável.").max(100),
  telefone: z.string().refine((v) => { const d = v.replace(/\D/g, ""); return d.length >= 10 && d.length <= 11; }, "Informe um telefone com DDD."),
  bairro: z.string().trim().min(2, "Informe o bairro.").max(80),
  tipo: z.enum(["padaria", "cafeteria", "confeitaria"], { errorMap: () => ({ message: "Escolha o tipo." }) }),
  email: z.string().trim().max(255).email("E-mail inválido.").optional().or(z.literal("")),
});

function Parceiros() {
  const [form, setForm] = useState({ estabelecimento: "", responsavel: "", telefone: "", bairro: "", tipo: "", email: "" });
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState("");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");
    const r = schema.safeParse(form);
    if (!r.success) {
      setErrors(Object.fromEntries(r.error.issues.map((i) => [i.path[0], i.message])));
      return;
    }
    setErrors({});
    setSending(true);
    const { error } = await supabase.rpc("submit_partner_request", { _data: r.data, _website: website });
    setSending(false);
    if (error) return setServerError(errMsg(error));
    setDone(true);
  }

  const field = (k: keyof typeof form, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div className="space-y-1.5">
      <Label htmlFor={k}>{label}</Label>
      <Input id={k} value={form[k]} onChange={set(k)} className="h-11 text-base" aria-invalid={!!errors[k]} {...props} />
      {errors[k] && <p className="text-sm text-destructive">{errors[k]}</p>}
    </div>
  );

  return (
    <PublicLayout>
      <div className="container-page grid gap-10 py-12 md:grid-cols-2">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold md:text-5xl">Menos desperdício, mais oportunidades para o seu negócio.</h1>
          <p className="text-lg text-muted-foreground">
            Conte um pouco sobre o seu estabelecimento. Nossa equipe analisa cada pedido antes de
            liberar o cadastro de kits.
          </p>
          <ul className="space-y-2 text-muted-foreground">
            <li>• Cadastre kits com itens, preço e horário de retirada</li>
            <li>• Acompanhe reservas e confirme retiradas pelo código</li>
            <li>• Sem taxas nesta demonstração</li>
          </ul>
          <p className="text-sm">Já tem acesso? <Link to="/login" className="font-semibold text-primary hover:underline">Entrar na área do parceiro</Link></p>
        </div>
        {done ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-3xl bg-card p-10 text-center shadow-soft">
            <CheckCircle2 className="size-14 text-primary" />
            <h2 className="text-2xl font-bold">Recebemos sua solicitação!</h2>
            <p className="text-muted-foreground">Vamos analisar e entrar em contato. A aprovação não é automática.</p>
            <Button asChild variant="outline"><Link to="/">Voltar ao início</Link></Button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="space-y-4 rounded-3xl bg-card p-6 shadow-soft md:p-8">
            {field("estabelecimento", "Nome do estabelecimento", { maxLength: 120 })}
            {field("responsavel", "Nome do responsável", { maxLength: 100, autoComplete: "name" })}
            {field("telefone", "Telefone com DDD", { type: "tel", maxLength: 20, placeholder: "(11) 91234-5678" })}
            {field("bairro", "Bairro", { maxLength: 80 })}
            <div className="space-y-1.5">
              <Label htmlFor="tipo">Tipo de estabelecimento</Label>
              <select id="tipo" value={form.tipo} onChange={set("tipo")} className="h-11 w-full rounded-md border border-input bg-card px-3 text-base" aria-invalid={!!errors.tipo}>
                <option value="">Selecione</option>
                {Object.entries(tipoLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              {errors.tipo && <p className="text-sm text-destructive">{errors.tipo}</p>}
            </div>
            {field("email", "E-mail (opcional)", { type: "email", maxLength: 255, autoComplete: "email" })}
            <div className="hidden" aria-hidden>
              <label>Website<input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></label>
            </div>
            {serverError && <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{serverError}</p>}
            <Button type="submit" size="lg" className="w-full" disabled={sending}>
              {sending && <Loader2 className="animate-spin" />} Enviar solicitação
            </Button>
          </form>
        )}
      </div>
    </PublicLayout>
  );
}
