import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BulletTrainsQuizSettings { questions: "10" | "20" | "30"; }
export interface BulletTrainsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BulletTrainsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What is Japan's bullet train system called?", choices: ["Shinkansen", "Maglev", "Tokaido", "Hayate"], correct: 0 },
  { question: "What does 'Shinkansen' literally mean?", choices: ["New trunk line", "Bullet train", "Fast train", "Modern rail"], correct: 0 },
  { question: "The first Shinkansen line opened between?", choices: ["Tokyo and Osaka (Tokaido)", "Tokyo and Kyoto", "Osaka and Hiroshima", "Tokyo and Sendai"], correct: 0 },
  { question: "Shinkansen began service in?", choices: ["1964", "1970", "1958", "1968"], correct: 0 },
  { question: "Shinkansen was timed to launch with what event?", choices: ["Tokyo Olympics", "World Expo", "Asian Games", "Imperial visit"], correct: 0 },
  { question: "What is the typical max operating speed of N700 Shinkansen?", choices: ["285-300 km/h", "250 km/h", "350 km/h", "200 km/h"], correct: 0 },
  { question: "What is the world's fastest commercial high-speed train?", choices: ["Shanghai Maglev (~431 km/h)", "TGV", "Shinkansen N700S", "ICE Velaro"], correct: 0 },
  { question: "TGV (France) introduced commercial service in?", choices: ["1981", "1975", "1985", "1990"], correct: 0 },
  { question: "TGV's record speed for conventional rail?", choices: ["574.8 km/h (2007 test)", "500 km/h", "600 km/h", "450 km/h"], correct: 0 },
  { question: "TGV stands for?", choices: ["Train à Grande Vitesse", "Transit Grand Voyage", "Train Galaxy Vector", "Train Grand Vert"], correct: 0 },
  { question: "Germany's high-speed train brand is?", choices: ["ICE (Intercity-Express)", "AGV", "EuroStar", "Talgo"], correct: 0 },
  { question: "Italy's high-speed train brand?", choices: ["Frecciarossa", "Talgo", "ICE", "AVE"], correct: 0 },
  { question: "Spain's high-speed train brand?", choices: ["AVE (Alta Velocidad Española)", "Renfe", "Talgo", "Iberia Rail"], correct: 0 },
  { question: "China's high-speed network is?", choices: ["The world's largest", "Smaller than Japan", "Newest in Asia", "Limited regional"], correct: 0 },
  { question: "China Railway Hexie/Fuxing trains operate at speeds up to?", choices: ["350 km/h commercial", "300 km/h", "400 km/h", "250 km/h"], correct: 0 },
  { question: "Eurostar runs through which tunnel?", choices: ["Channel Tunnel", "Mont Blanc Tunnel", "Gotthard", "Lötschberg"], correct: 0 },
  { question: "Eurostar started service in?", choices: ["1994", "1990", "2000", "1985"], correct: 0 },
  { question: "Acela is the high-speed service operated by?", choices: ["Amtrak (US)", "VIA Rail", "Brightline", "MTA"], correct: 0 },
  { question: "Acela's typical top speed?", choices: ["About 150 mph (240 km/h)", "200 mph", "100 mph", "300 mph"], correct: 0 },
  { question: "What is California High-Speed Rail's planned route?", choices: ["LA to San Francisco", "LA to Las Vegas", "SF to Portland", "SF to San Diego"], correct: 0 },
  { question: "Maglev's full name?", choices: ["Magnetic Levitation", "Magnetic Linear Velocity", "Modern Aerodynamic Glider", "Magneto Velocity"], correct: 0 },
  { question: "Shanghai Maglev runs to?", choices: ["Pudong Airport", "Hongqiao Airport", "City center", "Suzhou"], correct: 0 },
  { question: "Japan's L0 series Maglev test record speed?", choices: ["603 km/h (2015)", "500 km/h", "700 km/h", "550 km/h"], correct: 0 },
  { question: "What is JR Central's planned Chuo Shinkansen Maglev route?", choices: ["Tokyo to Nagoya (then Osaka)", "Osaka to Hiroshima", "Tokyo to Sendai", "Kyoto to Osaka"], correct: 0 },
  { question: "What's the name of the Shinkansen's nose-design influence?", choices: ["Kingfisher beak (for tunnel boom reduction)", "Eagle wings", "Penguin", "Owl"], correct: 0 },
  { question: "What city is Shinkansen Hayabusa associated with?", choices: ["Tokyo to northern Honshu (Tohoku/Hokkaido lines)", "Tokyo to Osaka", "Kyoto to Osaka", "Tokyo to Hokkaido only"], correct: 0 },
  { question: "China's first high-speed line (Beijing-Tianjin) opened in?", choices: ["2008", "2005", "2010", "2003"], correct: 0 },
  { question: "Spain's AVE first opened between?", choices: ["Madrid and Seville (1992)", "Madrid and Barcelona", "Barcelona and Valencia", "Madrid and Bilbao"], correct: 0 },
  { question: "What technology does Maglev use to move trains?", choices: ["Electromagnetic propulsion and levitation", "Steam", "Diesel", "Pneumatic"], correct: 0 },
  { question: "Korea's high-speed train brand?", choices: ["KTX (Korea Train eXpress)", "Hyundai Rotem", "Saemaul", "Mugunghwa"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: BulletTrainsQuizSettings): BulletTrainsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: BulletTrainsQuizState, action: BulletTrainsQuizAction): BulletTrainsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: BulletTrainsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
