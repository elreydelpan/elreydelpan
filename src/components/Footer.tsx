import { Link } from "react-router";
import { Logo } from "./Logo";
import { trpc } from "@/providers/trpc";
import type { SettingsMap } from "@contracts/types";
import { WHATSAPP_NUMBER_FALLBACK } from "@contracts/types";

export function Footer() {
  const { data } = trpc.catalog.settings.useQuery();
  const settings = (data ?? {}) as SettingsMap;
  const wa = String(settings.whatsapp || WHATSAPP_NUMBER_FALLBACK);

  return (
    <footer className="border-t border-border bg-carbon">
      <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <Logo />
        <p className="text-sm text-muted-foreground text-center">
          {settings.address ?? ""} ·{" "}
          <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" className="text-lima hover:underline">
            WhatsApp +54 9 11 2741-4110
          </a>
        </p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} El Rey del Pan</span>
          <Link to="/admin" className="hover:text-lima transition text-xs uppercase tracking-wide">
            Acceso admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
