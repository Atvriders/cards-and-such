import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { TamskSandState, TamskSandAction, TamskSandSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TamskSandGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const tamskSandPlugin: GamePlugin<TamskSandState, TamskSandAction, typeof settings> = {
  id: "tamsk-sand",
  title: "Tamsk Sand",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Tamsk Gipf timed-sandglass abstract — placement adaptation.",
  howToPlay: "Tamsk is the second Gipf-Project game by Kris Burm, famous for its timed sandglass mechanism: each piece carries a small sand timer that runs out unless moved. The full game uses a 19-cell hexagonal board and physical hourglasses. This 4x4 placement adaptation captures only the territorial layout. Across 12 turns you and a random CPU alternate placing pieces on empty squares. Click an empty cell. The CPU plays uniformly random. After twelve moves whoever has more pieces wins. Final scoreboard: 100 for a win, 25 for a tie. Tamsk's hourglass innovation is unique among abstracts — physical time pressure on each individual piece. Burm sourced specially-made glass timers for the production run; original Tamsk sets are now collector pieces. The placement reduction can't simulate the hourglass tension, but it preserves the territory-claim intuition. The full Tamsk rewards quick movements; this variant rewards careful planning. Tamsk pre-dates the wider Project Gipf success of Yinsh and Dvonn.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TamskSandSettings),
  reducer,
  isTerminal,
  component: TamskSandGame,
};
