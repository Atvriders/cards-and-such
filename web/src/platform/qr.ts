/**
 * Tiny pure-TS QR code generator (no dependencies).
 *
 * Supports byte-mode encoding only, ECC level M, versions 1–10
 * (capacity up to ~213 alphanumeric or ~146 byte chars). That's
 * more than enough for the friend-share URLs this codebase emits,
 * which top out around 80 bytes.
 *
 * The implementation follows ISO/IEC 18004:2006:
 *  - Reed–Solomon error correction in GF(256) with polynomial 0x11d
 *  - Standard finder, alignment, and timing patterns
 *  - All 8 mask patterns evaluated against the four QR penalty rules
 *  - Format-info BCH + XOR mask 0x5412
 *
 * This is intentionally minimalist. It is *not* a general-purpose
 * QR library — kanji/numeric/alphanumeric fast paths are skipped
 * (byte mode is universal) and we cap at version 10 to keep the
 * tables small. Returned modules are an N×N boolean grid where
 * `true` = dark.
 */
export interface QrModules {
  size: number;
  modules: boolean[][];
}

// Byte-mode capacity for ECC level M, versions 1..10.
// (From ISO/IEC 18004 Table 7.)
const BYTE_CAPACITY_M = [
  14, 26, 42, 62, 84, 106, 122, 152, 180, 213,
];

// Total codewords per version (versions 1..10).
const TOTAL_CODEWORDS = [
  26, 44, 70, 100, 134, 172, 196, 242, 292, 346,
];

// EC codewords per block, level M, versions 1..10.
const EC_CODEWORDS_M = [
  10, 16, 26, 18, 24, 16, 18, 22, 22, 26,
];

// EC block layout for level M, versions 1..10.
// Each tuple is [groups of (count, dataCodewordsPerBlock)].
const BLOCK_LAYOUT_M: ReadonlyArray<ReadonlyArray<readonly [number, number]>> = [
  [[1, 16]],          // v1
  [[1, 28]],          // v2
  [[1, 44]],          // v3
  [[2, 32]],          // v4
  [[2, 43]],          // v5
  [[4, 27]],          // v6
  [[4, 31]],          // v7
  [[2, 38], [2, 39]], // v8
  [[3, 36], [2, 37]], // v9
  [[4, 43], [1, 44]], // v10
];

// Alignment pattern centers, versions 1..10.
const ALIGNMENT_CENTERS: ReadonlyArray<ReadonlyArray<number>> = [
  [],                // v1
  [6, 18],           // v2
  [6, 22],           // v3
  [6, 26],           // v4
  [6, 30],           // v5
  [6, 34],           // v6
  [6, 22, 38],       // v7
  [6, 24, 42],       // v8
  [6, 26, 46],       // v9
  [6, 28, 50],       // v10
];

// GF(256) tables built from primitive polynomial 0x11d.
const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
(function initGf() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255];
})();

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

/** Build the generator polynomial of degree `degree`. */
function rsGenerator(degree: number): Uint8Array {
  let poly = new Uint8Array([1]);
  for (let i = 0; i < degree; i++) {
    const next = new Uint8Array(poly.length + 1);
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= poly[j];
      next[j + 1] ^= gfMul(poly[j], GF_EXP[i]);
    }
    poly = next;
  }
  return poly;
}

/** Compute `numEc` Reed–Solomon EC codewords for `data`. */
function rsEncode(data: Uint8Array, numEc: number): Uint8Array {
  const gen = rsGenerator(numEc);
  const result = new Uint8Array(numEc);
  for (let i = 0; i < data.length; i++) {
    const factor = data[i] ^ result[0];
    result.copyWithin(0, 1);
    result[result.length - 1] = 0;
    if (factor !== 0) {
      for (let j = 0; j < gen.length - 1; j++) {
        result[j] ^= gfMul(gen[j + 1], factor);
      }
    }
  }
  return result;
}

/** Pick the smallest version 1..10 that fits `byteLen` in level M, or null. */
function pickVersion(byteLen: number): number | null {
  for (let v = 1; v <= 10; v++) {
    if (byteLen <= BYTE_CAPACITY_M[v - 1]) return v;
  }
  return null;
}

