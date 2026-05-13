import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Hidden key card assigns each of the 25 words to one of these types.
// Red team always goes first in this edition (red = 9, blue = 8).
export type TileType = "red" | "blue" | "bystander" | "assassin";
export type Team = "red" | "blue";

export interface Tile {
  word: string;
  type: TileType;
  revealed: boolean;
}

export interface Clue {
  word: string;
  count: number;
  /** The team this clue was for (matches state.turn when it was issued). */
  team: Team;
}

export interface CodenamesFullState {
  tiles: Tile[];
  /** Current team to act. */
  turn: Team;
  /** Current spymaster clue for the active team. */
  clue: Clue | null;
  /** Guesses remaining for the current clue (clue.count + 1, decremented per correct guess). */
  guessesLeft: number;
  redLeft: number;
  blueLeft: number;
  redTotal: number;
  blueTotal: number;
  /** Game outcome. Player wins if their RED team is the team that revealed all its words. */
  winner: Team | null;
  /** "assassin" if game ended via assassin click; null otherwise. */
  endedByAssassin: Team | null;
  /** Type of the last tile revealed (for UI flash). */
  lastReveal: TileType | null;
  log: string[];
}

export type CodenamesFullAction =
  | { type: "guess"; tileIndex: number }
  | { type: "endGuessing" }
  /** Triggered by Game.tsx during BLUE's turn — the CPU plays the BLUE
   *  operative. The view ticks one cpuStep at a time so the player can
   *  watch the AI's guesses unfold instead of seeing all of them at once. */
  | { type: "cpuStep" };

// 400-word embedded word list (canonical Codenames-style vocabulary).
const WORDS: string[] = [
  "AFRICA","AGENT","AIR","ALIEN","ALPS","AMAZON","AMBULANCE","AMERICA","ANGEL","ANTARCTICA",
  "APPLE","ARM","ATLANTIS","AUSTRALIA","AZTEC","BACK","BALL","BAND","BANK","BAR",
  "BARK","BAT","BATTERY","BEACH","BEAR","BEAT","BED","BEIJING","BELL","BELT",
  "BERLIN","BERMUDA","BERRY","BILL","BLOCK","BOARD","BOLT","BOMB","BOND","BOOM",
  "BOOT","BOTTLE","BOW","BOX","BRIDGE","BRUSH","BUCK","BUFFALO","BUG","BUGLE",
  "BUTTON","CALF","CANADA","CAP","CAPITAL","CAR","CARD","CARROT","CASINO","CAST",
  "CAT","CELL","CENTAUR","CENTER","CHAIR","CHANGE","CHARGE","CHECK","CHEST","CHICK",
  "CHINA","CHOCOLATE","CHURCH","CIRCLE","CLIFF","CLOAK","CLUB","CODE","COLD","COMIC",
  "COMPOUND","CONCERT","CONDUCTOR","CONTRACT","COOK","COPPER","COTTON","COURT","COVER","CRANE",
  "CRASH","CRICKET","CROSS","CROWN","CYCLE","CZECH","DANCE","DATE","DAY","DEATH",
  "DECK","DEGREE","DIAMOND","DICE","DINOSAUR","DISEASE","DOCTOR","DOG","DRAFT","DRAGON",
  "DRESS","DRILL","DROP","DUCK","DWARF","EAGLE","EGYPT","EMBASSY","ENGINE","ENGLAND",
  "EUROPE","EYE","FACE","FAIR","FALL","FAN","FENCE","FIELD","FIGHTER","FIGURE",
  "FILE","FILM","FIRE","FISH","FLUTE","FLY","FOOT","FORCE","FOREST","FORK",
  "FRANCE","GAME","GAS","GENIUS","GERMANY","GHOST","GIANT","GLASS","GLOVE","GOLD",
  "GRACE","GRASS","GREECE","GREEN","GROUND","HAM","HAND","HAWK","HEAD","HEART",
  "HELICOPTER","HIMALAYAS","HOLE","HOLLYWOOD","HONEY","HOOD","HOOK","HORN","HORSE","HORSESHOE",
  "HOSPITAL","HOTEL","ICE","ICE_CREAM","INDIA","IRON","IVORY","JACK","JAM","JET",
  "JUPITER","KANGAROO","KETCHUP","KEY","KID","KING","KIWI","KNIFE","KNIGHT","LAB",
  "LAP","LASER","LAWYER","LEAD","LEMON","LEPRECHAUN","LIFE","LIGHT","LIMOUSINE","LINE",
  "LINK","LION","LITTER","LOCH_NESS","LOCK","LOG","LONDON","LUCK","MAIL","MAMMOTH",
  "MAPLE","MARBLE","MARCH","MASS","MATCH","MERCURY","MEXICO","MICROSCOPE","MILLIONAIRE","MINE",
  "MINT","MISSILE","MODEL","MOLE","MOON","MOSCOW","MOUNT","MOUSE","MOUTH","MUG",
  "NAIL","NEEDLE","NET","NEW_YORK","NIGHT","NINJA","NOTE","NOVEL","NURSE","NUT",
  "OCTOPUS","OIL","OLIVE","OLYMPUS","OPERA","ORANGE","ORGAN","PALM","PARK","PART",
  "PASS","PASTE","PENGUIN","PHOENIX","PIANO","PIE","PILOT","PIN","PIPE","PIRATE",
  "PISTOL","PIT","PLANE","PLASTIC","PLATE","PLATYPUS","PLAY","PLOT","POINT","POISON",
  "POLE","POLICE","POOL","PORT","POST","POUND","PRESS","PRINCESS","PUMPKIN","PUPIL",
  "PYRAMID","QUEEN","RABBIT","RACKET","RAY","REVOLUTION","RING","ROBIN","ROBOT","ROCK",
  "ROME","ROOT","ROSE","ROULETTE","ROUND","ROW","RULER","SATELLITE","SATURN","SCALE",
  "SCHOOL","SCIENTIST","SCORPION","SCREEN","SCUBA_DIVER","SEAL","SERVER","SHADOW","SHAKESPEARE","SHARK",
  "SHIP","SHOE","SHOP","SHOT","SINK","SKYSCRAPER","SLIP","SLUG","SMUGGLER","SNOW",
  "SNOWMAN","SOCK","SOLDIER","SOUL","SOUND","SPACE","SPELL","SPIDER","SPIKE","SPINE",
  "SPOT","SPRING","SPY","SQUARE","STADIUM","STAFF","STAR","STATE","STICK","STOCK",
  "STRAW","STREAM","STRIKE","STRING","SUB","SUIT","SUPERHERO","SWING","SWITCH","TABLE",
  "TABLET","TAG","TAIL","TAP","TEACHER","TELESCOPE","TEMPLE","THEATER","THIEF","THUMB",
  "TICK","TIE","TIME","TOKYO","TOOTH","TORCH","TOWER","TRACK","TRAIN","TRIANGLE",
  "TRIP","TRUNK","TUBE","TURKEY","UNDERTAKER","UNICORN","VACUUM","VAN","VET","WAKE",
  "WALL","WAR","WASHER","WASHINGTON","WATCH","WATER","WAVE","WEB","WELL","WHALE",
  "WHIP","WIND","WITCH","WORM","YARD","ZOMBIE","ZUCCHINI","ANCHOR","ANTENNA","ARROW",
];

