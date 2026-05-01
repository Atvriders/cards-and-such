import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const ANSWERS: string[] = [
  "APPLE","BRAVE","CRANE","DRIVE","EAGLE","FROST","GHOST","HONEY","INDEX","JOLLY",
  "KNAVE","LEMON","MANGO","NIGHT","OCEAN","PIANO","QUART","RIVER","STORM","TIGER",
  "ULCER","VIVID","WORLD","XENON","YIELD","ZEBRA","ALERT","BRINE","CLOTH","DAISY",
  "EMBER","FAITH","GLOOM","HORSE","IVORY","JEWEL","KARMA","LATCH","MOUTH","NAVAL",
  "OLIVE","POUND","QUACK","ROUST","SCORE","TRACE","UNITY","VAULT","WHEAT","YACHT",
  "BLAZE","CABIN","DRAFT","ENJOY","FENCE","GRAIN","HATCH","INPUT","JOINT","KNIFE",
  "LOYAL","MARSH","NOBLE","ORBIT","PIXEL","QUILT","RUSTY","SHARK","TRUST","UDDER",
  "VOCAL","WINCH","YEARN","ZESTY","ABODE","BATCH","CHOIR","DOUGH","EXILE","FLOUR",
  "GLEAM","HUMID","ITCHY","JAZZY","KAYAK","LUNGE","MIRTH","NERVE","OMEGA","PROUD",
  "QUEUE","RAVEN","SPICE","TRIBE","UNDER","VINYL","WALTZ","YOUNG","ALLOW","BUDGE",
];

export const VALID = new Set<string>([
  ...ANSWERS,
  "ABOVE","AGENT","ALONE","ALONG","ALOUD","BACON","BAKER","BEACH","BEGIN","BLACK",
  "BLAME","BLANK","BLEED","BLEND","BLIND","BLOCK","BLOOD","BLOOM","BOARD","BRAIN",
  "BREAD","BREAK","BRICK","BRIEF","BRING","BROAD","BROWN","BUILD","CABLE","CARRY",
  "CATCH","CAUSE","CHAIR","CHAOS","CHARM","CHART","CHASE","CHEEK","CHESS","CHEST",
  "CHIEF","CHILD","CHILI","CIVIL","CLAIM","CLEAN","CLEAR","CLERK","CLICK","CLIFF",
  "CLIMB","CLING","CLOCK","CLOSE","CLOUD","COACH","COAST","COULD","COUNT","COURT",
  "COVER","CRACK","CRAFT","CRASH","CRAZY","CREAM","CRIME","CROSS","CROWD","CROWN",
  "CRUSH","CYCLE","DANCE","DEALT","DEBUT","DEPTH","DERBY","DEVIL","DIRTY","DOZEN",
  "DRAIN","DRAMA","DREAM","DRESS","DRIED","DRINK","DROVE","DRUNK","EARLY","EARTH",
  "EIGHT","ELBOW","EMAIL","ENEMY","ENTER","ENTRY","EQUAL","ERROR","EVENT","EVERY",
  "EXACT","EXIST","EXTRA","FERRY","FIELD","FIFTH","FIFTY","FIGHT",
  "FINAL","FIRST","FLAME","FLASH","FLEET","FLESH","FLOAT","FLOCK","FLOOD","FLOOR",
  "FLUID","FLUSH","FOCUS","FORCE","FORTH","FORTY","FORUM","FOUND","FRAME","FRANK",
  "FRESH","FRIED","FRONT","FRUIT","FUNNY","GIANT","GLAND","GLASS","GLIDE","GLOBE",
  "GLORY","GLOVE","GRACE","GRADE","GRAND","GRANT","GRAPH","GRASS","GRAVE","GREAT",
  "GREEN","GROUP","GROWN","GUARD","GUESS","GUEST","GUIDE","GUILD","GUILT","HABIT",
  "HAPPY","HEART","HEAVY","HOTEL","HOUSE","HUMAN","IDEAL","IMAGE","ISSUE","JOKER",
  "JUDGE","JUICE","KNOWN","LABEL","LABOR","LARGE","LASER","LATER","LAYER","LEARN",
  "LEAST","LEAVE","LEGAL","LEVEL","LIGHT","LIMIT","LIVER","LOCAL","LOGIC","LOOSE",
  "LOWER","LUCKY","LUNCH","MAGIC","MAJOR","MAYBE","MEDIA","METAL","METER","MIGHT",
  "MINOR","MINUS","MIXER","MODEL","MONEY","MONTH","MORAL","MOUSE","MOVIE","MUSIC",
  "NEVER","NEWLY","NORTH","NOVEL","NURSE","OFFER","OFTEN","OPERA","ORDER","OTHER",
  "OUNCE","OUTER","OWNER","PAINT","PANEL","PAPER","PARTY","PATCH","PAUSE","PEACE",
  "PEACH","PEARL","PHASE","PHONE","PHOTO","PIECE","PILOT","PIVOT","PLACE","PLAIN",
  "PLANE","PLANT","PLATE","POINT","POWER","PRESS","PRICE","PRIDE","PRIME","PRINT",
  "PRIOR","PRIZE","PROOF","QUICK","QUIET","QUITE","RADAR","RADIO","RAISE","RAPID",
  "RATIO","REACH","READY","REALM","REBEL","RELAX","REPLY","RIGHT","ROUND","ROUTE",
  "ROYAL","RURAL","SCALE","SCENE","SCOUT","SHARE","SHARP","SHEEP","SHEET","SHELF",
  "SHELL","SHIFT","SHINE","SHIRT","SHOCK","SHOOT","SHORT","SHOWN","SIGHT","SILLY",
  "SINCE","SLEEP","SLICE","SLIDE","SLOPE","SMALL","SMART","SMELL","SMILE","SMOKE",
  "SNAKE","SOLAR","SOLID","SOLVE","SORRY","SOUND","SOUTH","SPACE","SPARE","SPEAK",
  "SPEND","SPENT","SPILL","SPLIT","SPORT","STAFF","STAGE","STAKE","STAND","START",
  "STATE","STEAM","STEEL","STEEP","STEER","STICK","STILL","STOCK","STONE","STOOD",
  "STORE","STORY","STRIP","STUDY","STUFF","STYLE","SUGAR","SUITE","SUPER","SWEEP",
  "SWEET","SWIFT","SWING","TABLE","TASTE","TEACH","THANK","THEFT","THEIR","THEME",
  "THERE","THICK","THING","THINK","THIRD","THOSE","THREE","THREW","THROW","TIRED",
  "TODAY","TOOTH","TOPIC","TOTAL","TOUCH","TOUGH","TOWER","TRACK","TRADE","TRAIL",
  "TRAIN","TREAT","TREND","TRIAL","TRICK","TRUCK","TRULY","UNCLE","UNION","UNITE",
  "UPPER","UPSET","URBAN","USAGE","USUAL","VAGUE","VALID","VALUE","VIDEO","VIRUS",
  "VISIT","VITAL","VOICE","WASTE","WATCH","WATER","WHILE","WHITE","WHOLE","WHOSE",
  "WORTH","WOULD","WRECK","WRITE","WRONG","YOUTH",
]);

