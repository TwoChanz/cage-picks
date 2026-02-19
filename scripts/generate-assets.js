/**
 * Generate app icon and splash assets for FightNight OS
 *
 * Creates branded placeholder images using sharp:
 * - icon.png (1024x1024) — App icon
 * - adaptive-icon.png (1024x1024) — Android adaptive icon foreground
 * - splash-icon.png (200x200) — Splash screen center icon
 * - notification-icon.png (96x96) — Push notification icon (white on transparent)
 * - favicon.png (48x48) — Web favicon
 */
const sharp = require("sharp")
const path = require("path")

const OUT = path.join(__dirname, "..", "assets", "images")
const BG = "#1a1a2e"
const RED = "#dc2626"

// Lightning bolt SVG path (centered in viewBox)
function lightningBolt(size, fgColor = "#ffffff", bgColor = BG, padding = 0.25) {
  const p = size * padding
  const w = size - p * 2
  const h = size - p * 2
  // Lightning bolt coordinates scaled to the padded area
  const ox = p
  const oy = p
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" rx="${Math.round(size * 0.18)}" fill="${bgColor}"/>
    <polygon points="${ox + w * 0.55},${oy} ${ox + w * 0.2},${oy + h * 0.55} ${ox + w * 0.45},${oy + h * 0.55} ${ox + w * 0.35},${oy + h} ${ox + w * 0.8},${oy + h * 0.4} ${ox + w * 0.55},${oy + h * 0.4} ${ox + w * 0.65},${oy}" fill="${fgColor}"/>
  </svg>`
}

// Circle version for adaptive icon
function lightningCircle(size) {
  const cx = size / 2
  const cy = size / 2
  const r = size * 0.35
  const p = size * 0.3
  const w = size - p * 2
  const h = size - p * 2
  const ox = p
  const oy = p
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" fill="${BG}"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="${RED}" opacity="0.2"/>
    <polygon points="${ox + w * 0.55},${oy} ${ox + w * 0.2},${oy + h * 0.55} ${ox + w * 0.45},${oy + h * 0.55} ${ox + w * 0.35},${oy + h} ${ox + w * 0.8},${oy + h * 0.4} ${ox + w * 0.55},${oy + h * 0.4} ${ox + w * 0.65},${oy}" fill="${RED}"/>
  </svg>`
}

// Notification icon: white on transparent, no background
function notificationSvg(size) {
  const p = size * 0.15
  const w = size - p * 2
  const h = size - p * 2
  const ox = p
  const oy = p
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <polygon points="${ox + w * 0.55},${oy} ${ox + w * 0.2},${oy + h * 0.55} ${ox + w * 0.45},${oy + h * 0.55} ${ox + w * 0.35},${oy + h} ${ox + w * 0.8},${oy + h * 0.4} ${ox + w * 0.55},${oy + h * 0.4} ${ox + w * 0.65},${oy}" fill="#ffffff"/>
  </svg>`
}

async function generate() {
  // App icon (1024x1024)
  await sharp(Buffer.from(lightningBolt(1024, RED, BG)))
    .png()
    .toFile(path.join(OUT, "icon.png"))
  console.log("Created icon.png (1024x1024)")

  // Adaptive icon foreground (1024x1024)
  await sharp(Buffer.from(lightningCircle(1024)))
    .png()
    .toFile(path.join(OUT, "adaptive-icon.png"))
  console.log("Created adaptive-icon.png (1024x1024)")

  // Splash icon (200x200)
  await sharp(Buffer.from(lightningBolt(200, RED, "transparent", 0.1)))
    .png()
    .toFile(path.join(OUT, "splash-icon.png"))
  console.log("Created splash-icon.png (200x200)")

  // Notification icon (96x96) — white on transparent
  await sharp(Buffer.from(notificationSvg(96)))
    .png()
    .toFile(path.join(OUT, "notification-icon.png"))
  console.log("Created notification-icon.png (96x96)")

  // Favicon (48x48)
  await sharp(Buffer.from(lightningBolt(48, RED, BG, 0.15)))
    .png()
    .toFile(path.join(OUT, "favicon.png"))
  console.log("Created favicon.png (48x48)")

  console.log("\nAll assets generated in assets/images/")
}

generate().catch(console.error)