/** Category map: each clue word maps to a set of board words it relates to.
 *  Used by the CPU spymaster to find a clue covering 2+ of its team's words
 *  without hitting bystanders or the assassin (a strong cover gets priority).
 */
const CATEGORIES: Record<string, string[]> = {
  ANIMAL: ["BEAR","BAT","BUFFALO","BUG","CALF","CAT","CHICK","CRICKET","DOG","DRAGON","DUCK","EAGLE","FISH","FLY","HAWK","HORSE","KANGAROO","KIWI","LION","MAMMOTH","MOLE","MOUSE","OCTOPUS","PENGUIN","PHOENIX","PLATYPUS","RABBIT","ROBIN","SCORPION","SEAL","SHARK","SLUG","SPIDER","TURKEY","UNICORN","WHALE","WORM","ZOMBIE","DINOSAUR"],
  FOOD: ["APPLE","BERRY","CARROT","CHOCOLATE","HAM","HONEY","ICE_CREAM","JAM","KETCHUP","KIWI","LEMON","OLIVE","ORANGE","PIE","PUMPKIN","TURKEY","ZUCCHINI"],
  COUNTRY: ["AFRICA","AMERICA","ANTARCTICA","AUSTRALIA","CANADA","CHINA","CZECH","EGYPT","ENGLAND","EUROPE","FRANCE","GERMANY","GREECE","INDIA","MEXICO"],
  CITY: ["BEIJING","BERLIN","BERMUDA","HOLLYWOOD","LONDON","MOSCOW","NEW_YORK","ROME","TOKYO","WASHINGTON","ATLANTIS"],
  WEAPON: ["BOMB","BOW","KNIFE","MISSILE","PISTOL","SPIKE","SWORD","WHIP","ARROW","CLUB","BAT","BOLT","CANNON"],
  SPORT: ["BALL","BAT","BOW","COURT","CRICKET","FIELD","GAME","NET","RACKET","RING","ROUND","STADIUM","TRACK","STRIKE"],
  MUSIC: ["BAND","BUGLE","CONCERT","CONDUCTOR","DANCE","DRUM","FLUTE","HORN","NOTE","OPERA","ORGAN","PIANO","STRING","TRIANGLE"],
  BODY: ["ARM","BACK","CHEST","EYE","FACE","FOOT","HAND","HEAD","HEART","MOUTH","SPINE","THUMB","TOOTH","TAIL","HORN"],
  JOB: ["AGENT","COOK","CONDUCTOR","DOCTOR","FIGHTER","LAWYER","NINJA","NURSE","PILOT","PIRATE","POLICE","SCIENTIST","SMUGGLER","SOLDIER","SPY","TEACHER","THIEF","UNDERTAKER","VET","RULER"],
  ROYAL: ["CROWN","KING","KNIGHT","PRINCESS","QUEEN","CASTLE","TOWER","RULER"],
  WATER: ["BEACH","FISH","OCEAN","POOL","PORT","SEAL","SHARK","SHIP","STREAM","SUB","WATER","WAVE","WELL","WHALE","SCUBA_DIVER","SINK","SNOW","ICE"],
  SKY: ["AIR","CLOUD","HELICOPTER","JET","PLANE","SATELLITE","STAR","WIND","FLY","HAWK","EAGLE","PHOENIX","ROBIN","ANGEL"],
  SPACE: ["ALIEN","JUPITER","MERCURY","MOON","OLYMPUS","ROCKET","SATELLITE","SATURN","SPACE","STAR","TELESCOPE","COMET"],
  COLOR: ["GOLD","GREEN","ORANGE","ROSE","COPPER","IVORY","SNOW"],
  METAL: ["COPPER","GOLD","IRON","LEAD","NAIL","NEEDLE","PIPE","RING","SPIKE","STEEL","CHAIN"],
  COLD: ["ALPS","ANTARCTICA","HIMALAYAS","ICE","ICE_CREAM","MAMMOTH","SNOW","SNOWMAN"],
  FIRE: ["BOMB","DRAGON","FIRE","MATCH","PHOENIX","TORCH","SUN"],
  PLANT: ["APPLE","BERRY","FOREST","GRASS","MAPLE","OLIVE","ORANGE","PALM","PUMPKIN","ROSE","ROOT","TREE","ZUCCHINI"],
  TIME: ["CYCLE","DATE","DAY","FALL","MARCH","NIGHT","SPRING","TIME","WATCH","CLOCK","SECOND","MINUTE","HOUR"],
  BUILDING: ["BANK","BAR","CASINO","CASTLE","CHURCH","EMBASSY","HOSPITAL","HOTEL","LAB","SCHOOL","SKYSCRAPER","STADIUM","TEMPLE","THEATER","TOWER","PYRAMID"],
  MOVIE: ["AGENT","ALIEN","BOND","HOLLYWOOD","NINJA","PIRATE","ROBOT","SHAKESPEARE","SPY","SUPERHERO","ZOMBIE","GHOST","WITCH","DRAGON","UNICORN"],
  MYTH: ["ATLANTIS","CENTAUR","DRAGON","DWARF","GENIUS","GHOST","GIANT","KNIGHT","LEPRECHAUN","LOCH_NESS","PHOENIX","UNICORN","WITCH","ZOMBIE","ANGEL","SOUL"],
  ROUND: ["BALL","CIRCLE","COIN","DICE","DISC","DROP","RING","ROUND","WHEEL","MARBLE","ORANGE","APPLE","PIE","MOON","SUN"],
  TOOL: ["BRUSH","DRILL","FORK","HAMMER","HOOK","KEY","KNIFE","NAIL","NEEDLE","PIPE","RULER","SCALE","SCREEN","SWITCH","VACUUM","WASHER","TOOL"],
  TRANSPORT: ["AMBULANCE","CAR","HELICOPTER","JET","LIMOUSINE","PLANE","SHIP","SUB","TRAIN","VAN","BIKE","BUS","TRUCK"],
  GAME: ["BOARD","CARD","CHESS","CHIP","CHECK","CLUB","DICE","GAME","PIECE","RING","ROULETTE","SCORE","STADIUM","STRIKE"],
  DANGER: ["BOMB","DEATH","DISEASE","DRAGON","FIRE","GHOST","KNIFE","MISSILE","PISTOL","POISON","SCORPION","SHARK","SPIDER","WITCH"],
  CLOTHING: ["BELT","BOOT","CAP","CLOAK","DRESS","GLOVE","HOOD","SHOE","SOCK","SUIT","TIE"],
  SCHOOL: ["BOARD","CHALK","CLASS","DESK","LAB","NOTE","PUPIL","SCHOOL","SCIENTIST","TEACHER","TEST"],
};

