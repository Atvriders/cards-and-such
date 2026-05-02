import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PokemonState, PokemonAction, PokemonSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PokemonQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const pokemonQuizPlugin: GamePlugin<PokemonState, PokemonAction, typeof settings> = {
  id:"pokemon-quiz", title:"Pokemon Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Pokemon: trainers, types, gyms, and the original 151.",
  howToPlay:"Pokemon Quiz tests your knowledge of Game Freak's monster-collecting RPG juggernaut, from the original 1996 Red/Blue games through the latest Scarlet/Violet entries. Questions span Kanto's original 151 through every modern generation — trainers, types, evolutions, legendary Pokemon, gym leaders, Elite Four, Team Rocket, Mega Evolution, Z-moves, Dynamax, the anime Ash and Pikachu, and the wider phenomenon.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red.\n\nChoose 10, 20, or 30 questions in Settings. Gotta know 'em all!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PokemonSettings),
  reducer,isTerminal,
  hint: (state: PokemonState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:PokemonQuizGame,
};
