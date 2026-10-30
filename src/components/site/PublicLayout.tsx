import type { ReactNode } from "react";
import { SiteFooter, SiteHeader } from "./SiteHeader";

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="conteudo" className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
