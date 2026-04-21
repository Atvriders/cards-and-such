// Word list for Word Search — common English words
export const WORD_POOL: string[] = [
  "APPLE","BRAVE","CRANE","DANCE","EAGLE","FABLE","GRACE","HOUSE","IVORY","JOKER",
  "KNIFE","LEMON","MANGO","NOVEL","OCEAN","PIANO","QUEEN","RIVER","SOLAR","TIGER",
  "ULTRA","VIPER","WHEAT","XENON","YACHT","ZEBRA","AMBER","BLAZE","CEDAR","DINGO",
  "EMBER","FLUTE","GRAPE","HERON","INDEX","JEWEL","KARMA","LLAMA","METRO","NINJA",
  "OLIVE","PETAL","QUAIL","RADAR","SIREN","THORN","UMBRA","VIOLA","WALTZ","AXIOM",
  "BRONZE","CASTLE","DANGER","EMPIRE","FOREST","GARDEN","HARBOR","INSECT","JAGUAR","KERNEL",
  "LANTERN","MIRROR","NARROW","ORACLE","PARROT","QUARRY","REASON","SATURN","TUNNEL","UPLIFT",
  "VELVET","WINTER","XYSTER","YEOMAN","ZEPHYR","ANCHOR","BASKET","CANOPY","DESERT","ELBOW",
  "FALCON","GOBLIN","HAMLET","ICICLE","JUNIOR","KIMONO","LAGOON","MAGNET","NOODLE","OYSTER",
  "PATENT","QUIVER","ROCKET","SPIDER","TEMPLE","UKULELE","VORTEX","WALRUS","YELLOW","ZIPPER",
  "FLAME","GLOBE","HONEY","IVORY","JEWEL","KNEEL","LIGHT","MAPLE","NORTH","ORDER",
  "PEACH","QUEST","RIDGE","SHORE","TRACE","UNCLE","VIVID","WHALE","EXTRA","YOUNG",
];

export function getWords(count: number, rng: () => number): string[] {
  const pool = WORD_POOL.slice();
  // Fisher-Yates shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }
  return pool.slice(0, count);
}
