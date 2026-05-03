import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { AgeOfSteamRwState, AgeOfSteamRwAction, AgeOfSteamRwSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AgeOfSteamRwGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const ageOfSteamRwPlugin: GamePlugin<AgeOfSteamRwState, AgeOfSteamRwAction, typeof settings> = {
  id: "age-of-steam-rw",
  title: "Age of Steam: Roll & Write",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Route-building roll-and-write; connect cities and score goods.",
  howToPlay: "Age of Steam: Roll & Write is a roll-and-write railway route-building game where players connect cities and score delivered goods. In this adaptation you build a rail network on a 4x4 grid by rolling a single d6 each turn and assigning the value to a track cell. Click Roll, then click any empty cell to mark it with the rolled number. You may Skip if the roll doesn't help your route. Each marked cell scores its dice value as goods delivered. Strategy: complete rows and columns to forge transcontinental railways (+5 each), plus +10 for completing the full network. Higher rolls deliver premium goods over long routes, lower rolls fill in regional links. After 12 rolls the steam era closes. A solid Age of Steam score is 34-48 points; a master engineer reaches 65+. Each rail era begins with a fresh seeded dice sequence.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AgeOfSteamRwSettings),
  reducer,
  isTerminal,
  hint: (state: any) => {
    if ((state as any).phase === "done") return null;
    if ((state as any).phase === "rolling") return { selector: '[data-testid="hint-target-age-of-steam-rw-roll"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-age-of-steam-rw-skip"]', pulses: 3 };
  },
  component: AgeOfSteamRwGame,
};
