import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SonicSettings { questions: "10" | "20" | "30"; }
export interface SonicState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SonicAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What species is Sonic?", choices: ["Hedgehog","Squirrel","Mouse","Fox"], correct: 0 },
  { question: "What color is Sonic?", choices: ["Blue","Red","Green","Yellow"], correct: 0 },
  { question: "Who is Sonic's mustachioed scientist nemesis?", choices: ["Dr. Eggman (Robotnik)","Shadow","Metal Sonic","Big the Cat"], correct: 0 },
  { question: "How many tails does Sonic's sidekick Tails have?", choices: ["Two","One","Three","Four"], correct: 0 },
  { question: "What species is Tails?", choices: ["Two-tailed fox","Cat","Squirrel","Hedgehog"], correct: 0 },
  { question: "In what year did the original Sonic the Hedgehog release on the Mega Drive/Genesis?", choices: ["1991","1989","1993","1995"], correct: 0 },
  { question: "On which 16-bit Sega console did Sonic 1 originally launch?", choices: ["Sega Genesis (Mega Drive)","Master System","Game Gear","Saturn"], correct: 0 },
  { question: "What species is the rival treasure-hunter Knuckles?", choices: ["Echidna","Hedgehog","Bat","Cat"], correct: 0 },
  { question: "What gem does Knuckles guard on Angel Island?", choices: ["Master Emerald","Triforce","Phantom Ruby","Time Stone"], correct: 0 },
  { question: "How many Chaos Emeralds must Sonic collect to become Super Sonic?", choices: ["Seven","Six","Five","Eight"], correct: 0 },
  { question: "Who is the pink hedgehog who has a long-running crush on Sonic?", choices: ["Amy Rose","Cream","Rouge","Blaze"], correct: 0 },
  { question: "What dark, edgy anti-hero hedgehog debuted in Sonic Adventure 2?", choices: ["Shadow the Hedgehog","Silver","Mephiles","Infinite"], correct: 0 },
  { question: "What 1991 Sega slogan compared its console to its rival?", choices: ["Genesis Does What Nintendon't","Sega Rules","Welcome to the Next Level","Power Up"], correct: 0 },
  { question: "What is the name of the floating land Knuckles inhabits?", choices: ["Angel Island","South Island","Westside Island","Little Planet"], correct: 0 },
  { question: "Which 1994 Genesis title introduced Knuckles as a playable character?", choices: ["Sonic & Knuckles","Sonic 3","Sonic CD","Sonic 2"], correct: 0 },
  { question: "What lock-on technology let Sonic & Knuckles connect to Sonic 3?", choices: ["Lock-On Technology","Game Genie","Cartridge Link","Multitap"], correct: 0 },
  { question: "What 1993 Sega CD game introduced Amy Rose and Metal Sonic?", choices: ["Sonic CD","Sonic 2","Sonic 3","Sonic R"], correct: 0 },
  { question: "What 3D Dreamcast launch title rebooted Sonic in 1998?", choices: ["Sonic Adventure","Sonic Adventure 2","Sonic Heroes","Sonic Unleashed"], correct: 0 },
  { question: "What 2008 game turns Sonic into a \"Werehog\" at night?", choices: ["Sonic Unleashed","Sonic Colors","Sonic Generations","Sonic Lost World"], correct: 0 },
  { question: "Which 2011 game pits modern Sonic against Classic Sonic?", choices: ["Sonic Generations","Sonic Forces","Sonic Heroes","Sonic Lost World"], correct: 0 },
  { question: "What 2017 throwback 2D Sonic game was developed by Christian Whitehead's team?", choices: ["Sonic Mania","Sonic Forces","Sonic Frontiers","Sonic Origins"], correct: 0 },
  { question: "What 2022 open-zone Sonic game introduced the Starfall Islands?", choices: ["Sonic Frontiers","Sonic Forces","Sonic Mania","Sonic Superstars"], correct: 0 },
  { question: "Which actor voiced Sonic in the 2020 live-action film?", choices: ["Ben Schwartz","Jim Carrey","Idris Elba","James Marsden"], correct: 0 },
  { question: "Which actor played Dr. Robotnik in the 2020 Sonic film?", choices: ["Jim Carrey","Ben Schwartz","Idris Elba","Keanu Reeves"], correct: 0 },
  { question: "Who voices Shadow in the 2024 Sonic the Hedgehog 3 film?", choices: ["Keanu Reeves","Jim Carrey","Idris Elba","Ben Schwartz"], correct: 0 },
  { question: "What yellow rings serve as Sonic's primary collectible and shield?", choices: ["Rings","Coins","Stars","Shards"], correct: 0 },
  { question: "What time-travel-themed Sonic game features Little Planet?", choices: ["Sonic CD","Sonic 3","Sonic Generations","Sonic Mania"], correct: 0 },
  { question: "What four-team game introduced Team Sonic, Dark, Rose, and Chaotix?", choices: ["Sonic Heroes","Sonic Adventure","Sonic Battle","Sonic Riders"], correct: 0 },
  { question: "What black-and-red robotic doppelganger of Sonic was built by Eggman?", choices: ["Metal Sonic","Mecha Sonic","Silver Sonic","Shadow Android"], correct: 0 },
  { question: "Who composed the music for Sonic 1 with the band Dreams Come True?", choices: ["Masato Nakamura","Yuzo Koshiro","Jun Senoue","Tomoya Ohtani"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SonicSettings): SonicState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SonicState, action: SonicAction): SonicState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SonicState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
