import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { AgricolaCardOnlyState, AgricolaCardOnlyAction, AgricolaCardOnlySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AgricolaCardOnlyGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const agricolaCardOnlyPlugin: GamePlugin<AgricolaCardOnlyState, AgricolaCardOnlyAction, typeof settings> = {
  id: "agricola-card-only",
  title: "Agricola Card-Only",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Card-only Agricola distillation: 10 turns of fields, occupations, and improvements.",
  howToPlay: "Agricola Card-Only condenses the deep occupation-and-improvement card game into ten focused turns. You begin with $200 cash, no Fields, and no Occupations. Each turn, pick one action: Buy a Field card for $40, Save (5% interest), Hire an Occupation for $60, or Sell a Field back to the market for roughly $30-50 random gold. After your action, every Field in your hand yields $8 of harvest income and every Occupation on payroll earns you $12 from special abilities. A farm event flavors the turn. Your final score is your net worth — cash plus the cost-basis value of your fields and occupations. Fields produce steady harvests but tie up capital, occupations amplify yields but cost more, and saving is slow but safe. Strong runs hit $700+ net worth and excellent ones near $1000.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AgricolaCardOnlySettings),
  reducer,
  isTerminal,
  hint: (state: AgricolaCardOnlyState): HintTarget | null => (state.phase === "choosing" ? { selector: '[data-testid="hint-target-agricola-card-only-primary"]', pulses: 3 } : null),
  component: AgricolaCardOnlyGame,
};
