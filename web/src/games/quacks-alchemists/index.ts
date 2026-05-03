import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { quacksAlchemistsState, quacksAlchemistsAction, quacksAlchemistsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { quacksAlchemistsGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const quacksAlchemistsPlugin: GamePlugin<quacksAlchemistsState, quacksAlchemistsAction, typeof settings> = {
  id: "quacks-alchemists",
  title: "Quacks Alchemists",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll-and-write potion-ingredient gathering on a 4x4 cauldron grid.",
  howToPlay: "Quacks Alchemists is the potion-brewing roll-and-write distilled to a 4x4 cauldron grid. Each cell represents an ingredient slot; inscribing a die value boils that ingredient into your potion.\n\nPress Roll to draw an ingredient die (1-6). Click any unmarked cauldron cell to add it there, scoring 2 base points per ingredient. Twelve brewing turns.\n\nCompleting any row earns a Stable Brew bonus of +5, any column a Potent Mix +5, and the entire cauldron (sixteen cells) a Master Alchemist +10. Skipping passes the turn at no cost — but you've used a brewing turn.\n\nThe original Quacks of Quedlinburg: The Alchemists is a roll-and-write spinoff with explosion mechanics; this distillation removes the bust-out risk and preserves only the cell-by-cell ingredient placement. Strong brewers score 35-45; the rare grid-filler hits the high forties.\n\nBrew carefully — every cauldron has its limits, and your twelve ingredients only go so far before completion bonuses become the only way to climb.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as quacksAlchemistsSettings),
  reducer,
  isTerminal,
  hint: (state: any) => {
    if ((state as any).phase === "done") return null;
    if ((state as any).phase === "rolling") return { selector: '[data-testid="hint-target-quacks-alchemists-roll"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-quacks-alchemists-skip"]', pulses: 3 };
  },
  component: quacksAlchemistsGame,
};
