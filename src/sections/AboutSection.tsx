import { trpc } from "@/providers/trpc";
import type { SettingsMap } from "@contracts/types";
import { SectionTitle } from "@/components/SectionTitle";
import { Crown } from "@/components/Logo";
import { Truck, BadgeDollarSign, PackageCheck } from "lucide-react";

const PILLARS = [
  { icon: BadgeDollarSign, title: "Mejores precios", text: "Precios directos de fábrica para tu comercio." },
  { icon: PackageCheck, title: "Stock permanente", text: "Pan El Remanso, línea Quento y kiosco siempre disponibles." },
  { icon: Truck, title: "Entregas en la zona", text: "Retiro en el local o envío a tu comercio." },
];

export function AboutSection() {
  const { data } = trpc.catalog.settings.useQuery();
  const settings = (data ?? {}) as SettingsMap;

  return (
    <section id="nosotros" className="max-w-7xl mx-auto px-4 py-16">
      <SectionTitle title="Sobre Nosotros" />
      <div className="max-w-3xl mx-auto text-center">
        <Crown className="w-12 h-12 text-lima mx-auto mb-4" />
        <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
          {settings.aboutText ?? ""}
        </p>
      </div>
      <div className="grid sm:grid-cols-3 gap-4 mt-12">
        {PILLARS.map((p) => (
          <div key={p.title} className="bg-card border border-border rounded-2xl p-6 text-center hover:border-lima/60 transition">
            <p.icon className="w-8 h-8 text-lima mx-auto mb-3" />
            <h3 className="font-display text-xl font-semibold uppercase">{p.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{p.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