/** Encode payload into the bit stream (mode + length + data + terminator + pad). */
function encodeData(bytes: Uint8Array, version: number): Uint8Array {
  const totalCw = TOTAL_CODEWORDS[version - 1];
  const ecCw = EC_CODEWORDS_M[version - 1] *
    BLOCK_LAYOUT_M[version - 1].reduce((s, [n]) => s + n, 0);
  const dataCw = totalCw - ecCw;
  const totalBits = dataCw * 8;

  const charCountBits = version <= 9 ? 8 : 16;

  const bits: number[] = [];
  const pushBits = (value: number, len: number) => {
    for (let i = len - 1; i >= 0; i--) bits.push((value >> i) & 1);
  };

  pushBits(0b0100, 4);                  // byte mode indicator
  pushBits(bytes.length, charCountBits);
  for (const b of bytes) pushBits(b, 8);

  // Terminator (up to 4 bits) and byte-align.
  const remaining = totalBits - bits.length;
  pushBits(0, Math.min(4, Math.max(0, remaining)));
  while (bits.length % 8 !== 0) bits.push(0);

  // Pad bytes alternate 0xEC / 0x11.
  const padBytes = [0xec, 0x11];
  let padIdx = 0;
  while (bits.length < totalBits) {
    pushBits(padBytes[padIdx], 8);
    padIdx ^= 1;
  }

  const out = new Uint8Array(dataCw);
  for (let i = 0; i < dataCw; i++) {
    let v = 0;
    for (let j = 0; j < 8; j++) v = (v << 1) | bits[i * 8 + j];
    out[i] = v;
  }
  return out;
}

/** Split data codewords into blocks per the layout, then compute EC and interleave. */
function buildFinalCodewords(data: Uint8Array, version: number): Uint8Array {
  const layout = BLOCK_LAYOUT_M[version - 1];
  const ecPerBlock = EC_CODEWORDS_M[version - 1];

  const dataBlocks: Uint8Array[] = [];
  const ecBlocks: Uint8Array[] = [];
  let offset = 0;
  for (const [count, dataLen] of layout) {
    for (let i = 0; i < count; i++) {
      const block = data.slice(offset, offset + dataLen);
      offset += dataLen;
      dataBlocks.push(block);
      ecBlocks.push(rsEncode(block, ecPerBlock));
    }
  }

  // Interleave data codewords column-by-column.
  const maxDataLen = Math.max(...dataBlocks.map((b) => b.length));
  const interleaved: number[] = [];
  for (let col = 0; col < maxDataLen; col++) {
    for (const block of dataBlocks) {
      if (col < block.length) interleaved.push(block[col]);
    }
  }
  for (let col = 0; col < ecPerBlock; col++) {
    for (const block of ecBlocks) interleaved.push(block[col]);
  }
  return new Uint8Array(interleaved);
}

function makeEmptyMatrix(size: number): { m: (boolean | null)[][]; r: boolean[][] } {
  const m: (boolean | null)[][] = [];
  const r: boolean[][] = [];
  for (let i = 0; i < size; i++) {
    m.push(new Array(size).fill(null));
    r.push(new Array(size).fill(false));
  }
  return { m, r };
}

function placeFinder(
  m: (boolean | null)[][],
  r: boolean[][],
  row: number,
  col: number,
) {
  for (let dr = -1; dr <= 7; dr++) {
    for (let dc = -1; dc <= 7; dc++) {
      const rr = row + dr, cc = col + dc;
      if (rr < 0 || cc < 0 || rr >= m.length || cc >= m.length) continue;
      const inner = dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6;
      let dark = false;
      if (inner) {
        const onEdge = dr === 0 || dr === 6 || dc === 0 || dc === 6;
        const inCenter = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
        dark = onEdge || inCenter;
      }
      m[rr][cc] = dark;
      r[rr][cc] = true;
    }
  }
}

function placeAlignment(m: (boolean | null)[][], r: boolean[][], row: number, col: number) {
  for (let dr = -2; dr <= 2; dr++) {
    for (let dc = -2; dc <= 2; dc++) {
      const onEdge = Math.abs(dr) === 2 || Math.abs(dc) === 2;
      const center = dr === 0 && dc === 0;
      m[row + dr][col + dc] = onEdge || center;
      r[row + dr][col + dc] = true;
    }
  }
}

function placeTiming(m: (boolean | null)[][], r: boolean[][]) {
  const size = m.length;
  for (let i = 8; i < size - 8; i++) {
    const dark = i % 2 === 0;
    m[6][i] = dark; r[6][i] = true;
    m[i][6] = dark; r[i][6] = true;
  }
}

