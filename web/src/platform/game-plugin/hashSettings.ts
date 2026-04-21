export function hashSettings(values: Record<string, unknown>): string {
  const json = JSON.stringify(values, Object.keys(values).sort());
  // djb2 hash, 32-bit, hex-encoded and truncated to 8 chars
  let h = 5381 >>> 0;
  for (let i = 0; i < json.length; i++) {
    h = ((h * 33) ^ json.charCodeAt(i)) >>> 0;
  }
  return h.toString(16).padStart(8, "0").slice(0, 8);
}
