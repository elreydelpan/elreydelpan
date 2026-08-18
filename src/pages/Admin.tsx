import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  LogOut, Package, FolderTree, Star, Image as ImageIcon, Settings2, KeyRound,
  Plus, Trash2, Pencil, Upload, ArrowLeft,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import type { BannerSlide, CatalogCategory, PriceTier, ProductDto, SettingsMap } from "@contracts/types";
import { Logo } from "@/components/Logo";
import { formatARS } from "@/lib/format";

type Tab = "productos" | "categorias" | "destacados" | "banner" | "config" | "password";

const inputCls =
  "w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-lima";

/* ---------- Login ---------- */
function Login({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const login = trpc.auth.login.useMutation({
    onSuccess: () => onSuccess(),
    onError: (e) => setError(e.message),
  });

  return (
    <div className="min-h-screen bg-carbon flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-8">
        <div className="flex justify-center mb-6 mt-2"><Logo /></div>
        <h1 className="font-display text-xl font-bold uppercase text-center mb-6">Panel de administración</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setError("");
            login.mutate({ username, password });
          }}
          className="space-y-3"
        >
          <input className={inputCls} placeholder="Usuario" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
          <input className={inputCls} type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={login.isPending}
            className="w-full bg-lima text-carbon font-bold py-2.5 rounded-full uppercase text-sm tracking-wide hover:brightness-110 transition disabled:opacity-50"
          >
            {login.isPending ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
        <Link to="/" className="block text-center text-xs text-muted-foreground mt-4 hover:text-lima">
          ← Volver a la tienda
        </Link>
      </div>
    </div>
  );
}

/* ---------- Image picker ---------- */
function ImagePicker({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const upload = trpc.admin.uploadMedia.useMutation({
    onSuccess: (r) => onChange(r.url),
  });

  return (
    <div className="flex items-center gap-2">
      {value && <img src={value} alt="" className="w-12 h-12 rounded-lg object-cover border border-border" />}
      <input className={inputCls} placeholder="URL de imagen o subí una" value={value} onChange={(e) => onChange(e.target.value)} />
      <label className="shrink-0 cursor-pointer bg-secondary border border-border rounded-lg p-2 hover:border-lima" title="Subir imagen">
        <Upload className="w-4 h-4" />
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const buf = await file.arrayBuffer();
            const base64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
            upload.mutate({ mime: file.type, dataBase64: base64 });
            e.target.value = "";
          }}
        />
      </label>
    </div>
  );
}

/* ---------- Product editor ---------- */
const emptyProduct = (categoryId: number): Omit<ProductDto, "id"> & { id?: number } => ({
  categoryId,
  name: "",
  description: "",
  imageUrl: "",
  unit: "",
  priceTiers: [{ minQty: 1, price: 0 }],
  featured: false,
  active: true,
  sortOrder: 0,
});

