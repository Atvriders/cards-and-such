import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CheatingMothCardState, CheatingMothCardAction, CheatingMothCardSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CheatingMothCardGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const cheatingMothCardPlugin: GamePlugin<CheatingMothCardState, CheatingMothCardAction, typeof settings> = {
  id: "cheating-moth-card", title: "Cheating Moth", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Cheating Moth (Schummelhummel) trivia. Match card numbers and Cheater rule actions.",
  howToPlay: "Cheating Moth (Schummelhummel) is a card game where actively cheating is part of the rules — but only via specific allowed mechanics. Twelve rounds quiz you on card values and Cheater-rule actions in the game. Pick from four answer choices, ten points each, 120 max. Cheating Moth was designed by Emely & Lukas Brand and published in 2011. Each player has hand cards and tries to dump them onto the discard pile, but a hidden Cheater card lets you legitimately drop cards from your hand without playing them — provided the Guard doesn't catch you. Card values are 1-5, with special bug cards (Spider, Beetle, etc.). Casual quizzers should hit 60-80; serious card-game enthusiasts aim for 100+. Run takes about two minutes. Submit each pick and Next to advance. Cheating Moth is a Spiel des Jahres nominee and a darling of the gateway-card-game community.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CheatingMothCardSettings),
  reducer, isTerminal, hint: (state: CheatingMothCardState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-cheating-moth-card-answer-0"]', pulses: 3 } : null, component: CheatingMothCardGame,
};
