import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CruelState, CruelAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Cruel } from "./Cruel.js";

export const cruelSettings = {} as const;

type CruelSettings = SettingsOf<typeof cruelSettings>;

export const cruelPlugin: GamePlugin<CruelState, CruelAction, typeof cruelSettings> = {
  id: "cruel",
  title: "Cruel",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "One deck, 12 tableau piles, Aces pre-placed. Build down same suit — no stock.",
  howToPlay: `Move all 52 cards to the four foundations to win.

Deal: All four Aces are placed immediately on the foundations. The remaining 48 cards are dealt face-up into 12 tableau piles of four cards each. There is no stock and no redeal.

Foundations: Build each foundation up in suit from Ace to King (A→2→3→…→K). Only the top card of each tableau pile may be moved.

Tableau: Build down in the same suit only — a 6♠ may only be placed on a 7♠. Only single cards can be moved. Empty tableau columns cannot be filled; once a pile is cleared it stays empty.

Goal: Transfer all 48 remaining cards to the foundations by building same-suit sequences.

Strategy: This game is notoriously difficult — many deals are unwinnable. Prioritize freeing cards that unblock sequences. Look several moves ahead before moving a card to the foundation, since you cannot return it to the tableau. Try to keep at least one suit advancing steadily so you can create space. Even with optimal play, most deals cannot be completed.`,
  settings: cruelSettings,
  initialState: (seed: number, settings: CruelSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Cruel,
};
