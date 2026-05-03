import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RedDogProgressiveCasState, RedDogProgressiveCasAction, RedDogProgressiveCasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RedDogProgressiveCasGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
const hint = (state: RedDogProgressiveCasState): HintTarget | null => {
  if (isTerminal(state)) return null;
  if (state.phase === "ready") return { selector: '[data-testid="hint-target-red-dog-progressive-cas-primary"]', pulses: 3 };
  if (state.phase === "scored") return { selector: '[data-testid="hint-target-red-dog-progressive-cas-secondary"]', pulses: 3 };
  return null;
};
export const redDogProgressiveCasPlugin: GamePlugin<RedDogProgressiveCasState, RedDogProgressiveCasAction, typeof settings> = {
  id: "red-dog-progressive-cas", title: "Red Dog Progressive", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Red Dog with a progressive jackpot side bet.",
  howToPlay: "Red Dog Progressive is the standard Red Dog (also known as Yablon or Acey-Deucey) with an added progressive jackpot side bet that triggers on certain rare card combinations such as three matching cards.\n\nIn this single-player adaptation you play fifteen rounds. Each round produces two anchor cards and a middle card. You may play to resolve the round.\n\nIf the middle falls strictly between the anchors you score: spread of one pays fifty-five, two-to-four pays twenty-two, five-to-eight pays fourteen, nine-or-more pays six. A pair of equal anchors is an eight-point push (the progressive-jackpot kicker). Outside-the-spread or matching-an-anchor pays zero.\n\nExpected score across fifteen rounds is fifty-five to ninety-five. Red Dog Progressive's signature is the kicker on pair-anchors — small but reliable. Tight spreads pay huge and rarely hit; wide spreads pay small but reliably. Two tight wins plus three or four mid-spread wins in the fifteen-round set lands you in the upper band.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as RedDogProgressiveCasSettings),
  reducer, isTerminal, hint: hint, component: RedDogProgressiveCasGame,
};
