import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ParodyOpolyState, ParodyOpolyAction, ParodyOpolySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ParodyOpolyGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const parodyOpolyPlugin: GamePlugin<ParodyOpolyState, ParodyOpolyAction, typeof settings> = {
  id: "parody-opoly", title: "Parody Opoly", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Parody-Monopoly themed clone trivia. Identify which Opoly variant uses these cards.",
  howToPlay: "Parody Opoly is a trivia about the dozens of theme-Monopoly clones released over the years. Twelve rounds describe a property name, action card, or board theme and ask which Opoly variant it belongs to. Pick from four candidates, ten points each, 120 max. Variants covered include Catopoly, Dogopoly, Coffeopoly, Disney-Opoly, Star-Wars-Opoly, Pokemon-Opoly, Doctor-Whoopoly, and the original Monopoly. Each variant rebrands the standard board (Boardwalk, Park Place) into themed property names. Disney-Opoly has Cinderella's Castle as the Boardwalk equivalent; Catopoly has Cat-Bed; Pokemon-Opoly has Cinnabar Island. Hardcore Monopoly-clone collectors hit 100+. Casual quizzers aim for 60-80. Run takes around two minutes. Submit each guess, Next to advance. The Opoly market is a fascinating niche of licensed and parody board games and this quiz invites you into its weirdness.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ParodyOpolySettings),
  reducer, isTerminal, component: ParodyOpolyGame,
};
