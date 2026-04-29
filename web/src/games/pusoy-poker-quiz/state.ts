import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PusoyPokerQuizSettings { questions: "10"; }
export interface PusoyPokerQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PusoyPokerQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Each player in Pusoy gets how many cards?", choices: ["10", "13", "14", "15"], correct: 1 },
  { question: "The 13 cards are arranged into how many hands?", choices: ["2", "3 (one 3-card and two 5-card hands)", "4", "5"], correct: 1 },
  { question: "The shortest hand must contain?", choices: ["3 cards", "5 cards", "7 cards", "13 cards"], correct: 0 },
  { question: "The two longer hands must contain?", choices: ["5 cards each", "4 cards each", "6 cards each", "Equal length"], correct: 0 },
  { question: "The order rule states the back hand must be?", choices: ["Equal or higher than the middle", "Lower than the front", "Random", "Always royal"], correct: 0 },
  { question: "The middle hand must be?", choices: ["Equal or higher than the front", "Equal or lower than the front", "Always a pair", "A flush"], correct: 0 },
  { question: "What happens if your hands are arranged out of order?", choices: ["You win automatically", "You forfeit (foul)", "Restart the round", "Discard cards"], correct: 1 },
  { question: "Pusoy compares hands?", choices: ["Pairwise against each opponent", "Only against the dealer", "Only highest hand wins", "By total card values"], correct: 0 },
  { question: "A perfect 13-card hand may include?", choices: ["Royal flush, straight flush, or quads", "All red cards", "All face cards", "Pure bluff"], correct: 0 },
  { question: "Pusoy and Pusoy Dos are?", choices: ["The same game", "Different games (Pusoy Dos is Big Two)", "Both Mahjong variants", "Only played in Spain"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: PusoyPokerQuizSettings): PusoyPokerQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(qq=>{const idx=qq.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===qq.correct) as 0|1|2|3;return{...qq,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: PusoyPokerQuizState, action: PusoyPokerQuizAction): PusoyPokerQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const qq=state.questions[state.currentIndex]!;const ok=state.selected===qq.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: PusoyPokerQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
