import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PhysicsQuizSettings { questions: "10" | "20" | "30"; }
export interface PhysicsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PhysicsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who proposed laws of motion in 1687?", choices: ["Isaac Newton","Albert Einstein","Galileo Galilei","Stephen Hawking"], correct: 0 },
  { question: "What's Newton's first law?", choices: ["Inertia: object at rest stays at rest","F=ma","Action-reaction","Gravity"], correct: 0 },
  { question: "What's Newton's second law?", choices: ["F=ma","Inertia","Action-reaction","Universal gravitation"], correct: 0 },
  { question: "What's Newton's third law?", choices: ["For every action there's equal opposite reaction","Inertia","F=ma","Gravity"], correct: 0 },
  { question: "What's E=mc^2 from?", choices: ["Einstein's special relativity","Newton","Maxwell","Bohr"], correct: 0 },
  { question: "Who proposed special relativity?", choices: ["Einstein","Newton","Galileo","Hawking"], correct: 0 },
  { question: "In what year was special relativity published?", choices: ["1905","1915","1925","1900"], correct: 0 },
  { question: "What's general relativity about?", choices: ["Gravity as spacetime curvature","Electromagnetism","Quantum","Forces"], correct: 0 },
  { question: "What's the SI unit of force?", choices: ["Newton","Joule","Watt","Volt"], correct: 0 },
  { question: "What's the SI unit of energy?", choices: ["Joule","Newton","Watt","Calorie"], correct: 0 },
  { question: "What's the SI unit of power?", choices: ["Watt","Joule","Newton","Calorie"], correct: 0 },
  { question: "What's gravity's acceleration on Earth?", choices: ["~9.8 m/s^2","~10 km/s^2","~32 m/s^2","Both 9.8 and 32 (different units)"], correct: 3 },
  { question: "What's the speed of sound in air (approx)?", choices: ["343 m/s","300,000 m/s","100 m/s","1000 m/s"], correct: 0 },
  { question: "What's the speed of light?", choices: ["~3e8 m/s","~3e6 m/s","~3e10 m/s","~3e9 m/s"], correct: 0 },
  { question: "What's the Doppler effect?", choices: ["Frequency change due to motion","Just sound","Both","Just light"], correct: 0 },
  { question: "What's quantum mechanics?", choices: ["Physics at atomic/subatomic scales","Just atoms","Both","Just particles"], correct: 2 },
  { question: "What's the Heisenberg uncertainty principle?", choices: ["Cannot know position and momentum exactly","Just position","Just momentum","Just energy"], correct: 0 },
  { question: "What's electromagnetism?", choices: ["Force between charges","Just electricity","Both","Just magnetism"], correct: 2 },
  { question: "What four forces are fundamental?", choices: ["Gravity, EM, weak, strong","Just gravity","Just EM","Two only"], correct: 0 },
  { question: "What's an electron?", choices: ["Negatively charged particle","Positively charged","Neutral","Both pos/neg"], correct: 0 },
  { question: "What's a proton?", choices: ["Positively charged in nucleus","Negative","Neutral","Outside nucleus"], correct: 0 },
  { question: "What's a neutron?", choices: ["Neutral particle in nucleus","Positive","Negative","Outside nucleus"], correct: 0 },
  { question: "What's the smallest unit of matter (commonly)?", choices: ["Atom (with quarks/leptons subatomic)","Just atom","Just quark","Both atom and subatomic"], correct: 3 },
  { question: "What's a wavelength?", choices: ["Distance between wave peaks","Time of wave","Speed","Mass"], correct: 0 },
  { question: "What's frequency unit?", choices: ["Hertz","Newton","Joule","Watt"], correct: 0 },
  { question: "What's an inertial reference frame?", choices: ["Non-accelerating frame","Accelerating","Both","Earth frame"], correct: 0 },
  { question: "What's thermodynamics first law?", choices: ["Energy conservation","Entropy increases","Both","Just energy"], correct: 2 },
  { question: "What's thermodynamics second law?", choices: ["Entropy increases (isolated systems)","Energy conserved","Both","Different"], correct: 0 },
  { question: "What's absolute zero?", choices: ["0 Kelvin / -273.15 C","0 C","-100 C","-200 C"], correct: 0 },
  { question: "What's a black body?", choices: ["Idealized perfect absorber","Just black object","Both","Star"], correct: 2 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: PhysicsQuizSettings): PhysicsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: PhysicsQuizState, action: PhysicsQuizAction): PhysicsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: PhysicsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