export const NUM_BOARDS = 2;
export const MAX_GUESSES = 7;

export type Tile = "absent" | "present" | "correct" | "blank";

export interface DordleMiniSettings {
  rounds: "5" | "8" | "10";
}

export interface DordleMiniState {
  answers: string[];
  guesses: string[];
  current: string;
  solved: boolean[];
  status: "playing" | "won" | "lost";
  message: string;
}

export type DordleMiniAction =
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

function pickAnswers(seed: number, n: number): string[] {
  const rng = mulberry32(seed);
  const pool = [...ANSWERS];
  const out: string[] = [];
  for (let i = 0; i < n && pool.length > 0; i++) {
    const idx = Math.floor(rng() * pool.length);
    out.push(pool.splice(idx, 1)[0]!);
  }
  return out;
}

export function initialState(seed: number, _settings: DordleMiniSettings): DordleMiniState {
  return {
    answers: pickAnswers(seed, NUM_BOARDS),
    guesses: [],
    current: "",
    solved: new Array(NUM_BOARDS).fill(false),
    status: "playing",
    message: "",
  };
}

export function reducer(state: DordleMiniState, action: DordleMiniAction): DordleMiniState {
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
      const guesses = [...state.guesses, state.current];
      const solved = state.answers.map((a, i) => state.solved[i] || state.current === a);
      const allSolved = solved.every(Boolean);
      if (allSolved) return { ...state, guesses, current: "", solved, status: "won", message: "Solved!" };
      if (guesses.length >= MAX_GUESSES) return { ...state, guesses, current: "", solved, status: "lost", message: "" };
      return { ...state, guesses, current: "", solved, message: "" };
    }
    case "reset":
      return { ...state, guesses: [], current: "", solved: new Array(NUM_BOARDS).fill(false), status: "playing", message: "" };
    default: return state;
  }
}

export function isTerminal(state: DordleMiniState): { score: number } | null {
  if (state.status === "won") return { score: Math.max(0, (MAX_GUESSES - state.guesses.length + 1) * 100 * NUM_BOARDS) };
  if (state.status === "lost") return { score: state.solved.filter(Boolean).length * 50 };
  return null;
}
