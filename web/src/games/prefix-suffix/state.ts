import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface PrefixSuffixSettings {
  questionCount: "5" | "10" | "15";
  mode: "prefix" | "suffix" | "mixed";
}

export interface PrefixSuffixEntry {
  type: "prefix" | "suffix";
  affix: string;
  meaning: string;
  choices: string[];
}

export interface PrefixSuffixState {
  settings: PrefixSuffixSettings;
  entries: PrefixSuffixEntry[];
  current: number;
  selected: number | null;
  score: number;
  done: boolean;
}

export type PrefixSuffixAction =
  | { type: "select"; index: number }
  | { type: "next" };

const PREFIX_BANK: { affix: string; meaning: string }[] = [
  { affix: "UN-", meaning: "not / opposite" },
  { affix: "RE-", meaning: "again / back" },
  { affix: "PRE-", meaning: "before" },
  { affix: "MIS-", meaning: "wrongly / badly" },
  { affix: "OVER-", meaning: "too much / above" },
  { affix: "UNDER-", meaning: "below / not enough" },
  { affix: "ANTI-", meaning: "against" },
  { affix: "AUTO-", meaning: "self" },
  { affix: "BI-", meaning: "two" },
  { affix: "CO-", meaning: "together / with" },
  { affix: "DIS-", meaning: "not / opposite of" },
  { affix: "EX-", meaning: "former / out of" },
  { affix: "FORE-", meaning: "before / front" },
  { affix: "INTER-", meaning: "between / among" },
  { affix: "MICRO-", meaning: "very small" },
  { affix: "MID-", meaning: "middle" },
  { affix: "MONO-", meaning: "one / single" },
  { affix: "NON-", meaning: "not" },
  { affix: "OUT-", meaning: "surpass / outside" },
  { affix: "POST-", meaning: "after" },
  { affix: "PRO-", meaning: "in favor of / forward" },
  { affix: "SEMI-", meaning: "half / partly" },
  { affix: "SUB-", meaning: "under / below" },
  { affix: "SUPER-", meaning: "above / beyond" },
  { affix: "TRANS-", meaning: "across / beyond" },
  { affix: "TRI-", meaning: "three" },
  { affix: "ULTRA-", meaning: "beyond / extreme" },
  { affix: "MULTI-", meaning: "many" },
  { affix: "TELE-", meaning: "far / at a distance" },
  { affix: "HYPER-", meaning: "over / beyond / excess" },
];

const SUFFIX_BANK: { affix: string; meaning: string }[] = [
  { affix: "-TION", meaning: "act or state of" },
  { affix: "-ABLE", meaning: "capable of / worthy" },
  { affix: "-MENT", meaning: "result / state" },
  { affix: "-LESS", meaning: "without" },
  { affix: "-FUL", meaning: "full of" },
  { affix: "-NESS", meaning: "state or quality" },
  { affix: "-LY", meaning: "in a manner / like" },
  { affix: "-ER", meaning: "one who / more" },
  { affix: "-ISH", meaning: "somewhat / like" },
  { affix: "-OLOGY", meaning: "study of" },
  { affix: "-IFY", meaning: "to make or cause" },
  { affix: "-ISM", meaning: "belief / practice" },
  { affix: "-IST", meaning: "one who believes / practices" },
  { affix: "-IZE", meaning: "to make or become" },
  { affix: "-OLOGY", meaning: "the study of" },
  { affix: "-WARD", meaning: "in the direction of" },
  { affix: "-SHIP", meaning: "state / position" },
  { affix: "-HOOD", meaning: "state / period of" },
  { affix: "-DOM", meaning: "state / realm" },
  { affix: "-EN", meaning: "to make or become" },
  { affix: "-ANCE", meaning: "state or quality of" },
  { affix: "-ENCE", meaning: "state or quality of" },
  { affix: "-AL", meaning: "relating to" },
  { affix: "-IC", meaning: "relating to / having" },
  { affix: "-OUS", meaning: "full of / having" },
];

const DISTRACTORS = [
  "sound of",
  "color of",
  "place for",
  "kind of animal",
  "type of food",
  "number of items",
  "shape of",
  "direction of",
  "material made of",
  "related to water",
  "related to fire",
  "related to air",
  "related to time",
  "made by hand",
  "involving movement",
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number, settings: PrefixSuffixSettings): PrefixSuffixState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.questionCount, 10);

  let pool: { affix: string; meaning: string; type: "prefix" | "suffix" }[];
  if (settings.mode === "prefix") {
    pool = PREFIX_BANK.map((b) => ({ ...b, type: "prefix" as const }));
  } else if (settings.mode === "suffix") {
    pool = SUFFIX_BANK.map((b) => ({ ...b, type: "suffix" as const }));
  } else {
    pool = [
      ...PREFIX_BANK.map((b) => ({ ...b, type: "prefix" as const })),
      ...SUFFIX_BANK.map((b) => ({ ...b, type: "suffix" as const })),
    ];
  }

  const shuffledPool = shuffle(pool, rng);
  const chosen = shuffledPool.slice(0, count);

  const entries: PrefixSuffixEntry[] = chosen.map((item) => {
    const wrongPool = shuffle(
      DISTRACTORS.filter((d) => d !== item.meaning),
      rng,
    ).slice(0, 3);
    const choices = shuffle([item.meaning, ...wrongPool], rng);
    return { type: item.type, affix: item.affix, meaning: item.meaning, choices };
  });

  return {
    settings,
    entries,
    current: 0,
    selected: null,
    score: 0,
    done: false,
  };
}

export function reducer(state: PrefixSuffixState, action: PrefixSuffixAction): PrefixSuffixState {
  if (state.done) return state;
  switch (action.type) {
    case "select": {
      if (state.selected !== null) return state;
      const entry = state.entries[state.current]!;
      const correct = entry.choices[action.index] === entry.meaning;
      return {
        ...state,
        selected: action.index,
        score: correct ? state.score + 10 : state.score,
      };
    }
    case "next": {
      if (state.selected === null) return state;
      const nextIdx = state.current + 1;
      if (nextIdx >= state.entries.length) {
        return { ...state, done: true };
      }
      return { ...state, current: nextIdx, selected: null };
    }
    default:
      return state;
  }
}

export function isTerminal(state: PrefixSuffixState): { score: number } | null {
  if (state.done) return { score: state.score };
  return null;
}