/** Fisher–Yates shuffle using a seeded RNG so the layout is deterministic by seed. */
function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = a[i]!;
    a[i] = a[j]!;
    a[j] = tmp;
  }
  return a;
}

/** CPU spymaster: pick a clue word + number that points at the team's
 *  unrevealed words. Strategy:
 *    1. For each known category, count how many team words it covers
 *       on the *current* (unrevealed) board.
 *    2. Discard categories that touch the assassin or the opposing team
 *       (severe penalty), or bystanders (mild penalty).
 *    3. Prefer the category with the most safe team-word coverage.
 *    4. Fall back to a generic 1-word clue if nothing covers 2+.
 */
function chooseClue(state: Pick<CodenamesFullState, "tiles">, team: Team, rng: () => number): Clue {
  const unrevealed = state.tiles.filter(t => !t.revealed);
  const teamWords = new Set(unrevealed.filter(t => t.type === team).map(t => t.word));
  const otherTeam: Team = team === "red" ? "blue" : "red";
  const opponentWords = new Set(unrevealed.filter(t => t.type === otherTeam).map(t => t.word));
  const bystanderWords = new Set(unrevealed.filter(t => t.type === "bystander").map(t => t.word));
  const assassinWord = unrevealed.find(t => t.type === "assassin")?.word;

  let best: { clue: string; count: number; score: number } | null = null;
  for (const [clueWord, related] of Object.entries(CATEGORIES)) {
    // Don't allow clue words that are themselves on the board.
    if (state.tiles.some(t => t.word === clueWord)) continue;

    const teamHits = related.filter(w => teamWords.has(w));
    const oppHits = related.filter(w => opponentWords.has(w));
    const bysHits = related.filter(w => bystanderWords.has(w));
    const hitsAssassin = assassinWord ? related.includes(assassinWord) : false;

    if (teamHits.length === 0) continue;
    // Score: team hits − opponent/assassin penalties.
    let score = teamHits.length * 10 - oppHits.length * 8 - bysHits.length * 2;
    if (hitsAssassin) score -= 100;
    if (score <= 0) continue;
    if (!best || score > best.score) {
      best = { clue: clueWord, count: teamHits.length, score };
    }
  }

  if (best && best.count > 0) {
    // Cap the count at the actual number of team words remaining.
    const cap = Math.max(1, teamWords.size);
    const count = Math.min(best.count, cap);
    return { word: best.clue, count, team };
  }

  // Fallback: pick any team word's "first letter" and offer a 1-count clue.
  const fallbackWords = Array.from(teamWords);
  if (fallbackWords.length > 0) {
    const w = fallbackWords[Math.floor(rng() * fallbackWords.length)]!;
    return { word: `HINT_${w.charAt(0)}`, count: 1, team };
  }
  return { word: "PASS", count: 0, team };
}