function ProductEditor({
  product,
  categories,
  onClose,
}: {
  product: (Omit<ProductDto, "id"> & { id?: number });
  categories: CatalogCategory[];
  onClose: () => void;
}) {
  const [p, setP] = useState(product);
  const utils = trpc.useUtils();
  const opts = {
    onSuccess: () => {
      utils.catalog.list.invalidate();
      onClose();
    },
  };
  const create = trpc.admin.createProduct.useMutation(opts);
  const update = trpc.admin.updateProduct.useMutation(opts);

  const setTier = (i: number, field: keyof PriceTier, val: number) => {
    const tiers = [...p.priceTiers];
    tiers[i] = { ...tiers[i], [field]: val };
    setP({ ...p, priceTiers: tiers });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h3 className="font-display text-xl font-bold uppercase mb-4">
          {p.id ? "Editar producto" : "Nuevo producto"}
        </h3>
        <div className="space-y-3">
          <input className={inputCls} placeholder="Nombre del producto *" value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} />
          <select className={inputCls} value={p.categoryId} onChange={(e) => setP({ ...p, categoryId: Number(e.target.value) })}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <input className={inputCls} placeholder="Presentación (ej: x90gr)" value={p.unit ?? ""} onChange={(e) => setP({ ...p, unit: e.target.value })} />
          <ImagePicker value={p.imageUrl ?? ""} onChange={(url) => setP({ ...p, imageUrl: url })} />

          <div>
            <p className="text-sm font-semibold mb-2">Escalas de precio (desde cantidad → precio unitario)</p>
            {p.priceTiers.map((t, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <span className="text-xs text-muted-foreground">x</span>
                <input type="number" min={1} className={inputCls} value={t.minQty} onChange={(e) => setTier(i, "minQty", Math.max(1, Number(e.target.value) || 1))} />
                <span className="text-xs text-muted-foreground">→ $</span>
                <input type="number" min={0} className={inputCls} value={t.price} onChange={(e) => setTier(i, "price", Math.max(0, Number(e.target.value) || 0))} />
                <button
                  className="p-1.5 text-muted-foreground hover:text-red-400"
                  onClick={() => setP({ ...p, priceTiers: p.priceTiers.filter((_, j) => j !== i) })}
                  disabled={p.priceTiers.length <= 1}
                  aria-label="Quitar escala"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              className="text-xs text-lima hover:underline flex items-center gap-1"
              onClick={() => setP({ ...p, priceTiers: [...p.priceTiers, { minQty: (p.priceTiers.at(-1)?.minQty ?? 1) * 10, price: 0 }] })}
            >
              <Plus className="w-3 h-3" /> Agregar escala
            </button>
          </div>

          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={p.featured} onChange={(e) => setP({ ...p, featured: e.target.checked })} className="accent-[#c8f31d]" />
              Destacado
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={p.active} onChange={(e) => setP({ ...p, active: e.target.checked })} className="accent-[#c8f31d]" />
              Activo (visible)
            </label>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="flex-1 border border-border rounded-full py-2 text-sm hover:border-lima">Cancelar</button>
          <button
            disabled={!p.name || create.isPending || update.isPending}
            onClick={() => {
              const payload = {
                ...p,
                description: p.description || null,
                imageUrl: p.imageUrl || null,
                unit: p.unit || null,
                priceTiers: p.priceTiers.filter((t) => t.price >= 0),
              };
              if (p.id) update.mutate({ ...payload, id: p.id });
              else create.mutate(payload);
            }}
            className="flex-1 bg-lima text-carbon font-bold rounded-full py-2 text-sm uppercase disabled:opacity-50"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Tabs ---------- */
function ProductosTab({ catalog }: { catalog: CatalogCategory[] }) {
  const [editing, setEditing] = useState<(Omit<ProductDto, "id"> & { id?: number }) | null>(null);
  const utils = trpc.useUtils();
  const del = trpc.admin.deleteProduct.useMutation({ onSuccess: () => utils.catalog.list.invalidate() });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-display text-2xl font-bold uppercase">Productos</h2>
        <button
          onClick={() => catalog.length && setEditing(emptyProduct(catalog[0].id))}
          className="bg-lima text-carbon text-sm font-bold px-4 py-2 rounded-full flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> Nuevo
        </button>
      </div>
      <div className="space-y-2">
        {catalog.map((c) => (
          <div key={c.id}>
            <p className="text-xs uppercase tracking-wide text-lima font-bold mt-4 mb-2">{c.name}</p>
            {c.products.map((p) => (
              <div key={p.id} className="flex items-center gap-3 bg-card border border-border rounded-xl px-3 py-2 mb-1.5">
                <span className="flex-1 text-sm truncate">{p.name}{!p.active && <span className="text-xs text-red-400 ml-2">(oculto)</span>}</span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {p.priceTiers.map((t) => `x${t.minQty}: ${formatARS(t.price)}`).join(" · ")}
                </span>
                {p.featured && <Star className="w-4 h-4 text-lima shrink-0" />}
                <button className="p-1.5 hover:text-lima" onClick={() => setEditing(p)} aria-label="Editar"><Pencil className="w-4 h-4" /></button>
                <button
                  className="p-1.5 hover:text-red-400"
                  onClick={() => confirm(`¿Eliminar "${p.name}"?`) && del.mutate({ id: p.id })}
                  aria-label="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
      {editing && <ProductEditor product={editing} categories={catalog} onClose={() => setEditing(null)} />}
    </div>
  );
}

function CategoriasTab({ catalog }: { catalog: CatalogCategory[] }) {
  const [name, setName] = useState("");
  const utils = trpc.useUtils();
  const invalidate = { onSuccess: () => utils.catalog.list.invalidate() };
  const create = trpc.admin.createCategory.useMutation(invalidate);
  const update = trpc.admin.updateCategory.useMutation(invalidate);
  const del = trpc.admin.deleteCategory.useMutation(invalidate);

  return (
    <div>
      <h2 className="font-display text-2xl font-bold uppercase mb-4">Categorías</h2>
      <div className="flex gap-2 mb-4">
        <input className={inputCls} placeholder="Nueva categoría" value={name} onChange={(e) => setName(e.target.value)} />
        <button
          className="bg-lima text-carbon text-sm font-bold px-4 rounded-full disabled:opacity-50"
          disabled={!name.trim()}
          onClick={() => { create.mutate({ name: name.trim(), sortOrder: catalog.length }); setName(""); }}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      {catalog.map((c) => (
        <div key={c.id} className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2 mb-1.5">
          <input
            className="flex-1 bg-transparent outline-none text-sm"
            defaultValue={c.name}
            onBlur={(e) => e.target.value.trim() && e.target.value !== c.name && update.mutate({ id: c.id, name: e.target.value.trim(), sortOrder: c.sortOrder, active: c.active })}
          />
          <label className="text-xs flex items-center gap-1 text-muted-foreground">
            <input type="checkbox" checked={c.active} onChange={(e) => update.mutate({ id: c.id, name: c.name, sortOrder: c.sortOrder, active: e.target.checked })} className="accent-[#c8f31d]" />
            Visible
          </label>
          <button
            className="p-1.5 hover:text-red-400"
            onClick={() => confirm(`¿Eliminar "${c.name}" y todos sus productos?`) && del.mutate({ id: c.id })}
            aria-label="Eliminar categoría"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

function DestacadosTab({ catalog }: { catalog: CatalogCategory[] }) {
  const utils = trpc.useUtils();
  const toggle = trpc.admin.toggleFeatured.useMutation({ onSuccess: () => utils.catalog.list.invalidate() });
  return (
    <div>
      <h2 className="font-display text-2xl font-bold uppercase mb-2">Destacados</h2>
      <p className="text-sm text-muted-foreground mb-4">Marcá con la estrella los productos que aparecen en el inicio.</p>
      {catalog.map((c) => (
        <div key={c.id}>
          <p className="text-xs uppercase tracking-wide text-lima font-bold mt-4 mb-2">{c.name}</p>
          {c.products.map((p) => (
            <button
              key={p.id}
              onClick={() => toggle.mutate({ id: p.id, featured: !p.featured })}
              className={`w-full flex items-center gap-3 border rounded-xl px-3 py-2 mb-1.5 text-sm text-left transition ${
                p.featured ? "border-lima bg-lima/10" : "border-border bg-card hover:border-lima/50"
              }`}
            >
              <Star className={`w-4 h-4 shrink-0 ${p.featured ? "text-lima fill-lima" : "text-muted-foreground"}`} />
              {p.name}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

function BannerTab({ settings }: { settings: SettingsMap }) {
  const [slides, setSlides] = useState<BannerSlide[]>(settings.bannerSlides ?? []);
  const [msg, setMsg] = useState("");
  const save = trpc.admin.updateSettings.useMutation({
    onSuccess: () => { setMsg("Banner guardado ✔"); setTimeout(() => setMsg(""), 2500); },
  });

  const setSlide = (i: number, patch: Partial<BannerSlide>) => {
    const next = [...slides];
    next[i] = { ...next[i], ...patch };
    setSlides(next);
  };

  return (
    <div>
      <h2 className="font-display text-2xl font-bold uppercase mb-4">Banner del inicio</h2>
      {slides.map((s, i) => (
        <div key={i} className="bg-card border border-border rounded-xl p-4 mb-3 space-y-2">
          {s.image && <img src={s.image} alt="" className="w-full h-28 object-cover rounded-lg" />}
          <ImagePicker value={s.image} onChange={(url) => setSlide(i, { image: url })} />
          <input className={inputCls} placeholder="Título" value={s.title} onChange={(e) => setSlide(i, { title: e.target.value })} />
          <input className={inputCls} placeholder="Subtítulo" value={s.subtitle} onChange={(e) => setSlide(i, { subtitle: e.target.value })} />
          <button className="text-xs text-red-400 hover:underline flex items-center gap-1" onClick={() => setSlides(slides.filter((_, j) => j !== i))}>
            <Trash2 className="w-3 h-3" /> Quitar slide
          </button>
        </div>
      ))}
      <button
        className="text-sm text-lima hover:underline flex items-center gap-1 mb-4"
        onClick={() => setSlides([...slides, { image: "", title: "", subtitle: "" }])}
      >
        <Plus className="w-4 h-4" /> Agregar slide
      </button>
      <div className="flex items-center gap-3">
        <button
          className="bg-lima text-carbon font-bold px-6 py-2 rounded-full text-sm uppercase"
          onClick={() => save.mutate({ entries: { bannerSlides: slides.filter((s) => s.image) } })}
        >
          Guardar banner
        </button>
        {msg && <span className="text-lima text-sm">{msg}</span>}
      </div>
    </div>
  );
}

function ConfigTab({ settings }: { settings: SettingsMap }) {
  const [form, setForm] = useState({
    heroTitle: settings.heroTitle ?? "",
    heroSubtitle: settings.heroSubtitle ?? "",
    aboutText: settings.aboutText ?? "",
    hours: settings.hours ?? "",
    address: settings.address ?? "",
    mapEmbedUrl: settings.mapEmbedUrl ?? "",
    instagram: settings.instagram ?? "",
    tiktok: settings.tiktok ?? "",
    whatsapp: settings.whatsapp ?? "",
  });
  const [msg, setMsg] = useState("");
  const save = trpc.admin.updateSettings.useMutation({
    onSuccess: () => { setMsg("Configuración guardada ✔"); setTimeout(() => setMsg(""), 2500); },
  });

  const field = (key: keyof typeof form, label: string, area = false) => (
    <div>
      <label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</label>
      {area ? (
        <textarea className={`${inputCls} min-h-24 mt-1`} value={String(form[key])} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
      ) : (
        <input className={`${inputCls} mt-1`} value={String(form[key])} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
      )}
    </div>
  );

  return (
    <div>
      <h2 className="font-display text-2xl font-bold uppercase mb-4">Configuración general</h2>
      <div className="space-y-3">
        {field("heroTitle", "Título principal")}
        {field("heroSubtitle", "Subtítulo principal")}
        {field("aboutText", "Texto 'Sobre Nosotros'", true)}
        {field("hours", "Horarios de atención")}
        {field("address", "Dirección")}
        {field("mapEmbedUrl", "URL del mapa embebido (Google Maps)")}
        {field("instagram", "Instagram (URL)")}
        {field("tiktok", "TikTok (URL)")}
        {field("whatsapp", "WhatsApp (número, solo dígitos, ej: 5491127414110)")}
      </div>
      <div className="flex items-center gap-3 mt-4">
        <button
          className="bg-lima text-carbon font-bold px-6 py-2 rounded-full text-sm uppercase"
          onClick={() => save.mutate({ entries: form })}
        >
          Guardar configuración
        </button>
        {msg && <span className="text-lima text-sm">{msg}</span>}
      </div>
    </div>
  );
}

function PasswordTab() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const change = trpc.auth.changePassword.useMutation({
    onSuccess: () => { setMsg("Contraseña actualizada ✔"); setError(""); setCurrent(""); setNext(""); },
    onError: (e) => { setError(e.message); setMsg(""); },
  });

  return (
    <div className="max-w-sm">
      <h2 className="font-display text-2xl font-bold uppercase mb-4">Cambiar contraseña</h2>
      <div className="space-y-3">
        <input className={inputCls} type="password" placeholder="Contraseña actual" value={current} onChange={(e) => setCurrent(e.target.value)} />
        <input className={inputCls} type="password" placeholder="Nueva contraseña (mín. 8 caracteres)" value={next} onChange={(e) => setNext(e.target.value)} />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        {msg && <p className="text-lima text-sm">{msg}</p>}
        <button
          disabled={!current || next.length < 8 || change.isPending}
          onClick={() => change.mutate({ current, next })}
          className="bg-lima text-carbon font-bold px-6 py-2 rounded-full text-sm uppercase disabled:opacity-50"
        >
          Actualizar contraseña
        </button>
      </div>
      <p className="text-xs text-muted-foreground mt-4">
        La contraseña se almacena hasheada con bcrypt (factor 12). Nunca se guarda en texto plano.
      </p>
    </div>
  );
}

/* ---------- Panel ---------- */
function Panel() {
  const [tab, setTab] = useState<Tab>("productos");
  const { data: catalogRaw } = trpc.catalog.list.useQuery();
  const { data: settingsRaw } = trpc.catalog.settings.useQuery();
  const catalog = (catalogRaw ?? []) as CatalogCategory[];
  const settings = (settingsRaw ?? {}) as SettingsMap;
  const logout = trpc.auth.logout.useMutation({ onSuccess: () => window.location.reload() });

  const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "productos", label: "Productos", icon: Package },
    { id: "categorias", label: "Categorías", icon: FolderTree },
    { id: "destacados", label: "Destacados", icon: Star },
    { id: "banner", label: "Banner", icon: ImageIcon },
    { id: "config", label: "Configuración", icon: Settings2 },
    { id: "password", label: "Contraseña", icon: KeyRound },
  ];

  return (
    <div className="min-h-screen bg-carbon">
      <header className="border-b border-border bg-card/60">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Logo compact />
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm text-muted-foreground hover:text-lima flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Ver tienda
            </Link>
            <button onClick={() => logout.mutate()} className="text-sm text-muted-foreground hover:text-red-400 flex items-center gap-1">
              <LogOut className="w-4 h-4" /> Salir
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
        <nav className="md:w-52 shrink-0 flex md:flex-col gap-1 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition ${
                tab === t.id ? "bg-lima text-carbon font-bold" : "text-muted-foreground hover:bg-card"
              }`}
            >
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </nav>
        <div className="flex-1 min-w-0">
          {tab === "productos" && <ProductosTab catalog={catalog} />}
          {tab === "categorias" && <CategoriasTab catalog={catalog} />}
          {tab === "destacados" && <DestacadosTab catalog={catalog} />}
          {tab === "banner" && <BannerTab key={JSON.stringify(settings.bannerSlides)} settings={settings} />}
          {tab === "config" && <ConfigTab key="cfg" settings={settings} />}
          {tab === "password" && <PasswordTab />}
        </div>
      </div>
    </div>
  );
}

export default function Admin() {
  const me = trpc.auth.me.useQuery(undefined, { retry: false });
  const [justLoggedIn, setJustLoggedIn] = useState(false);

  useEffect(() => {
    if (justLoggedIn) me.refetch();
  }, [justLoggedIn]); // eslint-disable-line react-hooks/exhaustive-deps

  if (me.isLoading) {
    return <div className="min-h-screen bg-carbon flex items-center justify-center text-muted-foreground">Cargando...</div>;
  }
  if (me.isError) {
    return <Login onSuccess={() => setJustLoggedIn(true)} />;
  }
  return <Panel />;
}
