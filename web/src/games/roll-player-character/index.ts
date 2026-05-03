import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RollPlayerCharacterState, RollPlayerCharacterAction, RollPlayerCharacterSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RollPlayerCharacterGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
const hint = (state: RollPlayerCharacterState): HintTarget | null => (state.phase === "rolling" ? { selector: ".dm-btn", pulses: 3 } : null);

export const rollPlayerCharacterPlugin: GamePlugin<RollPlayerCharacterState, RollPlayerCharacterAction, typeof settings> = {
  id:"roll-player-character",
  title:"Roll Player Character",
  category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Roll dice to build a character's stats.",
  howToPlay:"Roll Player Character is a 10-round character-creation dice game inspired by the role-playing builder. Each round you roll six dice — one for each ability score: Strength, Dexterity, Constitution, Intelligence, Wisdom, and Charisma. Sum all six for your round score. 🧙\n\nNo choice involved; the dice tell your hero's story. Average rounds score around 21. Across 10 rounds expect totals between 200 and 220. A round of all sixes (vanishingly rare) scores 36.\n\nPress Roll to determine your hero's six abilities, then Next to retire them and roll the next character. Each ability is labeled clearly. Score 220+ to be the legendary Roll Player. The game captures the joyous moment of seeing a character's stats reveal in a quick fantasy ride finishing in well under a minute. A perfect tribute to the original tabletop roll-and-draft favorite.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as RollPlayerCharacterSettings),
  reducer, isTerminal, hint, component:RollPlayerCharacterGame,
};
