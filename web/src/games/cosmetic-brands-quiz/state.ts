import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CosmeticBrandsQuizSettings { questions: "10" | "20" | "30"; }
export interface CosmeticBrandsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CosmeticBrandsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "L'Oréal is from?", choices: ["USA", "France", "Italy", "Germany"], correct: 1 },
  { question: "L'Oréal slogan?", choices: ["Because You're Worth It", "Maybe She's Born With It", "Make Up Your Life", "Beauty Within"], correct: 0 },
  { question: "Maybelline's slogan?", choices: ["Maybe She's Born With It", "Because You're Worth It", "Where Beauty Begins", "Discover Yours"], correct: 0 },
  { question: "Estée Lauder was a?", choices: ["Founder & namesake", "Stage name", "Fictional spokesperson", "PR persona only"], correct: 0 },
  { question: "Clinique was launched by?", choices: ["Estée Lauder", "L'Oréal", "Revlon", "Coty"], correct: 0 },
  { question: "Revlon was founded in?", choices: ["1922", "1932", "1942", "1952"], correct: 1 },
  { question: "Lancôme is from?", choices: ["UK", "France", "Italy", "USA"], correct: 1 },
  { question: "MAC Cosmetics is from?", choices: ["Toronto", "NYC", "LA", "London"], correct: 0 },
  { question: "Bobbi Brown launched her line in?", choices: ["1981", "1991", "2001", "2011"], correct: 1 },
  { question: "NARS founder?", choices: ["François Nars", "Pat McGrath", "Bobbi Brown", "Charlotte Tilbury"], correct: 0 },
  { question: "Urban Decay's famous palette?", choices: ["Naked", "Dior 5", "Pop Glam", "Glow"], correct: 0 },
  { question: "Too Faced sister brand was?", choices: ["Tarte", "Smashbox", "Hard Candy", "Better Than Sex mascara fame"], correct: 3 },
  { question: "Sephora is from?", choices: ["UK", "France", "Italy", "USA"], correct: 1 },
  { question: "Ulta Beauty is from?", choices: ["USA", "UK", "France", "Canada"], correct: 0 },
  { question: "Fenty Beauty was founded by?", choices: ["Beyoncé", "Rihanna", "Selena Gomez", "Kim Kardashian"], correct: 1 },
  { question: "Rare Beauty by?", choices: ["Kylie Jenner", "Selena Gomez", "Lady Gaga", "Hailey Bieber"], correct: 1 },
  { question: "Kylie Cosmetics by?", choices: ["Kylie Minogue", "Kylie Jenner", "Kylie Bunbury", "Kylie Cantrall"], correct: 1 },
  { question: "Charlotte Tilbury is a famous?", choices: ["Singer", "Makeup artist & founder", "Actress", "Model"], correct: 1 },
  { question: "Pat McGrath Labs founder is from?", choices: ["UK", "USA", "France", "Italy"], correct: 0 },
  { question: "Glossier founder?", choices: ["Emily Weiss", "Pat McGrath", "Bobbi Brown", "Huda Kattan"], correct: 0 },
  { question: "Huda Beauty founder?", choices: ["Huda Kattan", "Emily Weiss", "Anastasia Soare", "Pat McGrath"], correct: 0 },
  { question: "Anastasia Beverly Hills famous for?", choices: ["Lipstick", "Brows", "Foundation", "Mascara"], correct: 1 },
  { question: "Tom Ford launched his beauty line in?", choices: ["1995", "2005", "2015", "2020"], correct: 1 },
  { question: "Yves Saint Laurent Beauty is owned by?", choices: ["Estée Lauder", "L'Oréal", "LVMH", "Coty"], correct: 1 },
  { question: "Dior Beauty is owned by?", choices: ["L'Oréal", "LVMH", "Coty", "Procter & Gamble"], correct: 1 },
  { question: "Coty's legacy brands include?", choices: ["CoverGirl", "Maybelline", "L'Oréal", "Sephora"], correct: 0 },
  { question: "Olay is owned by?", choices: ["Unilever", "P&G", "L'Oréal", "Estée Lauder"], correct: 1 },
  { question: "Nivea is from?", choices: ["Germany", "France", "Italy", "UK"], correct: 0 },
  { question: "Avon is famous for?", choices: ["Department stores", "Door-to-door sales", "Subscription boxes", "Airport stores"], correct: 1 },
  { question: "Mary Kay used what color iconic car?", choices: ["Red", "Pink", "Gold", "Blue"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: CosmeticBrandsQuizSettings): CosmeticBrandsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: CosmeticBrandsQuizState, action: CosmeticBrandsQuizAction): CosmeticBrandsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: CosmeticBrandsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
