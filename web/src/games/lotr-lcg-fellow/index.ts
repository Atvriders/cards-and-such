import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LotrLcgFellowState, LotrLcgFellowAction, LotrLcgFellowSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LotrLcgFellowGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const lotrLcgFellowPlugin: GamePlugin<LotrLcgFellowState, LotrLcgFellowAction, typeof settings> = {
  id: "lotr-lcg-fellow",
  title: "LotR LCG: Fellowship Solo",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Lord of the Rings LCG fellowship variant — solo with AI hero ally.",
  howToPlay: "LotR LCG: Fellowship Solo lets you embark on a Middle-earth quest with one AI hero ally. Across ten rounds, both dice are added to a fellowship willpower track. Combined willpower above 70 earns a Ring Bonus — the One Ring is safely passed onward.\n\nPress Play Round to commit heroes to the quest. Then press Next Round, or Finish on round 10.\n\nIn the boxed game, deckbuilding for each hero is critical; this distillation honours that by giving you and your ally separate dice that represent each hero's personal commitment. The story is short, the danger is real, and the cooperative trust is essential. Forge your fellowship and reach Mount Doom — or at least cross the Bruinen safely.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as LotrLcgFellowSettings),
  reducer, isTerminal, component: LotrLcgFellowGame,
};
