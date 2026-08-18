/** Emoji de relleno según el nombre del producto (hasta que el admin suba fotos) */
export function productEmoji(name: string): string {
  const n = name.toLowerCase();
  if (/papas|batata|nachos|conos|ondulada/.test(n)) return "🍟";
  if (/tostadita/.test(n)) return "🫓";
  if (/palito/.test(n)) return "🥨";
  if (/agua/.test(n)) return "💧";
  if (/alfajor|bon o bon|sapito|fulbito/.test(n)) return "🍫";
  if (/gom|gummy|yummy|misky|lengüetazo|billiken|mogul|freegells|smack|turrón|selva/.test(n)) return "🍬";
  if (/kandy|defensa|hamburguesa x|caja 40/.test(n)) return "🍔";
  if (/pancho corto x|super pancho x/.test(n)) return "🌭";
  if (/pancho|hamburguesa/.test(n)) return "🍔";
  return "🍞";
}
