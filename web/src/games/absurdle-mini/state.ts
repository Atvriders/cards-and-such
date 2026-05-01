import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const ANSWERS: string[] = [
  "APPLE","BRAVE","CRANE","DRIVE","EAGLE","FROST","GHOST","HONEY","INDEX","JOLLY",
  "KNAVE","LEMON","MANGO","NIGHT","OCEAN","PIANO","QUART","RIVER","STORM","TIGER",
  "ULCER","VIVID","WORLD","YIELD","ZEBRA","ALERT","BRINE","CLOTH","DAISY","EMBER",
  "FAITH","GLOOM","HORSE","IVORY","JEWEL","KARMA","LATCH","MOUTH","NAVAL","OLIVE",
  "POUND","QUACK","SCORE","TRACE","UNITY","VAULT","WHEAT","YACHT","BLAZE","CABIN",
];

export const VALID = new Set<string>([
  ...ANSWERS,
  "ABOVE","AGENT","ALONE","BACON","BAKER","BEACH","BEGIN","BLACK","BLAME","BLANK",
  "BLEED","BLEND","BLIND","BLOCK","BLOOD","BLOOM","BOARD","BRAIN","BREAD","BREAK",
  "BRICK","BRIEF","BRING","BROAD","BROWN","BUILD","CABLE","CARRY","CATCH","CAUSE",
  "CHAIR","CHAOS","CHARM","CHART","CHASE","CHEEK","CHESS","CHEST","CHIEF","CHILD",
  "CIVIL","CLAIM","CLEAN","CLEAR","CLERK","CLICK","CLIFF","CLIMB","CLING","CLOCK",
  "CLOSE","CLOUD","COULD","COUNT","COURT","COVER","CRACK","CRASH","CRAZY","CREAM",
  "CRIME","CROSS","CROWD","CROWN","CRUSH","CYCLE","DANCE","DEALT","DEPTH","DIRTY",
  "DOZEN","DRAIN","DRAMA","DREAM","DRESS","DRIED","DRINK","DROVE","DRUNK","EARLY",
  "EARTH","EIGHT","ELBOW","EMAIL","ENEMY","ENTER","ENTRY","EQUAL","ERROR","EVENT",
  "EVERY","EXACT","EXIST","EXTRA","FAULT","FERRY","FIELD","FIFTH","FIFTY","FIGHT",
  "FINAL","FIRST","FLAME","FLASH","FLEET","FLESH","FLOAT","FLOCK","FLOOD","FLOOR",
  "FLUID","FLUSH","FOCUS","FORCE","FORTH","FORTY","FORUM","FOUND","FRAME","FRANK",
  "FRESH","FRIED","FRONT","FRUIT","FUNNY","GIANT","GLAND","GLASS","GLIDE","GLOBE",
  "GLORY","GLOVE","GRACE","GRADE","GRAND","GRANT","GRAPH","GRASS","GRAVE","GREAT",
  "GREEN","GROUP","GROWN","GUARD","GUESS","GUEST","GUIDE","GUILD","GUILT","HABIT",
  "HAPPY","HEART","HEAVY","HOTEL","HOUSE","HUMAN","IDEAL","IMAGE","ISSUE","JOKER",
  "JUDGE","JUICE","KNOWN","LABEL","LABOR","LARGE","LASER","LATER","LAYER","LEARN",
  "LEAST","LEAVE","LEGAL","LEVEL","LIGHT","LIMIT","LIVER","LOCAL","LOGIC","LOOSE",
  "LOWER","LUCKY","LUNCH","MAGIC","MAJOR","MAYBE","MEDIA","METAL","METER","MIGHT",
  "MINOR","MINUS","MIXER","MODEL","MONEY","MONTH","MORAL","MOTOR","MOUSE","MOVIE",
  "MUSIC","NEVER","NEWLY","NORTH","NOVEL","NURSE","OFFER","OFTEN","OPERA","ORDER",
  "OTHER","OUNCE","OUTER","OWNER","PAINT","PANEL","PAPER","PARTY","PATCH","PAUSE",
  "PEACE","PEACH","PEARL","PHASE","PHONE","PHOTO","PIECE","PILOT","PIVOT","PLACE",
  "PLAIN","PLANE","PLANT","PLATE","POINT","POWER","PRESS","PRICE","PRIDE","PRIME",
  "PRINT","PRIOR","PRIZE","PROOF","QUICK","QUIET","QUITE","RADAR","RADIO","RAISE",
  "RAPID","RATIO","REACH","READY","REALM","REBEL","RELAX","REPLY","RIGHT","ROUND",
  "ROUTE","ROYAL","RURAL","SCALE","SCENE","SCOUT","SHARE","SHARP","SHEEP","SHEET",
  "SHELF","SHELL","SHIFT","SHINE","SHIRT","SHOCK","SHOOT","SHORT","SHOWN","SIGHT",
  "SILLY","SINCE","SLEEP","SLICE","SLIDE","SLOPE","SMALL","SMART","SMELL","SMILE",
  "SMOKE","SNAKE","SOLAR","SOLID","SOLVE","SORRY","SOUND","SOUTH","SPACE","SPARE",
  "SPEAK","SPEND","SPENT","SPILL","SPLIT","SPORT","STAFF","STAGE","STAKE","STAND",
  "START","STATE","STEAM","STEEL","STEEP","STEER","STICK","STILL","STOCK","STONE",
  "STOOD","STORE","STORY","STRIP","STUDY","STUFF","STYLE","SUGAR","SUITE","SUPER",
  "SWEEP","SWEET","SWIFT","SWING","TABLE","TASTE","TEACH","THANK","THEFT","THEIR",
  "THEME","THERE","THICK","THING","THINK","THIRD","THOSE","THREE","THREW","THROW",
  "TIRED","TODAY","TOOTH","TOPIC","TOTAL","TOUCH","TOUGH","TOWER","TRACK","TRADE",
  "TRAIL","TRAIN","TREAT","TREND","TRIAL","TRICK","TRUCK","TRULY","UNCLE","UNION",
  "UNITE","UPPER","URBAN","USAGE","USUAL","VAGUE","VALID","VALUE","VIDEO","VIRUS",
  "VISIT","VITAL","VOICE","WASTE","WATCH","WATER","WHILE","WHITE","WHOLE","WHOSE",
  "WORTH","WOULD","WRECK","WRITE","WRONG","YOUTH",
]);

