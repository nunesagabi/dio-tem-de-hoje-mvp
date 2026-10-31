import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { EmptyState, StatusBadge } from "@/components/site/KitCard";
import { selectCls, tableCls } from "./PanelShell";
import { supabase } from "@/integrations/supabase/client";
import { errMsg, formatBRL, formatDateTime, formatPhone, formatShortDate } from "@/lib/format";

export type ResRow = {
  id: string; codigo_confirmacao: string; nome_consumidor: string; telefone_consumidor: string; quantidade: number;
  preco_unitario: number; status: string; data_retirada: string; created_at: string; completed_at: string | null;
  kits: { nome: string } | null; establishments?: { nome: string } | null;
};

export function ReservationsTable({ rows, showEstablishment }: { rows: ResRow[]; showEstablishment?: boolean }) {
  const qc = useQueryClient();
  const [status, setStatus] = useState("");
  const [busca, setBusca] = useState("");
  const [pickup, setPickup] = useState<ResRow | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const filtered = rows.filter((r) => (!status || r.status === status) && (!busca || r.codigo_confirmacao.includes(busca.trim().toUpperCase())));
  const refresh = () => { qc.invalidateQueries(); };

  async function confirmPickup() {
    if (!pickup) return;
    setBusy(true);
    const { error } = await supabase.rpc("mark_reservation_picked_up", { _id: pickup.id, _codigo: code });
    setBusy(false);
    if (error) return toast.error(errMsg(error));
    toast.success("Retirada confirmada!");
    setPickup(null); setCode(""); refresh();
  }
  async function cancel(r: ResRow) {
    if (!confirm(`Cancelar a reserva ${r.codigo_confirmacao}? As unidades voltam ao estoque.`)) return;
    const { error } = await supabase.rpc("cancel_reservation", { _id: r.id });
    if (error) return toast.error(errMsg(error));
    toast.success("Reserva cancelada.");
    refresh();
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <select aria-label="Filtrar por status" className={selectCls} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Todos os status</option><option value="reservada">Reservada</option><option value="retirada">Retirada</option><option value="cancelada">Cancelada</option>
        </select>
        <Input aria-label="Buscar código" placeholder="Buscar código" className="h-10 w-44 rounded-xl" value={busca} onChange={(e) => setBusca(e.target.value)} />
      </div>
      {filtered.length === 0 ? <div className="mt-6"><EmptyState title="Nenhuma reserva por aqui" /></div> : (
        <div className="mt-4 overflow-x-auto rounded-3xl bg-card p-2 shadow-soft">
          <table className={tableCls}>
            <thead><tr><th>Código</th><th>Kit</th>{showEstablishment && <th>Estabelecimento</th>}<th>Cliente</th><th>Qtd</th><th>Retirada</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td className="font-mono font-bold">{r.codigo_confirmacao}</td>
                  <td>{r.kits?.nome}</td>
                  {showEstablishment && <td>{r.establishments?.nome}</td>}
                  <td>{r.nome_consumidor}<div className="text-xs text-muted-foreground">{formatPhone(r.telefone_consumidor)}</div></td>
                  <td>{r.quantidade} · {formatBRL(r.quantidade * r.preco_unitario)}</td>
                  <td>{formatShortDate(r.data_retirada)}<div className="text-xs text-muted-foreground">feita {formatDateTime(r.created_at)}</div></td>
                  <td><StatusBadge status={r.status} /></td>
                  <td className="whitespace-nowrap">
                    {r.status === "reservada" && (
                      <div className="flex gap-1">
                        <Button size="sm" onClick={() => { setPickup(r); setCode(""); }}>Retirada</Button>
                        <Button size="sm" variant="ghost" onClick={() => cancel(r)}>Cancelar</Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Dialog open={!!pickup} onOpenChange={(o) => !o && setPickup(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar retirada</DialogTitle>
            <DialogDescription>Peça ao cliente o código de confirmação e digite abaixo.</DialogDescription>
          </DialogHeader>
          <Input autoFocus aria-label="Código" className="h-12 text-center font-mono text-2xl uppercase tracking-widest" maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setPickup(null)}>Voltar</Button>
            <Button onClick={confirmPickup} disabled={busy || code.length < 6}>{busy && <Loader2 className="animate-spin" />} Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
