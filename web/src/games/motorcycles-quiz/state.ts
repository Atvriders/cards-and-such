import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MotorcyclesQuizSettings { questions: "10" | "20" | "30"; }
export interface MotorcyclesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MotorcyclesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who founded Harley-Davidson?", choices: ["William Harley and Arthur Davidson", "Henry Ford", "John Harley", "Fred Davidson alone"], correct: 0 },
  { question: "Harley-Davidson was founded in?", choices: ["1903", "1910", "1898", "1920"], correct: 0 },
  { question: "What city is Harley-Davidson headquartered in?", choices: ["Milwaukee", "Detroit", "Chicago", "Cleveland"], correct: 0 },
  { question: "Who founded Honda Motor Co. (motorcycles)?", choices: ["Soichiro Honda", "Kiichiro Toyoda", "Akio Morita", "Konosuke Matsushita"], correct: 0 },
  { question: "What is the best-selling motor vehicle in history?", choices: ["Honda Super Cub", "VW Beetle", "Toyota Corolla", "Ford F-150"], correct: 0 },
  { question: "What year did Honda introduce the Super Cub?", choices: ["1958", "1965", "1972", "1950"], correct: 0 },
  { question: "What is the famous 'Triumph Bonneville' named after?", choices: ["Bonneville Salt Flats", "A village in England", "A racing track", "A river"], correct: 0 },
  { question: "Where is Triumph Motorcycles based?", choices: ["Hinckley, England", "Birmingham", "Manchester", "London"], correct: 0 },
  { question: "What Italian brand makes the V-twin Monster series?", choices: ["Ducati", "MV Agusta", "Aprilia", "Moto Guzzi"], correct: 0 },
  { question: "Where is Ducati headquartered?", choices: ["Bologna", "Milan", "Rome", "Turin"], correct: 0 },
  { question: "Who owns Ducati now?", choices: ["Audi (VW Group)", "BMW", "Honda", "Yamaha"], correct: 0 },
  { question: "What Japanese brand makes the YZF-R1?", choices: ["Yamaha", "Honda", "Kawasaki", "Suzuki"], correct: 0 },
  { question: "Kawasaki's Ninja is what type of bike?", choices: ["Sportbike", "Cruiser", "Touring", "Off-road"], correct: 0 },
  { question: "What German brand makes the GS adventure bikes?", choices: ["BMW", "KTM", "Husqvarna", "Sachs"], correct: 0 },
  { question: "Where is KTM headquartered?", choices: ["Mattighofen, Austria", "Munich, Germany", "Bologna, Italy", "Helsinki, Finland"], correct: 0 },
  { question: "What does 'MotoGP' stand for?", choices: ["Motorcycle Grand Prix", "Motor Grand Prize", "Motor Group Prix", "Motorbike Globe Prix"], correct: 0 },
  { question: "How many MotoGP titles has Valentino Rossi won?", choices: ["9", "7", "5", "11"], correct: 0 },
  { question: "Marc Marquez races for which factory team in MotoGP (most successfully)?", choices: ["Honda Repsol", "Yamaha", "Ducati", "Suzuki"], correct: 0 },
  { question: "Isle of Man TT races have been held since?", choices: ["1907", "1920", "1935", "1950"], correct: 0 },
  { question: "What is the famous Indian Motorcycle's home country?", choices: ["United States", "India", "England", "Italy"], correct: 0 },
  { question: "Indian Motorcycles was founded in?", choices: ["1901", "1910", "1925", "1898"], correct: 0 },
  { question: "What classifies a 'cruiser' motorcycle?", choices: ["Low seat, relaxed riding position", "Aggressive sport position", "Off-road capability", "Touring fairings"], correct: 0 },
  { question: "What is a 'cafe racer' style?", choices: ["Stripped-down classic with low handlebars", "Modern superbike", "Off-road dirt bike", "Touring bike"], correct: 0 },
  { question: "Easy Rider (1969) features what type of motorcycle?", choices: ["Customized Harley-Davidson choppers", "Triumph Bonneville", "Indian Chief", "Honda 750"], correct: 0 },
  { question: "What does 'cc' measure on a motorcycle engine?", choices: ["Cubic centimeters of displacement", "Cylinder count", "Compression ratio", "Combustion cycle"], correct: 0 },
  { question: "What was the first production motorcycle to top 200 mph?", choices: ["Suzuki Hayabusa (1999)", "Kawasaki Ninja H2", "BMW S1000RR", "Ducati Panigale"], correct: 0 },
  { question: "What is Vespa famous for?", choices: ["Italian scooters", "Sportbikes", "Cruisers", "Touring bikes"], correct: 0 },
  { question: "Vespa is made by which company?", choices: ["Piaggio", "Ducati", "Aprilia", "MV Agusta"], correct: 0 },
  { question: "Steve McQueen's famous bike in 'The Great Escape' was?", choices: ["Triumph TR6 Trophy", "Harley Knucklehead", "BMW R75", "Indian Scout"], correct: 0 },
  { question: "What does 'ABS' on a motorcycle stand for?", choices: ["Anti-lock Braking System", "Auto Brake System", "Active Braking Sensor", "Adjustable Brake System"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: MotorcyclesQuizSettings): MotorcyclesQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MotorcyclesQuizState, action: MotorcyclesQuizAction): MotorcyclesQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MotorcyclesQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
