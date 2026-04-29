import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SpoonsShedState, SpoonsShedAction, SpoonsShedSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SpoonsShedGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const spoonsShedPlugin: GamePlugin<SpoonsShedState, SpoonsShedAction, typeof settings> = {
  id: "spoons-shed", title: "Spoons (Shedding)", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pass-until-quartet grab-a-spoon race.",
  howToPlay: "Spoons is the classic party shedding game where players sit in a circle around a pile of spoons (one fewer than the number of players). Cards are passed rapidly; once someone collects four of a kind they secretly grab a spoon, and everyone else races to grab one too. The spoonless player loses the round.\n\nIn this single-player simulation you race the CPU through six rounds. Each round you and the CPU pass cards until one of you collects a four-of-a-kind. The simulation factors your reflex speed (slightly favored), and the winner takes twenty points plus a five-point bonus.\n\nThe loser gets no points but continues to the next round. The classic tradition of spelling S-P-O-O-N-S is preserved in scoring: lose all six rounds and you spell SPOONS yourself, ending with zero. A typical good run is sixty to ninety points across six rounds; clean sweeps are rare. Press Play to deal the next round.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SpoonsShedSettings),
  reducer, isTerminal, component: SpoonsShedGame,
};