export function initialState(seed: number): CodenamesFullState {
  const rng = mulberry32(seed >>> 0);

  // Pick 25 unique words from the embedded list.
  const picked = shuffle(WORDS, rng).slice(0, 25);

  // Assign types: 9 red, 8 blue, 7 bystander, 1 assassin. Red goes first.
  const types: TileType[] = [
    ...Array(9).fill("red"),
    ...Array(8).fill("blue"),
    ...Array(7).fill("bystander"),
    "assassin",
  ] as TileType[];
  const shuffledTypes = shuffle(types, rng);

  const tiles: Tile[] = picked.map((word, i) => ({
    word,
    type: shuffledTypes[i]!,
    revealed: false,
  }));

  const firstClue = chooseClue({ tiles }, "red", rng);

  return {
    tiles,
    turn: "red",
    clue: firstClue,
    guessesLeft: firstClue.count + 1,
    redLeft: 9,
    blueLeft: 8,
    redTotal: 9,
    blueTotal: 8,
    winner: null,
    endedByAssassin: null,
    lastReveal: null,
    log: [`Spymaster (RED): "${firstClue.word}" — ${firstClue.count}`],
  };
}

function rngFromState(state: CodenamesFullState, salt: number): () => number {
  // Deterministic-ish: derive from remaining counts + log length + salt.
  const seed = (state.redLeft * 1009 + state.blueLeft * 31 + state.log.length * 17 + salt) >>> 0;
  return mulberry32(seed);
}

