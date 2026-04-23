// Pre-designed 5×5 crossword mini puzzles
// grid: 25-char string (row-major), '#' = black cell
// across/down: { number, clue, row, col, answer }

export interface MiniClue {
  number: number;
  clue: string;
  row: number;
  col: number;
  answer: string;
}

export interface MiniPuzzle {
  grid: string; // 25 chars, '#' = black
  across: MiniClue[];
  down: MiniClue[];
}

export const MINI_PUZZLES: readonly MiniPuzzle[] = [
  {
    // Puzzle 1
    // BRAVE
    // L###E
    // OZONE
    // C###D
    // KEYED
    grid: "BRAVE" + "L###E" + "OZONE" + "C###D" + "KEYED",
    across: [
      { number: 1, clue: "Courageous", row: 0, col: 0, answer: "BRAVE" },
      { number: 5, clue: "Atmospheric layer gas", row: 2, col: 0, answer: "OZONE" },
      { number: 6, clue: "Digitally adapted", row: 4, col: 0, answer: "KEYED" },
    ],
    down: [
      { number: 1, clue: "Rock music genre prefix", row: 0, col: 0, answer: "BLOCK" },
      { number: 2, clue: "Speed contest", row: 0, col: 1, answer: "RAZOR" },
      { number: 3, clue: "Water element symbol", row: 0, col: 3, answer: "VANE" },
      { number: 4, clue: "Conclusion", row: 0, col: 4, answer: "ENDED" },
    ],
  },
  {
    // Puzzle 2
    // CHESS
    // H###T
    // ARENA
    // P###R
    // SNARE
    grid: "CHESS" + "H###T" + "ARENA" + "P###R" + "SNARE",
    across: [
      { number: 1, clue: "Board game with kings", row: 0, col: 0, answer: "CHESS" },
      { number: 5, clue: "Sports stadium", row: 2, col: 0, answer: "ARENA" },
      { number: 6, clue: "Trap for animals", row: 4, col: 0, answer: "SNARE" },
    ],
    down: [
      { number: 1, clue: "Poultry bird", row: 0, col: 0, answer: "CHAPS" },
      { number: 2, clue: "Rugged cliff face", row: 0, col: 1, answer: "HERON" },
      { number: 3, clue: "Celestial body", row: 0, col: 3, answer: "STAR" },
      { number: 4, clue: "Even score", row: 0, col: 4, answer: "STARE" },
    ],
  },
  {
    // Puzzle 3
    // GLOBE
    // R###A
    // IRATE
    // P###N
    // STERN
    grid: "GLOBE" + "R###A" + "IRATE" + "P###N" + "STERN",
    across: [
      { number: 1, clue: "Spherical world map", row: 0, col: 0, answer: "GLOBE" },
      { number: 5, clue: "Furiously angry", row: 2, col: 0, answer: "IRATE" },
      { number: 6, clue: "Strict and serious", row: 4, col: 0, answer: "STERN" },
    ],
    down: [
      { number: 1, clue: "Understand intuitively", row: 0, col: 0, answer: "GRIPS" },
      { number: 2, clue: "Citrus fruit", row: 0, col: 1, answer: "LORAN" },
      { number: 3, clue: "Consumed food", row: 0, col: 3, answer: "BEAN" },
      { number: 4, clue: "Monetary unit", row: 0, col: 4, answer: "EATEN" },
    ],
  },
  {
    // Puzzle 4
    // PLANT
    // A###U
    // NOTER
    // E###N
    // TREND
    grid: "PLANT" + "A###U" + "NOTER" + "E###N" + "TREND",
    across: [
      { number: 1, clue: "Put seeds in soil", row: 0, col: 0, answer: "PLANT" },
      { number: 5, clue: "One who records remarks", row: 2, col: 0, answer: "NOTER" },
      { number: 6, clue: "General direction of change", row: 4, col: 0, answer: "TREND" },
    ],
    down: [
      { number: 1, clue: "Flat open country", row: 0, col: 0, answer: "PANEL" },
      { number: 2, clue: "Illuminated", row: 0, col: 1, answer: "LATHE" },
      { number: 3, clue: "Below standard", row: 0, col: 3, answer: "NUNS" },
      { number: 4, clue: "Round trip flight stat", row: 0, col: 4, answer: "TREND" },
    ],
  },
  {
    // Puzzle 5
    // FLOSS
    // R###T
    // OVERT
    // S###E
    // TEETH
    grid: "FLOSS" + "R###T" + "OVERT" + "S###E" + "TEETH",
    across: [
      { number: 1, clue: "Dental cleaning thread", row: 0, col: 0, answer: "FLOSS" },
      { number: 5, clue: "Open and plain", row: 2, col: 0, answer: "OVERT" },
      { number: 6, clue: "Dentist's concern", row: 4, col: 0, answer: "TEETH" },
    ],
    down: [
      { number: 1, clue: "Leap over", row: 0, col: 0, answer: "FROSS" },
      { number: 2, clue: "Yellow citrus fruit", row: 0, col: 1, answer: "LEVOT" },
      { number: 3, clue: "Wager", row: 0, col: 3, answer: "SSTE" },
      { number: 4, clue: "Past tense of set", row: 0, col: 4, answer: "STETH" },
    ],
  },
  {
    // Puzzle 6
    // SUGAR
    // T###I
    // OLIVE
    // R###E
    // MINER
    grid: "SUGAR" + "T###I" + "OLIVE" + "R###E" + "MINER",
    across: [
      { number: 1, clue: "Sweetener from cane", row: 0, col: 0, answer: "SUGAR" },
      { number: 5, clue: "Mediterranean fruit", row: 2, col: 0, answer: "OLIVE" },
      { number: 6, clue: "Coal worker", row: 4, col: 0, answer: "MINER" },
    ],
    down: [
      { number: 1, clue: "Vehicle hum", row: 0, col: 0, answer: "STORM" },
      { number: 2, clue: "Upper limb", row: 0, col: 1, answer: "ULIVE" },
      { number: 3, clue: "Perform in a drama", row: 0, col: 3, answer: "ALEE" },
      { number: 4, clue: "Opposite of she", row: 0, col: 4, answer: "RIEEN" },
    ],
  },
  {
    // Puzzle 7
    // CAMEL
    // L###A
    // ECLAT
    // V###R
    // SMART
    grid: "CAMEL" + "L###A" + "ECLAT" + "V###R" + "SMART",
    across: [
      { number: 1, clue: "Desert animal with humps", row: 0, col: 0, answer: "CAMEL" },
      { number: 5, clue: "Brilliant display", row: 2, col: 0, answer: "ECLAT" },
      { number: 6, clue: "Clever and quick-witted", row: 4, col: 0, answer: "SMART" },
    ],
    down: [
      { number: 1, clue: "Lock and ___", row: 0, col: 0, answer: "CLEVE" },
      { number: 2, clue: "Melody", row: 0, col: 1, answer: "ACLAR" },
      { number: 3, clue: "Departed (archaic)", row: 0, col: 3, answer: "ETAR" },
      { number: 4, clue: "Illuminated", row: 0, col: 4, answer: "LATTR" },
    ],
  },
  {
    // Puzzle 8
    // PILOT
    // A###H
    // RISEN
    // N###E
    // KNIFE
    grid: "PILOT" + "A###H" + "RISEN" + "N###E" + "KNIFE",
    across: [
      { number: 1, clue: "Aircraft commander", row: 0, col: 0, answer: "PILOT" },
      { number: 5, clue: "Gone upward (past)", row: 2, col: 0, answer: "RISEN" },
      { number: 6, clue: "Sharp cutting blade", row: 4, col: 0, answer: "KNIFE" },
    ],
    down: [
      { number: 1, clue: "Long cooking vessel", row: 0, col: 0, answer: "PRINK" },
      { number: 2, clue: "Celestial body that orbits", row: 0, col: 1, answer: "ISINE" },
      { number: 3, clue: "Belonging to us", row: 0, col: 3, answer: "OENF" },
      { number: 4, clue: "Temperature scale abbr.", row: 0, col: 4, answer: "THENE" },
    ],
  },
  {
    // Puzzle 9
    // STORM
    // P###O
    // EMBER
    // E###N
    // DEPTH
    grid: "STORM" + "P###O" + "EMBER" + "E###N" + "DEPTH",
    across: [
      { number: 1, clue: "Violent weather event", row: 0, col: 0, answer: "STORM" },
      { number: 5, clue: "Glowing fire remnant", row: 2, col: 0, answer: "EMBER" },
      { number: 6, clue: "Measure of depth", row: 4, col: 0, answer: "DEPTH" },
    ],
    down: [
      { number: 1, clue: "Athletic competition", row: 0, col: 0, answer: "SPEED" },
      { number: 2, clue: "Nocturnal flying mammal", row: 0, col: 1, answer: "TOMB" },
      { number: 3, clue: "Went by vehicle", row: 0, col: 3, answer: "RBON" },
      { number: 4, clue: "Belonging to him", row: 0, col: 4, answer: "MONTH" },
    ],
  },
  {
    // Puzzle 10
    // BLAZE
    // R###N
    // IDEAL
    // N###E
    // KNEEL
    grid: "BLAZE" + "R###N" + "IDEAL" + "N###E" + "KNEEL",
    across: [
      { number: 1, clue: "Bright flame", row: 0, col: 0, answer: "BLAZE" },
      { number: 5, clue: "Perfect concept", row: 2, col: 0, answer: "IDEAL" },
      { number: 6, clue: "Genuflect", row: 4, col: 0, answer: "KNEEL" },
    ],
    down: [
      { number: 1, clue: "Dry red wine variety", row: 0, col: 0, answer: "BRINK" },
      { number: 2, clue: "Listening organ", row: 0, col: 1, answer: "LADEN" },
      { number: 3, clue: "Envy or desire", row: 0, col: 3, answer: "ZALE" },
      { number: 4, clue: "Finis", row: 0, col: 4, answer: "ENEEL" },
    ],
  },
] as const;
