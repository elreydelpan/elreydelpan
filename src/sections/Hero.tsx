import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { trpc } from "@/providers/trpc";
import type { BannerSlide, SettingsMap } from "@contracts/types";
import { WHATSAPP_NUMBER_FALLBACK } from "@contracts/types";
import { Crown } from "@/components/Logo";

export function Hero() {
  const { data: settingsRaw } = trpc.catalog.settings.useQuery();
  const settings = (settingsRaw ?? {}) as SettingsMap;
  const slides: BannerSlide[] =
    Array.isArray(settings.bannerSlides) && settings.bannerSlides.length > 0
      ? settings.bannerSlides
      : [{ image: "/img/banner1.png", title: "Distribuidora Mayorista", subtitle: "Mejores precios que fábrica" }];
  const wa = settings.whatsapp || WHATSAPP_NUMBER_FALLBACK;

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selected, setSelected] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    const timer = setInterval(() => emblaApi.scrollNext(), 6000);
    return () => {
      emblaApi.off("select", onSelect);
      clearInterval(timer);
    };
  }, [emblaApi]);

  return (
    <section id="inicio" className="relative pt-16">
      <div className="relative overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((s, i) => (
            <div key={i} className="relative min-w-0 flex-[0_0_100%] h-[70vh] min-h-[420px]">
              <img
                src={s.image}
                alt={s.title}
                className="absolute inset-0 w-full h-full object-cover brightness-[.3] blur-[3px] scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-carbon via-transparent to-carbon/60" />
              <div className="relative h-full max-w-7xl mx-auto px-4 flex flex-col items-center justify-center text-center">
                <Crown className="w-14 h-14 text-lima mb-4" />
                <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight uppercase">
                  {settings.heroTitle ?? "EL REY"} <span className="text-lima">{settings.heroTitle ? "" : "DEL PAN"}</span>
                </h1>
                <p className="mt-3 text-lg md:text-2xl font-display uppercase tracking-wide text-lima">
                  {s.title}
                </p>
                <p className="mt-1 text-muted-foreground max-w-xl">
                  {s.subtitle || settings.heroSubtitle}
                </p>
                <div className="mt-8 flex flex-wrap gap-3 justify-center">
                  <a
                    href="#productos"
                    className="bg-lima text-carbon font-bold px-8 py-3 rounded-full uppercase text-sm tracking-wide hover:brightness-110 transition"
                  >
                    Ver productos
                  </a>
                  <a
                    href={`https://wa.me/${wa}`}
                    target="_blank"
                    rel="noreferrer"
                    className="border-2 border-lima text-lima font-bold px-8 py-3 rounded-full uppercase text-sm tracking-wide hover:bg-lima hover:text-carbon transition flex items-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <button
            onClick={scrollPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-carbon/70 border border-border rounded-full p-2 hover:border-lima"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-carbon/70 border border-border rounded-full p-2 hover:border-lima"
            aria-label="Siguiente"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, i) => (
              <span
                key={i}
                className={`w-2.5 h-2.5 rounded-full ${i === selected ? "bg-lima" : "bg-white/30"}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
