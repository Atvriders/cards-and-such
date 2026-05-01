import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { QuartoClassicState, QuartoClassicAction, QuartoClassicSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { QuartoClassicGame } from "./Game.js";

const settings = {
  botStrength: { kind: "enum" as const, label: "Bot", options: ["easy", "hard"] as const, default: "easy" as const },
} as const;

type S = SettingsOf<typeof settings>;

export const quartoClassicPlugin: GamePlugin<QuartoClassicState, QuartoClassicAction, typeof settings> = {
  id: "quarto-classic",
  title: "Quarto (Classic)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Real Quarto: 16 unique pieces, 4 binary attributes. The opponent picks the piece you place. Four-in-a-row sharing any attribute wins.",
  howToPlay: `Quarto Classic uses 16 unique pieces, each with four binary attributes: tall/short, light/dark, square/round, and solid/hollow. The aim is to place four pieces in a row, column, or diagonal that all share at least one attribute (e.g. all four are tall, or all four are hollow).

The signature twist: you do not pick the piece you place — your opponent picks it for you. After placing, you pick a piece for the opponent to place next.

On your turn the bot has handed you a piece. Place it on any empty cell. If the placement completes a 4-line sharing any attribute, you win. If not, you choose any remaining piece for the bot to place next. The bot then places it (winning if it can) and hands you the next piece.

Hard bot uses look-ahead: it avoids handing you pieces that let you win, and it places safely so its handed piece doesn't gift you a win on the next move.

Scoring: win = 100, draw = 50, loss = 0.

Tips: think two ply ahead — every piece you give the opponent is a piece you might face yourself later. Try to leave your opponent only "dangerous" pieces.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as QuartoClassicSettings),
  reducer,
  isTerminal,
  component: QuartoClassicGame,
};
