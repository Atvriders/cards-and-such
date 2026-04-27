import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PhotographyQuizSettings { questions: "10" | "20"; }
export interface PhotographyQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PhotographyQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Aperture is measured in?",
    "choices": [
      "seconds",
      "f-stops",
      "ISO",
      "mm"
    ],
    "correct": 1
  },
  {
    "question": "A higher ISO means?",
    "choices": [
      "less light sensitivity",
      "more light sensitivity",
      "faster shutter",
      "longer focus"
    ],
    "correct": 1
  },
  {
    "question": "Shutter speed of 1/1000s is?",
    "choices": [
      "slow",
      "very fast",
      "moderate",
      "one second"
    ],
    "correct": 1
  },
  {
    "question": "A wider aperture has a smaller?",
    "choices": [
      "f-number",
      "ISO",
      "focal length",
      "sensor"
    ],
    "correct": 0
  },
  {
    "question": "Rule of thirds divides image into?",
    "choices": [
      "2 parts",
      "6 parts",
      "9 parts",
      "12 parts"
    ],
    "correct": 2
  },
  {
    "question": "Ansel Adams is famous for?",
    "choices": [
      "portraits",
      "B&W landscapes",
      "war photos",
      "fashion"
    ],
    "correct": 1
  },
  {
    "question": "DSLR stands for?",
    "choices": [
      "Digital Single Lens Reflex",
      "Digital Standard Lens Range",
      "Digital Sensor Lens Reflector",
      "Direct Sensor Lens Read"
    ],
    "correct": 0
  },
  {
    "question": "Bokeh refers to?",
    "choices": [
      "framing",
      "blurry background quality",
      "tone",
      "focus"
    ],
    "correct": 1
  },
  {
    "question": "A telephoto lens has?",
    "choices": [
      "short focal length",
      "long focal length",
      "fixed focal length",
      "variable aperture only"
    ],
    "correct": 1
  },
  {
    "question": "Depth of field controls?",
    "choices": [
      "color",
      "focus area depth",
      "exposure",
      "contrast"
    ],
    "correct": 1
  },
  {
    "question": "RAW files are?",
    "choices": [
      "compressed",
      "uncompressed image data",
      "JPEG variants",
      "video format"
    ],
    "correct": 1
  },
  {
    "question": "Henri Cartier-Bresson coined?",
    "choices": [
      "The decisive moment",
      "Zone system",
      "Bulb mode",
      "Flash sync"
    ],
    "correct": 0
  },
  {
    "question": "Golden hour is just after?",
    "choices": [
      "midnight",
      "sunrise/before sunset",
      "noon",
      "midnight"
    ],
    "correct": 1
  },
  {
    "question": "A prime lens has?",
    "choices": [
      "zoom",
      "fixed focal length",
      "variable focal length",
      "macro only"
    ],
    "correct": 1
  },
  {
    "question": "Macro photography focuses on?",
    "choices": [
      "very small subjects close-up",
      "far away",
      "portraits",
      "landscapes"
    ],
    "correct": 0
  },
  {
    "question": "Exposure is the combination of?",
    "choices": [
      "aperture, shutter, ISO",
      "focus, shutter, color",
      "aperture, color, ISO",
      "white balance, ISO, focus"
    ],
    "correct": 0
  },
  {
    "question": "A lower f-number lets in?",
    "choices": [
      "less light",
      "more light",
      "same light",
      "no light"
    ],
    "correct": 1
  },
  {
    "question": "The 'magic hour' refers to?",
    "choices": [
      "midday",
      "golden hour",
      "blue hour",
      "midnight"
    ],
    "correct": 1
  },
  {
    "question": "A tripod helps with?",
    "choices": [
      "focus",
      "stability",
      "exposure",
      "color"
    ],
    "correct": 1
  },
  {
    "question": "Histograms show?",
    "choices": [
      "focus",
      "tonal distribution",
      "color saturation",
      "focal length"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: PhotographyQuizSettings): PhotographyQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: PhotographyQuizState, action: PhotographyQuizAction): PhotographyQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: PhotographyQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
