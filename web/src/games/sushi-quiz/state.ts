import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SushiQuizSettings { questions: "10" | "20"; }
export interface SushiQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SushiQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What country is sushi from?", choices: ["Japan","China","Korea","Vietnam"], correct: 0 },
  { question: "What's nigiri?", choices: ["Vinegared rice with fish on top","Roll","Bowl","Soup"], correct: 0 },
  { question: "What's maki?", choices: ["Rolled sushi","Pressed","Bowl","Just maki"], correct: 0 },
  { question: "What's sashimi?", choices: ["Raw fish without rice","Sushi","Both","Cooked"], correct: 0 },
  { question: "What's the rice in sushi seasoned with?", choices: ["Vinegar, sugar, salt","Just vinegar","Both","Rice wine"], correct: 2 },
  { question: "What's nori?", choices: ["Seaweed sheet","Just seaweed","Both","Type of fish"], correct: 2 },
  { question: "What's wasabi?", choices: ["Japanese horseradish","Just spicy paste","Both","Mustard"], correct: 2 },
  { question: "What's the brined ginger served with sushi called?", choices: ["Gari","Wasabi","Both","Soy"], correct: 0 },
  { question: "What's a California Roll?", choices: ["Crab, avocado, cucumber inside-out","Just roll","Both","Western invention"], correct: 2 },
  { question: "What's an inside-out roll called?", choices: ["Uramaki","Maki","Both","Hosomaki"], correct: 0 },
  { question: "What's a thin roll called?", choices: ["Hosomaki","Futomaki","Both","Uramaki"], correct: 0 },
  { question: "What's a thick roll called?", choices: ["Futomaki","Hosomaki","Both","Uramaki"], correct: 0 },
  { question: "What's a hand roll called?", choices: ["Temaki","Maki","Both","Hosomaki"], correct: 0 },
  { question: "What's a piece of nigiri sushi typically?", choices: ["Fish + rice","Just rice","Both","Various toppings"], correct: 3 },
  { question: "What's tuna in Japanese?", choices: ["Maguro","Saba","Toro is fatty tuna","Just Maguro"], correct: 3 },
  { question: "What's salmon in Japanese sushi?", choices: ["Sake or shake","Just sake","Both","Just shake"], correct: 2 },
  { question: "What's the fatty tuna belly?", choices: ["Toro","Just toro","Both","Otoro and chutoro"], correct: 2 },
  { question: "What's the most prized tuna?", choices: ["Otoro (fattiest)","Toro","Both","Just otoro"], correct: 2 },
  { question: "What's chirashi sushi?", choices: ["Bowl with rice and toppings scattered","Just bowl","Both","Rice with fish"], correct: 2 },
  { question: "What's a sushi chef called?", choices: ["Itamae","Sushi-shokunin","Both","Just itamae"], correct: 2 },
  { question: "What's omakase?", choices: ["Chef's choice","Just chef chooses","Both","Tasting menu"], correct: 2 },
  { question: "What's edomae sushi?", choices: ["Tokyo style with fresh fish","Just Tokyo","Both","Original style"], correct: 2 },
  { question: "What's the soy sauce called?", choices: ["Shoyu","Just soy","Both","Different"], correct: 2 },
  { question: "What's the ratio of rice grains to fish in nigiri?", choices: ["Just enough to support fish","Just rice","Both","Standard"], correct: 3 },
  { question: "What's a gunkanmaki?", choices: ["Battleship roll - rice with seaweed wall","Just gunkan","Both","Variety"], correct: 2 },
  { question: "What's commonly served on gunkan?", choices: ["Roe, uni","Just toppings","Both","Variety"], correct: 2 },
  { question: "What's uni?", choices: ["Sea urchin gonads","Just urchin","Both","Delicacy"], correct: 2 },
  { question: "What's ikura?", choices: ["Salmon roe","Just roe","Both","Eggs"], correct: 2 },
  { question: "What's tobiko?", choices: ["Flying fish roe","Just roe","Both","Tiny eggs"], correct: 2 },
  { question: "What's the order of eating in omakase?", choices: ["Light to rich","Just light","Both","Chef decides"], correct: 3 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SushiQuizSettings): SushiQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SushiQuizState, action: SushiQuizAction): SushiQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SushiQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
