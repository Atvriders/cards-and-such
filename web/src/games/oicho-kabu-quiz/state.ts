import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface OichoKabuQuizSettings { questions: "10"; }
export interface OichoKabuQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type OichoKabuQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Oicho Kabu is similar to which Western game?", choices: ["Poker", "Baccarat", "Blackjack", "Bridge"], correct: 1 },
  { question: "The target hand value is?", choices: ["7", "9", "10", "21"], correct: 1 },
  { question: "The deck used is called?", choices: ["Hanafuda", "Kabufuda", "Hwatu", "Tarot"], correct: 1 },
  { question: "A Kabufuda deck has how many cards?", choices: ["32", "40 (10 ranks × 4)", "48", "52"], correct: 1 },
  { question: "The word 'kabu' translates as?", choices: ["Nine", "Eight", "Cherry", "Game"], correct: 0 },
  { question: "Players add up their cards and look only at the?", choices: ["First digit", "Last digit (mod 10)", "Highest value", "Total exactly"], correct: 1 },
  { question: "A hand totaling 19 has a value of?", choices: ["19", "9", "10", "1"], correct: 1 },
  { question: "Oicho Kabu's name 'oicho' refers to?", choices: ["Eight", "Big", "Old", "Lucky"], correct: 0 },
  { question: "Yakuza in Japan have historic connections with?", choices: ["This game's gambling rooms", "Mahjong only", "Riichi parlours", "Card shops"], correct: 0 },
  { question: "Oicho Kabu is primarily a ___ game.", choices: ["Strategy", "Gambling / chance", "Trick-taking", "Pattern recognition"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: OichoKabuQuizSettings): OichoKabuQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(qq=>{const idx=qq.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===qq.correct) as 0|1|2|3;return{...qq,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: OichoKabuQuizState, action: OichoKabuQuizAction): OichoKabuQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const qq=state.questions[state.currentIndex]!;const ok=state.selected===qq.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: OichoKabuQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
