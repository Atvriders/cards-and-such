export interface TilePos {
  row: number;
  col: number;
  layer: number;
}

function pos(row: number, col: number, layer: number): TilePos {
  return { row, col, layer };
}

/**
 * Build Turtle layout — 144 tiles total across 5 layers.
 * Layer 0: 9×8=72, Layer 1: 7×6=42, Layer 2: 5×4=20, Layer 3: 3×2=6, Layer 4 (apex): 4
 * Total: 72+42+20+6+4 = 144 ✓
 */
export const TURTLE_LAYOUT: TilePos[] = (() => {
  const tiles: TilePos[] = [];
  // Layer 0: 9 cols × 8 rows = 72
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 9; c++) {
      tiles.push(pos(r, c, 0));
    }
  }
  // Layer 1: 7 cols × 6 rows = 42 (centred: rows 1-6, cols 1-7)
  for (let r = 1; r < 7; r++) {
    for (let c = 1; c < 8; c++) {
      tiles.push(pos(r, c, 1));
    }
  }
  // Layer 2: 5 cols × 4 rows = 20 (centred: rows 2-5, cols 2-6)
  for (let r = 2; r < 6; r++) {
    for (let c = 2; c < 7; c++) {
      tiles.push(pos(r, c, 2));
    }
  }
  // Layer 3: 3 cols × 2 rows = 6 (centred: rows 3-4, cols 3-5)
  for (let r = 3; r < 5; r++) {
    for (let c = 3; c < 6; c++) {
      tiles.push(pos(r, c, 3));
    }
  }
  // Layer 4 (apex): 4 tiles (rows 3-4, cols 4)
  tiles.push(pos(3, 4, 4), pos(4, 4, 4), pos(3, 5, 4), pos(4, 5, 4));

  // 72 + 42 + 20 + 6 + 4 = 144
  return tiles;
})();

/**
 * Dragon layout — 144 tiles across 5 layers.
 * Layer 0: 11×8=88 — but adjusted: use 11×8 = 88 base, then build up
 * Layer 0: 8×10=80, Layer 1: 6×8=48... too many
 * Simple: Layer 0: 12×6=72, Layer 1: 10×4=40, Layer 2: 8×2=16, Layer 3: 6×2=12, Layer 4: 4
 * 72+40+16+12+4=144 ✓
 */
export const DRAGON_LAYOUT: TilePos[] = (() => {
  const tiles: TilePos[] = [];
  // Layer 0: 12 cols × 6 rows = 72
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 12; c++) {
      tiles.push(pos(r, c, 0));
    }
  }
  // Layer 1: 10 cols × 4 rows = 40 (rows 1-4, cols 1-10)
  for (let r = 1; r < 5; r++) {
    for (let c = 1; c < 11; c++) {
      tiles.push(pos(r, c, 1));
    }
  }
  // Layer 2: 8 cols × 2 rows = 16 (rows 2-3, cols 2-9)
  for (let r = 2; r < 4; r++) {
    for (let c = 2; c < 10; c++) {
      tiles.push(pos(r, c, 2));
    }
  }
  // Layer 3: 6 cols × 2 rows = 12 (rows 2-3, cols 3-8)
  for (let r = 2; r < 4; r++) {
    for (let c = 3; c < 9; c++) {
      tiles.push(pos(r, c, 3));
    }
  }
  // Layer 4: 4 tiles (rows 2-3, cols 5-6)
  tiles.push(pos(2, 5, 4), pos(2, 6, 4), pos(3, 5, 4), pos(3, 6, 4));

  // 72 + 40 + 16 + 12 + 4 = 144
  return tiles;
})();

/**
 * Pyramid layout — 144 tiles across 5 layers, wide base tapering upward.
 * Layer 0: 14×5=70, Layer 1: 10×4=40, Layer 2: 6×3=18, Layer 3: 4×2=8, Layer 4: 8×1=8
 * 70 + 40 + 18 + 8 + 8 = 144 ✓
 */
export const PYRAMID_LAYOUT: TilePos[] = (() => {
  const tiles: TilePos[] = [];

  // Layer 0: 14 cols × 5 rows = 70
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 14; c++) {
      tiles.push(pos(r, c, 0));
    }
  }

  // Layer 1: 10 cols × 4 rows = 40 (rows 0-3, cols 2-11)
  for (let r = 0; r < 4; r++) {
    for (let c = 2; c < 12; c++) {
      tiles.push(pos(r, c, 1));
    }
  }

  // Layer 2: 6 cols × 3 rows = 18 (rows 0-2, cols 4-9)
  for (let r = 0; r < 3; r++) {
    for (let c = 4; c < 10; c++) {
      tiles.push(pos(r, c, 2));
    }
  }

  // Layer 3: 4 cols × 2 rows = 8 (rows 0-1, cols 5-8)
  for (let r = 0; r < 2; r++) {
    for (let c = 5; c < 9; c++) {
      tiles.push(pos(r, c, 3));
    }
  }

  // Layer 4 (apex): 8 tiles — 2 rows × 4 cols (rows 0-1, cols 5-8 → offset: rows 0-1, cols 5-8)
  // Actually let's use 4 cols for 2 rows: 8 total but we need exactly 8
  // 70 + 40 + 18 + 8 = 136, need 8 more
  for (let c = 6; c < 8; c++) {
    tiles.push(pos(0, c, 4), pos(1, c, 4));
  }
  // That's 4. Need 4 more.
  tiles.push(pos(0, 5, 4), pos(0, 8, 4), pos(1, 5, 4), pos(1, 8, 4));

  // Should be 144: 70 + 40 + 18 + 8 + 8 = 144
  return tiles;
})();
