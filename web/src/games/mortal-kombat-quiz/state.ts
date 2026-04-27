import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MortalKombatSettings { questions: "10" | "20" | "30"; }
export interface MortalKombatState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MortalKombatAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "MK developer?", choices: ["Midway / NetherRealm","Capcom","SNK","Sega"], correct: 0 },
  { question: "First MK year?", choices: ["1992","1990","1995","1988"], correct: 0 },
  { question: "MK creators?", choices: ["Boon & Tobias","Mishima","Ono","Aoki"], correct: 0 },
  { question: "Special finishing move?", choices: ["Fatality","Special","Combo","Throw"], correct: 0 },
  { question: "Yellow ninja?", choices: ["Scorpion","Sub-Zero","Reptile","Ermac"], correct: 0 },
  { question: "Blue ninja?", choices: ["Sub-Zero","Scorpion","Reptile","Ermac"], correct: 0 },
  { question: "Scorpion's catchphrase?", choices: ["GET OVER HERE!","Toasty","Excellent","Mortal Kombat"], correct: 0 },
  { question: "Liu Kang is the?", choices: ["Earthrealm hero","Villain","Outworld lord","Sorcerer"], correct: 0 },
  { question: "Shao Kahn rules?", choices: ["Outworld","Earthrealm","Edenia","Netherrealm"], correct: 0 },
  { question: "Raiden is the god of?", choices: ["Thunder","Fire","Wind","Earth"], correct: 0 },
  { question: "MK 2011 reboot known as?", choices: ["MK9","MKX","MK11","MK1"], correct: 0 },
  { question: "MKX year?", choices: ["2015","2011","2018","2020"], correct: 0 },
  { question: "MK11 year?", choices: ["2019","2017","2021","2023"], correct: 0 },
  { question: "MK1 reboot year?", choices: ["2023","2021","2024","2025"], correct: 0 },
  { question: "Quan Chi is a?", choices: ["Sorcerer","Ninja","Warrior","Robot"], correct: 0 },
  { question: "Goro is a?", choices: ["Shokan (4 arms)","Centaur","Demon","Dragon"], correct: 0 },
  { question: "Kano's eye?", choices: ["Cybernetic red","Blue","Green","Black"], correct: 0 },
  { question: "Sonya Blade is?", choices: ["Special Forces","Police","Civilian","Pilot"], correct: 0 },
  { question: "Johnny Cage profession?", choices: ["Action movie star","Cop","Doctor","Lawyer"], correct: 0 },
  { question: "Jax has?", choices: ["Cybernetic arms","Eye","Legs","Wings"], correct: 0 },
  { question: "Mileena's bite?", choices: ["Sharp teeth","None","Poison","Stone"], correct: 0 },
  { question: "Kitana's weapon?", choices: ["Steel fans","Sword","Gun","Spear"], correct: 0 },
  { question: "Reptile is?", choices: ["Saurian","Human","Ghost","Robot"], correct: 0 },
  { question: "Test your might minigame?", choices: ["Yes","No","Once","Sometimes"], correct: 0 },
  { question: "Babality finisher?", choices: ["Turns into baby","Throws","Kicks","Punches"], correct: 0 },
  { question: "Friendship finisher?", choices: ["Yes","No","Sometimes","Just MK1"], correct: 0 },
  { question: "Animality finisher?", choices: ["Turns into animal","Throws","Kicks","Punches"], correct: 0 },
  { question: "Movie 1995 main star?", choices: ["Liu Kang","Scorpion","Sub-Zero","Raiden"], correct: 0 },
  { question: "Cyrax is a?", choices: ["Cyborg ninja","Human","Ghost","Sorcerer"], correct: 0 },
  { question: "FINISH HIM/HER said by?", choices: ["Announcer","Player","Loser","Computer"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: MortalKombatSettings): MortalKombatState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MortalKombatState, action: MortalKombatAction): MortalKombatState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MortalKombatState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
