import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { blazeFireworkState, blazeFireworkAction, blazeFireworkSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { blazeFireworkGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const blazeFireworkPlugin: GamePlugin<blazeFireworkState, blazeFireworkAction, typeof settings> = {
  id: "blaze-firework",
  title: "Blaze",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Card-flip simultaneous — match numbers to complete firework chains.",
  howToPlay: "Blaze is a firework-chain matching game distilled to a 4x4 cell grid where each inscribed value contributes to a sky-bursting display. Twelve flips per game.\n\nPress Roll to draw a firework die (1-6). Click any unmarked cell to ignite that firework there, scoring 2 base points. Light up an entire row to trigger a Chain Reaction bonus of +5; any column earns a Skyfall bonus of +5; and the full sixteen-cell grid lights the Grand Finale for +10.\n\nSkipping a roll passes the turn at no cost but consumes one of twelve. A thoughtful pyrotechnician scores 30-40; an artist juggling row and column completions can reach the high forties.\n\nThe original Blaze is a simultaneous-flip game for 2-5 players, racing to match colours and numbers for firework completion. This distillation captures the cell-by-cell ignition tension without the speed-race component — you have all the time in the world to plan each new burst, but only twelve total.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as blazeFireworkSettings),
  reducer,
  isTerminal,
    hint: (state: blazeFireworkState) => {
      if (state.phase === "done") return null;
      return { selector: '[data-testid="hint-target-blaze-firework-action"]', pulses: 3 };
    },
  component: blazeFireworkGame,
};
