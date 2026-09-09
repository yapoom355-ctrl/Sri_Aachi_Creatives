export function resolveProductImage(thumbnailUrl?: string | null, nameOrSlug?: string, id?: string): string {
  if (thumbnailUrl) {
    let url = thumbnailUrl;
    if (url.startsWith("/media/")) {
      url = `https://sriaachicreatives.udayamarketing.in${url}`;
    }
    if (url.startsWith("http")) {
      // Auto-upgrade any low-res 256/128/64 thumbnails to 1024 high resolution
      return url
        .replace(/_thumbnail_256\./gi, "_thumbnail_1024.")
        .replace(/_thumbnail_128\./gi, "_thumbnail_1024.")
        .replace(/_thumbnail_64\./gi, "_thumbnail_1024.");
    }
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
