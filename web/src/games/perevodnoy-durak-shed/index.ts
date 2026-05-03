import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { PerevodnoyDurakShedState, PerevodnoyDurakShedAction, PerevodnoyDurakShedSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const PerevodnoyDurakShedGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PerevodnoyDurakShedGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const perevodnoyDurakShedPlugin: GamePlugin<PerevodnoyDurakShedState, PerevodnoyDurakShedAction, typeof settings> = {
  id: "perevodnoy-durak-shed", title: "Perevodnoy Durak", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Passing Durak variant.",
  howToPlay: "Perevodnoy Durak ('Passing Fool') is a Russian Durak variant where the defender, instead of beating the attack, may pass it on to the next player by adding a card of the same rank. The pass-on shifts the role of defender to the next player around the table.\n\nIn this single-player version you face the CPU across six rounds. Each round both players hold six cards and a trump suit is named. You may attack, defend, or pass; the CPU plays optimally to drain your hand.\n\nPassing is powerful — you skip having to beat a tough card and force the CPU to deal with it. But you must hold a same-rank card to pass, so it is not always possible. The first to empty their hand wins twenty points plus a five-point bonus per CPU card.\n\nPerevodnoy Durak is the second most common Russian Durak variant after Podkidnoy. It is faster and more strategic because of the pass mechanic. A strong total across six rounds is around seventy points. Press Play to begin the next pass.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PerevodnoyDurakShedSettings),
  reducer, isTerminal, 
  hint: (state: PerevodnoyDurakShedState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (state.phase === "ready") return { selector: '[data-testid="hint-target-perevodnoy-durak-shed-play"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-perevodnoy-durak-shed-next"]', pulses: 3 };
    return null;
  },
  component: PerevodnoyDurakShedGame,
};
