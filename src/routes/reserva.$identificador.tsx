import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Clock, MapPin, Loader2, Info } from "lucide-react";
import { toast } from "sonner";
import { PublicLayout } from "@/components/site/PublicLayout";
import { EmptyState, StatusBadge } from "@/components/site/KitCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { errMsg, formatBRL, formatDate, formatTime } from "@/lib/format";
import { getLocalToken, saveReservationLocally } from "@/lib/reservations";

export const Route = createFileRoute("/reserva/$identificador")({
  head: () => ({
    meta: [
      { title: "Sua reserva · tem de hoje." },
      { name: "description", content: "Consulte o código, o endereço e o horário de retirada da sua reserva." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Sua reserva · tem de hoje." },
      { property: "og:description", content: "Consulta segura de reserva de demonstração." },
    ],
  }),
  component: ReservaPage,
});

type Res = {
  public_id: string; codigo: string; status: string; quantidade: number; preco_unitario: number; nome: string;
  data_retirada: string;
  kit: { nome: string; imagem: string | null; retirada_inicio: string; retirada_fim: string; conservacao: string; items: { nome: string; quantidade: number; unidade: string }[] };
  establishment: { nome: string; endereco: string; bairro: string; cidade: string; telefone: string };
};

function ReservaPage() {
  const { identificador } = Route.useParams();
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [res, setRes] = useState<Res | null>(null);
  const [loading, setLoading] = useState(false);
  const [manual, setManual] = useState("");
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const m = window.location.hash.match(/chave=([a-f0-9]{64})/);
    setToken(m?.[1] ?? getLocalToken(identificador));
    setReady(true);
  }, [identificador]);

  async function load(t: string) {
    setLoading(true);
    const { data, error } = await supabase.rpc("get_reservation", { _public_id: identificador, _token: t });
    setLoading(false);
    if (error) { toast.error(errMsg(error)); return; }
    setRes(data as unknown as Res | null);
    if (data) saveReservationLocally(identificador, t, (data as unknown as Res).kit.nome);
  }

  useEffect(() => { if (token) load(token); }, [token]);

  async function cancelar() {
    if (!token || !confirm("Cancelar esta reserva? O kit volta a ficar disponível para outras pessoas.")) return;
    setCancelling(true);
    const { error } = await supabase.rpc("cancel_reservation_by_token", { _public_id: identificador, _token: token });
    setCancelling(false);
    if (error) return toast.error(errMsg(error));
    toast.success("Reserva cancelada.");
    load(token);
  }

  return (
    <PublicLayout>
      <div className="container-page max-w-3xl py-10">
        {!ready || loading ? (
          <div className="h-80 animate-pulse rounded-3xl bg-muted" />
        ) : !res ? (
          <div className="space-y-6">
            <EmptyState title="Não encontramos esta reserva">
              Para consultar, use o link completo recebido na confirmação ou informe a chave de consulta.
            </EmptyState>
            <form className="flex flex-col gap-3 rounded-3xl bg-card p-6 sm:flex-row sm:items-end" onSubmit={(e) => { e.preventDefault(); const t = manual.trim().toLowerCase(); if (/^[a-f0-9]{64}$/.test(t)) setToken(t); else toast.error("Chave inválida."); }}>
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="chave">Chave de consulta</Label>
                <Input id="chave" value={manual} onChange={(e) => setManual(e.target.value)} className="h-11 font-mono" />
              </div>
              <Button type="submit">Consultar</Button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            {res.status === "reservada" && (
              <div className="flex items-center gap-3 rounded-3xl bg-primary p-6 text-primary-foreground">
                <CheckCircle2 className="size-8 shrink-0" />
                <div>
                  <p className="font-display text-2xl font-bold">Sua reserva foi registrada!</p>
                  <p className="text-primary-foreground/85">Retire seu kit no horário combinado, {res.nome}.</p>
                </div>
              </div>
            )}
            <div className="rounded-3xl bg-card p-6 text-center shadow-soft">
              <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Código de confirmação</p>
              <p className="mt-2 font-mono text-5xl font-bold tracking-[0.3em] text-forest">{res.codigo}</p>
              <div className="mt-3"><StatusBadge status={res.status} /></div>
              <p className="mt-3 text-sm text-muted-foreground">Apresente este código no balcão.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3 rounded-3xl bg-card p-6">
                <h2 className="text-xl font-semibold">{res.quantidade}× {res.kit.nome}</h2>
                <ul className="space-y-1 text-sm">
                  {res.kit.items.map((i) => <li key={i.nome}>• {Number(i.quantidade) * res.quantidade} {i.unidade} {i.nome}</li>)}
                </ul>
                <p className="pt-2">A pagar no local: <strong className="text-primary">{formatBRL(res.quantidade * res.preco_unitario)}</strong></p>
              </div>
              <div className="space-y-3 rounded-3xl bg-card p-6 text-sm">
                <p className="text-lg font-semibold">{res.establishment.nome}</p>
                <p className="flex gap-2"><MapPin className="size-4 shrink-0 text-primary" /> {res.establishment.endereco} — {res.establishment.bairro}, {res.establishment.cidade}</p>
                <p className="flex gap-2"><Clock className="size-4 shrink-0 text-primary" /> <span className="capitalize">{formatDate(res.data_retirada)}, {formatTime(res.kit.retirada_inicio)}–{formatTime(res.kit.retirada_fim)}</span></p>
                {res.kit.conservacao && <p><strong>Conservação:</strong> {res.kit.conservacao}</p>}
              </div>
            </div>
            <div className="flex gap-2 rounded-2xl bg-sun/40 p-4 text-sm">
              <Info className="size-5 shrink-0" />
              <p>O pagamento é feito no estabelecimento. Guarde este link: ele é a única forma de consultar sua reserva. Projeto demonstrativo — nenhuma compra real foi feita.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline"><Link to="/ofertas">Ver outras ofertas</Link></Button>
              {res.status === "reservada" && (
                <Button variant="ghost" onClick={cancelar} disabled={cancelling}>
                  {cancelling && <Loader2 className="animate-spin" />} Cancelar reserva
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
