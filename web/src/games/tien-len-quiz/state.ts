import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TienLenQuizSettings { questions: "10"; }
export interface TienLenQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TienLenQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What is the leading card of the first hand in Tien Len?", choices: ["3 of Hearts", "3 of Spades", "Ace of Spades", "2 of Hearts"], correct: 1 },
  { question: "Which card rank is the highest in Tien Len?", choices: ["Ace", "King", "Queen", "Two"], correct: 3 },
  { question: "How many cards are dealt to each player?", choices: ["10", "11", "13", "15"], correct: 2 },
  { question: "A run of three or more consecutive cards is called?", choices: ["Bomb", "Sequence", "Triple", "Quad"], correct: 1 },
  { question: "Four-of-a-kind in Tien Len can defeat what?", choices: ["Any single", "A pair of 2s", "A run", "Nothing"], correct: 1 },
  { question: "Tien Len originated in which country?", choices: ["China", "Korea", "Vietnam", "Thailand"], correct: 2 },
  { question: "How many players is Tien Len typically played with?", choices: ["2", "3", "4", "5"], correct: 2 },
  { question: "The 'bomb' in Tien Len refers to?", choices: ["Three pairs in a row", "Four of a kind", "A wild card", "Both A and B"], correct: 3 },
  { question: "Each round continues until?", choices: ["Someone passes", "All players pass except the last to play", "Time expires", "Cards run out"], correct: 1 },
  { question: "The 2 of Spades is generally regarded as?", choices: ["The lowest card", "The highest card", "A joker", "Removed from play"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: TienLenQuizSettings): TienLenQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(qq=>{const idx=qq.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===qq.correct) as 0|1|2|3;return{...qq,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TienLenQuizState, action: TienLenQuizAction): TienLenQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const qq=state.questions[state.currentIndex]!;const ok=state.selected===qq.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TienLenQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
