import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { AbsState, AbsAction, AbsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AbsGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const zendoKoanPlugin: GamePlugin<AbsState, AbsAction, typeof settings> = {
  id: "zendo-koan",
  title: "Zendo (Koan)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Inductive reasoning pyramid abstract.",
  howToPlay: "Zendo is Kory Heath's inductive-reasoning game where one player invents a hidden rule and others test it with pyramid arrangements ('koans'). In this 5x5 placement adaptation across 14 turns (7 each), you place pyramids; the CPU plays randomly. Click an empty cell. After 14 moves the higher count wins. Full Zendo has a Master player who knows the rule (e.g., 'must contain a green pyramid') and Students who build koans and ask whether they have the Buddha-nature. The first to guess the rule wins. Zendo won the 2003 Origins Award for Game of the Year. The deductive-koan logic is unique among published abstracts. This simplified placement version skips the deduction layer to provide quick rounds. Strategy: claim the centre and edges. Final scoreboard: 100 points for the win, 25 for a tie. The full Zendo is a brilliant puzzle game played online by enthusiasts; this version is the gateway.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AbsSettings),
  reducer,
  isTerminal,
  component: AbsGame,
};
