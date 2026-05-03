import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BrazilianCanastaRState, BrazilianCanastaRAction, BrazilianCanastaRSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const BrazilianCanastaRGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.BrazilianCanastaRGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const brazilianCanastaRPlugin: GamePlugin<BrazilianCanastaRState, BrazilianCanastaRAction, typeof settings> = {
  id: "brazilian-canasta-r", title: "Brazilian Canasta", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Progressive-target Canasta variant with escalating thresholds.",
  howToPlay: "Brazilian Canasta is a Canasta variant where the minimum-meld threshold rises round by round, forcing players to commit larger initial melds late in the game. The variant rewards players who can hold cards for big payoffs.\n\nIn this single-player drill, five rounds are played from an eleven-card hand. The engine auto-melds your hand into sets and runs. Aces count one for value, pip cards face value, faces count ten. Long melds are particularly valuable — a seven-card canasta-equivalent pays forty-two.\n\nA matched meld pays eighteen base plus six per extra card. With no melds you collect a deadwood-tied consolation. Going out (clearing hand) adds thirty bonus.\n\nExpected score across five rounds is sixty-five to one hundred fifteen. Brazilian's escalating-threshold flavour means later rounds reward players who held off making small melds in favour of bigger ones. Aim for at least one long sequence and two other melds; that mix puts you on track for the high end.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BrazilianCanastaRSettings),
  reducer, isTerminal, 
  hint: (state: BrazilianCanastaRState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (state.phase === "play") return { selector: '[data-testid="hint-target-brazilian-canasta-r-play"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-brazilian-canasta-r-next"]', pulses: 3 };
    return null;
  },
  component: BrazilianCanastaRGame,
};
