import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { RistiklappiShedState, RistiklappiShedAction, RistiklappiShedSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const RistiklappiShedGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.RistiklappiShedGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const ristiklappiShedPlugin: GamePlugin<RistiklappiShedState, RistiklappiShedAction, typeof settings> = {
  id: "ristiklappi-shed", title: "Ristiklappi", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Finnish shedding game.",
  howToPlay: "Ristiklappi is a Finnish shedding card game popular in family homes and ski lodges across Finland. Players in turn lead a card and the next player must beat it with a higher card of the same suit, or play a trump. If you cannot beat or trump, you take the trick and lead next.\n\nIn this single-player version you face the CPU across six rounds. Each round both players are dealt thirteen cards and a trump suit is named. The first to empty their hand wins the round for twenty points plus a five-point bonus per CPU card remaining.\n\nThe Finnish word ristiklappi roughly translates to 'cross-clap' referring to the snap of beating a trick. The game has a relaxed feel and is often played by three or four generations together at the dinner table. Across six rounds a strong total is around seventy points; six wins in a row is rare.\n\nRistiklappi is little known outside Finland. Press Play and beat the next card.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as RistiklappiShedSettings),
  reducer, isTerminal, 
  hint: (state: RistiklappiShedState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (state.phase === "ready") return { selector: '[data-testid="hint-target-ristiklappi-shed-play"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-ristiklappi-shed-next"]', pulses: 3 };
    return null;
  },
  component: RistiklappiShedGame,
};
