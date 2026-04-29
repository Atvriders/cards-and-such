import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BurgleBrosHeistState, BurgleBrosHeistAction, BurgleBrosHeistSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BurgleBrosHeistGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const burgleBrosHeistPlugin: GamePlugin<BurgleBrosHeistState, BurgleBrosHeistAction, typeof settings> = {
  id: "burgle-bros-heist",
  title: "Burgle Bros Heist",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Cooperative heist; crack safes across building floors.",
  howToPlay: "Burgle Bros Heist is a ten-round cooperative dice tribute to Tim Fowers' Burgle Bros, the cooperative heist where thieves crack safes across multi-floor buildings while dodging guards. You and an AI accomplice ally roll dice each round to crack vaults. Team target is 70 across 10 rounds. 💎\n\nEach round both dice are rolled and summed, with the sum added to your team score. Reach 70 by round 10 and the heist succeeds with a +50 cooperative bonus. Per-round averages around 7 mean ten rounds usually clear the target with comfortable margin.\n\nPress Play Round to roll, Next Round to advance, and Finish on round 10. The game completes in well under a minute. It distills Burgle Bros' tense cooperative heist into a compact dice session — perfect for a quick caper that captures the original's safecracker spirit in pocket form for endless replay attempts.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BurgleBrosHeistSettings),
  reducer, isTerminal, component: BurgleBrosHeistGame,
};
