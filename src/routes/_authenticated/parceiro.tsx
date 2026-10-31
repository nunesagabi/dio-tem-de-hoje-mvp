import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { PanelShell } from "@/components/panel/PanelShell";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/parceiro")({
  head: () => ({ meta: [{ title: "Painel do parceiro · tem de hoje." }, { name: "robots", content: "noindex" }] }),
  component: Layout,
});

const nav = [
  { to: "/parceiro/dashboard", label: "Painel" },
  { to: "/parceiro/kits", label: "Kits" },
  { to: "/parceiro/kits/novo", label: "Novo kit" },
  { to: "/parceiro/reservas", label: "Reservas" },
  { to: "/parceiro/configuracoes", label: "Estabelecimento" },
];

function Layout() {
  const { isAdmin } = useAuth();
  return (
    <PanelShell
      title="Parceiro"
      nav={nav}
      extra={isAdmin ? <Link to="/admin/dashboard" className="text-sm font-semibold text-primary hover:underline">Ir para admin</Link> : null}
    >
      <Outlet />
    </PanelShell>
  );
}
