import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AeonsEndMagesState, AeonsEndMagesAction, AeonsEndMagesSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AeonsEndMagesGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const aeonsEndMagesPlugin: GamePlugin<AeonsEndMagesState, AeonsEndMagesAction, typeof settings> = {
  id: "aeons-end-mages",
  title: "Aeon's End: Mages Awakening",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Aeon's End deck-builder variant — no-shuffle mage deck order management.",
  howToPlay: "Aeon's End: Mages Awakening adapts the no-shuffle deck builder. You play a mage alongside an AI mage; each round combined dice represent the spells cast that turn. Hit 70 over ten rounds to defeat the nemesis — a 50-point Mage Awakening bonus is added.\n\nPress Play Round to draw and cast. Then press Next Round, or Finish on round 10.\n\nIn the box, the order of cards in your discard matters because there is no shuffle; this distillation honours the deck-management feel by giving you stable dice rolls each round. Your AI mage has their own deck, their own breaches, and their own gem economy. Together you face an ancient horror. Plan carefully, cast loudly, save Gravehold.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AeonsEndMagesSettings),
  reducer, isTerminal, component: AeonsEndMagesGame,
};
