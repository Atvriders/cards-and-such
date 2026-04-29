import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GState, GAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { IndianMarriageRGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const indianMarriageRPlugin: GamePlugin<GState, GAction, typeof settings> = {
  id: "indian-marriage-r", title: "Indian Marriage", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Indian Rummy with Marriage-of-three bonus scoring.",
  howToPlay: "Indian Marriage is a rummy variant from the Indian subcontinent featuring 'Marriage' bonuses — three of the joker-card ranks together gain extra points. In this simulator, the regular meld engine auto-detects sets and runs in your nine-card hand. Five rounds are played.\n\nA set is three or more cards of the same rank; a run is three or more consecutive same-suit cards. Each meld scores twenty base points plus five for every card past three. Deadwood — leftover cards outside any meld — includes aces at one, face cards ten, others pip value, and bare-hand rounds yield only a tiny consolation.\n\nGoing out clean (zero deadwood) adds twenty-five-point Marriage-clearance bonus. Across five rounds, expected totals run sixty to one-seventy. Click 'Auto-score' each round and 'Next' to deal again. Marriage rewards seeds where face-card triples appear or where small ranks string together — a 'three-card marriage' might appear naturally on lucky seeds.",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, { dummy: false }),
  reducer, isTerminal, component: IndianMarriageRGame,
};
