import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface WorldFlagsQuizSettings { questions: "10" | "20" | "30"; }
export interface WorldFlagsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type WorldFlagsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Which flag has a red maple leaf on white between two red bands?", choices: ["USA","Canada","UK","Switzerland"], correct: 1 },
  { question: "Which flag is red with a white cross extending to the edges?", choices: ["Switzerland","Denmark","England","Greece"], correct: 1 },
  { question: "Which flag is solid green only (no symbols, historic)?", choices: ["Saudi Arabia","Pakistan","Libya (1977-2011)","Iran"], correct: 2 },
  { question: "Which flag has a yellow sun on blue and white horizontal stripes?", choices: ["Argentina","Uruguay","Greece","Honduras"], correct: 0 },
  { question: "Which flag is blue with a white circle and red dot?", choices: ["Japan","Bangladesh","South Korea","Pakistan"], correct: 1 },
  { question: "Which flag has a white circle with a red dot on white?", choices: ["Japan","Bangladesh","Palau","Greenland"], correct: 0 },
  { question: "Which flag has a yellow circle on blue with a star?", choices: ["Palau","Vietnam","Tunisia","Philippines"], correct: 0 },
  { question: "Which flag has 14 red and white stripes with a yellow crescent on blue?", choices: ["Malaysia","Indonesia","Singapore","Philippines"], correct: 0 },
  { question: "Which flag has a single yellow star on red?", choices: ["China","Vietnam","North Korea","Cuba"], correct: 1 },
  { question: "Which flag has five yellow stars on red?", choices: ["China","Vietnam","Cuba","North Korea"], correct: 0 },
  { question: "Which flag has 27 stars and stripes (most current)?", choices: ["UK","USA","Liberia","Cuba"], correct: 1 },
  { question: "Which flag is red, white, and blue horizontal stripes (top to bottom)?", choices: ["Russia","Netherlands","France","Czech Republic"], correct: 1 },
  { question: "Which flag is blue, white, red horizontal stripes top to bottom?", choices: ["Netherlands","France","Russia","Luxembourg"], correct: 2 },
  { question: "Which flag is black, red, gold horizontal?", choices: ["Belgium","Germany","Spain","Lithuania"], correct: 1 },
  { question: "Which flag has horizontal black/red/gold but vertical?", choices: ["Germany","Belgium","Spain","Romania"], correct: 1 },
  { question: "Which flag is blue with a white Nordic cross?", choices: ["Finland","Sweden","Iceland","Denmark"], correct: 0 },
  { question: "Which flag is yellow with a blue Nordic cross?", choices: ["Finland","Sweden","Iceland","Norway"], correct: 1 },
  { question: "Which flag has the Union Jack with a southern cross constellation?", choices: ["NZ","Australia","Fiji","Both NZ and Australia"], correct: 3 },
  { question: "Which flag is green-white-red vertical with an emblem?", choices: ["Italy","Mexico","Hungary","Iran"], correct: 1 },
  { question: "Which flag is blue-white-red vertical?", choices: ["Russia","France","Netherlands","Italy"], correct: 1 },
  { question: "Which flag is green-white-red vertical (no emblem)?", choices: ["Mexico","Italy","Iran","Hungary"], correct: 1 },
  { question: "Which flag has a black, red, green tricolor with a center symbol (Africa)?", choices: ["Kenya","South Africa","Mozambique","Ghana"], correct: 0 },
  { question: "Which flag has six colors in a unique Y shape?", choices: ["South Africa","Mozambique","Eritrea","Tanzania"], correct: 0 },
  { question: "Which flag has a yellow trident on green and red?", choices: ["Barbados","Mozambique","Antigua","St. Lucia"], correct: 1 },
  { question: "Which flag has a broken trident on blue, gold, blue?", choices: ["Barbados","Bahamas","Trinidad","Jamaica"], correct: 0 },
  { question: "Which flag is divided diagonally with green/yellow/black?", choices: ["Jamaica","Guyana","Tanzania","St. Vincent"], correct: 0 },
  { question: "Which flag has a red dragon on white and green?", choices: ["Wales","Bhutan","England","Scotland"], correct: 0 },
  { question: "Which flag has a yellow dragon on orange and yellow?", choices: ["Bhutan","Wales","Sri Lanka","Mongolia"], correct: 0 },
  { question: "Which flag has a sun with rays on a tricolor band?", choices: ["Argentina","Uruguay","Philippines","All of these"], correct: 3 },
  { question: "Which flag has 50 stars and 13 stripes?", choices: ["USA","Liberia","Malaysia","Cuba"], correct: 0 },
  { question: "Which flag has a single white star and red/white/blue?", choices: ["Liberia","Cuba","USA","Chile"], correct: 0 },
  { question: "Which flag is blue and white with a star and crescent?", choices: ["Turkey","Singapore","Tunisia","Pakistan"], correct: 1 },
  { question: "Which flag is red with a white star and crescent?", choices: ["Tunisia","Turkey","Singapore","Pakistan"], correct: 1 },
  { question: "Which flag is dark green with a white crescent and star?", choices: ["Pakistan","Turkmenistan","Saudi Arabia","Mauritania"], correct: 0 },
  { question: "Which flag is green with Arabic script and a sword?", choices: ["Saudi Arabia","Iraq","Iran","Yemen"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: WorldFlagsQuizSettings): WorldFlagsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: WorldFlagsQuizState, action: WorldFlagsQuizAction): WorldFlagsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: WorldFlagsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
