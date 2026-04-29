import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GState, GAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CanastaMexicanaRGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const canastaMexicanaRPlugin: GamePlugin<GState, GAction, typeof settings> = {
  id: "canasta-mexicana-r", title: "Canasta Mexicana", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Mexican Canasta variant with bonus hand patterns and meld bonuses.",
  howToPlay: "Canasta Mexicana is the Mexican branch of the canasta family, popular for its flexible meld combinations and short-game rhythm. Four rounds are played; each round you receive an eleven-card hand which the engine auto-melds into sets and runs.\n\nA set is three or more cards of the same rank; a run is three or more consecutive cards of one suit. Each meld scores twenty points base plus five for every extra card past three. Deadwood — cards left outside any meld — costs you nothing directly here, but going out (zero deadwood) earns a twenty-five-point bonus that simulates the canasta-out reward.\n\nClick 'Auto-score' to lock in the round, view your meld breakdown, then 'Next' to deal the following hand. Across four rounds, expected totals run from about ninety to one-eighty depending on seed. Mexicana rewards seeds where ranks cluster heavily — cling to triples and watch suits that bunch.",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, { dummy: false }),
  reducer, isTerminal, component: CanastaMexicanaRGame,
};
