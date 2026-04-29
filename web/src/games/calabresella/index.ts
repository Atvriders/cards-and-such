import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CalabresellaGame } from "./Game.js";

const settings = {} as const;
type S = SettingsOf<typeof settings>;
type GAction = { type: "play"; cardId: string };

export const calabresellaPlugin: GamePlugin<GState, GAction, typeof settings> = {
  id: "calabresella",
  title: "Calabresella",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Three-handed Neapolitan trick-taker with declarer vs opponents.",
  howToPlay: "Calabresella is the three-handed Neapolitan trick-taking game where the declarer plays alone against the two other players. In this 1v1 simulator you become the declarer and the bot represents the combined opposition; clubs are trump, the suit traditionally favored in Calabresella's southern Italian origins.\n\nFollow the led suit if you can. If you cannot, you may play any card, but only trumps and led-suit cards can win the trick. The highest trump beats everything; otherwise the highest led-suit card wins. Ace is high (rank fourteen), then king down to two.\n\nWin if you take eight or more of the thirteen tricks. As declarer you bear the burden — strong trumps and ace control are essential. The bot defends with a measured approach: cheap wins where possible, dumps elsewhere. Click any legal card; the bot responds immediately. Calabresella rewards seeds with concentrated trump strength and ace coverage in side suits.",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed),
  reducer,
  isTerminal,
  component: CalabresellaGame,
};
