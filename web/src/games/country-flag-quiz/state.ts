import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface CountryFlagQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number|null; submitted: boolean; score: number; correctCount: number; phase: "playing"|"result"|"done"; }
export type CountryFlagQuizAction = { type:"select"; choice:number } | { type:"submit" } | { type:"next" };
export interface CountryFlagQuizSettings { questions: "10"|"20" }
const ALL_QUESTIONS: QuizQuestion[] = [
  { question:"Which country has a flag with a red maple leaf?", choices:["Australia","New Zealand","Canada","UK"], correct:2 },
  { question:"Which flag features a crescent moon and star on red?", choices:["Tunisia","Turkey","Pakistan","Malaysia"], correct:1 },
  { question:"The flag with a yellow star on red background belongs to which country?", choices:["Vietnam","China","Laos","Cuba"], correct:1 },
  { question:"Which country's flag has green, white, and orange vertical stripes?", choices:["Nigeria","Ireland","Ivory Coast","Italy"], correct:1 },
  { question:"The flag of Brazil features which shape in the center?", choices:["Star","Circle","Diamond","Cross"], correct:2 },
  { question:"Which flag shows a cedar tree in the center?", choices:["Jordan","Lebanon","Syria","Palestine"], correct:1 },
  { question:"Japan's flag shows a red circle on what background?", choices:["Blue","Green","Yellow","White"], correct:3 },
  { question:"Which country's flag uses a distinctive 'Dragon' symbol?", choices:["Nepal","Tibet","Bhutan","Mongolia"], correct:2 },
  { question:"The Union Jack is the flag of which country?", choices:["Australia","UK","New Zealand","Canada"], correct:1 },
  { question:"Which flag is unique in being non-rectangular (pennant shape)?", choices:["Switzerland","Nepal","Philippines","Bhutan"], correct:1 },
  { question:"Which country has a flag with horizontal black, red, and gold stripes?", choices:["Austria","Belgium","Germany","Netherlands"], correct:2 },
  { question:"The flag of the Maldives features what symbol?", choices:["Crescent moon","Star and crescent","Sun","Wave"], correct:1 },
  { question:"Which country's flag has a sun with 32 rays?", choices:["Argentina","Colombia","Ecuador","Bolivia"], correct:0 },
  { question:"The flag of South Africa uses how many colors?", choices:["3","4","5","6"], correct:3 },
  { question:"Which flag features the Southern Cross constellation?", choices:["Australia","New Zealand","Brazil","All of these"], correct:3 },
  { question:"The Olympic flag has rings on what background?", choices:["Blue","Red","Yellow","White"], correct:3 },
  { question:"Which country has horizontal red, white, and blue stripes (top to bottom)?", choices:["France","Netherlands","Russia","Luxembourg"], correct:1 },
  { question:"The Swiss flag is notable for being?", choices:["Triangular","Circular","Square","Hexagonal"], correct:2 },
  { question:"Which flag has a Bald Eagle?", choices:["USA","Mexico","Guatemala","Ecuador"], correct:1 },
  { question:"Denmark's flag features a white cross on what background?", choices:["Blue","Green","White","Red"], correct:3 },
];
function shuffle<T>(arr: T[], rng: ()=>number): T[] { const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: CountryFlagQuizSettings): CountryFlagQuizState {
  const rng=mulberry32(seed);const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const indexed=q.choices.map((c,i)=>({c,i}));const sh=shuffle(indexed,rng);const newCorrect=sh.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:sh.map(x=>x.c) as [string,string,string,string],correct:newCorrect};});
  return { questions, currentIndex:0, selected:null, submitted:false, score:0, correctCount:0, phase:"playing" };
}
export function reducer(state: CountryFlagQuizState, action: CountryFlagQuizAction): CountryFlagQuizState {
  if(state.phase==="done") return state;
  switch(action.type){
    case "select": return state.submitted?state:{...state,selected:action.choice};
    case "submit": {if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;return{...state,submitted:true,score:state.score+(ok?100:0),correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "next": {const next=state.currentIndex+1;if(next>=state.questions.length)return{...state,phase:"done"};return{...state,currentIndex:next,selected:null,submitted:false,phase:"playing"};}
    default: return state;
  }
}
export function isTerminal(state: CountryFlagQuizState): { score:number }|null { return state.phase==="done"?{score:state.score}:null; }
