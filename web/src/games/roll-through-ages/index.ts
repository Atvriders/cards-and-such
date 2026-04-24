import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RollThroughAgesState, RollThroughAgesAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RollThroughAges } from "./RollThroughAges.js";

const rollThroughAgesSettings = {
  turns: {
    kind: "enum" as const,
    label: "Turns",
    options: ["5", "7"] as const,
    default: "5" as const,
  },
} as const;

type RTASettingsType = SettingsOf<typeof rollThroughAgesSettings>;

export const rollThroughAgesPlugin: GamePlugin<RollThroughAgesState, RollThroughAgesAction, typeof rollThroughAgesSettings> = {
  id: "roll-through-ages",
  title: "Roll Through the Ages",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Build a civilization by rolling dice for food, goods, and workers over 5–7 turns.",
  howToPlay: `Roll Through the Ages is a civilization-building dice game. You start with 3 cities and must feed them each turn while accumulating goods and workers to build developments and monuments.

Each turn, roll dice equal to your number of cities (up to 7). Die faces produce: food (2–3 per die), goods (1–2 per die), workers (3 per die), or skulls (lose 3 food). You may reroll any non-held dice up to two more times. Click a die to hold it before rerolling.

When you're satisfied with your roll, click Keep Dice to tally your resources. Then decide to buy developments (3 goods = +5 points) or build monuments (6 workers = +10 points). Finally, click Next Turn: you must feed your cities (1 food each). Starvation costs 2 points per unfed city. If you have 5+ food surplus after feeding, you gain a city.

After 5 (or 7) turns the game ends. Your score combines points from developments and monuments minus starvation penalties. Aim for steady food production while stockpiling workers or goods for big end-game purchases.`,
  settings: rollThroughAgesSettings,
  initialState: (seed: number, settings: RTASettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: RollThroughAges,
};
