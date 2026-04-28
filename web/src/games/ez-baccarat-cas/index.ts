import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { EzBaccaratCasState, EzBaccaratCasAction, EzBaccaratCasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { EzBaccaratCasGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const ezBaccaratCasPlugin: GamePlugin<EzBaccaratCasState, EzBaccaratCasAction, typeof settings> = {
  id: "ez-baccarat-cas", title: "EZ Baccarat", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Commission-free Baccarat with Dragon 7 and Panda 8 side bets.",
  howToPlay: "EZ Baccarat is a commission-free version of standard Baccarat: Banker wins pay one-to-one (no five-per-cent rake), but a Banker win with exactly seven points using three cards (Dragon 7) pushes instead of paying. Two side bets are available: Dragon 7 pays forty-to-one when this exact hand happens; Panda 8 pays twenty-five-to-one when Player wins with three-card eight.\n\nEach round you choose Player, Banker, Tie, Dragon 7, or Panda 8. Both hands are dealt and resolved by fixed Baccarat rules. Card totals use modulo-ten counting; tens and face cards score zero.\n\nTwelve rounds are played. Player or Banker win pays twelve points. Tie pays forty-eight. Dragon 7 hit pays forty-eight. Panda 8 hit pays thirty. Misses pay zero.\n\nExpected score is around fifty points; the side-bet hits are rare (Dragon 7 around two per cent, Panda 8 around one per cent) but pay handsomely. EZ Baccarat is mathematically very similar to standard Baccarat with slightly different volatility.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as EzBaccaratCasSettings),
  reducer, isTerminal, component: EzBaccaratCasGame,
};
