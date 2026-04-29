import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TheStarSoliSettings { questions: "10"; }
export interface TheStarSoliState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TheStarSoliAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: 'The Star tableau is shaped like?', choices: ['A star with radiating arms', 'A grid', 'A pyramid', 'A circle'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'How many reserve groups in The Star?', choices: ['Eight groups', 'Four groups', 'Two groups', 'Twelve groups'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'The Star uses how many decks?', choices: ['One deck', 'Two decks', 'Three decks', 'Four decks'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'The Star is part of which patience family?', choices: ['Fortune-telling oddity patiences', 'Klondike', 'Spider', 'Yukon'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'In The Star players match cards by?', choices: ['Rank or pairs', 'Suit only', 'Color only', 'Random'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Total cards in single-deck Star is?', choices: ['52 cards', '104 cards', '32 cards', '78 cards'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: "Era of The Star's popularity?", choices: ['Victorian era', '1980s', 'Renaissance', '1970s'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'The Star emphasizes?', choices: ['Pattern and presentation', 'Pure calculation', 'Bluffing', 'Race'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Foundation building in classic Star is?', choices: ['By matched pairs/groups discarded', 'By suit Ace to King', 'By color', 'By bidding'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'The Star is most often considered?', choices: ['A casual fortune-telling game', 'Hard-core competitive', "A children's bingo", 'A poker variant'], correct: 0 as 0 | 1 | 2 | 3 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: TheStarSoliSettings): TheStarSoliState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TheStarSoliState, action: TheStarSoliAction): TheStarSoliState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TheStarSoliState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
