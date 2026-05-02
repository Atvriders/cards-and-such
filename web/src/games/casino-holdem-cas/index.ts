import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { CasinoHoldemCasState, CasinoHoldemCasAction, CasinoHoldemCasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CasinoHoldemCasGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
const hint = (state: CasinoHoldemCasState): HintTarget | null => (state.phase === "ready" ? { selector: '[data-testid="hint-target-casino-holdem-cas-primary"]', pulses: 3 } : null);
export const casinoHoldemCasPlugin: GamePlugin<CasinoHoldemCasState, CasinoHoldemCasAction, typeof settings> = {
  id: "casino-holdem-cas", title: "Casino Hold'em (Casino)", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "House-banked Texas Hold'em variant.",
  howToPlay: "Casino Hold'em is a casino table-game variant of Texas Hold'em where the player faces only the dealer (not other players). After two hole cards and a community flop, the player decides to call (2x ante) or fold.\n\nIn this single-player version you play fifteen rounds. Press Play each round to deal two hole cards and a flop. Decide to call or fold. If you call, the turn and river complete and the hands are compared at showdown.\n\nThe dealer qualifies with a pair of fours or better. If they qualify, hands are compared; if not, the ante pays even and the call pushes. Bonus pays on the AA Bonus side bet for hands of a flush or better, ranging from 7:1 (flush) to 100:1 (royal flush).\n\nA strong total across fifteen rounds is around three hundred. Casino Hold'em was invented by Stephen Au-Yeung in 2000 and is found in most European casinos. Press Play to deal.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CasinoHoldemCasSettings),
  reducer, isTerminal, hint, component: CasinoHoldemCasGame,
};
