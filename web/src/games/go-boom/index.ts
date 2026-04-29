import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GoBoomState, GoBoomAction, GoBoomSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { GoBoomGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const goBoomPlugin: GamePlugin<GoBoomState, GoBoomAction, typeof settings> = {
  id: "go-boom", title: "Go Boom", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Shedding/trick hybrid: high card wins each Boom round.",
  howToPlay: "Go Boom is an old-school shedding-and-trick hybrid card game. In this mini-version, each round is one trick: you and the CPU each play a card, and the higher card wins the round. There's no shedding mechanic to manage.\n\nEach round, you and the CPU each draw one card. Higher rank wins. Aces are highest (13), twos lowest (1). Suit is ignored — no trump.\n\nScoring: round win awards 10 points. Tie awards 4 sympathy points. Loss awards zero.\n\nTen rounds total. Expected score 45-65 points; lucky play reaches 75+.\n\nGo Boom traditionally has each player deal cards in turn that match either suit or rank of the lead, and the round-trick winner leads the next \"Boom.\" First to shed all cards yells \"Boom!\" and wins. This mini-version keeps the round-by-round trick spirit and the cheery name without the must-follow-rule pressure. Good for kids learning trick-taking concepts who want a stripped-down version with no bookkeeping.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GoBoomSettings),
  reducer, isTerminal, component: GoBoomGame,
};
