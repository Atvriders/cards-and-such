import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { BeatNeighbourShedState, BeatNeighbourShedAction, BeatNeighbourShedSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const BeatNeighbourShedGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.BeatNeighbourShedGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const beatNeighbourShedPlugin: GamePlugin<BeatNeighbourShedState, BeatNeighbourShedAction, typeof settings> = {
  id: "beat-neighbour-shed", title: "Beat Your Neighbour", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Beggar variant with extra penalty.",
  howToPlay: "Beat Your Neighbour Out of Doors is a Beggar My Neighbour variant where penalty payments increase dramatically. Jacks demand two cards (not one), queens three, kings four, aces five. The deeper penalty makes the game faster and more dramatic — most rounds end before a player can recover from a single bad ace.\n\nIn this single-player version you face the CPU across six rounds. The simulation follows the strict 2-3-4-5 penalty scale. Each round, twenty-six cards each, the first to collect all fifty-two wins twenty points plus a five-point card-margin bonus.\n\nLike Beggar My Neighbour the game is fully deterministic — once cards are dealt and the order is set, the outcome is fixed. There is no skill, only luck. Yet the swing of fortune is gripping: a single ace pull can turn a near-defeat into a sweeping victory.\n\nA strong total across six rounds is around eighty. Beat Your Neighbour is a wonderful family game because younger players have equal chance with adults. Press Play to settle the next round.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BeatNeighbourShedSettings),
  reducer, isTerminal, 
  hint: (state: BeatNeighbourShedState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (state.phase === "ready") return { selector: '[data-testid="hint-target-beat-neighbour-shed-play"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-beat-neighbour-shed-next"]', pulses: 3 };
    return null;
  },
  component: BeatNeighbourShedGame,
};
