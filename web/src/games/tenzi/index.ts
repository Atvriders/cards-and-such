import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TenziState, TenziAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Tenzi } from "./Tenzi.js";

export const tenziSettings = {
  dice: {
    kind: "enum" as const,
    label: "Dice Count",
    options: ["10", "15", "20"] as const,
    default: "10" as const,
  },
} as const;

type TenziSettingsType = SettingsOf<typeof tenziSettings>;

export const tenziPlugin: GamePlugin<TenziState, TenziAction, typeof tenziSettings> = {
  id: "tenzi",
  title: "Tenzi",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Race to get all 10 dice showing the same face — speed solitaire dice!",
  howToPlay: `Tenzi is a fast-paced solitaire dice game. You start with 10 dice (or 15/20 for a harder challenge) all rolled at once.

After the initial roll, choose a target face — the number you want all your dice to show. Any dice already showing that face are immediately locked (shown in green). Click Roll to reroll all unlocked dice. After each roll, any die showing your target face automatically locks. Keep rolling until every die shows your target face.

Your score is based on how few rolls it takes: base score is 10 × your dice count, minus your roll count. Finishing in fewer rolls gives a higher score. A perfect game (all dice show target on the very first roll) scores the maximum.

Strategy: pick the target that already appears most often in your initial roll to lock as many as possible right away. With 10 dice you need roughly 6 rolls on average, so finishing in 4 or fewer is excellent. More dice require more rolls but give a higher base score.`,
  settings: tenziSettings,
  initialState: (seed: number, settings: TenziSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Tenzi,
};
