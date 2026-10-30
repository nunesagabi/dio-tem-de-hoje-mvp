import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/site/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { errMsg } from "@/lib/format";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar · tem de hoje." },
      { name: "description", content: "Acesso para estabelecimentos parceiros e administradores." },
      { property: "og:title", content: "Entrar · tem de hoje." },
      { property: "og:description", content: "Área de parceiros do tem de hoje." },
    ],
  }),
  component: Login,
});

function Login() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/parceiro/dashboard" });
    });
    const { data } = supabase.auth.onAuthStateChange((e, s) => {
      if (e === "SIGNED_IN" && s) navigate({ to: "/parceiro/dashboard" });
    });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) return toast.error(error.message === "Invalid login credentials" ? "E-mail ou senha incorretos." : errMsg(error));
    } else {
      if (password.length < 8) { setLoading(false); return toast.error("A senha precisa ter pelo menos 8 caracteres."); }
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: window.location.origin + "/login", data: { nome } },
      });
      setLoading(false);
      if (error) return toast.error(errMsg(error));
      setSent(true);
    }
  }

  async function google() {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/login" });
    if (r.error) toast.error("Não foi possível entrar com Google.");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center"><Logo /></div>
        <div className="space-y-5 rounded-3xl bg-card p-7 shadow-soft">
          <div>
            <h1 className="text-2xl font-bold">{mode === "in" ? "Entrar" : "Criar conta de parceiro"}</h1>
            <p className="mt-1 text-sm text-muted-foreground">Área para estabelecimentos e administradores. Consumidores não precisam de conta.</p>
          </div>
          {sent ? (
            <p className="rounded-2xl bg-sun/40 p-4 text-sm">Enviamos um link de confirmação para <strong>{email}</strong>. Confirme o e-mail para entrar.</p>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              {mode === "up" && (
                <div className="space-y-1.5"><Label htmlFor="nome">Seu nome</Label>
                  <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required maxLength={100} className="h-11" /></div>
              )}
              <div className="space-y-1.5"><Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" className="h-11" /></div>
              <div className="space-y-1.5"><Label htmlFor="senha">Senha</Label>
                <Input id="senha" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={mode === "up" ? 8 : undefined} autoComplete={mode === "in" ? "current-password" : "new-password"} className="h-11" /></div>
              <Button type="submit" className="w-full" disabled={loading}>{loading && <Loader2 className="animate-spin" />}{mode === "in" ? "Entrar" : "Criar conta"}</Button>
            </form>
          )}
          <div className="relative text-center text-xs text-muted-foreground"><span className="bg-card px-2">ou</span></div>
          <Button variant="outline" className="w-full" onClick={google}>Continuar com Google</Button>
          <p className="text-center text-sm">
            {mode === "in" ? "Ainda não tem conta? " : "Já tem conta? "}
            <button className="font-semibold text-primary hover:underline" onClick={() => { setMode(mode === "in" ? "up" : "in"); setSent(false); }}>
              {mode === "in" ? "Criar conta" : "Entrar"}
            </button>
          </p>
        </div>
        <p className="text-center text-sm"><Link to="/" className="text-muted-foreground hover:text-primary">← Voltar ao início</Link></p>
      </div>
    </div>
  );
}
