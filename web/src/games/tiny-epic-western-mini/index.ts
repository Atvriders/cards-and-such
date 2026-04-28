import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { TinyEpicWesternState, TinyEpicWesternAction, TinyEpicWesternSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TinyEpicWesternGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const tinyEpicWesternPlugin: GamePlugin<TinyEpicWesternState, TinyEpicWesternAction, typeof settings> = {
  id: "tiny-epic-western-mini",
  title: "Tiny Epic Western",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Worker placement poker. Influence western towns and sheriff.",
  howToPlay: "Tiny Epic Western is a ten-turn worker-placement Wild West game. You start with $200 cash. Each turn pick: Invest $35 (1 Saloon), Save (5% interest), Hire a Sheriff for $60 to enforce your influence, or Trade a Saloon for a $30-50 town payout. After actions, each Saloon pays $7 from drinks and gambling and each Sheriff earns $12 in influence rewards. Mid-screen flavor describes the western towns: showdowns, train robberies, dust storms. Score equals net worth at turn 10. The math: Saloons return 20%, Sheriffs return 20%, saving 5%. The flavor: poker showdowns at saloons are the influence engine, stack saloons for volume income, then add sheriffs for amplification. Aim for 5-6 Saloons plus 2 Sheriffs by turn 10 for $700-850. Pure save: $325. Greedy Sheriff-first: around $550.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TinyEpicWesternSettings),
  reducer,
  isTerminal,
  component: TinyEpicWesternGame,
};
