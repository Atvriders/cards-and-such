import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface GreenLanternQuizSettings { questions: "10" | "20"; }
export interface GreenLanternQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type GreenLanternQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "First Earth Green Lantern (Silver Age)?", choices: ["Hal Jordan", "Alan Scott", "John Stewart", "Guy Gardner"], correct: 0 },
  { question: "The cosmic peacekeeping Corps based on?", choices: ["Oa", "Apokolips", "Krypton", "Tamaran"], correct: 0 },
  { question: "GL ring is powered by?", choices: ["Willpower (green)", "Fear", "Love", "Hope"], correct: 0 },
  { question: "GL ring's traditional weakness?", choices: ["Yellow (originally)", "Wood (Alan Scott)", "Both Yellow and Wood depending on bearer", "Fire"], correct: 2 },
  { question: "The little blue immortals who run the Corps?", choices: ["Guardians of the Universe", "Watchers", "Celestials", "Eternals"], correct: 0 },
  { question: "Sinestro's home planet?", choices: ["Korugar", "Oa", "Daxam", "Rann"], correct: 0 },
  { question: "Sinestro's Corps wields what color?", choices: ["Yellow (fear)", "Red", "Blue", "Black"], correct: 0 },
  { question: "Hal Jordan's profession?", choices: ["Test pilot", "Architect", "Marine", "Lawyer"], correct: 0 },
  { question: "Hal's longtime love interest?", choices: ["Carol Ferris", "Lois Lane", "Iris West", "Selina Kyle"], correct: 0 },
  { question: "Carol Ferris becomes which lantern?", choices: ["Star Sapphire (violet/love)", "Indigo", "Black", "Blue"], correct: 0 },
  { question: "Red Lanterns are powered by?", choices: ["Rage", "Greed", "Avarice", "Hope"], correct: 0 },
  { question: "Atrocitus founded which Corps?", choices: ["Red Lanterns", "Sinestro Corps", "Indigo Tribe", "Black Lanterns"], correct: 0 },
  { question: "Larfleeze hoards which Corps?", choices: ["Orange (avarice)", "Yellow", "Indigo", "Black"], correct: 0 },
  { question: "Saint Walker leads which Corps?", choices: ["Blue (hope)", "Green", "Indigo", "Star Sapphire"], correct: 0 },
  { question: "Indigo Tribe channels?", choices: ["Compassion", "Greed", "Anger", "Fear"], correct: 0 },
  { question: "Black Lanterns are powered by?", choices: ["Death", "Life", "Will", "Time"], correct: 0 },
  { question: "Nekron rules the?", choices: ["Black Lantern Corps", "Red Lanterns", "Sinestro Corps", "Star Sapphires"], correct: 0 },
  { question: "Kilowog is a?", choices: ["GL drill instructor", "Guardian", "Sinestro Corps", "Civilian"], correct: 0 },
  { question: "John Stewart was originally a?", choices: ["Marine architect", "Teacher", "Police officer", "Astronaut"], correct: 0 },
  { question: "Guy Gardner's hairstyle?", choices: ["Bowl cut", "Buzz", "Long mullet", "Bald"], correct: 0 },
  { question: "Alan Scott's ring vulnerability?", choices: ["Wood", "Yellow", "Water", "Fire"], correct: 0 },
  { question: "GL oath ends with the line?", choices: ["Beware my power, Green Lantern's light", "Up up and away", "I am vengeance", "By Odin's beard"], correct: 0 },
  { question: "Hal Jordan's GL ring was given by?", choices: ["Abin Sur (dying)", "The Guardians directly", "Kilowog", "Sinestro"], correct: 0 },
  { question: "GL's main interplanetary nemesis (cosmic)?", choices: ["Sinestro", "Lex Luthor", "Brainiac", "Darkseid"], correct: 0 },
  { question: "The 7 emotional spectrum colors are?", choices: ["Red, Orange, Yellow, Green, Blue, Indigo, Violet", "RGB only", "Just Green and Yellow", "Black and White only"], correct: 0 },
  { question: "GL Corps' headquarters world?", choices: ["Oa", "Mogo", "Tamaran", "Rann"], correct: 0 },
  { question: "Mogo is famously a?", choices: ["Living planet GL", "Robot", "Asteroid", "Star"], correct: 0 },
  { question: "GL first appeared in?", choices: ["All-American Comics #16 (1940, Alan Scott)", "Showcase #22", "Detective #1", "Action #1"], correct: 0 },
  { question: "Hal Jordan first appeared in?", choices: ["Showcase #22 (1959)", "All-American #16", "Adventure #1", "Detective #1"], correct: 0 },
  { question: "Green Lantern symbol resembles a?", choices: ["Lantern", "Star", "Skull", "Shield"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: GreenLanternQuizSettings): GreenLanternQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(qq=>{const idx=qq.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===qq.correct) as 0|1|2|3;return{...qq,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: GreenLanternQuizState, action: GreenLanternQuizAction): GreenLanternQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const qq=state.questions[state.currentIndex]!;const ok=state.selected===qq.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: GreenLanternQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