function reserveFormat(m: (boolean | null)[][], r: boolean[][]) {
  const size = m.length;
  for (let i = 0; i < 9; i++) {
    if (!r[8][i]) { r[8][i] = true; m[8][i] = false; }
    if (!r[i][8]) { r[i][8] = true; m[i][8] = false; }
  }
  for (let i = 0; i < 8; i++) {
    r[8][size - 1 - i] = true; m[8][size - 1 - i] = false;
    r[size - 1 - i][8] = true; m[size - 1 - i][8] = false;
  }
  // The "dark module" — always set.
  m[size - 8][8] = true; r[size - 8][8] = true;
}

function fillData(
  m: (boolean | null)[][],
  r: boolean[][],
  codewords: Uint8Array,
) {
  const size = m.length;
  let bitIdx = 0;
  let upward = true;
  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col--; // skip vertical timing
    for (let i = 0; i < size; i++) {
      const row = upward ? size - 1 - i : i;
      for (let dx = 0; dx < 2; dx++) {
        const c = col - dx;
        if (r[row][c]) continue;
        let bit = 0;
        if (bitIdx >> 3 < codewords.length) {
          bit = (codewords[bitIdx >> 3] >> (7 - (bitIdx & 7))) & 1;
        }
        m[row][c] = bit === 1;
        bitIdx++;
      }
    }
    upward = !upward;
  }
}

function maskBit(mask: number, row: number, col: number): boolean {
  switch (mask) {
    case 0: return (row + col) % 2 === 0;
    case 1: return row % 2 === 0;
    case 2: return col % 3 === 0;
    case 3: return (row + col) % 3 === 0;
    case 4: return (Math.floor(row / 2) + Math.floor(col / 3)) % 2 === 0;
    case 5: return ((row * col) % 2) + ((row * col) % 3) === 0;
    case 6: return (((row * col) % 2) + ((row * col) % 3)) % 2 === 0;
    case 7: return (((row + col) % 2) + ((row * col) % 3)) % 2 === 0;
    default: return false;
  }
}

function applyMask(
  base: boolean[][],
  reserved: boolean[][],
  mask: number,
): boolean[][] {
  const size = base.length;
  const out: boolean[][] = [];
  for (let r = 0; r < size; r++) {
    const row: boolean[] = new Array(size);
    for (let c = 0; c < size; c++) {
      let bit = base[r][c];
      if (!reserved[r][c] && maskBit(mask, r, c)) bit = !bit;
      row[c] = bit;
    }
    out.push(row);
  }
  return out;
}

function placeFormatInfo(grid: boolean[][], mask: number) {
  const size = grid.length;
  const data = (0b00 << 3) | mask; // ECC level M = 0b00
  let rem = data;
  for (let i = 0; i < 10; i++) {
    rem = (rem << 1) ^ ((rem >> 9) * 0x537);
  }
  const bits = ((data << 10) | rem) ^ 0x5412;
  for (let i = 0; i <= 5; i++) grid[8][i] = ((bits >> i) & 1) === 1;
  grid[8][7] = ((bits >> 6) & 1) === 1;
  grid[8][8] = ((bits >> 7) & 1) === 1;
  grid[7][8] = ((bits >> 8) & 1) === 1;
  for (let i = 9; i < 15; i++) grid[14 - i][8] = ((bits >> i) & 1) === 1;
  for (let i = 0; i < 8; i++) grid[size - 1 - i][8] = ((bits >> i) & 1) === 1;
  for (let i = 8; i < 15; i++) grid[8][size - 15 + i] = ((bits >> i) & 1) === 1;
  grid[size - 8][8] = true; // dark module
}

