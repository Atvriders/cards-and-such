import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { BeggarNeighbourShedState, BeggarNeighbourShedAction, BeggarNeighbourShedSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const BeggarNeighbourShedGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.BeggarNeighbourShedGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const beggarNeighbourShedPlugin: GamePlugin<BeggarNeighbourShedState, BeggarNeighbourShedAction, typeof settings> = {
  id: "beggar-neighbour-shed", title: "Beggar My Neighbour", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Luck-based capture shedding.",
  howToPlay: "Beggar My Neighbour, also known as Beat Your Neighbour Out of Doors, is one of the oldest English card games, mentioned in Charles Dickens's Great Expectations. Players take turns playing cards face-up to a center pile; when a player plays a face card or ace, the opponent must pay a tribute of cards (one for jack, two for queen, three for king, four for ace).\n\nIn this single-player version you face the CPU across six rounds. Each round both players start with twenty-six cards. The simulation runs the entire round and reports the result.\n\nWin a round by collecting all the cards. Twenty points for a win plus a five-point bonus per round won. Beggar My Neighbour is famously deterministic: once cards are dealt the outcome is fixed, no decisions matter. The 1936 Conway-Paterson conjecture about whether the game can loop forever was proven decidable in 2001 — for some shuffles the game runs hundreds of turns.\n\nA strong total is around sixty to ninety points across six rounds. Press Play and let fate decide.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BeggarNeighbourShedSettings),
  reducer, isTerminal, 
  hint: (state: BeggarNeighbourShedState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (state.phase === "ready") return { selector: '[data-testid="hint-target-beggar-neighbour-shed-play"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-beggar-neighbour-shed-next"]', pulses: 3 };
    return null;
  },
  component: BeggarNeighbourShedGame,
};
