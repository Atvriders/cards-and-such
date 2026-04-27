import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface FastFoodBrandsQuizSettings { questions: "10" | "20" | "30"; }
export interface FastFoodBrandsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type FastFoodBrandsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "McDonald's mascot is?", choices: ["Wendy", "Ronald", "Colonel", "King"], correct: 1 },
  { question: "McDonald's started in?", choices: ["Chicago", "San Bernardino, CA", "Detroit", "Phoenix"], correct: 1 },
  { question: "The Big Mac was introduced in?", choices: ["1958", "1968", "1978", "1988"], correct: 1 },
  { question: "Burger King's slogan?", choices: ["I'm Lovin' It", "Have It Your Way", "Eat Fresh", "Think Outside the Bun"], correct: 1 },
  { question: "Wendy's mascot is named after?", choices: ["The chef", "The founder's daughter", "The town", "The city"], correct: 1 },
  { question: "Wendy's was founded by?", choices: ["Ray Kroc", "Dave Thomas", "Harland Sanders", "Glen Bell"], correct: 1 },
  { question: "KFC was founded by?", choices: ["Ray Kroc", "Glen Bell", "Harland Sanders", "Dave Thomas"], correct: 2 },
  { question: "KFC's home state?", choices: ["Texas", "Kentucky", "Tennessee", "Georgia"], correct: 1 },
  { question: "Taco Bell was founded by?", choices: ["Glen Bell", "Carl Karcher", "Harland Sanders", "Tom Monaghan"], correct: 0 },
  { question: "Subway slogan is?", choices: ["Eat Fresh", "Think Outside Bun", "Do The Right Thing", "Just Do It"], correct: 0 },
  { question: "Subway was founded in?", choices: ["1955", "1965", "1975", "1985"], correct: 1 },
  { question: "Domino's pizza founder?", choices: ["Tom Monaghan", "Don Vincent", "Frank Carney", "Mike Ilitch"], correct: 0 },
  { question: "Pizza Hut was founded by the?", choices: ["Carney brothers", "Marriott family", "Carl Karcher", "Glen Bell"], correct: 0 },
  { question: "Little Caesars founded by?", choices: ["Tom Monaghan", "Mike Ilitch", "Frank Carney", "Dave Thomas"], correct: 1 },
  { question: "Chick-fil-A was founded by?", choices: ["Truett Cathy", "Dave Thomas", "Glen Bell", "Ray Kroc"], correct: 0 },
  { question: "Chick-fil-A is closed on?", choices: ["Mondays", "Sundays", "Saturdays", "Tuesdays"], correct: 1 },
  { question: "Carl's Jr. was founded by?", choices: ["Carl Karcher", "Harland Sanders", "Tom Monaghan", "Glen Bell"], correct: 0 },
  { question: "In-N-Out is famous in?", choices: ["East Coast", "California", "Texas", "Florida"], correct: 1 },
  { question: "Five Guys started in?", choices: ["NYC", "Virginia", "Texas", "California"], correct: 1 },
  { question: "Shake Shack started as a cart in?", choices: ["Chicago", "NYC", "LA", "Boston"], correct: 1 },
  { question: "Whataburger is from?", choices: ["California", "Texas", "Tennessee", "Florida"], correct: 1 },
  { question: "Sonic Drive-In is famous for?", choices: ["Drive-in carhop service", "Indoor seating", "Buffets", "Cafeteria style"], correct: 0 },
  { question: "Arby's is best known for?", choices: ["Burgers", "Roast beef", "Tacos", "Pizza"], correct: 1 },
  { question: "Hardee's and Carl's Jr. merged because?", choices: ["Same company", "Different names same chain", "Bought competitor", "Both"], correct: 3 },
  { question: "Panda Express specialty?", choices: ["American Chinese", "Mexican", "Indian", "Italian"], correct: 0 },
  { question: "Chipotle was founded by?", choices: ["Steve Ells", "Dave Thomas", "Tom Monaghan", "Carl Karcher"], correct: 0 },
  { question: "Popeyes specialty?", choices: ["Burgers", "Louisiana fried chicken", "Pizza", "Tacos"], correct: 1 },
  { question: "Jollibee originated in?", choices: ["Vietnam", "Philippines", "Thailand", "Singapore"], correct: 1 },
  { question: "Quiznos competed mainly with?", choices: ["McDonald's", "Subway", "Pizza Hut", "KFC"], correct: 1 },
  { question: "Dairy Queen famous treat?", choices: ["Slurpee", "Blizzard", "McFlurry", "Frosty"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: FastFoodBrandsQuizSettings): FastFoodBrandsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: FastFoodBrandsQuizState, action: FastFoodBrandsQuizAction): FastFoodBrandsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: FastFoodBrandsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
