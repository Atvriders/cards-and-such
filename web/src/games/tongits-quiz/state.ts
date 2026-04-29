import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TongitsQuizSettings { questions: "10"; }
export interface TongitsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TongitsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Tongits is from which country?", choices: ["Indonesia", "Philippines", "Thailand", "Vietnam"], correct: 1 },
  { question: "How many players does Tongits typically have?", choices: ["2", "3", "4", "6"], correct: 1 },
  { question: "Tongits is closely related to which family?", choices: ["Poker", "Rummy", "Trick-taking", "Climbing"], correct: 1 },
  { question: "Each player is dealt how many cards?", choices: ["10", "12", "13 (with one extra to dealer)", "15"], correct: 2 },
  { question: "A 'set' in Tongits consists of?", choices: ["Three or four of a kind", "Three suited cards", "Three run cards", "Any three"], correct: 0 },
  { question: "A 'run' must be?", choices: ["Three or more consecutive cards of same suit", "Three same-rank cards", "Two pairs", "A triple"], correct: 0 },
  { question: "You may declare 'Tongits' when?", choices: ["You have melded all but one card", "You have laid down all your cards", "You hold three jokers", "Your turn ends"], correct: 1 },
  { question: "The objective is to?", choices: ["Empty your hand or have lowest points", "Capture all tricks", "Score the most points", "Bluff opponents"], correct: 0 },
  { question: "Players take cards from?", choices: ["The stockpile or last discarded card", "Only the stockpile", "Only the discard pile", "Other players' hands"], correct: 0 },
  { question: "Tongits gameplay resembles which Western game most?", choices: ["Rummy", "Poker", "Spades", "Hearts"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: TongitsQuizSettings): TongitsQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(qq=>{const idx=qq.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===qq.correct) as 0|1|2|3;return{...qq,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TongitsQuizState, action: TongitsQuizAction): TongitsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const qq=state.questions[state.currentIndex]!;const ok=state.selected===qq.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TongitsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
