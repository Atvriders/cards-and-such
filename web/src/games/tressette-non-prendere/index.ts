import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TressetteNonPrendereGame } from "./Game.js";

const settings = {} as const;
type S = SettingsOf<typeof settings>;
type GAction = { type: "play"; cardId: string };

export const tressetteNonPrenderePlugin: GamePlugin<GState, GAction, typeof settings> = {
  id: "tressette-non-prendere",
  title: "Tressette a Non Prendere",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Misère Tressette: aim to take as few tricks as possible.",
  howToPlay: "Tressette a Non Prendere is the misère branch of the classic Italian trick-taking game: your goal is to take as FEW tricks as possible. In this 1v1 simulator you and the bot each receive thirteen cards. No trump applies — only following suit matters.\n\nFollow the led suit if you can; if you cannot, your card cannot win the trick. The highest card of the led suit takes the trick (ace high, then king, queen, jack, ten down to two). Win the round by leaving the bot with at least nine tricks — that is, taking five or fewer yourself.\n\nMisère strategy inverts everything: you WANT to lose tricks, so play your low cards aggressively, dump high cards when forced (especially the ace), and keep junk in trick-trapping suits. The bot does not know your goal, so its mid-tier defense will sometimes accidentally hand you tricks. Click any legal card; the bot answers immediately and the trick resolves.",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed),
  reducer,
  isTerminal,
  component: TressetteNonPrendereGame,
};
