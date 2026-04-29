import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ChinchonCardSettings { questions: "10"; }
export interface ChinchonCardState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ChinchonCardAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: 'Chinchón is from?', choices: ['Spain (popular in Latin America too)', 'Russia', 'Japan', 'Sweden'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Players are dealt how many cards?', choices: ['Seven cards', 'Ten cards', 'Five cards', 'Thirteen cards'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Goal in Chinchón is to?', choices: ['Have the lowest score', 'Have the highest score', 'Take the most tricks', 'Capture all pieces'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Reaching how many points eliminates a player?', choices: ['100 points (lose if you go over)', '21 points', '1000 points', '10 points'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: "A 'chinchón' meld is?", choices: ['Seven cards in suit-and-rank sequence (instant win)', 'Three of a kind', 'Any seven cards', 'A trump-suit run'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Spanish deck used in Chinchón is?', choices: ['40 or 50 cards', '52 cards', '78 cards', '32 cards'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Chinchón is part of which family?', choices: ['Rummy family', 'Trick-taking only', 'Solitaire', 'Bidding'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Each turn a player must?', choices: ['Draw a card and then discard one', 'Bid only', 'Trade hands', 'Auction'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Italian Chinchón is played with?', choices: ['A 40-card deck', 'A 78-card Tarot', 'A 32-card piquet', 'A 52-card poker deck'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Chinchón is most often described as?', choices: ["The Spanish-speaking world's beloved Gin Rummy cousin", 'A trick-taking variant', 'A solitaire', 'A bidding game'], correct: 0 as 0 | 1 | 2 | 3 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: ChinchonCardSettings): ChinchonCardState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ChinchonCardState, action: ChinchonCardAction): ChinchonCardState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ChinchonCardState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
