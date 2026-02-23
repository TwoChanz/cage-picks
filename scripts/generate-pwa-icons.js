/**
 * generate-pwa-icons.js — One-time script to create PWA icons from master icon
 *
 * Usage: node scripts/generate-pwa-icons.js
 *
 * Generates:
 *   public/icons/icon-192x192.png
 *   public/icons/icon-512x512.png
 *   public/icons/apple-touch-icon.png (180x180)
 */
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const SOURCE = path.join(__dirname, "..", "assets", "images", "icon.png");
const OUT_DIR = path.join(__dirname, "..", "public", "icons");

const SIZES = [
  { name: "icon-192x192.png", size: 192 },
  { name: "icon-512x512.png", size: 512 },
  { name: "apple-touch-icon.png", size: 180 },
];

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const { name, size } of SIZES) {
    await sharp(SOURCE)
      .resize(size, size, {
        fit: "contain",
        background: { r: 26, g: 26, b: 46, alpha: 1 },
      })
      .png()
      .toFile(path.join(OUT_DIR, name));
    console.log(`  Created: public/icons/${name} (${size}x${size})`);
  }
  console.log("Done!");
}

main().catch(console.error);
