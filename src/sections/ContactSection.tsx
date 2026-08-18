import { Instagram, MessageCircle, Clock, MapPin } from "lucide-react";
import { trpc } from "@/providers/trpc";
import type { SettingsMap } from "@contracts/types";
import { WHATSAPP_NUMBER_FALLBACK } from "@contracts/types";
import { SectionTitle } from "@/components/SectionTitle";

function TikTokIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M16.6 3c.4 2.1 1.8 3.6 4 3.9v3.1c-1.5 0-2.9-.5-4-1.3v6.6c0 3.9-2.7 6.2-6 6.2-3.1 0-5.6-2.4-5.6-5.6 0-3.3 2.7-5.7 6.1-5.5v3.2c-.3-.1-.6-.2-1-.2-1.5 0-2.6 1.1-2.6 2.5 0 1.5 1.2 2.5 2.6 2.5 1.6 0 2.6-1.1 2.6-2.9V3h3.9z" />
    </svg>
  );
}

export function ContactSection() {
  const { data } = trpc.catalog.settings.useQuery();
  const settings = (data ?? {}) as SettingsMap;
  const wa = String(settings.whatsapp || WHATSAPP_NUMBER_FALLBACK);

  const cards = [
    settings.instagram
      ? { icon: Instagram, label: "Instagram", value: "@el_rey_del_pan_okk", href: String(settings.instagram) }
      : null,
    settings.tiktok
      ? { icon: TikTokIcon, label: "TikTok", value: "@elreydelpan.ok", href: String(settings.tiktok) }
      : null,
    { icon: MessageCircle, label: "WhatsApp", value: "+54 9 11 2741-4110", href: `https://wa.me/${wa}` },
  ].filter(Boolean) as { icon: React.ComponentType<{ className?: string }>; label: string; value: string; href: string }[];

  return (
    <section id="contacto" className="max-w-7xl mx-auto px-4 py-16">
      <SectionTitle title="Contacto y Ubicación" subtitle="Pasá por el local o escribinos" />

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-2xl p-6 flex gap-4 items-start">
            <MapPin className="w-6 h-6 text-lima shrink-0 mt-0.5" />
            <div>
              <h3 className="font-display text-xl font-semibold uppercase">Dirección</h3>
              <p className="text-muted-foreground">
                {settings.address ?? "Juan Manuel de Rosas 1153, Gregorio de Laferrère"}
              </p>
            </div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6 flex gap-4 items-start">
            <Clock className="w-6 h-6 text-lima shrink-0 mt-0.5" />
            <div>
              <h3 className="font-display text-xl font-semibold uppercase">Horarios</h3>
              <p className="text-muted-foreground whitespace-pre-line">{settings.hours ?? ""}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {cards.map((c) => (
              <a
                key={c.label}
                href={c.href}
                target="_blank"
                rel="noreferrer"
                className="bg-card border border-border rounded-2xl p-4 text-center hover:border-lima transition group"
              >
                <c.icon className="w-6 h-6 text-lima mx-auto mb-2" />
                <p className="font-display uppercase text-sm font-semibold">{c.label}</p>
                <p className="text-xs text-muted-foreground truncate">{c.value}</p>
              </a>
            ))}
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden border border-border min-h-[320px]">
          {settings.mapEmbedUrl ? (
            <iframe
              title="Ubicación El Rey del Pan"
              src={String(settings.mapEmbedUrl)}
              className="w-full h-full min-h-[320px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-card">
              Mapa no configurado
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
