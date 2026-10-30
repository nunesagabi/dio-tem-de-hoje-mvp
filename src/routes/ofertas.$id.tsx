import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ArrowLeft, Clock, MapPin, Package, Loader2, Info } from "lucide-react";
import { toast } from "sonner";
import { PublicLayout } from "@/components/site/PublicLayout";
import { EmptyState } from "@/components/site/KitCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { publicKitQuery } from "@/lib/queries";
import { errMsg, formatBRL, formatDate, formatTime, tipoLabel } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";
import { saveReservationLocally } from "@/lib/reservations";

export const Route = createFileRoute("/ofertas/$id")({
  head: () => ({
    meta: [
      { title: "Detalhes do kit · tem de hoje." },
      { name: "description", content: "Veja o que vem no kit, preço, endereço e horário de retirada." },
      { property: "og:title", content: "Detalhes do kit · tem de hoje." },
      { property: "og:description", content: "Kit de padaria ou cafeteria com preço reduzido. Projeto demonstrativo." },
    ],
  }),
  component: KitDetail,
});

function randomToken() {
  const b = new Uint8Array(32);
  crypto.getRandomValues(b);
  return Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
}

function KitDetail() {
  const { id } = Route.useParams();
  const { data: kit, isLoading } = useQuery(publicKitQuery(id));
  const [step, setStep] = useState<"info" | "form" | "summary">("info");
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [qtd, setQtd] = useState(1);
  const [aceite, setAceite] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const qc = useQueryClient();
  const navigate = useNavigate();
  // One idempotency key + secret per reservation attempt: retries / double clicks reuse it.
  const attempt = useMemo(() => ({ key: crypto.randomUUID(), token: randomToken() }), []);

  if (isLoading)
    return <PublicLayout><div className="container-page py-20"><div className="h-96 animate-pulse rounded-3xl bg-muted" /></div></PublicLayout>;
  if (!kit)
    return (
      <PublicLayout>
        <div className="container-page py-20">
          <EmptyState title="Este kit não está mais disponível">
            <Button asChild className="mt-4"><Link to="/ofertas">Ver outras ofertas</Link></Button>
          </EmptyState>
        </div>
      </PublicLayout>
    );

  const esgotado = kit.disponivel <= 0;
  const max = Math.min(kit.disponivel, 10);

  function validate() {
    const e: Record<string, string> = {};
    if (nome.trim().length < 2) e.nome = "Informe seu nome.";
    const d = telefone.replace(/\D/g, "");
    if (d.length < 10 || d.length > 11) e.telefone = "Informe um telefone com DDD, ex.: (11) 91234-5678.";
    if (qtd < 1 || qtd > max) e.qtd = `Escolha entre 1 e ${max}.`;
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function confirmar() {
    if (!aceite) { setErrors({ aceite: "Confirme que leu as condições de retirada." }); return; }
    setSending(true);
    const { data, error } = await supabase.rpc("create_reservation", {
      _kit_id: kit!.id, _nome: nome, _telefone: telefone, _quantidade: qtd,
      _idempotency_key: attempt.key, _lookup_token: attempt.token, _aceite: aceite,
    });
    setSending(false);
    qc.invalidateQueries({ queryKey: ["public-kit", id] });
    qc.invalidateQueries({ queryKey: ["public-kits"] });
    if (error) { toast.error(errMsg(error)); setStep("form"); return; }
    const publicId = (data as { public_id: string }).public_id;
    saveReservationLocally(publicId, attempt.token, kit!.nome);
    toast.success("Sua reserva foi registrada!");
    navigate({ to: "/reserva/$identificador", params: { identificador: publicId }, hash: `chave=${attempt.token}` });
  }

  return (
    <PublicLayout>
      <div className="container-page py-8">
        <Link to="/ofertas" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
          <ArrowLeft className="size-4" /> Voltar às ofertas
        </Link>
        <div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div className="space-y-6">
            {kit.imagem && (
              <img src={kit.imagem} alt={kit.nome} width={1024} height={768} className="aspect-[4/3] w-full rounded-[2rem] object-cover shadow-lift" />
            )}
            <div className="rounded-3xl bg-card p-6">
              <h2 className="flex items-center gap-2 text-xl font-semibold"><Package className="size-5 text-primary" /> O que vem no kit</h2>
              <ul className="mt-4 divide-y divide-border">
                {kit.items?.map((it) => (
                  <li key={it.nome} className="flex justify-between py-3">
                    <span>{it.nome}</span>
                    <span className="font-bold">{Number(it.quantidade)} {it.unidade}</span>
                  </li>
                ))}
              </ul>
            </div>
            {(kit.ingredientes || kit.alergenicos || kit.conservacao) && (
              <div className="space-y-3 rounded-3xl bg-card p-6 text-sm">
                {kit.ingredientes && <p><strong>Ingredientes:</strong> {kit.ingredientes}</p>}
                {kit.alergenicos && <p><strong>Alergênicos:</strong> {kit.alergenicos}</p>}
                {kit.conservacao && <p><strong>Conservação:</strong> {kit.conservacao}</p>}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                {tipoLabel[kit.establishment.tipo]} · {kit.establishment.nome}
              </p>
              <h1 className="mt-2 text-4xl font-bold">{kit.nome}</h1>
              <p className="mt-3 text-lg text-muted-foreground">{kit.descricao}</p>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="font-display text-4xl font-bold text-primary">{formatBRL(kit.preco)}</span>
              {kit.preco_referencia && <span className="text-muted-foreground line-through">{formatBRL(kit.preco_referencia)}</span>}
            </div>
            <div className="space-y-3 rounded-3xl bg-card p-6">
              <p className="flex gap-2"><MapPin className="mt-0.5 size-5 shrink-0 text-primary" />
                <span>{kit.establishment.endereco} — {kit.establishment.bairro}, {kit.establishment.cidade}</span></p>
              <p className="flex gap-2"><Clock className="mt-0.5 size-5 shrink-0 text-primary" />
                <span className="capitalize">{formatDate(kit.data_retirada)}, das {formatTime(kit.retirada_inicio)} às {formatTime(kit.retirada_fim)}</span></p>
              <p className="font-bold">
                {esgotado ? "Esse kit já foi reservado por completo." : `${kit.disponivel} de ${kit.estoque_total} disponíveis`}
              </p>
            </div>

            {step === "info" && (
              <Button size="lg" className="w-full" disabled={esgotado} onClick={() => setStep("form")}>
                {esgotado ? "Reservado por completo" : "Reservar kit"}
              </Button>
            )}

            {step === "form" && (
              <form
                className="space-y-4 rounded-3xl border-2 border-primary/20 bg-card p-6"
                onSubmit={(e) => { e.preventDefault(); if (validate()) setStep("summary"); }}
                noValidate
              >
                <h2 className="text-xl font-semibold">Seus dados para a retirada</h2>
                <div className="space-y-1.5">
                  <Label htmlFor="nome">Nome</Label>
                  <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} maxLength={100} autoComplete="name" className="h-11 text-base" aria-invalid={!!errors.nome} />
                  {errors.nome && <p className="text-sm text-destructive">{errors.nome}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tel">Telefone com DDD</Label>
                  <Input id="tel" type="tel" inputMode="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} maxLength={20} autoComplete="tel" placeholder="(11) 91234-5678" className="h-11 text-base" aria-invalid={!!errors.telefone} />
                  {errors.telefone && <p className="text-sm text-destructive">{errors.telefone}</p>}
                  <p className="text-xs text-muted-foreground">Usado apenas pelo estabelecimento para falar com você sobre a retirada.</p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="qtd">Quantidade de kits</Label>
                  <Input id="qtd" type="number" min={1} max={max} value={qtd} onChange={(e) => setQtd(Number(e.target.value))} className="h-11 w-28 text-base" aria-invalid={!!errors.qtd} />
                  {errors.qtd && <p className="text-sm text-destructive">{errors.qtd}</p>}
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setStep("info")}>Voltar</Button>
                  <Button type="submit" className="flex-1">Continuar</Button>
                </div>
              </form>
            )}

            {step === "summary" && (
              <div className="space-y-4 rounded-3xl border-2 border-primary/20 bg-card p-6">
                <h2 className="text-xl font-semibold">Resumo da reserva</h2>
                <dl className="grid grid-cols-2 gap-y-2 text-sm">
                  <dt className="text-muted-foreground">Nome</dt><dd className="font-semibold">{nome}</dd>
                  <dt className="text-muted-foreground">Telefone</dt><dd className="font-semibold">{telefone}</dd>
                  <dt className="text-muted-foreground">Kits</dt><dd className="font-semibold">{qtd} × {formatBRL(kit.preco)}</dd>
                  <dt className="text-muted-foreground">Total a pagar no local</dt><dd className="font-display text-lg font-bold text-primary">{formatBRL(qtd * kit.preco)}</dd>
                </dl>
                <div className="flex gap-2 rounded-2xl bg-sun/40 p-4 text-sm">
                  <Info className="size-5 shrink-0" />
                  <p>O pagamento é feito diretamente no estabelecimento, na retirada. Retire seu kit no horário combinado. Esta é uma demonstração: nenhuma compra real é feita.</p>
                </div>
                <label className="flex items-start gap-3 text-sm">
                  <Checkbox checked={aceite} onCheckedChange={(v) => setAceite(v === true)} className="mt-0.5" aria-describedby="aceite-erro" />
                  <span>Confirmo meus dados e estou ciente de que devo retirar o kit no endereço e horário informados.</span>
                </label>
                {errors.aceite && <p id="aceite-erro" className="text-sm text-destructive">{errors.aceite}</p>}
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep("form")} disabled={sending}>Editar</Button>
                  <Button className="flex-1" onClick={confirmar} disabled={sending}>
                    {sending && <Loader2 className="animate-spin" />} Confirmar reserva
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