function evaluatePenalty(grid: boolean[][]): number {
  const size = grid.length;
  let p = 0;
  // Rule 1: runs of >= 5 in rows and columns
  for (let r = 0; r < size; r++) {
    let run = 1;
    for (let c = 1; c < size; c++) {
      if (grid[r][c] === grid[r][c - 1]) {
        run++;
      } else {
        if (run >= 5) p += 3 + (run - 5);
        run = 1;
      }
    }
    if (run >= 5) p += 3 + (run - 5);
  }
  for (let c = 0; c < size; c++) {
    let run = 1;
    for (let r = 1; r < size; r++) {
      if (grid[r][c] === grid[r - 1][c]) {
        run++;
      } else {
        if (run >= 5) p += 3 + (run - 5);
        run = 1;
      }
    }
    if (run >= 5) p += 3 + (run - 5);
  }
  // Rule 2: 2x2 blocks
  for (let r = 0; r < size - 1; r++) {
    for (let c = 0; c < size - 1; c++) {
      const v = grid[r][c];
      if (v === grid[r][c + 1] && v === grid[r + 1][c] && v === grid[r + 1][c + 1]) p += 3;
    }
  }
  // Rule 3: finder-like patterns 1:1:3:1:1
  const pat = [true, false, true, true, true, false, true, false, false, false, false];
  const patRev = [...pat].reverse();
  const matches = (arr: boolean[], at: number, p: boolean[]) => {
    for (let i = 0; i < p.length; i++) if (arr[at + i] !== p[i]) return false;
    return true;
  };
  for (let r = 0; r < size; r++) {
    for (let c = 0; c <= size - 11; c++) {
      if (matches(grid[r], c, pat) || matches(grid[r], c, patRev)) p += 40;
    }
  }
  for (let c = 0; c < size; c++) {
    const col: boolean[] = new Array(size);
    for (let r = 0; r < size; r++) col[r] = grid[r][c];
    for (let r = 0; r <= size - 11; r++) {
      if (matches(col, r, pat) || matches(col, r, patRev)) p += 40;
    }
  }
  // Rule 4: balance of dark modules
  let dark = 0;
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (grid[r][c]) dark++;
  const ratio = dark / (size * size);
  const dev = Math.floor(Math.abs(ratio * 100 - 50) / 5);
  p += dev * 10;
  return p;
}

/**
 * Encode `text` (UTF-8) as a QR code at level M.
 * Returns the module grid, or null if the text exceeds version-10 capacity.
 */
export function encodeQrModules(text: string): QrModules | null {
  const encoder = typeof TextEncoder !== "undefined" ? new TextEncoder() : null;
  const bytes = encoder
    ? encoder.encode(text)
    : new Uint8Array(Array.from(text, (ch) => ch.charCodeAt(0) & 0xff));
  const version = pickVersion(bytes.length);
  if (version == null) return null;
  const size = 17 + version * 4;

  const dataCw = encodeData(bytes, version);
  const finalCw = buildFinalCodewords(dataCw, version);

  const { m, r } = makeEmptyMatrix(size);
  placeFinder(m, r, 0, 0);
  placeFinder(m, r, 0, size - 7);
  placeFinder(m, r, size - 7, 0);
  for (const ar of ALIGNMENT_CENTERS[version - 1]) {
    for (const ac of ALIGNMENT_CENTERS[version - 1]) {
      if (r[ar][ac]) continue; // skip if overlaps finder
      placeAlignment(m, r, ar, ac);
    }
  }
  placeTiming(m, r);
  reserveFormat(m, r);
  fillData(m, r, finalCw);

  const baseGrid: boolean[][] = m.map((row) => row.map((v) => v === true));

  let bestMask = 0;
  let bestPenalty = Infinity;
  let bestGrid: boolean[][] | null = null;
  for (let mask = 0; mask < 8; mask++) {
    const masked = applyMask(baseGrid, r, mask);
    placeFormatInfo(masked, mask);
    const penalty = evaluatePenalty(masked);
    if (penalty < bestPenalty) {
      bestPenalty = penalty;
      bestMask = mask;
      bestGrid = masked;
    }
  }

  return { size, modules: bestGrid ?? applyMask(baseGrid, r, bestMask) };
}

/**
 * Render the QR `modules` grid as an SVG string. `pixelSize` is the
 * pixel side of one module; `margin` is the quiet zone (modules).
 */
export function renderQrSvg(
  modules: QrModules,
  pixelSize = 4,
  margin = 2,
): string {
  const { size, modules: grid } = modules;
  const totalSize = (size + margin * 2) * pixelSize;
  let path = "";
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!grid[r][c]) continue;
      const x = (c + margin) * pixelSize;
      const y = (r + margin) * pixelSize;
      path += `M${x} ${y}h${pixelSize}v${pixelSize}h-${pixelSize}z`;
    }
  }
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" ` +
    `width="${totalSize}" height="${totalSize}" shape-rendering="crispEdges">` +
    `<rect width="${totalSize}" height="${totalSize}" fill="#fff"/>` +
    `<path fill="#000" d="${path}"/>` +
    `</svg>`
  );
}
