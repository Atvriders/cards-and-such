import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CerealBrandsQuizSettings { questions: "10" | "20" | "30"; }
export interface CerealBrandsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CerealBrandsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Tony the Tiger is the mascot of?", choices: ["Corn Pops", "Frosted Flakes", "Special K", "Apple Jacks"], correct: 1 },
  { question: "Snap, Crackle, and Pop sell?", choices: ["Corn Flakes", "Rice Krispies", "Cheerios", "Wheaties"], correct: 1 },
  { question: "Toucan Sam promotes?", choices: ["Trix", "Froot Loops", "Lucky Charms", "Cocoa Puffs"], correct: 1 },
  { question: "Trix Rabbit's catchphrase?", choices: ["Silly rabbit", "Snap to it", "Get gentle", "Eat up"], correct: 0 },
  { question: "Lucky Charms mascot is a?", choices: ["Wizard", "Leprechaun", "Pixie", "Rabbit"], correct: 1 },
  { question: "Sonny is the mascot of?", choices: ["Cocoa Pebbles", "Cocoa Puffs", "Choco Krispies", "Sugar Smacks"], correct: 1 },
  { question: "Cap'n Crunch debuted in?", choices: ["1953", "1963", "1973", "1983"], correct: 1 },
  { question: "Cheerios is owned by?", choices: ["Kellogg", "Post", "General Mills", "Quaker"], correct: 2 },
  { question: "Honey Nut Cheerios mascot?", choices: ["Bee", "Bear", "Beaver", "Bird"], correct: 0 },
  { question: "Wheaties is famously?", choices: ["Breakfast of Champions", "Snap Crackle Pop", "Magically Delicious", "Goldenly Crisp"], correct: 0 },
  { question: "Kellogg's headquarters?", choices: ["Battle Creek, MI", "Chicago, IL", "Minneapolis, MN", "Cincinnati, OH"], correct: 0 },
  { question: "General Mills is based in?", choices: ["Battle Creek", "Minneapolis", "St Louis", "Chicago"], correct: 1 },
  { question: "Quaker Oats man wears a?", choices: ["Top hat", "Tricorn / colonial hat", "Cowboy hat", "Crown"], correct: 1 },
  { question: "Post Cereal's flagship?", choices: ["Grape-Nuts", "Frosted Flakes", "Cheerios", "Lucky Charms"], correct: 0 },
  { question: "Frosted Flakes was originally called?", choices: ["Frosted Sugar Cones", "Sugar Frosted Flakes", "Sweet Cornies", "Tony Tigers"], correct: 1 },
  { question: "Apple Jacks is owned by?", choices: ["Kellogg", "General Mills", "Post", "Quaker"], correct: 0 },
  { question: "Cookie Crisp's mascot is?", choices: ["Wolf / Cookie Crook", "Bear", "Owl", "Lion"], correct: 0 },
  { question: "Count Chocula's rival mascot?", choices: ["Frankenberry", "Boo Berry", "Both", "Neither"], correct: 2 },
  { question: "Boo Berry cereal is?", choices: ["Strawberry", "Blueberry", "Grape", "Mixed berry"], correct: 1 },
  { question: "Honey Smacks mascot?", choices: ["Dig'em Frog", "Tony", "Sonny", "Toucan"], correct: 0 },
  { question: "Special K is marketed for?", choices: ["Kids", "Diet/health", "Sports", "Athletes only"], correct: 1 },
  { question: "Corn Flakes was invented by?", choices: ["Will Keith Kellogg", "Charles Post", "James Quaker", "John Cap"], correct: 0 },
  { question: "Grape-Nuts contain?", choices: ["Grapes", "Nuts only", "Wheat & barley", "Oats only"], correct: 2 },
  { question: "Raisin Bran was first sold in?", choices: ["1926", "1936", "1946", "1956"], correct: 1 },
  { question: "Corn Pops mascot is currently?", choices: ["Pop the kernel", "No mascot", "A whale", "A tiger"], correct: 1 },
  { question: "Mini-Wheats are coated with?", choices: ["Sugar", "Frosting", "Honey", "Cinnamon"], correct: 1 },
  { question: "Cinnamon Toast Crunch makers?", choices: ["Wendell, Bob, Quello", "Snap Crackle Pop", "Trix family", "Pebbles family"], correct: 0 },
  { question: "Reese's Puffs combines cereal with?", choices: ["Mint", "Peanut butter & chocolate", "Strawberry", "Caramel"], correct: 1 },
  { question: "Cocoa Pebbles characters from?", choices: ["Looney Tunes", "Disney", "The Flintstones", "Hanna-Barbera Smurfs"], correct: 2 },
  { question: "Kix tagline?", choices: ["Kid tested, mother approved", "Magically Delicious", "Snap Crackle Pop", "Stay Fit"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: CerealBrandsQuizSettings): CerealBrandsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: CerealBrandsQuizState, action: CerealBrandsQuizAction): CerealBrandsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: CerealBrandsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
