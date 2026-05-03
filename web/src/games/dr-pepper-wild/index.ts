import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { DrPepperWildState, DrPepperWildAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DrPepperWild } from "./Game.js";

const settings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["10"] as const, default: "10" as const },
} as const;

export const drPepperWildPlugin: GamePlugin<DrPepperWildState, DrPepperWildAction, typeof settings> = {
  id: "dr-pepper-wild",
  title: "Dr Pepper Wild",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Wild game: 2s, 4s, and 10s are all wild.",
  howToPlay: "Dr Pepper Wild is a single-player card-combo game. Wild game: 2s, 4s, and 10s are all wild. Each round you receive a five-card hand from a shuffled 52-card deck and score points based on the strongest poker-style combo present.\n\nSpecial rule: Cards of rank 2, 4, or 10 act as wild — score best 5-card combo per round.\n\nPress Deal to receive a new five-card hand. The score for that hand is computed instantly using the variant's scoring table — pairs, two-pair, three-of-a-kind, straight, flush, full house, four-of-a-kind, straight flush. Bonus or wild rules adjust the totals up.\n\nPlay continues for ten rounds, accumulating points. The deck reshuffles each round so high cards are always available. Aim for the highest possible cumulative score by riding lucky deals.\n\nThe seed determines the entire shuffle sequence, so you can replay an identical run by entering the same seed. After ten rounds, your final score is locked in. Single-player only — no CPU opponent. A bite-sized poker variant perfect for short play sessions.",
  settings,
  initialState: (seed, _s) => initialState(seed, { rounds: "10" }),
  reducer, isTerminal,
  hint: (state: any) => {
    if (state.phase === "ready") return { selector: '[data-testid="hint-target-dr-pepper-wild-deal"]', pulses: 3 };
    if (state.phase === "dealt") return { selector: '[data-testid="hint-target-dr-pepper-wild-next"]', pulses: 3 };
    return null;
  }, component: DrPepperWild,
};
