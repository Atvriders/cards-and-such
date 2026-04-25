import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type SpoonsState, type SpoonsAction } from "./state.js";
import { SpoonsGame } from "./Game.js";

export const spoonsSettings = {
  opponents: { kind: "enum" as const, label: "Opponents", options: ["1", "2", "3"] as const, default: "2" as const },
} as const;

export const spoonsPlugin: GamePlugin<SpoonsState, SpoonsAction, typeof spoonsSettings> = {
  id: "spoons",
  title: "Spoons",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Collect four of a kind then grab a spoon before the others do!",
  howToPlay: `Spoons is a lightning-fast matching-and-grabbing card game for 2-4 players. Each player starts with four cards and three lives. A row of spoons is placed in the centre — always one fewer spoon than the number of players.

On each pass everyone simultaneously picks one card from their hand and passes it face-down to the player on their left, then picks up the card that arrived from their right. Keep passing until someone collects four of a kind.

The instant a player holds four of the same rank they may grab a spoon from the table. Once any spoon is taken, everyone else can also try to grab one — the player left without a spoon loses a life. Bots react randomly: some will sneak-grab even without four of a kind!

A player eliminated from the spoons pile (no spoon grabbed) loses a life. Lose all three lives and you're out. The last player standing wins.

Click a card in your hand to pass it left each turn. When the Grab phase begins, hit the Grab button as fast as you can. Aim to collect pairs and triples first, then hope the right card arrives.

Scoring: 500 points for winning; 50 points per remaining life if you lose.`,
  settings: spoonsSettings,
  initialState,
  reducer,
  isTerminal,
  component: SpoonsGame,
};
