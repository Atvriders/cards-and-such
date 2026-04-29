import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { VoliMariasGame } from "./Game.js";

const settings = {} as const;
type S = SettingsOf<typeof settings>;
type GAction = { type: "play"; cardId: string };

export const voliMariasPlugin: GamePlugin<GState, GAction, typeof settings> = {
  id: "voli-marias",
  title: "Voli Mariáš",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Czech Mariáš variant where declarer picks contract type.",
  howToPlay: "Voli Mariáš (Choice Mariáš) is the variant where the declarer 'picks' (volí) the contract type before play begins — choosing trump, no-trump, or sometimes a special contract. This 1v1 simulator standardizes on the trump contract with clubs as trump suit; you play thirteen cards each.\n\nFollow the led suit if you can. If you cannot, any card may be played, but only trumps or led-suit cards can win the trick. The highest trump wins outright; otherwise the highest led-suit card wins. Ace is high, then king down to two.\n\nWin if you take eight or more of the thirteen tricks. The 'choice' aspect of Voli is abstracted into a fixed trump contract, simplifying the simulator while preserving the trick-taking feel. The bot defends with a measured baseline: cheap wins, dumps where possible. Click any legal card; the bot answers immediately and the trick resolves. Voli Mariáš rewards seeds with strong trumps and ace coverage in at least two side suits.",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed),
  reducer,
  isTerminal,
  component: VoliMariasGame,
};
