import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AgonState, AgonAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Agon } from "./Game.js";

export const agonSettings = {
  opponent: {
    kind: "enum" as const,
    label: "Opponent",
    options: ["bot"] as const,
    default: "bot",
  },
} as const;

type AgonSettingsType = SettingsOf<typeof agonSettings>;

export const agonPlugin: GamePlugin<AgonState, AgonAction, typeof agonSettings> = {
  id: "agon",
  title: "Agon",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Victorian hex strategy — race your Queen to the centre.",
  howToPlay: `Agon is one of the oldest hexagonal board games, played on a six-ring board of 91 hexagons. Each player commands one Queen and six Guards. Your goal is to place your Queen on the single golden centre hex while all six Guards occupy the six hexes immediately surrounding it.

You play White; the bot plays Black. On your turn, click any white piece to select it, then click a highlighted hex to move it. Each piece moves exactly one step to any adjacent hex that is unoccupied. You cannot jump over or capture pieces. The bot moves randomly.

Strategy tips: advance your Guards toward the inner rings early to prepare a formation before your Queen arrives. Watch that the bot doesn't block your Guards from surrounding the centre. Conversely, try to interfere with the bot's formation by occupying key hexes near the centre. Because the board is symmetric and pieces cannot capture, the game rewards careful coordination. The golden centre hex is your ultimate destination — but arriving there with your Queen before the Guard ring is complete doesn't win. Patience and formation play are essential.

Scoring: win = 20 points; loss = 0.`,
  settings: agonSettings,
  initialState: (seed: number, settings: AgonSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Agon,
};
