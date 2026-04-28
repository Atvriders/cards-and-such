import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { OklahomaGinRState, OklahomaGinRAction, OklahomaGinRSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { OklahomaGinRGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const oklahomaGinRPlugin: GamePlugin<OklahomaGinRState, OklahomaGinRAction, typeof settings> = {
  id: "oklahoma-gin-r", title: "Oklahoma Gin", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Gin variant where the first discard determines the maximum knock value.",
  howToPlay: "Oklahoma Gin is a Gin Rummy variant with one twist: the value of the first upcard determines the maximum deadwood total at which a player can knock. If the upcard is a six, you can knock with six or fewer points of deadwood. If it's an ace, only gin (zero deadwood) ends the round.\n\nEach round you are dealt seven cards. The engine auto-melds your hand, identifying sets (three or more of a rank) and runs (three or more of consecutive same-suit cards). Deadwood is the sum of unmelded card values: aces count one, 2-10 face value, J/Q/K count ten.\n\nSix rounds are played. If your deadwood is at or under the round's knock limit, you score thirty points plus five per matched meld. If above, you score zero plus a tiny consolation of one point per meld.\n\nExpected score is around fifty to eighty points across six rounds. Big rounds with a low knock-limit upcard are a bonus. Aces being upcards (gin only) almost always score zero, while sixes or higher are forgiving.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as OklahomaGinRSettings),
  reducer, isTerminal, component: OklahomaGinRGame,
};
