export function resolveProductImage(thumbnailUrl?: string | null, nameOrSlug?: string, id?: string): string {
  if (thumbnailUrl && thumbnailUrl.startsWith("http")) {
    return thumbnailUrl;
  }

  const query = (nameOrSlug || "").toLowerCase();

  if (query.includes("resin") || query.includes("memory")) {
    return "/images/resin-memory-block.jpg";
  }
  if (query.includes("photo") || query.includes("frame")) {
    return "/images/photo-frame.webp";
  }
  if (query.includes("engine") || query.includes("table")) {
    return "/images/motor-engine-table.webp";
  }
  if (query.includes("gear") || query.includes("clock")) {
    return "/images/gear-clock.webp";
  }
  if (query.includes("piston") || query.includes("lamp")) {
    return "/images/piston-lamp.webp";
  }
  if (query.includes("mug") || query.includes("cup") || query.includes("ceramic")) {
    return "/images/mug-ceramic.jpg";
  }
  if (query.includes("oversized")) {
    return "/images/tshirt-oversized-custom.jpg";
  }
  if (query.includes("t-shirt") || query.includes("tshirt") || query.includes("shirt") || query.includes("tee")) {
    return "/images/tshirt-black-custom.png";
  }

  // Fallback to custom resin memory block
  return "/images/resin-memory-block.jpg";
}
