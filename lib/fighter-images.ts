/**
 * Local Fighter Image Mapping
 *
 * Maps fighter slugs to bundled local images. These take priority
 * over remote `image_url` values from the database.
 *
 * To add a new fighter image:
 * 1. Drop the image into assets/images/fighters/
 * 2. Add a require() entry below keyed by the fighter's slug
 */
import { ImageSourcePropType } from "react-native"

const FIGHTER_IMAGES: Record<string, ImageSourcePropType> = {
  "alex-pereira": require("@/assets/images/fighters/Alex.Pereira.png"),
  "alexander-volkanovski": require("@/assets/images/fighters/Alexander.png"),
  "alexandre-pantoja": require("@/assets/images/fighters/Alexandre.png"),
  "arman-tsarukyan": require("@/assets/images/fighters/Arman.png"),
  "islam-makhachev": require("@/assets/images/fighters/Makhachev.png"),
  "ilia-topuria": require("@/assets/images/fighters/Topuria.png"),
  "khamzat-chimaev": require("@/assets/images/fighters/Chimaev.png"),
  "magomed-ankalaev": require("@/assets/images/fighters/magomed.ankalaev.png"),
  "merab-dvalishvili": require("@/assets/images/fighters/Merab.png"),
  "petr-yan": require("@/assets/images/fighters/Petr.png"),
  "tom-aspinall": require("@/assets/images/fighters/Aspinall.png"),
}

/**
 * Returns a local image source for a fighter, or null if none exists.
 */
export function getFighterImage(slug: string): ImageSourcePropType | null {
  return FIGHTER_IMAGES[slug] ?? null
}
