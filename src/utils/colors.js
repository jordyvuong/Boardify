/**
 * Éclaircit une couleur hexadécimale
 * @param {string} color - Couleur au format hexadécimal (#RRGGBB)
 * @param {number} factor - Facteur d'éclaircissement (0-1)
 * @returns {string} - Couleur éclaircie au format hexadécimal
 */
export function getLighterColor(color, factor = 0.8) {
  // Extraction des composantes RGB
  let r = parseInt(color.slice(1, 3), 16)
  let g = parseInt(color.slice(3, 5), 16)
  let b = parseInt(color.slice(5, 7), 16)

  // Application du facteur d'éclaircissement
  r = Math.min(255, r + Math.round((255 - r) * factor))
  g = Math.min(255, g + Math.round((255 - g) * factor))
  b = Math.min(255, b + Math.round((255 - b) * factor))

  // Conversion en hexadécimal
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}
