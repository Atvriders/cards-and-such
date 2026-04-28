import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LotrLcgCoopState, LotrLcgCoopAction, LotrLcgCoopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LotrLcgCoopGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const lotrLcgCoopPlugin: GamePlugin<LotrLcgCoopState, LotrLcgCoopAction, typeof settings> = {
  id: "lotr-lcg-coop",
  title: "LotR LCG Co-op",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Cooperative quest in Middle-earth — heroes united against the shadow.",
  howToPlay: "LotR LCG Co-op tributes Fantasy Flight Games' Lord of the Rings: The Card Game, the original cooperative LCG. Across ten rounds, you and an AI hero contribute willpower, attack, and questing values via dice rolls, pooling all results into a single team score. Reach 70 to overcome the quest and gain a 50-point bonus.\n\nPress Play Round each turn. Two dice show their faces and the sum joins your team score. Press Next Round to continue, or Finish on round 10.\n\nThe actual LotR LCG features sphere-aligned heroes, threat tracks, encounter decks, and famous Tolkien locations. This dice adaptation shrinks all of that to a clean cooperative arc: every roll matters, neither player can carry the team alone, and the whole company rides or falls together.\n\nImagine your fellowship traversing Mirkwood, Moria, or the Anduin. Even a modest roll feels heroic when shared.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as LotrLcgCoopSettings),
  reducer, isTerminal, component: LotrLcgCoopGame,
};
