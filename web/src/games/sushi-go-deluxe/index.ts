import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SushiGoDeluxeState, SushiGoDeluxeAction, SushiGoDeluxeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SushiGoDeluxeGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const sushiGoDeluxePlugin: GamePlugin<SushiGoDeluxeState, SushiGoDeluxeAction, typeof settings> = {
  id: "sushi-go-deluxe",
  title: "Sushi Go Deluxe",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Expanded Sushi Go variant with wasabi and tea ceremony.",
  howToPlay: "Sushi Go Deluxe is an expanded Sushi Go variant with deluxe sushi types. Eight rounds of conveyor-belt card drafting.\n\nEach round, three cards appear: pick one and the CPU takes the highest-rank remaining. Suits are sushi types — Maki, Nigiri, Sashimi, and Tempura.\n\nScoring per tableau:\n- Sum of card ranks (1-9 each).\n- +10 per sushi type with 3+ pieces.\n- +15 additional per sushi type with 5+ pieces.\n- +5 per same-rank pair; +10 per triplet.\n- +25 if you outscore the CPU.\n\nStrategy: Deluxe rewards specialization — three Sashimi is +10 plus rank totals. The greedy CPU takes the rank-9, opening mid-tier picks for your set. Sashimi-3 secures your set at low cost. Aim for 60-100 points. Sushi Go Deluxe is the franchise's conveyor mechanic on a fancier menu. Eight picks; four sushi types; one feast.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SushiGoDeluxeSettings),
  reducer,
  isTerminal,
  component: SushiGoDeluxeGame,
};
