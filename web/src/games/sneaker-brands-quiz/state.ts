import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SneakerBrandsQuizSettings { questions: "10" | "20" | "30"; }
export interface SneakerBrandsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SneakerBrandsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Nike's slogan is?", choices: ["Impossible Is Nothing", "Just Do It", "I Am What I Am", "Forever Faster"], correct: 1 },
  { question: "Adidas was founded by?", choices: ["Adolf Dassler", "Phil Knight", "Joseph Foster", "James Davis"], correct: 0 },
  { question: "Puma's founder was the brother of which Adidas founder?", choices: ["Adolf Dassler", "Rudolf Dassler", "Heinz Dassler", "Karl Dassler"], correct: 1 },
  { question: "Reebok originated in?", choices: ["UK", "USA", "Germany", "Japan"], correct: 0 },
  { question: "New Balance is headquartered in?", choices: ["New York", "Boston", "Portland", "LA"], correct: 1 },
  { question: "Converse was founded in?", choices: ["1908", "1928", "1948", "1968"], correct: 0 },
  { question: "Chuck Taylor All-Stars are made by?", choices: ["Vans", "Converse", "Puma", "Reebok"], correct: 1 },
  { question: "Vans originated as a?", choices: ["Skate brand", "Surf brand", "Custom shoe shop", "Running brand"], correct: 2 },
  { question: "Under Armour was founded by?", choices: ["Kevin Plank", "Phil Knight", "Tinker Hatfield", "Sonny Vaccaro"], correct: 0 },
  { question: "Air Jordan launched in?", choices: ["1980", "1985", "1990", "1995"], correct: 1 },
  { question: "Adidas's headquarters?", choices: ["Munich", "Herzogenaurach", "Berlin", "Hamburg"], correct: 1 },
  { question: "Phil Knight co-founded Nike with?", choices: ["Bill Bowerman", "Tinker Hatfield", "Steve Prefontaine", "John McEnroe"], correct: 0 },
  { question: "Stan Smith shoe is by?", choices: ["Nike", "Adidas", "Puma", "Reebok"], correct: 1 },
  { question: "Yeezy was a collab between Adidas and?", choices: ["Pharrell", "Kanye West", "Drake", "Jay-Z"], correct: 1 },
  { question: "ASICS is from?", choices: ["China", "Japan", "Korea", "Taiwan"], correct: 1 },
  { question: "Onitsuka Tiger is the predecessor of?", choices: ["Mizuno", "ASICS", "Yonex", "Descente"], correct: 1 },
  { question: "Saucony is best known for?", choices: ["Skating", "Running", "Basketball", "Tennis"], correct: 1 },
  { question: "Brooks specializes in?", choices: ["Cleats", "Running shoes", "Skate shoes", "Boots"], correct: 1 },
  { question: "Hoka is famous for?", choices: ["Minimalist design", "Maximalist cushion", "Studded soles", "Knit uppers only"], correct: 1 },
  { question: "On is a Swiss brand for?", choices: ["Skating", "Running", "Basketball", "Hiking"], correct: 1 },
  { question: "Allbirds focuses on?", choices: ["Sustainable materials", "Carbon plates", "Hi-tech basketball", "Wrestling"], correct: 0 },
  { question: "Skechers is from?", choices: ["UK", "USA", "Germany", "Italy"], correct: 1 },
  { question: "Fila is originally from?", choices: ["USA", "Italy", "Korea", "Japan"], correct: 1 },
  { question: "Mizuno is from?", choices: ["Japan", "Korea", "China", "Vietnam"], correct: 0 },
  { question: "K-Swiss originated in?", choices: ["Switzerland", "Korea", "USA", "Germany"], correct: 2 },
  { question: "Diadora is from?", choices: ["France", "Italy", "Spain", "Greece"], correct: 1 },
  { question: "Air Max debuted in?", choices: ["1985", "1987", "1991", "1995"], correct: 1 },
  { question: "Tinker Hatfield is famous for designing?", choices: ["Yeezys", "Air Jordans", "Boost runners", "Chuck IIs"], correct: 1 },
  { question: "Kobe shoe line was made by?", choices: ["Adidas", "Nike", "Puma", "Under Armour"], correct: 1 },
  { question: "LeBron's shoe line is by?", choices: ["Adidas", "Nike", "Reebok", "Puma"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SneakerBrandsQuizSettings): SneakerBrandsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SneakerBrandsQuizState, action: SneakerBrandsQuizAction): SneakerBrandsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SneakerBrandsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
