import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BuddhismQuizSettings { questions: "10" | "20" | "30"; }
export interface BuddhismQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BuddhismQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who founded Buddhism?", choices: ["Siddhartha Gautama (Buddha)","Confucius","Lao Tzu","Mahavira"], correct: 0 },
  { question: "What does Buddha mean?", choices: ["Enlightened/Awakened one","Teacher","Both","Just enlightened"], correct: 2 },
  { question: "In what country was Buddha born?", choices: ["Nepal","India","Tibet","Sri Lanka"], correct: 0 },
  { question: "In what century did Buddha live (approximately)?", choices: ["6th-5th century BCE","1st century CE","8th century BCE","2nd century BCE"], correct: 0 },
  { question: "What are the Four Noble Truths?", choices: ["Truth of suffering, cause, cessation, path","Just suffering","Both","Just truths"], correct: 2 },
  { question: "What's the first Noble Truth?", choices: ["Life involves suffering (dukkha)","Path","Cessation","Cause"], correct: 0 },
  { question: "What's the second Noble Truth?", choices: ["Cause of suffering is craving","Just suffering","Both","Path"], correct: 0 },
  { question: "What's the third Noble Truth?", choices: ["Suffering can cease (Nirvana)","Just cessation","Both","Path"], correct: 0 },
  { question: "What's the fourth Noble Truth?", choices: ["Eightfold Path leads to cessation","Just path","Both","Just direction"], correct: 2 },
  { question: "How many parts to the Eightfold Path?", choices: ["8","4","6","10"], correct: 0 },
  { question: "What's the goal of Buddhism?", choices: ["Nirvana","Heaven","Both","Just liberation"], correct: 2 },
  { question: "What's Nirvana?", choices: ["Liberation from suffering and rebirth","Just heaven","Both","Just bliss"], correct: 2 },
  { question: "What's karma in Buddhism?", choices: ["Action and consequence affecting rebirth","Just fate","Both","Just deed"], correct: 2 },
  { question: "What's reincarnation in Buddhism?", choices: ["Cycle of rebirth (samsara)","Just rebirth","Both","Just samsara"], correct: 2 },
  { question: "What's the Sangha?", choices: ["Buddhist monastic community","Just community","Both","Just monks"], correct: 2 },
  { question: "What's the Tripitaka?", choices: ["Three Baskets of Buddhist scripture","Just scripture","Both","Holy book"], correct: 2 },
  { question: "What three Buddhist branches?", choices: ["Theravada, Mahayana, Vajrayana","Just two","All three","Three main"], correct: 3 },
  { question: "What's Theravada Buddhism?", choices: ["Older school, Sri Lanka, SE Asia","Just older","Both","Just school"], correct: 2 },
  { question: "What's Mahayana Buddhism?", choices: ["Larger vehicle, East Asia","Just larger","Both","Different"], correct: 2 },
  { question: "What's Vajrayana / Tibetan Buddhism?", choices: ["Diamond vehicle, Tibet","Just Tibetan","Both","Different"], correct: 2 },
  { question: "What's a Bodhisattva?", choices: ["One who delays Nirvana to help others","Just helper","Both","Just figure"], correct: 2 },
  { question: "Who's the Dalai Lama?", choices: ["Spiritual leader of Tibetan Buddhism","Just monk","Both","Just leader"], correct: 2 },
  { question: "What's meditation in Buddhism?", choices: ["Mental discipline including mindfulness","Just sitting","Both","Just thought"], correct: 2 },
  { question: "What's Zen Buddhism's emphasis?", choices: ["Direct experience/meditation","Just meditation","Both","Different"], correct: 2 },
  { question: "What's a koan?", choices: ["Zen paradoxical statement","Just question","Both","Just statement"], correct: 2 },
  { question: "What's the Lotus Sutra?", choices: ["Important Mahayana scripture","Just scripture","Both","Just text"], correct: 2 },
  { question: "What's the Bodhi Tree?", choices: ["Where Buddha attained enlightenment","Just tree","Both","Sacred tree"], correct: 2 },
  { question: "What's the Wheel of Dharma?", choices: ["Symbol of Buddha's teaching","Just wheel","Both","Symbol"], correct: 2 },
  { question: "What's compassion called in Buddhism?", choices: ["Karuna","Metta (loving-kindness)","Both important","Just compassion"], correct: 2 },
  { question: "What's Buddhism's first precept?", choices: ["No killing","No stealing","No lying","Just precept"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: BuddhismQuizSettings): BuddhismQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: BuddhismQuizState, action: BuddhismQuizAction): BuddhismQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: BuddhismQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
