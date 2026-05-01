import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface OceaniaQuizSettings { questions: "10" | "20" | "30"; }
export interface OceaniaQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type OceaniaQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What is the largest country in Oceania?", choices: ["Papua New Guinea","Australia","New Zealand","Fiji"], correct: 1 },
  { question: "What is the capital of Australia?", choices: ["Sydney","Melbourne","Canberra","Brisbane"], correct: 2 },
  { question: "What is the capital of New Zealand?", choices: ["Auckland","Wellington","Christchurch","Hamilton"], correct: 1 },
  { question: "What is the largest reef system in the world, off Australia's coast?", choices: ["Mesoamerican Reef","Great Barrier Reef","Red Sea Coral Reef","New Caledonia Barrier Reef"], correct: 1 },
  { question: "Which country shares the island of New Guinea with Papua New Guinea?", choices: ["Australia","Indonesia","East Timor","Solomon Islands"], correct: 1 },
  { question: "Mount Cook (Aoraki) is the highest peak in which country?", choices: ["Australia","New Zealand","Papua New Guinea","Fiji"], correct: 1 },
  { question: "What is the capital of Fiji?", choices: ["Lautoka","Suva","Nadi","Labasa"], correct: 1 },
  { question: "Which Australian state contains Sydney?", choices: ["Victoria","Queensland","New South Wales","Western Australia"], correct: 2 },
  { question: "What is the largest desert in Australia?", choices: ["Gibson","Great Sandy","Great Victoria","Tanami"], correct: 2 },
  { question: "What sacred sandstone monolith is in central Australia?", choices: ["Kata Tjuta","Uluru","The Olgas","Devils Marbles"], correct: 1 },
  { question: "Easter Island is a territory of which country?", choices: ["New Zealand","Chile","France","Australia"], correct: 1 },
  { question: "What sea separates Australia and New Zealand?", choices: ["Tasman Sea","Coral Sea","Arafura Sea","Bismarck Sea"], correct: 0 },
  { question: "What is the capital of Papua New Guinea?", choices: ["Lae","Madang","Port Moresby","Mount Hagen"], correct: 2 },
  { question: "What is the indigenous people of Australia called?", choices: ["Maori","Aboriginal Australians","Polynesians","Melanesians"], correct: 1 },
  { question: "What is the indigenous people of New Zealand called?", choices: ["Aboriginal","Maori","Samoan","Tongan"], correct: 1 },
  { question: "What is the capital of Samoa?", choices: ["Apia","Pago Pago","Nukualofa","Suva"], correct: 0 },
  { question: "What is the smallest country in Oceania (and one of the smallest in the world)?", choices: ["Tuvalu","Nauru","Palau","Marshall Islands"], correct: 1 },
  { question: "What is the largest island in Oceania?", choices: ["Tasmania","South Island NZ","New Guinea","North Island NZ"], correct: 2 },
  { question: "What strait separates Australia from Tasmania?", choices: ["Cook Strait","Torres Strait","Bass Strait","Foveaux Strait"], correct: 2 },
  { question: "What is the capital of Tonga?", choices: ["Apia","Suva","Nukualofa","Funafuti"], correct: 2 },
  { question: "What ocean is Oceania located in?", choices: ["Atlantic","Pacific","Indian","Southern"], correct: 1 },
  { question: "What is the highest mountain in Australia?", choices: ["Mount Bartle Frere","Mount Kosciuszko","Mount Ossa","Mount Bogong"], correct: 1 },
  { question: "What strait separates Australia from Papua New Guinea?", choices: ["Bass Strait","Torres Strait","Cook Strait","Banda Strait"], correct: 1 },
  { question: "What is the longest river in Australia?", choices: ["Darling","Murray","Murrumbidgee","Cooper Creek"], correct: 1 },
  { question: "What is the capital of Solomon Islands?", choices: ["Honiara","Port Vila","Funafuti","Yaren"], correct: 0 },
  { question: "What language is spoken in New Caledonia (officially)?", choices: ["English","French","Spanish","Dutch"], correct: 1 },
  { question: "Hawaii is part of which subregion of Oceania?", choices: ["Melanesia","Micronesia","Polynesia","Australasia"], correct: 2 },
  { question: "What is the capital of Vanuatu?", choices: ["Port Vila","Luganville","Suva","Apia"], correct: 0 },
  { question: "What is the smallest mainland Australian state by area?", choices: ["Tasmania","Victoria","South Australia","ACT"], correct: 1 },
  { question: "Which country comprises the North Island and South Island?", choices: ["Australia","New Zealand","Fiji","Samoa"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: OceaniaQuizSettings): OceaniaQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: OceaniaQuizState, action: OceaniaQuizAction): OceaniaQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: OceaniaQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
