import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MarineBioQuizSettings { questions: "10" | "20" | "30"; }
export interface MarineBioQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MarineBioQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What's the largest ocean?", choices: ["Pacific","Atlantic","Indian","Arctic"], correct: 0 },
  { question: "What's the deepest part of the ocean?", choices: ["Mariana Trench","Tonga Trench","Java Trench","Puerto Rico Trench"], correct: 0 },
  { question: "How deep is the Mariana Trench?", choices: ["~11,000 m","~5,000 m","~7,000 m","~15,000 m"], correct: 0 },
  { question: "What's the largest animal in the ocean?", choices: ["Blue whale","Giant squid","Whale shark","Sperm whale"], correct: 0 },
  { question: "What's the largest fish?", choices: ["Whale shark","Basking shark","Great white","Manta ray"], correct: 0 },
  { question: "What's the most dangerous shark?", choices: ["Great white (most attacks)","Tiger","Bull","Both Bull and Great white"], correct: 3 },
  { question: "What's coral made of?", choices: ["Cnidarian polyps with calcium carbonate","Plant","Both","Algae"], correct: 2 },
  { question: "What's the largest reef in the world?", choices: ["Great Barrier Reef","Mesoamerican","Red Sea","Coral Triangle"], correct: 0 },
  { question: "What ocean phenomenon is El Nino?", choices: ["Warm Pacific water shift","Cold Pacific","Both warm/cold cycle","Just storm"], correct: 0 },
  { question: "What's the smallest ocean?", choices: ["Arctic","Atlantic","Indian","Pacific"], correct: 0 },
  { question: "What's a cephalopod?", choices: ["Octopus, squid, cuttlefish","Just octopus","Both","Just squid"], correct: 2 },
  { question: "How many hearts does an octopus have?", choices: ["3","2","1","4"], correct: 0 },
  { question: "How many tentacles does an octopus have?", choices: ["8","10","6","12"], correct: 0 },
  { question: "How many tentacles does a squid have?", choices: ["10 (8 arms + 2 tentacles)","8","6","Just 10"], correct: 0 },
  { question: "What's plankton?", choices: ["Drifting marine organisms (phyto and zoo)","Just plant","Both","Just animal"], correct: 2 },
  { question: "What's phytoplankton?", choices: ["Plant plankton (photosynthesizers)","Animal","Both","Bacteria only"], correct: 0 },
  { question: "What's zooplankton?", choices: ["Animal plankton","Plant","Both","Bacteria"], correct: 0 },
  { question: "What ocean current is the Gulf Stream?", choices: ["Warm Atlantic current","Cold","Both","Pacific"], correct: 0 },
  { question: "What's the bioluminescent ocean phenomenon?", choices: ["Living organisms producing light","Reflection","Both","Algal bloom"], correct: 2 },
  { question: "What pinniped includes seals and sea lions?", choices: ["Seals, sea lions, walruses","Just seals","Both","Just walrus"], correct: 2 },
  { question: "What's a marine mammal?", choices: ["Whales, dolphins, seals, etc.","Just whales","Both","Just dolphins"], correct: 2 },
  { question: "What's the difference between a dolphin and a porpoise?", choices: ["Different family, body shape, teeth","Same","Just size","Just color"], correct: 0 },
  { question: "What's a Manta ray?", choices: ["Large ray, plankton feeder","Predator","Both","Just predator"], correct: 2 },
  { question: "How long can sea turtles live?", choices: ["~50-100+ years","~10","~30","~200"], correct: 0 },
  { question: "What's a dugong?", choices: ["Sea cow / sirenian","Whale","Both","Dolphin"], correct: 2 },
  { question: "What's a manatee?", choices: ["Sirenian similar to dugong","Whale","Both","Dolphin"], correct: 2 },
  { question: "What's the world's largest jellyfish?", choices: ["Lion's mane","Box","Moon","Atolla"], correct: 0 },
  { question: "What's the most venomous marine creature?", choices: ["Box jellyfish","Stonefish","Cone snail","All deadly"], correct: 0 },
  { question: "What's a Portuguese man o' war?", choices: ["Siphonophore (colonial cnidarian)","Jellyfish","Both","Just jellyfish"], correct: 2 },
  { question: "How long can dolphins hold breath?", choices: ["~10 minutes (varies)","~1 min","~30 min","~1 hour"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: MarineBioQuizSettings): MarineBioQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MarineBioQuizState, action: MarineBioQuizAction): MarineBioQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MarineBioQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
