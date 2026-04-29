import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ZhengShangyouQuizSettings { questions: "10"; }
export interface ZhengShangyouQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ZhengShangyouQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Zheng Shangyou belongs to which family of card games?", choices: ["Trick-taking", "Climbing/shedding", "Matching", "Fishing"], correct: 1 },
  { question: "What is the main goal of Zheng Shangyou?", choices: ["Win all tricks", "Empty your hand first", "Score the most points", "Capture the most cards"], correct: 1 },
  { question: "The name translates roughly as?", choices: ["Struggle upstream", "Climb the mountain", "Run to the top", "Catch the dragon"], correct: 0 },
  { question: "Zheng Shangyou is most popular in?", choices: ["Japan", "Korea", "China", "Vietnam"], correct: 2 },
  { question: "A bomb beats?", choices: ["Any non-bomb combination", "Only single cards", "Only runs", "Nothing"], correct: 0 },
  { question: "Players are typically dealt?", choices: ["10 cards", "13 cards", "All cards roughly evenly", "20 cards"], correct: 2 },
  { question: "Each turn requires playing?", choices: ["A higher combination of the same type, or pass", "Any card", "Only singles", "Nothing if you pass"], correct: 0 },
  { question: "The first player out is called?", choices: ["Loser", "Tractor", "Big Boss / Master", "Slave"], correct: 2 },
  { question: "The last player out is called?", choices: ["Champion", "Pauper / Loser", "Rich man", "Solo"], correct: 1 },
  { question: "After the round, players often?", choices: ["Reshuffle randomly", "Trade cards based on rank", "Discard hand", "Skip a round"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: ZhengShangyouQuizSettings): ZhengShangyouQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(qq=>{const idx=qq.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===qq.correct) as 0|1|2|3;return{...qq,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ZhengShangyouQuizState, action: ZhengShangyouQuizAction): ZhengShangyouQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const qq=state.questions[state.currentIndex]!;const ok=state.selected===qq.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ZhengShangyouQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
