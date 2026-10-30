import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link
      to="/"
      className={`font-display text-2xl font-bold tracking-tight ${light ? "text-forest-foreground" : "text-primary"}`}
    >
      tem de hoje<span className="text-peach">.</span>
    </Link>
  );
}

export function DemoBanner() {
  return (
    <div className="bg-forest px-4 py-1.5 text-center text-xs font-semibold text-forest-foreground">
      Projeto demonstrativo · estabelecimentos e kits fictícios · nenhum pedido real é aceito
    </div>
  );
}

const links = [
  { to: "/", hash: "como-funciona", label: "Como funciona" },
  { to: "/ofertas", label: "Ofertas" },
  { to: "/parceiros", label: "Sou um estabelecimento" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur">
      <DemoBanner />
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav className="hidden items-center gap-7 md:flex" aria-label="Principal">
          {links.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              hash={"hash" in l ? l.hash : undefined}
              className="text-sm font-semibold text-foreground/80 hover:text-primary"
            >
              {l.label}
            </Link>
          ))}
          <Link to="/login" className="text-sm font-semibold text-foreground/80 hover:text-primary">
            Entrar
          </Link>
          <Button asChild size="sm">
            <Link to="/ofertas">Ver ofertas</Link>
          </Button>
        </nav>
        <button
          className="rounded-full p-2 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>
      {open && (
        <nav className="container-page flex flex-col gap-1 pb-4 md:hidden" aria-label="Menu móvel">
          {links.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              hash={"hash" in l ? l.hash : undefined}
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-3 font-semibold hover:bg-muted"
            >
              {l.label}
            </Link>
          ))}
          <Link to="/login" onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 font-semibold hover:bg-muted">
            Entrar
          </Link>
          <Button asChild className="mt-2">
            <Link to="/ofertas" onClick={() => setOpen(false)}>Ver ofertas</Link>
          </Button>
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-forest text-forest-foreground">
      <div className="container-page grid gap-10 py-14 md:grid-cols-3">
        <div className="space-y-3">
          <Logo light />
          <p className="text-sm text-forest-foreground/80">Comida boa, preço bom, perto de você.</p>
          <p className="text-sm text-forest-foreground/70">
            Kits de padarias e cafeterias do bairro, com o que sobrou do dia e ainda está ótimo para
            consumo.
          </p>
        </div>
        <nav className="flex flex-col gap-2 text-sm" aria-label="Rodapé">
          <Link to="/ofertas" className="hover:text-sun">Ofertas</Link>
          <Link to="/" hash="como-funciona" className="hover:text-sun">Como funciona</Link>
          <Link to="/parceiros" className="hover:text-sun">Quero anunciar meus kits</Link>
          <Link to="/login" className="hover:text-sun">Área do parceiro</Link>
        </nav>
        <p className="text-sm text-forest-foreground/70">
          Este é um projeto demonstrativo criado para o desafio de desenvolvimento com IA da DIO.
          Os estabelecimentos, kits e valores são fictícios. Não há vendas nem pagamentos reais.
        </p>
      </div>
    </footer>
  );
}
