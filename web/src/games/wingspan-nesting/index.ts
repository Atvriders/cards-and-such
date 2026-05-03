import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { WingspanNestingState, WingspanNestingAction, WingspanNestingSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WingspanNestingGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const wingspanNestingPlugin: GamePlugin<WingspanNestingState, WingspanNestingAction, typeof settings> = {
  id: "wingspan-nesting",
  title: "Wingspan: Nesting",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Filler using Wingspan artwork; nest type set collection draft.",
  howToPlay: "Wingspan: Nesting is a quick filler drafting game using Wingspan-style nest types as the four suits — Bowl, Cup, Cavity, and Platform. Eight rounds of card picking against a CPU.\n\nEach round, three cards appear: pick one and the CPU greedily takes the highest-rank remaining. Build a nest collection to score sets and ranks.\n\nScoring per tableau:\n- Sum of egg-ranks (1-9 each).\n- +10 per nest type with 3+ birds.\n- +15 additional per nest type with 5+ birds.\n- +5 per matched egg-rank pair; +10 per triplet.\n- +25 if you outscore CPU at game end.\n\nStrategy: nests are tempting to spread thin, but +10 bonuses come from concentration. Three Cup nests beats six scattered birds for raw points. The CPU's greed plays into your hands when you take a low-rank Cavity to lock in a future +10. Aim for 60-100 points. Nesting is the fastest Wingspan-themed game in the family — 8 picks, big decisions.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as WingspanNestingSettings),
  reducer,
  isTerminal,
  hint: (state: any) => {
      if (state.phase === "drafting") return { selector: '[data-testid="hint-target-wingspan-nesting-primary"]', pulses: 3 };
      if (state.phase === "round-done") return { selector: '[data-testid="hint-target-wingspan-nesting-next"]', pulses: 3 };
      return null;
    },
  component: WingspanNestingGame,
};