function switchTeams(state: CodenamesFullState, reason: string): CodenamesFullState {
  const nextTurn: Team = state.turn === "red" ? "blue" : "red";
  const rng = rngFromState(state, nextTurn === "red" ? 1 : 2);
  const clue = chooseClue(state, nextTurn, rng);
  return {
    ...state,
    turn: nextTurn,
    clue,
    guessesLeft: clue.count + 1,
    log: [...state.log, reason, `Spymaster (${nextTurn.toUpperCase()}): "${clue.word}" — ${clue.count}`],
  };
}

/** CPU operative — given the current clue, pick the unrevealed tile most
 *  likely to belong to the CPU's team. The CPU does NOT see the key; it
 *  uses the same category map as the spymaster, picking from tiles whose
 *  word appears in the clue's category. Falls back to passing if none match.
 */
function cpuPickGuess(state: CodenamesFullState): number | null {
  if (!state.clue) return null;
  const related = CATEGORIES[state.clue.word];
  const candidates: number[] = [];
  state.tiles.forEach((t, i) => {
    if (t.revealed) return;
    if (related && related.includes(t.word)) candidates.push(i);
  });
  if (candidates.length === 0) return null;
  // Deterministic-ish pick: hash-mod by state shape.
  const rng = rngFromState(state, 99);
  return candidates[Math.floor(rng() * candidates.length)]!;
}

export function reducer(state: CodenamesFullState, action: CodenamesFullAction): CodenamesFullState {
  if (state.winner !== null) return state;

  if (action.type === "endGuessing") {
    return switchTeams(state, `${state.turn.toUpperCase()} operative passed.`);
  }

  if (action.type === "cpuStep") {
    // Only valid on BLUE's turn (the CPU plays BLUE's operative).
    if (state.turn !== "blue") return state;
    const pick = cpuPickGuess(state);
    if (pick === null) {
      return switchTeams(state, "BLUE operative passed (no clue match).");
    }
    return reducer(state, { type: "guess", tileIndex: pick });
  }

  if (action.type === "guess") {
    const { tileIndex } = action;
    const tile = state.tiles[tileIndex];
    if (!tile || tile.revealed) return state;

    const tiles = state.tiles.map((t, i) => i === tileIndex ? { ...t, revealed: true } : t);
    const log = [...state.log, `${state.turn.toUpperCase()} guessed ${tile.word} → ${tile.type.toUpperCase()}`];
    const next: CodenamesFullState = { ...state, tiles, lastReveal: tile.type, log };

    // Assassin: immediate loss for the guessing team -> other team wins.
    if (tile.type === "assassin") {
      const winner: Team = state.turn === "red" ? "blue" : "red";
      return { ...next, winner, endedByAssassin: state.turn };
    }

    // Decrement the correct team's remaining count.
    let redLeft = state.redLeft;
    let blueLeft = state.blueLeft;
    if (tile.type === "red") redLeft -= 1;
    if (tile.type === "blue") blueLeft -= 1;

    // Win check: team revealed all its words.
    if (redLeft === 0) return { ...next, redLeft, blueLeft, winner: "red" };
    if (blueLeft === 0) return { ...next, redLeft, blueLeft, winner: "blue" };

    // Guessed own team's word: keep going, but decrement guesses.
    if (tile.type === state.turn) {
      const guessesLeft = state.guessesLeft - 1;
      if (guessesLeft <= 0) {
        return switchTeams({ ...next, redLeft, blueLeft }, "Out of guesses.");
      }
      return { ...next, redLeft, blueLeft, guessesLeft };
    }

    // Guessed opponent's word or bystander: turn ends.
    return switchTeams({ ...next, redLeft, blueLeft }, `${state.turn.toUpperCase()} turn ends.`);
  }

  return state;
}

/** Player plays as RED operative for both teams; they "win" when RED wins. */
export function isTerminal(state: CodenamesFullState): { score: number } | null {
  if (state.winner === "red") return { score: 100 };
  if (state.winner === "blue") return { score: 0 };
  return null;
}
