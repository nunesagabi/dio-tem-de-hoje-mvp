import { Link } from "@tanstack/react-router";
import { Clock, MapPin } from "lucide-react";
import type { PublicKit } from "@/lib/types";
import { formatBRL, formatTime, tipoLabel } from "@/lib/format";

export function KitCard({ kit }: { kit: PublicKit }) {
  const esgotado = kit.disponivel <= 0;
  return (
    <Link
      to="/ofertas/$id"
      params={{ id: kit.id }}
      className="group flex flex-col overflow-hidden rounded-3xl bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {kit.imagem && (
          <img
            src={kit.imagem}
            alt={kit.nome}
            loading="lazy"
            width={1024}
            height={768}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <span
          className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold ${esgotado ? "bg-forest text-forest-foreground" : "bg-sun text-sun-foreground"}`}
        >
          {esgotado ? "Reservado por completo" : `${kit.disponivel} disponíve${kit.disponivel === 1 ? "l" : "is"}`}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {tipoLabel[kit.establishment.tipo]} · {kit.establishment.nome}
        </p>
        <h3 className="text-xl font-semibold">{kit.nome}</h3>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-4" /> {kit.establishment.bairro}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-4" /> {formatTime(kit.retirada_inicio)}–{formatTime(kit.retirada_fim)}
          </span>
        </div>
        <div className="mt-auto flex items-baseline gap-2 pt-3">
          <span className="font-display text-2xl font-bold text-primary">{formatBRL(kit.preco)}</span>
          {kit.preco_referencia && (
            <span className="text-sm text-muted-foreground line-through">
              {formatBRL(kit.preco_referencia)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function EmptyState({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-3xl border-2 border-dashed border-border bg-card/60 px-6 py-14 text-center">
      <p className="font-display text-xl font-semibold">{title}</p>
      {children && <div className="mt-2 text-muted-foreground">{children}</div>}
    </div>
  );
}

const statusStyles: Record<string, string> = {
  reservada: "bg-sun text-sun-foreground",
  retirada: "bg-primary text-primary-foreground",
  cancelada: "bg-muted text-muted-foreground",
  publicado: "bg-primary text-primary-foreground",
  rascunho: "bg-sun text-sun-foreground",
  encerrado: "bg-muted text-muted-foreground",
  aprovado: "bg-primary text-primary-foreground",
  pendente: "bg-sun text-sun-foreground",
  rejeitado: "bg-destructive text-destructive-foreground",
  suspenso: "bg-peach text-peach-foreground",
  nova: "bg-sun text-sun-foreground",
  aprovada: "bg-primary text-primary-foreground",
  rejeitada: "bg-muted text-muted-foreground",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-0.5 text-xs font-bold capitalize ${statusStyles[status] ?? "bg-muted"}`}>
      {status}
    </span>
  );
}
