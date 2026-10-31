import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/site/KitCard";

export function NeedEstablishment() {
  return (
    <EmptyState title="Cadastre seu estabelecimento">
      Antes de criar kits, preencha os dados do seu estabelecimento. A equipe aprova o cadastro antes da publicação.
      <div><Button asChild className="mt-4"><Link to="/parceiro/configuracoes">Cadastrar estabelecimento</Link></Button></div>
    </EmptyState>
  );
}

export function PendingNotice({ status }: { status: string }) {
  if (status === "aprovado") return null;
  const msg: Record<string, string> = {
    pendente: "Seu estabelecimento está em análise. Você já pode criar kits como rascunho; a publicação é liberada após a aprovação.",
    rejeitado: "Seu cadastro não foi aprovado. Fale com a equipe do projeto.",
    suspenso: "Seu estabelecimento está suspenso. Seus kits não aparecem no catálogo.",
  };
  return <div className="mb-6 rounded-2xl bg-sun/50 p-4 text-sm font-semibold">{msg[status]}</div>;
}
