// Umrechnungen in die Einheiten von OOXML.
export const mmToTwip = (mm: number): number => Math.round((mm * 1440) / 25.4);
export const ptToHalfPt = (pt: number): number => Math.round(pt * 2);
export const ptToTwip = (pt: number): number => Math.round(pt * 20);
/** Zeilenabstand als Vielfaches: 240 = einzeilig. */
export const lineSpacing = (factor: number): number => Math.round(240 * factor);
