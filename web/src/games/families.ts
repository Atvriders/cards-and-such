// =====================================================================
// Game families
// ---------------------------------------------------------------------
// With 4500+ games in the registry, the lobby grid becomes unscannable.
// Many games are minor variants of a few well-known titles (Klondike,
// FreeCell, Spider, Mahjong, Hold'em, Yahtzee, etc.) — collapsing those
// into a single "family" tile that opens a variant picker dramatically
// reduces visual noise without hiding any games.
//
// Each family is defined by:
//   - id           : stable family slug (also used as the tile testid:
//                    `tile-<familyId>`). For families that share an id
//                    with an existing game (e.g. `klondike`), the family
//                    tile replaces that game's standalone tile. The
//                    underlying game is still accessible from inside the
//                    picker.
//   - label        : human-readable family name shown on the tile.
//   - description  : 1-line summary used on the family tile.
//   - matches      : either an explicit list of member game IDs, OR a
//                    predicate over IDs (used for `mahjong-*` since
//                    listing 110+ layouts inline is noisy).
//
// Resolution rule: a game belongs to the FIRST family whose `matches`
// returns true. Order in `FAMILIES` therefore matters when ids could
// theoretically match multiple families — keep the most specific
// families earlier in the list. In practice the explicit-list families
// rarely overlap; the only generic predicate (`mahjong`) is unique.
// =====================================================================

export interface GameFamily {
  id: string;
  label: string;
  description: string;
  /** Explicit list of member game ids. */
  memberIds?: readonly string[];
  /** Optional predicate — used when listing IDs would be unwieldy. */
  matches?: (id: string) => boolean;
}

/**
 * Build a Set of every member id covered by `family`. Used by the lobby
 * to compute "is this game inside a family" without re-running the
 * predicate on every render.
 */
export function expandFamily(
  family: GameFamily,
  allIds: readonly string[],
): Set<string> {
  const out = new Set<string>();
  if (family.memberIds) for (const id of family.memberIds) out.add(id);
  if (family.matches) {
    for (const id of allIds) if (family.matches(id)) out.add(id);
  }
  return out;
}

