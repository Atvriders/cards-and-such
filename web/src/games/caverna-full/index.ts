import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CavernaFullState, CavernaFullAction, CavernaFullSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";

const CavernaFullGame = /* @__PURE__ */ lazy(() =>
  import("./Game.js").then((mod) => ({ default: mod.CavernaFullGame as unknown as React.ComponentType<unknown> }))
);

const settings = {
  _dummy: { kind: "boolean" as const, label: "(reserved)", default: false },
} as const;

type S = SettingsOf<typeof settings>;

export const cavernaFullPlugin: GamePlugin<CavernaFullState, CavernaFullAction, typeof settings> = {
  id: "caverna-full",
  title: "Caverna (Full)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Dwarven worker placement: explore forests, excavate caves, raise animals across 12 rounds.",
  howToPlay:
    "Caverna: The Cave Farmers is Agricola's roomier cousin, where dwarven families work both a forest and a mountain. You play one dwarf clan against three CPU clans across 12 rounds, with harvest checks after rounds 5, 8, 10, and 12.\n\n" +
    "Each round, players take turns placing dwarves on action spaces (one dwarf per space). You start with 2 dwarves; the Family Growth action grants extra dwarves (up to 5 total).\n\n" +
    "Action spaces are split between accumulating resources (Logging, Sheep Farming, Ore Mining, etc.) and one-shot effects (Forest Exploration to clear forest, Cave Excavation to dig out mountain, Sowing to convert grain into fields, Family Growth). Cleared forest tiles become potential fields once sown. Excavated caves become dwellings that gate Family Growth.\n\n" +
    "Resources tracked: wood, stone, ore, ruby, food, wheat, grain, sheep, donkey, boar, cow, dog.\n\n" +
    "At each harvest, fields produce food (1 each), every dwarf eats 2 food (grain/wheat/animals can substitute), and pairs of same-species animals breed +1 offspring. Missing meals deduct from your ruby score.\n\n" +
    "Final score combines dwarves, dwellings, fields, cleared tiles, animals owned (diversity bonus), and resource stockpile (rubies are worth 2 VP each).\n\n" +
    "Advanced rules omitted: weapon-armed expedition actions, room/dwelling furnishings, pasture fencing, mine-specific spaces, ruby trading, and adjacency placement on the forest/mountain grid.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CavernaFullSettings),
  reducer,
  isTerminal,
  hint: (state): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "cpuTurn") {
      return { selector: '[data-testid="caverna-full-cpu-step"]', pulses: 3 };
    }
    if (state.phase === "playing" && state.current === 0) {
      return { selector: '[data-testid="hint-target-caverna-full-primary"]', pulses: 3 };
    }
    return null;
  },
  component: CavernaFullGame,
};
