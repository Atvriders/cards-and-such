import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TarocchiState, TarocchiAction, TarocchiSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TarocchiGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const tarocchiPlugin: GamePlugin<TarocchiState, TarocchiAction, typeof settings> = {
  id: "tarocchi", title: "Tarocchi", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Italian Tarot trick-taking family — the original Tarot games.",
  howToPlay: "Tarocchi is the broad family of Italian Tarot trick-taking games and the historical ancestor of all modern Tarot card play (occult Tarot reading came centuries later). Variants include Tarocco Bolognese, Siciliano, and Piedmontese. The deck has four suits plus twenty-two trionfi trumps. Players follow suit if able, otherwise must trump if able, and tricks are scored using a counting system that rewards specific point cards (kings, queens, the matto fool, and the highest trumps). In this six-round one-on-one duel you click Play Round to deal twelve-card hands and resolve the play. Strategy: capture point cards aggressively by leading with high trumps; conserve the matto for trump-thin hands. Save kings for the final tricks since they are the most valuable suit cards. Aim for at least three rounds where you out-score the CPU for a respectable Tarocchi total.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TarocchiSettings),
  reducer, isTerminal, component: TarocchiGame,
};
