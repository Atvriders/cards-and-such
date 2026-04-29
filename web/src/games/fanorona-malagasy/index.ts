import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { FanoronaMalagasyState, FanoronaMalagasyAction, FanoronaMalagasySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FanoronaMalagasyGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const fanoronaMalagasyPlugin: GamePlugin<FanoronaMalagasyState, FanoronaMalagasyAction, typeof settings> = {
  id: "fanorona-malagasy",
  title: "Fanorona (Malagasy)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Madagascar national 'capture by approach' game.",
  howToPlay: "Fanorona is the national board game of Madagascar — a checkers-family abstract famous for its 'capture by approach or withdrawal' rule. The full game uses a 9x5 grid where moving a piece toward an enemy line captures all the enemies aligned with it. This 5x5 placement adaptation simplifies to pure territorial claim. Across 14 turns you and a random CPU alternate placing pieces on empty squares. Click an empty cell. The CPU plays uniformly random. After fourteen moves the player with more pieces wins. Final scoreboard: 100 for a win, 25 for a tie. Fanorona has been computer-solved as a draw with perfect play; that hasn't dented its popularity at Antananarivo cafes where players wager small change. The 'approach or withdraw' capture creates dramatic chain-reactions absent from western checkers. UNESCO inscribed Fanorona on Madagascar's intangible heritage list in 2007. The placement reduction can't replicate those sweeping captures but preserves the territory-claim instinct.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as FanoronaMalagasySettings),
  reducer,
  isTerminal,
  component: FanoronaMalagasyGame,
};
