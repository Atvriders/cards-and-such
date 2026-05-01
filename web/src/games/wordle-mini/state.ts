import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const WORDLE_ANSWERS: string[] = [
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
  "CRISP","DAUNT","EQUIP","FROST","GLAZE","HARSH","INDEX","JUMBO","LINEN","MOTOR",
];

export const WORDLE_VALID = new Set<string>([
  ...WORDLE_ANSWERS,
  "ABLED","ABOVE","ACORN","ACTOR","AFTER","AGAIN","AGENT","AGREE","AHEAD","ALARM",
  "ALBUM","ALIEN","ALIVE","ALLEY","ALLOY","ALONE","ALONG","ALOOF","ALOUD","AMBER",
  "AMEND","ANGEL","ANGER","ANGLE","ANGRY","ANKLE","APPLY","APRON","ARENA","ARGUE",
  "ARMOR","ARRAY","ARROW","ASIDE","ASSET","ATLAS","AUDIO","AUDIT","AVOID","AWAKE",
  "BACON","BADGE","BAGEL","BAKER","BANJO","BASIC","BASIN","BEACH","BEAST","BEGIN",
  "BERRY","BIRTH","BLACK","BLAME","BLAND","BLANK","BLEND","BLESS","BLIND","BLINK",
  "BLOOM","BLUSH","BOARD","BOOST","BOOTH","BOXER","BRAIN","BRAND","BRASS","BREAD",
  "BREAK","BREED","BRICK","BRIDE","BRIEF","BRING","BROAD","BROWN","BRUSH","BUILD",
  "BURST","BUYER","CABLE","CAMEL","CANDY","CANOE","CARGO","CARRY","CATCH","CAUSE",
  "CHAIR","CHALK","CHAOS","CHARM","CHART","CHASE","CHEAP","CHEEK","CHESS","CHEST",
  "CHIEF","CHILD","CHILI","CHIME","CHINA","CHOSE","CIVIL","CLAIM","CLEAN","CLEAR",
  "CLERK","CLICK","CLIFF","CLIMB","CLING","CLOCK","CLOSE","CLOUD","COACH","COAST",
  "COULD","COUNT","COURT","COVER","CRACK","CRAFT","CRASH","CRAZY","CREAM","CRIME",
  "CROWD","CROWN","CRUDE","CRUEL","CRUSH","CURSE","CYCLE","DANCE","DEALT","DEBIT",
  "DECAY","DEPTH","DERBY","DEVIL","DIARY","DIRTY","DOZEN","DRAIN","DRAMA","DREAM",
  "DRESS","DRIED","DRINK","DROVE","DRUNK","DRYER","EARLY","EARTH","EATER","EIGHT",
  "ELBOW","EMAIL","ENEMY","ENJOY","ENTER","ENTRY","EQUAL","ERROR","EVENT","EVERY",
  "EXACT","EXIST","EXTRA","FAIRY","FALSE","FAULT","FAVOR","FEAST","FERRY","FIBER",
  "FIELD","FIFTH","FIFTY","FIGHT","FINAL","FINER","FIRST","FIXED","FLAME","FLASH",
  "FLEET","FLESH","FLOAT","FLOCK","FLOOD","FLOOR","FLUID","FLUSH","FOCUS","FORCE",
  "FORTH","FORTY","FORUM","FOUND","FRAME","FRANK","FRAUD","FRESH","FRIED","FRONT",
  "FRUIT","FUNNY","GAMER","GIANT","GIRTH","GLAND","GLARE","GLASS","GLIDE","GLOBE",
  "GLORY","GLOVE","GRACE","GRADE","GRAIN","GRAND","GRANT","GRAPH","GRASS","GRAVE",
  "GREAT","GREEN","GROUP","GROWN","GUARD","GUESS","GUEST","GUIDE","GUILD","GUILT",
  "HABIT","HAPPY","HARRY","HASTE","HEART","HEAVY","HENCE","HOBBY","HOLLY","HORDE",
  "HOTEL","HOUSE","HUMAN","HURRY","ICILY","IDEAL","IMAGE","IRONY","ISSUE","JIFFY",
  "JOKER","JUDGE","JUICE","KNEEL","KNOCK","KNOWN","LABEL","LABOR","LAGER","LARGE",
  "LASER","LATER","LAYER","LEARN","LEAST","LEAVE","LEGAL","LEVEL","LIGHT","LIMIT",
  "LIVER","LOCAL","LOGIC","LOOSE","LOWER","LUCKY","LUNCH","LYING","MAGIC","MAJOR",
  "MAYBE","MEDIA","METAL","METER","MIGHT","MINOR","MINUS","MIXER","MODEL","MONEY",
  "MONTH","MORAL","MOTOR","MOUSE","MOVIE","MUSIC","NEVER","NEWLY","NICHE","NINTH",
  "NORTH","NOVEL","NURSE","OFFER","OFTEN","OPERA","ORDER","OTHER","OUNCE","OUTER",
  "OWNER","PAINT","PANEL","PAPER","PARTY","PASTE","PATCH","PATIO","PAUSE","PEACE",
  "PEACH","PEARL","PHASE","PHONE","PHOTO","PIECE","PILOT","PIVOT","PLACE","PLAID",
  "PLAIN","PLANE","PLANT","PLATE","POINT","POUND","POWER","PRESS","PRICE","PRIDE",
  "PRIME","PRINT","PRIOR","PRIZE","PROOF","QUICK","QUIET","QUITE","RADAR","RADIO",
  "RAISE","RAPID","RATIO","REACH","READY","REALM","REBEL","RELAX","REPLY","RIGHT",
  "ROUND","ROUTE","ROYAL","RURAL","SCALE","SCENE","SCOUT","SHARE","SHARP","SHEEP",
  "SHEET","SHELF","SHELL","SHIFT","SHINE","SHIRT","SHOCK","SHOOT","SHORT","SHOWN",
  "SIGHT","SILLY","SINCE","SLEEP","SLICE","SLIDE","SLOPE","SMALL","SMART","SMELL",
  "SMILE","SMOKE","SNAKE","SOLAR","SOLID","SOLVE","SORRY","SOUND","SOUTH","SPACE",
  "SPARE","SPEAK","SPEND","SPENT","SPILL","SPLIT","SPOKE","SPORT","STAFF","STAGE",
  "STAKE","STAND","START","STATE","STEAM","STEEL","STEEP","STEER","STICK","STILL",
  "STOCK","STONE","STOOD","STORE","STORY","STRIP","STUDY","STUFF","STYLE","SUGAR",
  "SUITE","SUPER","SWEAR","SWEEP","SWEET","SWIFT","SWING","TABLE","TASTE","TEACH",
  "THANK","THEFT","THEIR","THEME","THERE","THICK","THING","THINK","THIRD","THOSE",
  "THREE","THREW","THROW","TIRED","TODAY","TOKEN","TOOTH","TOPIC","TOTAL","TOUCH",
  "TOUGH","TOWER","TRACK","TRADE","TRAIL","TRAIN","TREAT","TREND","TRIAL","TRICK",
  "TRUCK","TRULY","UNCLE","UNION","UNITE","UPPER","UPSET","URBAN","USAGE","USUAL",
  "VAGUE","VALID","VALUE","VIDEO","VIRUS","VISIT","VITAL","VOICE","WASTE","WATCH",
  "WATER","WHILE","WHITE","WHOLE","WHOSE","WORTH","WOULD","WRECK","WRITE","WRONG",
  "YOUTH",
]);

