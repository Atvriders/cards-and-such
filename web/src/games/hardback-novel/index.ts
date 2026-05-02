import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HardbackNovelState, HardbackNovelAction, HardbackNovelSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HardbackNovelGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const hardbackNovelPlugin: GamePlugin<HardbackNovelState, HardbackNovelAction, typeof settings> = {
  id:"hardback-novel",
  title:"Hardback Novel",
  category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Compose a fantasy novel from random genres.",
  howToPlay:"Hardback Novel is a 10-round fantasy-themed card game where you compose a tiny novel by drawing four genre cards each round: Adventure (1), Mystery (2), Romance (3), Horror (4), and Fantasy (5). The sum is your round score. 📖\n\nIf all four cards in a round share the same genre — a true \"genre set\" — you earn an additional 8-point bonus for thematic unity. Mixed rounds score lower; uniform rounds score big. The expected average per round is about 12 points; with the rare bonus you can spike past 20.\n\nPress Draw to reveal four cards, then Next to continue. There's no choice — just delight in seeing what four genres your library produces. Final scores cluster around 110 to 140. Aim for 140+ to be the next bestselling fantasy author. Quick, breezy, and conjures a literary fantasy world in moments.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as HardbackNovelSettings),
  reducer,
  isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-hardback-novel-primary"]', pulses: 3 }),
  component:HardbackNovelGame,
};