export const FAMILIES: readonly GameFamily[] = [
  // ---------- Solitaire patiences ----------
  {
    id: "klondike",
    label: "Klondike",
    description: "The classic seven-pile patience and its many flavours.",
    memberIds: [
      "klondike",
      "klondike-by-threes",
      "klondike-deal-one",
      "klondike-deal-one-no-redeal",
      "klondike-no-redeal",
      "klondike-super-solver",
      "klondike-threes-no-redeal",
      "klondike-threes-standard",
      "double-klondike",
      "double-klondike-pat",
      "triple-klondike",
      "vegas-klondike",
      "bakers-klondike",
      "chinese-klondike",
    ],
  },
  {
    id: "freecell",
    label: "FreeCell",
    description: "Open-information cell games — no luck, all deduction.",
    memberIds: [
      "freecell",
      "freecell-classic",
      "freecell-two-deck",
      "double-freecell",
      "double-deck-freecell",
      "triple-freecell",
      "eight-off",
      "mini-eight-off",
      "seahaven-towers",
      "bakers-game",
    ],
  },
  {
    id: "spider",
    label: "Spider",
    description: "Two-deck cascade solitaires — sequence by suit and clear.",
    memberIds: [
      "spider",
      "spider-one-suit",
      "spider-two-suits",
      "spider-four-suits",
      "mini-spider-1suit",
      "relaxed-spider",
      "spiderette",
      "little-spider",
      "spidike",
      "wasp",
      "wasp-pat",
      "wasp-soli",
      "wasp-whip",
      "scorpion",
      "scorpion-pat",
      "scorpion-soli",
      "scorpion-tail",
      "black-widow",
      "black-widow-spider",
      "will-o-wisp",
      "will-o-the-wisp",
    ],
  },
  {
    id: "yukon",
    label: "Yukon",
    description: "Klondike's wilder cousin — move any face-up card with its tail.",
    memberIds: [
      "yukon",
      "yukon-cells",
      "moosehide",
      "moosehide-yukon",
      "alaska",
      "alaska-pat",
      "alaska-solitaire",
      "russian-soli",
      "russian-solitaire",
    ],
  },
  {
    id: "pyramid",
    label: "Pyramid",
    description: "Pair to thirteen and dismantle the tomb.",
    memberIds: [
      "pyramid",
      "pyramid-golf",
      "pyramid-no-redeal",
      "pyramid-solitaire-classic",
      "mini-pyramid-solitaire",
      "pharaohs-pyramid",
      "giza",
      "giza-pyramid",
      "tut-tomb",
      "tuts-tomb",
    ],
  },
  {
    id: "tri-peaks",
    label: "TriPeaks",
    description: "Climb three peaks one card at a time.",
    memberIds: [
      "tri-peaks",
      "tri-peaks-continuous",
      "tri-peaks-solitaire",
      "mini-tripeaks",
    ],
  },
  {
    id: "forty-thieves",
    label: "Forty Thieves",
    description: "Ten-column open patiences — Napoleon's favourite family.",
    memberIds: [
      "forty-thieves",
      "limited-forty-thieves",
      "big-forty",
      "forty-and-eight",
      "forty-eight-one-deck",
      "lucas",
      "maria",
      "number-ten",
      "streets",
      "streets-and-alleys",
      "indian",
      "indian-fty",
      "indian-patience",
      "josephine",
      "blockade",
      "busy-aces",
      "gigantic",
      "presidents-cabinet",
    ],
  },
  {
    id: "canfield",
    label: "Canfield",
    description: "Casino patience with a thirteen-card reserve.",
    memberIds: [
      "canfield",
      "canfield-chameleon",
      "canfield-storehouse",
      "storehouse",
      "storehouse-canfield",
      "demon",
      "demon-patience",
      "rainbow-canfield",
      "selective-canfield",
      "superior-canfield",
    ],
  },

  // ---------- Tile-matching ----------
  {
    id: "mahjong-solitaire",
    label: "Mahjong Solitaire",
    description: "Match free tiles across dozens of hand-built layouts.",
    matches: (id) => id.startsWith("mahjong-"),
  },

  // ---------- Poker ----------
  {
    id: "holdem",
    label: "Texas Hold'em",
    description: "Two-card hold'em across every limit and casino variant.",
    memberIds: [
      "holdem-no-limit",
      "holdem-pot-limit",
      "holdem-fixed-limit",
      "holdem-spread-limit",
      "short-deck-holdem",
      "super-holdem",
      "double-flop-holdem",
      "ultimate-holdem",
      "casino-holdem",
      "casino-holdem-cas",
      "royal-holdem",
      "heads-up-holdem-cas",
    ],
  },
  {
    id: "omaha",
    label: "Omaha",
    description: "Four (or five) hole cards, must use exactly two.",
    memberIds: [
      "omaha-hi",
      "omaha-hi-lo",
      "omaha-five-card-hi",
      "omaha-five-card-hi-lo",
      "omaha-six-card-hi",
      "omaha-holdem",
      "courchevel-poker",
      "courchevel-cas",
      "courchevel-hi-lo",
      "big-o-plo",
      "plo6-poker",
    ],
  },
  {
    id: "stud",
    label: "Stud Poker",
    description: "Open-board stud games — five and seven card.",
    memberIds: [
      "seven-card-stud",
      "seven-card-stud-hi-lo-cas",
      "seven-stud-hi-lo",
      "five-card-stud-cas",
      "five-card-stud-classic",
      "five-stud-poker",
    ],
  },
  {
    id: "lowball-draw",
    label: "Lowball & Draw",
    description: "Draw poker variants where the lowest hand wins.",
    memberIds: [
      "two-seven-triple-draw",
      "two-seven-single-draw",
      "ace-five-triple-draw",
      "badugi",
      "badeucy-poker",
      "badacey-poker",
      "kansas-city-lowball",
      "cal-lowball",
    ],
  },
  {
    id: "pineapple",
    label: "Pineapple Poker",
    description: "Hold'em with three hole cards — discard, then play.",
    memberIds: [
      "pineapple-poker",
      "crazy-pineapple",
      "crazy-pineapple-cas",
      "lazy-pineapple",
      "lazy-pineapple-cas",
      "pineapple-ofc",
      "pineapple-ofc-cas",
      "ofc-pineapple-cas",
    ],
  },

  // ---------- Casino ----------
  {
    id: "blackjack",
    label: "Blackjack",
    description: "Beat the dealer to twenty-one — every house variant.",
    memberIds: [
      "blackjack",
      "blackjack-switch",
      "blackjack-switch-cas",
      "atlantic-city-bj-cas",
      "european-bj-cas",
      "spanish-21",
      "spanish-21-cas",
      "pontoon",
      "pontoon-cas",
    ],
  },

  // ---------- Dice ----------
  {
    id: "yahtzee",
    label: "Yahtzee",
    description: "Five-dice category scoring — and its many sequels.",
    memberIds: [
      "yahtzee",
      "yahtzee-mini",
      "mini-yahtzee",
      "open-face-yahtzee",
      "yahtzee-boss-dice",
      "yahtzee-free-for-all",
      "triple-yahtzee",
      "battle-yahtzee",
      "jumbo-yahtzee",
      "kniffel",
      "yamb-dice",
      "maxi-yatzy",
      "yatzy-scand",
    ],
  },

  // ---------- Board ----------
  {
    id: "connect-four",
    label: "Connect Four",
    description: "Drop discs to make a line — every shape and rule twist.",
    memberIds: [
      "connect-4",
      "connect-four-classic",
      "connect-four-classic-cl",
      "connect-four-mini",
      "connect-four-3d",
      "connect-four-gravity-flip",
      "connect-four-pop10",
      "connect-four-popout",
      "connect-four-power-checker",
      "connect-five",
      "connect-six",
      "connect-six-classic",
      "connect6",
    ],
  },
  {
    id: "backgammon",
    label: "Backgammon",
    description: "Race your checkers home — classics and short games.",
    memberIds: [
      "backgammon-standard-race",
      "nackgammon",
      "hyper-backgammon",
      "hypergammon",
      "hypergammon-mini",
      "narde-russian",
      "tavli-greek-race",
      "tavli-portes-race",
      "fevga-tavli",
      "plakoto-tavli",
      "acey-deucey",
      "acey-deucey-cas",
      "acey-deucey-in-between",
    ],
  },
  {
    id: "mastermind",
    label: "Mastermind",
    description: "Crack the colour code in as few guesses as you can.",
    memberIds: [
      "mastermind",
      "mastermind-5peg-8color",
      "mastermind-6peg-10color",
      "mastermind-no-repeats",
    ],
  },
  {
    id: "sudoku",
    label: "Sudoku",
    description: "Logic-fill grids from 4×4 minis up to 25×25 monsters.",
    memberIds: [
      "sudoku",
      "sudoku-classic-pl",
      "sudoku-159",
      "sudoku-16",
      "sudoku-25",
      "sudoku-mini-4x4",
      "sudoku-mini-6x6",
    ],
  },

  // ---------- Trivia / quiz sub-families ----------
  {
    id: "decades-trivia",
    label: "Decades Trivia",
    description: "Test yourself on every decade from the 1920s to the 2010s.",
    memberIds: [
      "1920s-quiz",
      "1930s-quiz",
      "1940s-quiz",
      "1950s-quiz",
      "1960s-quiz",
      "1970s-quiz",
      "1980s-quiz",
      "1990s-quiz",
      "2000s-quiz",
      "2010s-quiz",
    ],
  },
  {
    id: "music-genre-trivia",
    label: "Music Genre Trivia",
    description: "Quizzes covering rock, jazz, classical, hip-hop and more.",
    memberIds: [
      "boy-bands-quiz",
      "classical-music-quiz",
      "composers-classical-quiz",
      "country-music-quiz",
      "electronic-music-quiz",
      "folk-music-quiz",
      "gospel-music-quiz",
      "hip-hop-quiz",
      "jazz-quiz",
      "mtv-music-awards-quiz",
      "musical-instruments-quiz",
      "music-decade-quiz",
      "music-notation-quiz",
      "music-theory-quiz",
      "pop-music-quiz",
      "rock-music-quiz",
    ],
  },
  {
    id: "chess-variants-trivia",
    label: "Chess Variants Trivia",
    description: "Quizzes on Atomic, Crazyhouse, Capablanca and other variants.",
    memberIds: [
      "atomic-chess-quiz",
      "capablanca-chess-quiz",
      "chess960-crazyhouse-quiz",
      "chess960-quiz",
      "chess-history-quiz",
      "cylinder-chess-quiz",
      "dark-chess-quiz",
      "four-player-chess-quiz",
      "horde-chess-quiz",
      "legan-chess-quiz",
      "losing-chess-quiz",
      "minichess-5x5-quiz",
      "omega-chess-quiz",
      "progressive-chess-quiz",
      "rifle-chess-quiz",
      "seirawan-chess-quiz",
      "spartan-chess-quiz",
      "toroidal-chess-quiz",
    ],
  },
];

/**
 * Compare two strings case-insensitively for sort order. Used by both
 * the lobby (for sorting tiles + variant pickers) and by the families
 * test to verify each family's member list is alphabetisable.
 */
export function compareTitles(a: string, b: string): number {
  return a.localeCompare(b, undefined, { sensitivity: "base" });
}
