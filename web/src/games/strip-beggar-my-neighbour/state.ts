import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface StripBeggarMyNeighbourSettings { questions: "10"; }
export interface StripBeggarMyNeighbourState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type StripBeggarMyNeighbourAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: 'Strip Beggar My Neighbour reduces the?', choices: ['Deck size to 32 or 36 cards', 'Number of players to one', 'Court cards to two only', 'Round count to one'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Beggar My Neighbour is famously?', choices: ["A deterministic children's card game", 'A trick-taking adult game', 'A patience', 'A bluffing game'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Court cards trigger?', choices: ['Tribute payment from opponent', 'An auction', 'A reshuffle', 'Nothing'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Number of cards Jack demands as tribute is?', choices: ['One card', 'Four cards', 'Three cards', 'Two cards'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Number of cards King demands as tribute is?', choices: ['Three cards', 'One card', 'Two cards', 'Four cards'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Standard Beggar My Neighbour uses?', choices: ['A full 52-card deck', '32 cards', '36 cards', '78 cards'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Goal of the game is?', choices: ['Win all the cards', 'Score 21 points', 'Take the most tricks', 'Discard quickly'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: "'Strip' here refers to?", choices: ['Stripping/removing low cards from the deck', 'Removing clothing', 'Stripping suits', 'Removing a player'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Number of players is?', choices: ['Two players typically', 'Always solo', 'Always six', 'Always twelve'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Strip Beggar My Neighbour mainly affects?', choices: ['Game length and tribute frequency', 'Trump rules', 'Bidding', 'Knock thresholds'], correct: 0 as 0 | 1 | 2 | 3 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: StripBeggarMyNeighbourSettings): StripBeggarMyNeighbourState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: StripBeggarMyNeighbourState, action: StripBeggarMyNeighbourAction): StripBeggarMyNeighbourState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: StripBeggarMyNeighbourState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
