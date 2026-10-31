import { Link, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/site/SiteHeader";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export type NavItem = { to: string; label: string };

export function PanelShell({ title, nav, children, extra }: { title: string; nav: NavItem[]; children: ReactNode; extra?: ReactNode }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-forest px-4 py-1.5 text-center text-xs font-semibold text-forest-foreground">
        Ambiente de demonstração · dados fictícios
      </div>
      <header className="border-b border-border bg-card">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="rounded-full bg-sun px-3 py-0.5 text-xs font-bold text-sun-foreground">{title}</span>
          </div>
          <div className="flex items-center gap-2">
            {extra}
            <Button variant="ghost" size="sm" onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/login" }); }}>
              <LogOut /> Sair
            </Button>
          </div>
        </div>
        <nav className="container-page flex gap-1 overflow-x-auto pb-2" aria-label="Painel">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to.endsWith("/kits") }}
              className="whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted"
              activeProps={{ className: "bg-primary text-primary-foreground hover:bg-primary" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="container-page py-8">{children}</main>
    </div>
  );
}

export function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-3xl bg-card p-5 shadow-soft">
      <p className="text-sm font-semibold text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-3xl font-bold text-forest">{value}</p>
    </div>
  );
}

export const tableCls = "w-full text-sm [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-bold [&_th]:text-muted-foreground [&_td]:px-3 [&_td]:py-3 [&_tr]:border-b [&_tr]:border-border";
export const selectCls = "h-10 rounded-xl border border-input bg-card px-3 text-sm";
