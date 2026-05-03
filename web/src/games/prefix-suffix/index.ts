import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PrefixSuffixState, PrefixSuffixAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PrefixSuffix } from "./PrefixSuffix.js";

export const prefixSuffixSettings = {
  questionCount: {
    kind: "enum" as const,
    label: "Questions",
    options: ["5", "10", "15"] as const,
    default: "10" as const,
  },
  mode: {
    kind: "enum" as const,
    label: "Mode",
    options: ["prefix", "suffix", "mixed"] as const,
    default: "mixed" as const,
  },
} as const;

type PrefixSuffixSettingsType = SettingsOf<typeof prefixSuffixSettings>;

export const prefixSuffixPlugin: GamePlugin<PrefixSuffixState, PrefixSuffixAction, typeof prefixSuffixSettings> = {
  id: "prefix-suffix",
  title: "Prefix/Suffix",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Identify what a prefix or suffix means — a vocabulary-building quiz on word parts.",
  howToPlay: `Prefix/Suffix is a vocabulary quiz focused on word parts. Each question shows a prefix (a word-part added to the front of a word, like UN- or PRE-) or a suffix (added to the end, like -FUL or -LESS) and asks you to choose its meaning from four options.

Click or tap the correct meaning. Correct answers highlight green; wrong ones turn red while the right answer is revealed. Each correct pick earns 10 points. Finish all questions to see your total score.

You can configure the number of questions (5, 10, or 15) and choose to focus on prefixes only, suffixes only, or a mixed challenge.

Tips: UN- always means "not" or "opposite" — unwell, unkind, unfair. RE- means "again" — restart, rewrite, rebuild. Suffixes that end in -NESS or -MENT turn adjectives and verbs into nouns describing a state (kindness, enjoyment). -FUL means "full of" (joyful, helpful). -LESS means "without" (hopeless, careless). Learning about 30 common affixes can help you decode thousands of unfamiliar words.`,
  settings: prefixSuffixSettings,
  initialState: (seed: number, settings: PrefixSuffixSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".ps-next", pulses: 3 }; },
  component: PrefixSuffix,
};
