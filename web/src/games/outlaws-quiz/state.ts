import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface OutlawsQuizSettings { questions: "10" | "20" | "30"; }
export interface OutlawsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type OutlawsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Jesse James was killed by?", choices: ["Robert Ford","Wyatt Earp","Pat Garrett","Pinkerton"], correct: 0 },
  { question: "Jesse James died in?", choices: ["1882","1888","1892","1900"], correct: 0 },
  { question: "Billy the Kid's real name was?", choices: ["Henry McCarty","William Bonney","Both","Neither"], correct: 2 },
  { question: "Billy the Kid was killed by?", choices: ["Pat Garrett","Wyatt Earp","Jesse James","Frank James"], correct: 0 },
  { question: "Billy the Kid died in?", choices: ["1881","1885","1889","1893"], correct: 0 },
  { question: "Butch Cassidy's real name was?", choices: ["Robert LeRoy Parker","Robert Ford","Henry Longabaugh","Henry McCarty"], correct: 0 },
  { question: "Sundance Kid's real name was?", choices: ["Henry Longabaugh","Robert Parker","Henry McCarty","Robert Ford"], correct: 0 },
  { question: "Butch and Sundance fled to?", choices: ["Mexico","Bolivia","Argentina","Both Bolivia (final)"], correct: 3 },
  { question: "Bonnie and Clyde were killed in?", choices: ["1932","1934","1936","1938"], correct: 1 },
  { question: "Bonnie and Clyde were killed in?", choices: ["Texas","Oklahoma","Louisiana","Arkansas"], correct: 2 },
  { question: "John Dillinger was killed in?", choices: ["1932","1934","1936","1938"], correct: 1 },
  { question: "Dillinger was killed outside what?", choices: ["Bank","Movie theater","Hotel","Court"], correct: 1 },
  { question: "Pretty Boy Floyd's real name was?", choices: ["Charles Arthur Floyd","Charles Dean Floyd","Charles Eugene Floyd","Charles Edward Floyd"], correct: 0 },
  { question: "Baby Face Nelson's real name was?", choices: ["Lester Joseph Gillis","Charles Floyd","John Dillinger","Bonnie Parker"], correct: 0 },
  { question: "Ma Barker led which gang?", choices: ["Barker-Karpis","Dillinger","James-Younger","Wild Bunch"], correct: 0 },
  { question: "Wyatt Earp was associated with?", choices: ["Tombstone shootout","NY","Chicago","Boston"], correct: 0 },
  { question: "The OK Corral gunfight was in?", choices: ["1881","1885","1891","1895"], correct: 0 },
  { question: "Doc Holliday was a?", choices: ["Dentist/gambler","Banker","Sheriff","Judge"], correct: 0 },
  { question: "Belle Starr was called?", choices: ["Bandit Queen","Wild Rose","Lady Outlaw","Dirty Belle"], correct: 0 },
  { question: "The Wild Bunch's hideout was?", choices: ["Hole in the Wall","Snake River","Black Hills","Rio Grande"], correct: 0 },
  { question: "The James-Younger gang's leader was?", choices: ["Jesse James","Cole Younger","Frank James","Bob Younger"], correct: 0 },
  { question: "The Northfield raid (1876) was a?", choices: ["Bank robbery","Train robbery","Stagecoach robbery","Cattle rustling"], correct: 0 },
  { question: "Black Bart left what at robberies?", choices: ["Poetry","Coins","Dimes","Notes only"], correct: 0 },
  { question: "Robin Hood reportedly lived in?", choices: ["Sherwood Forest","Black Forest","London","York"], correct: 0 },
  { question: "Ned Kelly was famous in?", choices: ["Australia","UK","USA","Canada"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: OutlawsQuizSettings): OutlawsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: OutlawsQuizState, action: OutlawsQuizAction): OutlawsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: OutlawsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
