import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CybersecQuizState, CybersecQuizAction, CybersecQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CybersecQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const cybersecQuizPlugin: GamePlugin<CybersecQuizState, CybersecQuizAction, typeof settings> = {
  id:"cybersec-quiz", title:"Cybersecurity Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of encryption, attacks, and defenses.",
  howToPlay:"Cybersecurity Quiz challenges you on the field of digital defense: encryption algorithms, common attack types, defense strategies, famous breaches, and security concepts every developer and user should understand. Topics include phishing, SQL injection, ransomware, public-key cryptography, two-factor authentication, and the Equifax/SolarWinds incidents.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock \u2014 fast, accurate answers earn the highest score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Whether you're a security pro, an aspiring red-teamer, or just someone who wants to stay safe online, this quiz will sharpen your security thinking!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CybersecQuizSettings),
  reducer,isTerminal,component:CybersecQuizGame,
};
