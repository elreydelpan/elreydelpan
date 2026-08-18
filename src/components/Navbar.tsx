import { ShoppingCart, Menu, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "./Logo";
import { useCart } from "@/lib/cart";

const LINKS = [
  { href: "#inicio", label: "Inicio" },
  { href: "#destacados", label: "Destacados" },
  { href: "#productos", label: "Productos" },
  { href: "#lista-precios", label: "Lista de precios" },
  { href: "#nosotros", label: "Nosotros" },
  { href: "#contacto", label: "Contacto" },
];

export function Navbar() {
  const { count, setOpen } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-carbon/90 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <a href="#inicio" aria-label="El Rey del Pan">
          <Logo compact />
        </a>

        <nav className="hidden md:flex items-center gap-6">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-muted-foreground hover:text-lima transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpen(true)}
            className="relative flex items-center gap-2 bg-lima text-carbon font-semibold text-sm px-4 py-2 rounded-full hover:brightness-110 transition"
            aria-label="Abrir carrito"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">Carrito</span>
            {count > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-carbon text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-carbon">
                {count}
              </span>
            )}
          </button>
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menú"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="md:hidden border-t border-border bg-carbon px-4 py-3 flex flex-col gap-3">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="text-sm font-medium text-muted-foreground hover:text-lima"
            >
              {l.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
