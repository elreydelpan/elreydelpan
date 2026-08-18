import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { CatalogCategory } from "@contracts/types";

export function downloadPriceListPDF(catalog: CatalogCategory[]) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const CARBON: [number, number, number] = [11, 11, 11];

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  doc.setFillColor(...CARBON);
  doc.rect(0, 0, pageW, 90, "F");
  doc.setTextColor(200, 243, 29);
  doc.setFontSize(26);
  doc.setFont("helvetica", "bold");
  doc.text("EL REY DEL PAN", pageW / 2, 42, { align: "center" });
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Lista de precios mayorista", pageW / 2, 62, { align: "center" });
  doc.text(`Vigente al ${new Date().toLocaleDateString("es-AR")}`, pageW / 2, 78, { align: "center" });

  let y = 115;

  for (const cat of catalog.filter((c) => c.active)) {
    const prods = cat.products.filter((p) => p.active);
    if (prods.length === 0) continue;

    const refTiers = [...(prods[0]?.priceTiers ?? [])].sort((a, b) => a.minQty - b.minQty);
    const maxTiers = Math.max(...prods.map((p) => p.priceTiers.length));
    const head = [
      ["Detalle", ...Array.from({ length: maxTiers }, (_, i) => (refTiers[i] ? `x${refTiers[i].minQty}` : "-"))],
    ];
    const body = prods.map((p) => {
      const tiers = [...p.priceTiers].sort((a, b) => a.minQty - b.minQty);
      return [
        p.name + (p.unit ? ` (${p.unit})` : ""),
        ...Array.from({ length: maxTiers }, (_, i) => (tiers[i] ? `$ ${tiers[i].price.toLocaleString("es-AR")}` : "-")),
      ];
    });

    // estimación de altura para salto de página
    const estHeight = 20 + (body.length + 1) * 18;
    if (y + estHeight > pageH - 60) {
      doc.addPage();
      y = 60;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...CARBON);
    doc.text(cat.name.toUpperCase(), 40, y);

    autoTable(doc, {
      startY: y + 8,
      head,
      body,
      theme: "grid",
      styles: { fontSize: 8.5, cellPadding: 4 },
      headStyles: { fillColor: CARBON, textColor: [200, 243, 29], fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 245, 238] },
      margin: { left: 40, right: 40 },
    });

    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 26;
  }

  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120);
    doc.text(
      "El Rey del Pan · Juan Manuel de Rosas 1153, Gregorio de Laferrère · WhatsApp +54 9 11 2741-4110",
      pageW / 2,
      pageH - 20,
      { align: "center" }
    );
  }

  doc.save("lista-de-precios-el-rey-del-pan.pdf");
}
