import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LicitovanyMariasGame } from "./Game.js";

const settings = {} as const;
type S = SettingsOf<typeof settings>;
type GAction = { type: "play"; cardId: string };

export const licitovanyMariasPlugin: GamePlugin<GState, GAction, typeof settings> = {
  id: "licitovany-marias",
  title: "Licitovaný Mariáš",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Mariáš variant with bidding for higher contracts.",
  howToPlay: "Licitovaný Mariáš is the bidding-up variant of Czech Mariáš, where the declarer bids for higher contracts (such as 'sevens' or 'hundred') in exchange for bigger rewards or penalties. In this 1v1 simulator you take on the role of the declarer who must take more tricks than usual: the bot represents the defenders.\n\nClubs are trump. Follow the led suit if you can; if not, any card may be played, but only trumps or led-suit cards can win the trick. The highest trump wins; otherwise the highest led-suit card wins. Ace is high, then king down to two.\n\nThe bid-up contract here requires you to take nine or more of the thirteen tricks — a stiff challenge that demands strong trump and ace control. The bot plays defensively: cheap captures, dumps elsewhere. Click any legal card; the bot answers immediately. Licitovaný rewards seeds with concentrated trump density and a side-suit ace or two — anything less and the bid usually fails.",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed),
  reducer,
  isTerminal,
  component: LicitovanyMariasGame,
};
