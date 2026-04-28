import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AscensionGodslayerState, AscensionGodslayerAction, AscensionGodslayerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AscensionGodslayerGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const ascensionGodslayerPlugin: GamePlugin<AscensionGodslayerState, AscensionGodslayerAction, typeof settings> = {
  id:"ascension-godslayer",
  title:"Ascension Godslayer",
  category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Recruit heroes and slay constructs.",
  howToPlay:"Ascension Godslayer is a quick fantasy card game where each round draws four cards from a central row of heroes (worth 1-3) and constructs (worth 4-6). Each card you reveal contributes its value to your score. Pairs of matching values add a bonus of 5 — pure synergy. ⚔️\n\nYou play 10 rounds, each round entirely automatic. Watch the row reveal and tally results. With four cards per round, expect totals around 14 to 16 normally, plus bonus 5s on pairs. Hitting two pairs in one round is the dream for a 15-point boost.\n\nThe heroes provide steady score; constructs provide the boom. Press Draw to start a round, then Next to advance. Constructs glow gold; heroes shine silver. Aim for a final score of 160 or more to claim the title of Godslayer. The journey is brisk but flavorful — perfect for a quick fantasy fix.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as AscensionGodslayerSettings),
  reducer,
  isTerminal,
  component:AscensionGodslayerGame,
};
