import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DragonTigerCasState, DragonTigerCasAction, DragonTigerCasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DragonTigerCasGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
const hint = (state: DragonTigerCasState): HintTarget | null => {
  if (isTerminal(state)) return null;
  if (state.phase === "ready") return { selector: '[data-testid="hint-target-dragon-tiger-cas-primary"]', pulses: 3 };
  if (state.phase === "scored") return { selector: '[data-testid="hint-target-dragon-tiger-cas-secondary"]', pulses: 3 };
  return null;
};
export const dragonTigerCasPlugin: GamePlugin<DragonTigerCasState, DragonTigerCasAction, typeof settings> = {
  id: "dragon-tiger-cas", title: "Dragon Tiger", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two-card highest-wins casino draw.",
  howToPlay: "Dragon Tiger is a fast-paced two-card casino draw originating in Cambodia. One card is dealt to the Dragon spot, one to the Tiger spot, and the higher rank wins. The game is among the simplest casino card games.\n\nIn this single-player adaptation you play fifteen rounds. Each round produces two anchors and a middle card (an in-between style approximation of the high-low draw). You may play to resolve the round.\n\nIf the middle falls strictly between the anchors you score: spread of one pays fifty-five, two-to-four pays twenty-two, five-to-eight pays fourteen, nine-or-more pays six. A pair of equal anchors is a six-point push. Outside-the-spread or matching-an-anchor pays zero.\n\nExpected score across fifteen rounds is fifty to ninety. Dragon Tiger's fast simplicity is well captured by the in-between mechanic. Tight spreads pay big but rarely hit; wide spreads pay small but reliably. Two tight wins in the fifteen-round set push you to the high end of the band.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DragonTigerCasSettings),
  reducer, isTerminal, hint: hint, component: DragonTigerCasGame,
};
