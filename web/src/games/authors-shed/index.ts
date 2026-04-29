import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { AuthorsShedState, AuthorsShedAction, AuthorsShedSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AuthorsShedGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const authorsShedPlugin: GamePlugin<AuthorsShedState, AuthorsShedAction, typeof settings> = {
  id: "authors-shed", title: "Authors (Shedding)", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Go Fish for complete sets.",
  howToPlay: "Authors is the classic Victorian children's card game where players ask each other for cards trying to collect quartets — four cards of the same rank. It is a Go Fish variant where the goal is books rather than emptying the hand, but in this adaptation we play it as a shedding race.\n\nYou and the CPU are dealt seven cards each. Each round you ask whether the CPU has a particular rank; if yes, you take it (shedding two cards become a pair, four become a book and clear). If no, you draw and the turn passes.\n\nWin the round by collecting more books than the CPU. Each round is worth twenty points for a win plus five per book. Six rounds total. Authors rewards memory — note when the CPU asks for ranks and respond by guarding those.\n\nA good total is around eighty. Sweeping every round is rare. The game is named because the original deck featured author portraits — Dickens, Twain, Longfellow — and was used to teach children literary trivia in the 1860s.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AuthorsShedSettings),
  reducer, isTerminal, component: AuthorsShedGame,
};
