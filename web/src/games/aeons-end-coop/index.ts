import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AeonsEndCoopState, AeonsEndCoopAction, AeonsEndCoopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AeonsEndCoopGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const aeonsEndCoopPlugin: GamePlugin<AeonsEndCoopState, AeonsEndCoopAction, typeof settings> = {
  id: "aeons-end-coop",
  title: "Aeon's End Co-op",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Cooperative deckbuilder homage — mages defend against the nemesis.",
  howToPlay: "Aeon's End Co-op tributes the Action Phase Games hit by Kevin Riley, where mages defend Gravehold against incoming Nemeses. Across ten rounds, you and an AI mage ally pool rolls to channel breaches, cast spells, and damage the nemesis. Reach team score 70 to survive the assault and earn a 50-point bonus.\n\nPress Play Round each turn. Both dice resolve and the sum joins your team score. Press Next Round to continue, Finish on round 10.\n\nThe original Aeon's End is famous for its no-shuffle deck mechanic and asymmetric mages with unique breach orders. This compact adaptation discards deckbuilding entirely; instead, every round is a shared dice attack. There's no individual scoring — your mages live or die together.\n\nThe thematic urgency of Aeon's End — the slow attrition, the boss attacks — is preserved by the team-vs-target structure. Survive together or fail together; the nemesis won't tell the difference.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AeonsEndCoopSettings),
  reducer, isTerminal, component: AeonsEndCoopGame,
};
