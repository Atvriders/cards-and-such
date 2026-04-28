import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MiniBaccaratCasState, MiniBaccaratCasAction, MiniBaccaratCasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MiniBaccaratCasGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const miniBaccaratCasPlugin: GamePlugin<MiniBaccaratCasState, MiniBaccaratCasAction, typeof settings> = {
  id: "mini-baccarat-cas", title: "Mini Baccarat", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Punto Banco baccarat — bet Player, Banker, or Tie.",
  howToPlay: "Mini Baccarat is the small-table version of Punto Banco, where players simply bet on which of two hands (Player or Banker) will be closer to nine — or whether they will Tie. No drawing decisions are made by the player; the rules are fully fixed and the dealer follows a known table.\n\nEach round you choose Player, Banker, or Tie, then both hands are dealt and resolved automatically. Each hand starts with two cards; a third may be drawn under fixed rules. Card values: aces count one, 2-9 face, 10 and face cards count zero. Only the last digit of the total matters (so a 7 + 8 hand totals 5).\n\nTwelve rounds are played. Player wins pay twelve points. Banker wins pay eleven (a five-per-cent commission). Tie wins pay forty-eight (eight-to-one). Misses pay zero.\n\nExpected score is around fifty points across twelve rounds; a couple of correct Tie bets can push past 130, but ties land only nine per cent of the time. Banker wins slightly more often than Player; Tie is a sucker bet but pays huge when it hits.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MiniBaccaratCasSettings),
  reducer, isTerminal, component: MiniBaccaratCasGame,
};
