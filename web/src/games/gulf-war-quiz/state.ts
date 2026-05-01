import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface GulfWarQuizSettings { questions: "10" | "20" | "30"; }
export interface GulfWarQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type GulfWarQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What country invaded Kuwait in August 1990?", choices: ["Iran","Iraq","Saudi Arabia","Syria"], correct: 1 },
  { question: "Who was Iraq's leader during the Gulf War?", choices: ["Saddam Hussein","Hosni Mubarak","Hafez al-Assad","Yasser Arafat"], correct: 0 },
  { question: "What was the U.S.-led coalition operation called?", choices: ["Operation Desert Shield","Operation Desert Storm","Both phases","Operation Just Cause"], correct: 2 },
  { question: "What U.S. president led the Gulf War coalition?", choices: ["Reagan","George H.W. Bush","Clinton","George W. Bush"], correct: 1 },
  { question: "What U.S. general commanded coalition forces?", choices: ["Powell","Schwarzkopf","Franks","Petraeus"], correct: 1 },
  { question: "What U.S. general was Joint Chiefs Chairman?", choices: ["Powell","Schwarzkopf","Marshall","Shalikashvili"], correct: 0 },
  { question: "In what year did the air war begin?", choices: ["1990","1991","1992","1989"], correct: 1 },
  { question: "How long did the ground war last?", choices: ["100 days","100 hours","30 days","6 months"], correct: 1 },
  { question: "What was the name of the air-defense system Iraq used against coalition aircraft?", choices: ["S-300","SA-2/SA-3","Patriot","Roland"], correct: 1 },
  { question: "What was the U.S. anti-missile system that intercepted Scuds?", choices: ["Patriot","Stinger","Aegis","Sentinel"], correct: 0 },
  { question: "What missile did Iraq fire on Israel and Saudi Arabia?", choices: ["Scud","Tomahawk","Cruise","R-17"], correct: 0 },
  { question: "What was the highway leading from Kuwait nicknamed after retreating Iraqi forces were attacked?", choices: ["Highway of Death","Mile of Doom","Death Road","Final Road"], correct: 0 },
  { question: "What was the U.S. tank that dominated Iraqi armor?", choices: ["M1 Abrams","M60","M48","Sherman"], correct: 0 },
  { question: "What was the U.S. attack helicopter star of the war?", choices: ["Apache AH-64","Cobra","Black Hawk","Kiowa"], correct: 0 },
  { question: "What Iraqi tanks were largely destroyed?", choices: ["T-72","T-55","T-62","All used by Iraq"], correct: 3 },
  { question: "What stealth fighter played a major role?", choices: ["F-117 Nighthawk","F-22","B-2","F-15E"], correct: 0 },
  { question: "What U.S. aircraft carrier carried strike aircraft?", choices: ["Multiple were deployed","USS Nimitz","USS Enterprise","USS Saratoga"], correct: 0 },
  { question: "What was the U.S.-led airlift to Saudi Arabia called?", choices: ["Operation Desert Shield","Operation Provide Hope","Operation Sea Angel","Operation Restore Hope"], correct: 0 },
  { question: "What environmental disaster did retreating Iraqi forces cause?", choices: ["Oil well fires","Chemical spill","Forest fires","Water contamination"], correct: 0 },
  { question: "What infamous oil spill resulted in the Gulf?", choices: ["Kuwait oil spill","Persian Gulf oil spill","Both names used","Saddam Spill"], correct: 2 },
  { question: "What body authorized force against Iraq?", choices: ["UN Security Council Resolution 678","NATO","Arab League","UN General Assembly"], correct: 0 },
  { question: "What U.S. submarine launched cruise missiles at Iraq?", choices: ["Tomahawk-equipped subs","SSN-21","Multiple did","All were involved"], correct: 2 },
  { question: "What Saudi Arabian city was the main coalition staging area?", choices: ["Riyadh","Dhahran","Jeddah","Mecca"], correct: 1 },
  { question: "What Iraqi elite force engaged coalition?", choices: ["Republican Guard","Fedayeen","Mukhabarat","All forces"], correct: 0 },
  { question: "What month did Kuwait get liberated?", choices: ["January 1991","February 1991","March 1991","April 1991"], correct: 1 },
  { question: "What was the UN ceasefire resolution number?", choices: ["678","687","700","715"], correct: 1 },
  { question: "What U.S. attack craft was nicknamed Warthog?", choices: ["A-10 Thunderbolt II","F-16","F-18","F-15"], correct: 0 },
  { question: "What battle saw the largest tank engagement?", choices: ["73 Easting","Medina Ridge","Both major","Wadi al-Batin"], correct: 2 },
  { question: "What sanctions remained after the war?", choices: ["UN sanctions","Trade embargo","Both","Nuclear sanctions"], correct: 2 },
  { question: "What city was Iraq's capital?", choices: ["Baghdad","Basra","Mosul","Karbala"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: GulfWarQuizSettings): GulfWarQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: GulfWarQuizState, action: GulfWarQuizAction): GulfWarQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: GulfWarQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
