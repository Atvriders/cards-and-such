import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HappyFamiliesState, HappyFamiliesAction, HappyFamiliesSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const HappyFamiliesGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.HappyFamiliesGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const happyFamiliesPlugin: GamePlugin<HappyFamiliesState, HappyFamiliesAction, typeof settings> = {
  id: "happy-families", title: "Happy Families", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Victorian family-set collection card game — collect all four family members.",
  howToPlay: "Happy Families is a Victorian-era card game where the deck consists of forty-four cards depicting eleven families of four members each (Mr Bun the Baker, Mrs Bun the Baker's Wife, Master Bun the Baker's Son, Miss Bun the Baker's Daughter, etc.). Players take turns asking opponents for a specific family member ('Mr Bun the Baker, please'). If the opponent holds the card they hand it over; otherwise the asker loses their turn. The goal is to collect complete families — four cards of one family — and the player with the most families wins. In this one-on-one CPU duel across six rounds, click Play Round to deal and simulate the asking. Strategy: ask for cards in families where you already hold three members. Track CPU requests carefully to deduce their holdings. Aim for at least three round wins and a total of ten-plus families for a strong Happy Families finish.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as HappyFamiliesSettings),
  reducer, isTerminal, hint: (state: HappyFamiliesState): HintTarget | null => (state.phase === "ready" ? { selector: '[data-testid="hint-target-happy-families-primary"]', pulses: 3 } : null), component: HappyFamiliesGame,
};
