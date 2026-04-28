import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { NotoriousBountyState, NotoriousBountyAction, NotoriousBountySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { NotoriousBountyGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const notoriousBountyPlugin: GamePlugin<NotoriousBountyState, NotoriousBountyAction, typeof settings> = {
  id: "notorious-bounty",
  title: "Notorious Bounty",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Solo journaling homage — bounty hunter tracks fugitives through clue-cards.",
  howToPlay: "Notorious Bounty is a solo journaling homage to Mark Cleveland's Notorious, a Wretched & Alone-style bounty-hunter game where the protagonist tracks a fugitive across a sprawling map using clue cards and dice rolls. The original is famous for its sparse Western tone and unforgiving outcomes.\n\nAcross ten entries you make hunter's-choices: where to ride, who to interrogate, when to draw. Each prompt offers four choices A-D; each assigns a base reward plus 0-20 of variance via the seeded mulberry32 oracle.\n\nThere is no built-in success; the chase itself is the score. Aggressive paths can reward big, but cautious paths chip away steadily. Either way, the dust never settles for long.\n\nImagine the creak of saddle leather, the heat of noonday sun, the eyes of a town that has seen too many strangers. You are owed a name and a coin, and the trail is hot. Ride.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as NotoriousBountySettings),
  reducer, isTerminal, component: NotoriousBountyGame,
};