export interface WordleMiniSettings {
  rounds: "5" | "8" | "10";
}

export type Tile = "absent" | "present" | "correct" | "blank";

export interface WordleMiniState {
  answer: string;            // 5-letter uppercase
  guesses: string[];          // committed guesses
  current: string;            // current input row (may be < 5)
  maxGuesses: number;
  status: "playing" | "won" | "lost";
  message: string;
}

export type WordleMiniAction =
  | { type: "key"; ch: string }
  | { type: "backspace" }
  | { type: "enter" }
  | { type: "reset" };

export function pickAnswer(seed: number): string {
  const rng = mulberry32(seed);
  const idx = Math.floor(rng() * WORDLE_ANSWERS.length);
  return WORDLE_ANSWERS[idx]!;
}

export function scoreGuess(guess: string, answer: string): Tile[] {
  const g = guess.toUpperCase().padEnd(5, " ").slice(0, 5);
  const a = answer.toUpperCase();
  const result: Tile[] = ["absent","absent","absent","absent","absent"];
  const used = [false,false,false,false,false];
  // First pass: greens
  for (let i = 0; i < 5; i++) {
    if (g[i] === a[i]) { result[i] = "correct"; used[i] = true; }
  }
  // Second pass: yellows
  for (let i = 0; i < 5; i++) {
    if (result[i] === "correct") continue;
    for (let j = 0; j < 5; j++) {
      if (!used[j] && g[i] === a[j]) {
        result[i] = "present";
        used[j] = true;
        break;
      }
    }
  }
  return result;
}

export function initialState(seed: number, settings: WordleMiniSettings): WordleMiniState {
  return {
    answer: pickAnswer(seed),
    guesses: [],
    current: "",
    maxGuesses: parseInt(settings.rounds, 10),
    status: "playing",
    message: "",
  };
}

export function reducer(state: WordleMiniState, action: WordleMiniAction): WordleMiniState {
  if (state.status !== "playing" && action.type !== "reset") return state;
  switch (action.type) {
    case "key": {
      if (state.current.length >= 5) return state;
      const ch = action.ch.toUpperCase();
      if (!/^[A-Z]$/.test(ch)) return state;
      return { ...state, current: state.current + ch, message: "" };
    }
    case "backspace":
      return { ...state, current: state.current.slice(0, -1), message: "" };
    case "enter": {
      if (state.current.length !== 5) return { ...state, message: "Need 5 letters" };
      if (!WORDLE_VALID.has(state.current)) return { ...state, message: "Not in word list" };
      const guesses = [...state.guesses, state.current];
      if (state.current === state.answer) return { ...state, guesses, current: "", status: "won", message: "Solved!" };
      if (guesses.length >= state.maxGuesses) return { ...state, guesses, current: "", status: "lost", message: state.answer };
      return { ...state, guesses, current: "", message: "" };
    }
    case "reset":
      return { ...state, guesses: [], current: "", status: "playing", message: "" };
    default: return state;
  }
}

export function isTerminal(state: WordleMiniState): { score: number } | null {
  if (state.status === "won") {
    const tries = state.guesses.length;
    return { score: Math.max(0, (state.maxGuesses - tries + 1) * 100) };
  }
  if (state.status === "lost") return { score: 0 };
  return null;
}
