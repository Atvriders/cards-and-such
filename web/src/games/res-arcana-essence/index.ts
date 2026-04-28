import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ResArcanaEssenceState, ResArcanaEssenceAction, ResArcanaEssenceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ResArcanaEssenceGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const resArcanaEssencePlugin: GamePlugin<ResArcanaEssenceState, ResArcanaEssenceAction, typeof settings> = {
  id:"res-arcana-essence",
  title:"Res Arcana Essence",
  category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Distill essences from artifact cards.",
  howToPlay:"Res Arcana Essence is a 10-round artifact-tableau game. Each round, four Artifact cards are drawn from a fantasy deck: Wand (2), Tome (3), Crystal (4), Goblet (5), and Throne (7). Sum the values for your base round score. ✨\n\nArtifact bonus: each Throne in your hand adds an extra 3 points. So a round with a Throne can spike. Average rounds without bonuses score about 14; with a Throne, around 17. Across 10 rounds expect totals near 140 to 180.\n\nPress Draw to distill four artifacts of essence, then Next to continue. Thrones glow purple. Score 165+ for a Res Arcana mastery run. Each card name and value displays clearly. Inspired by the elegant tabletop tableau game, this miniature captures its essence — pun intended — in a quick run finishing under a minute. Gentle, meditative, and richly fantasy.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ResArcanaEssenceSettings),
  reducer,
  isTerminal,
  component:ResArcanaEssenceGame,
};
