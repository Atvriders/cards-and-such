import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CarBrandsQuizSettings { questions: "10" | "20" | "30"; }
export interface CarBrandsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CarBrandsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Which company makes the Mustang?", choices: ["Ford", "Chevrolet", "Dodge", "Pontiac"], correct: 0 },
  { question: "Ferrari is based in which country?", choices: ["Germany", "Italy", "France", "Spain"], correct: 1 },
  { question: "Which brand has a four-ring logo?", choices: ["BMW", "Audi", "Mercedes", "Volkswagen"], correct: 1 },
  { question: "Tesla was founded in which decade?", choices: ["1990s", "2000s", "2010s", "1980s"], correct: 1 },
  { question: "Toyota originated in which country?", choices: ["China", "Korea", "Japan", "Thailand"], correct: 2 },
  { question: "Which slogan: \"The Ultimate Driving Machine\"?", choices: ["Audi", "Porsche", "BMW", "Lexus"], correct: 2 },
  { question: "Lamborghini logo features which animal?", choices: ["Horse", "Lion", "Bull", "Eagle"], correct: 2 },
  { question: "Honda was founded by?", choices: ["Henry Ford", "Soichiro Honda", "Enzo Ferrari", "Karl Benz"], correct: 1 },
  { question: "The Porsche 911 was launched in which decade?", choices: ["1950s", "1960s", "1970s", "1980s"], correct: 1 },
  { question: "Volvo originated in which country?", choices: ["Norway", "Finland", "Sweden", "Denmark"], correct: 2 },
  { question: "Which brand owns Bentley?", choices: ["BMW", "Volkswagen", "Mercedes", "Ford"], correct: 1 },
  { question: "The Cadillac brand is based in?", choices: ["Germany", "France", "USA", "UK"], correct: 2 },
  { question: "Hyundai is from which country?", choices: ["Japan", "China", "South Korea", "Taiwan"], correct: 2 },
  { question: "Which logo features a prancing horse?", choices: ["Lamborghini", "Ferrari", "Maserati", "Alfa Romeo"], correct: 1 },
  { question: "Mini Cooper is owned by?", choices: ["BMW", "Audi", "Volkswagen", "Ford"], correct: 0 },
  { question: "Subaru logo depicts what star cluster?", choices: ["Orion", "Pleiades", "Big Dipper", "Andromeda"], correct: 1 },
  { question: "Henry Ford pioneered the?", choices: ["Diesel engine", "Assembly line", "Catalytic converter", "Hybrid drive"], correct: 1 },
  { question: "Which Korean brand makes the Stinger?", choices: ["Hyundai", "Daewoo", "Kia", "SsangYong"], correct: 2 },
  { question: "Mercedes-Benz logo is a?", choices: ["Star", "Wing", "Crown", "Wheel"], correct: 0 },
  { question: "Jaguar is based in which country?", choices: ["Germany", "Italy", "UK", "France"], correct: 2 },
  { question: "Bugatti is famous for?", choices: ["Compact cars", "Hypercars", "Trucks", "EVs only"], correct: 1 },
  { question: "Pagani is an automaker from?", choices: ["Spain", "Italy", "France", "UK"], correct: 1 },
  { question: "McLaren originated as a?", choices: ["Truck builder", "Racing team", "Tractor maker", "Marine company"], correct: 1 },
  { question: "Rolls-Royce is owned by?", choices: ["BMW", "Mercedes", "Volkswagen", "Toyota"], correct: 0 },
  { question: "Tesla's first car was the?", choices: ["Model S", "Roadster", "Model 3", "Cybertruck"], correct: 1 },
  { question: "Aston Martin is famously associated with?", choices: ["Batman", "James Bond", "Iron Man", "Indiana Jones"], correct: 1 },
  { question: "Peugeot is based in?", choices: ["Italy", "Spain", "France", "Germany"], correct: 2 },
  { question: "The Citroen logo represents?", choices: ["Wings", "A double chevron", "Stars", "Lions"], correct: 1 },
  { question: "Which Italian brand made the 500 city car?", choices: ["Lancia", "Alfa Romeo", "Fiat", "Maserati"], correct: 2 },
  { question: "Land Rover is part of which group?", choices: ["BMW", "Tata Motors", "Volkswagen", "GM"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: CarBrandsQuizSettings): CarBrandsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: CarBrandsQuizState, action: CarBrandsQuizAction): CarBrandsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: CarBrandsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
