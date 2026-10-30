import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, CalendarCheck, Store, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/site/PublicLayout";
import { EmptyState, KitCard } from "@/components/site/KitCard";
import { publicKitsQuery } from "@/lib/queries";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "tem de hoje. — Kits de padarias e cafeterias perto de você" },
      { name: "description", content: "Encontre kits de padarias e cafeterias do seu bairro com preços reduzidos. Reserve online e retire no local. Projeto demonstrativo." },
      { property: "og:title", content: "tem de hoje. — Comida boa, preço bom, perto de você" },
      { property: "og:description", content: "Kits de padarias e cafeterias do bairro com preço reduzido. Reserve online e retire no estabelecimento." },
    ],
  }),
  component: Index,
});

const steps = [
  { icon: Search, title: "Encontre um kit", text: "Veja exatamente o que vem em cada kit, o preço e onde retirar." },
  { icon: CalendarCheck, title: "Reserve online", text: "Informe nome e telefone e receba um código de confirmação." },
  { icon: Store, title: "Retire no estabelecimento", text: "Apresente o código no horário combinado e pague no balcão." },
];

function Index() {
  const { data: kits, isLoading } = useQuery(publicKitsQuery());
  return (
    <PublicLayout>
      <section className="container-page grid items-center gap-10 py-12 md:grid-cols-2 md:py-20">
        <div className="space-y-6">
          <span className="inline-flex rounded-full bg-sun px-4 py-1 text-sm font-bold text-sun-foreground">
            Comida boa, preço bom, perto de você.
          </span>
          <h1 className="text-4xl font-bold leading-[1.05] text-forest md:text-6xl">
            Tem coisa boa pertinho de você.
          </h1>
          <p className="max-w-lg text-lg text-muted-foreground">
            Encontre kits de padarias e cafeterias do seu bairro com preços reduzidos. Saiba
            exatamente o que vem, reserve online e retire no estabelecimento.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/ofertas">Explorar ofertas <ArrowRight /></Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/parceiros">Quero anunciar meus kits</Link>
            </Button>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-3 -rotate-2 rounded-[2.5rem] bg-peach/60" aria-hidden />
          <img
            src={hero}
            alt="Atendente de padaria entregando um saquinho de pães no balcão"
            width={1280}
            height={1024}
            className="relative aspect-[5/4] w-full rounded-[2rem] object-cover shadow-lift"
          />
        </div>
      </section>

      <section id="como-funciona" className="bg-card py-16">
        <div className="container-page">
          <h2 className="text-3xl font-bold md:text-4xl">Como funciona</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.title} className="rounded-3xl bg-background p-7">
                <div className="flex items-center gap-3">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                    <s.icon className="size-6" />
                  </span>
                  <span className="font-display text-4xl font-bold text-peach">{i + 1}</span>
                </div>
                <h3 className="mt-5 text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold md:text-4xl">Ofertas de hoje</h2>
            <p className="mt-2 text-muted-foreground">Catálogo demonstrativo com estabelecimentos fictícios.</p>
          </div>
          <Button asChild variant="link"><Link to="/ofertas">Ver todas <ArrowRight /></Link></Button>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading &&
            [0, 1, 2].map((i) => <div key={i} className="aspect-[4/5] animate-pulse rounded-3xl bg-muted" />)}
          {kits?.slice(0, 6).map((k) => <KitCard key={k.id} kit={k} />)}
        </div>
        {kits && kits.length === 0 && (
          <EmptyState title="Nenhum kit disponível agora">Volte mais tarde — sempre aparece coisa boa.</EmptyState>
        )}
      </section>

      <section className="container-page">
        <div className="grid gap-8 rounded-[2rem] bg-primary p-8 text-primary-foreground md:grid-cols-[1.4fr_1fr] md:p-14">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold md:text-4xl">Menos desperdício, mais oportunidades para o seu negócio.</h2>
            <p className="text-primary-foreground/85">
              Padarias e cafeterias cadastram kits com o que sobrou do dia, definem preço, quantidade
              e horário de retirada, e acompanham cada reserva em um painel simples.
            </p>
          </div>
          <div className="flex flex-col justify-center gap-3">
            <Button asChild size="lg" variant="cream">
              <Link to="/parceiros">Solicitar participação</Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="text-primary-foreground hover:bg-forest hover:text-primary-foreground">
              <Link to="/login">Já sou parceiro · Entrar</Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