export type Tile = "absent" | "present" | "correct" | "blank";

export interface AbsurdleMiniSettings {
  rounds: "5" | "8" | "10";
}

export interface AbsurdleMiniState {
  candidates: string[];     // pool of remaining possible answers — adversary keeps it as large as possible
  guesses: { word: string; tiles: Tile[] }[];
  current: string;
  status: "playing" | "won" | "lost";
  message: string;
  maxGuesses: number;
}

export type AbsurdleMiniAction =
  | { type: "key"; ch: string }
  | { type: "backspace" }
  | { type: "enter" }
  | { type: "reset" };

export function scoreGuess(guess: string, answer: string): Tile[] {
  const g = guess.toUpperCase().padEnd(5, " ").slice(0, 5);
  const a = answer.toUpperCase();
  const result: Tile[] = ["absent","absent","absent","absent","absent"];
  const used = [false,false,false,false,false];
  for (let i = 0; i < 5; i++) if (g[i] === a[i]) { result[i] = "correct"; used[i] = true; }
  for (let i = 0; i < 5; i++) {
    if (result[i] === "correct") continue;
    for (let j = 0; j < 5; j++) {
      if (!used[j] && g[i] === a[j]) { result[i] = "present"; used[j] = true; break; }
    }
  }
  return result;
}

function tilesKey(tiles: Tile[]): string {
  return tiles.map(t => t === "correct" ? "G" : t === "present" ? "Y" : "B").join("");
}

// Adversarial: among current candidates, pick the tile pattern with the largest remaining set
export function adversarialResponse(guess: string, candidates: string[]): { tiles: Tile[]; remaining: string[] } {
  const groups = new Map<string, string[]>();
  for (const c of candidates) {
    const tiles = scoreGuess(guess, c);
    const k = tilesKey(tiles);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(c);
  }
  // Pick group with largest remaining set; tie-break to least-correct (avoid too many greens)
  let bestK = ""; let bestSize = -1; let bestGreens = -1;
  for (const [k, list] of groups) {
    const greens = (k.match(/G/g) ?? []).length;
    if (list.length > bestSize || (list.length === bestSize && greens < bestGreens)) {
      bestSize = list.length;
      bestK = k;
      bestGreens = greens;
    }
  }
  const tiles: Tile[] = bestK.split("").map(c => c === "G" ? "correct" : c === "Y" ? "present" : "absent");
  return { tiles, remaining: groups.get(bestK)! };
}

export function initialState(seed: number, settings: AbsurdleMiniSettings): AbsurdleMiniState {
  const rng = mulberry32(seed);
  // Shuffle answers deterministically (used as pool)
  const pool = [...ANSWERS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }
  return {
    candidates: pool,
    guesses: [],
    current: "",
    status: "playing",
    message: "",
    maxGuesses: parseInt(settings.rounds, 10),
  };
}

export function reducer(state: AbsurdleMiniState, action: AbsurdleMiniAction): AbsurdleMiniState {
  if (state.status !== "playing" && action.type !== "reset") return state;
  switch (action.type) {
    case "key":
      if (state.current.length >= 5) return state;
      if (!/^[a-zA-Z]$/.test(action.ch)) return state;
      return { ...state, current: state.current + action.ch.toUpperCase(), message: "" };
    case "backspace":
      return { ...state, current: state.current.slice(0, -1), message: "" };
    case "enter": {
      if (state.current.length !== 5) return { ...state, message: "Need 5 letters" };
      if (!VALID.has(state.current)) return { ...state, message: "Not in word list" };
      const { tiles, remaining } = adversarialResponse(state.current, state.candidates);
      const guesses = [...state.guesses, { word: state.current, tiles }];
      const allGreen = tiles.every(t => t === "correct");
      // remaining will only have 1 word if all tiles are correct
      if (allGreen && remaining.length === 1) {
        return { ...state, guesses, current: "", candidates: remaining, status: "won", message: "Solved!" };
      }
      if (guesses.length >= state.maxGuesses) {
        return { ...state, guesses, current: "", candidates: remaining, status: "lost", message: "" };
      }
      return { ...state, guesses, current: "", candidates: remaining, message: "" };
    }
    case "reset":
      return initialState(0, { rounds: state.maxGuesses.toString() as AbsurdleMiniSettings["rounds"] });
    default: return state;
  }
}

export function isTerminal(state: AbsurdleMiniState): { score: number } | null {
  if (state.status === "won") return { score: Math.max(0, (state.maxGuesses - state.guesses.length + 1) * 100) };
  if (state.status === "lost") return { score: 0 };
  return null;
}
