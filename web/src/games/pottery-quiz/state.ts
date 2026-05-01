import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PotteryQuizSettings { questions: "10" | "20"; }
export interface PotteryQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PotteryQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "'Throwing' clay refers to?",
    "choices": [
      "firing",
      "shaping on a wheel",
      "glazing",
      "drying"
    ],
    "correct": 1
  },
  {
    "question": "Kilns reach temperatures up to about?",
    "choices": [
      "500\u00b0C",
      "800\u00b0C",
      "1300\u00b0C",
      "2500\u00b0C"
    ],
    "correct": 2
  },
  {
    "question": "Bisque firing is the?",
    "choices": [
      "glaze firing",
      "first firing",
      "raku",
      "none"
    ],
    "correct": 1
  },
  {
    "question": "Clay 'leather-hard' is ready for?",
    "choices": [
      "throwing",
      "trimming/handles",
      "glazing",
      "firing"
    ],
    "correct": 1
  },
  {
    "question": "The hottest cone (lowest number) is for?",
    "choices": [
      "earthenware",
      "stoneware",
      "porcelain",
      "raku"
    ],
    "correct": 2
  },
  {
    "question": "Earthenware fires at?",
    "choices": [
      "high temps",
      "low temps",
      "cone 10",
      "cone 15"
    ],
    "correct": 1
  },
  {
    "question": "Stoneware fires typically at cones?",
    "choices": [
      "04-06",
      "6-10",
      "20+",
      "cold"
    ],
    "correct": 1
  },
  {
    "question": "Porcelain originated in?",
    "choices": [
      "Egypt",
      "China",
      "Greece",
      "Mesopotamia"
    ],
    "correct": 1
  },
  {
    "question": "'Slip' is liquid clay used for?",
    "choices": [
      "glazing",
      "joining/decoration",
      "throwing",
      "drying"
    ],
    "correct": 1
  },
  {
    "question": "Raku firing originated in?",
    "choices": [
      "China",
      "Japan",
      "Korea",
      "Vietnam"
    ],
    "correct": 1
  },
  {
    "question": "'Wedging' clay removes?",
    "choices": [
      "water",
      "air bubbles",
      "glaze",
      "grog"
    ],
    "correct": 1
  },
  {
    "question": "Coiling is a hand-building technique using?",
    "choices": [
      "slabs",
      "ropes/coils of clay",
      "pinches",
      "molds"
    ],
    "correct": 1
  },
  {
    "question": "Pinch pots are made by?",
    "choices": [
      "wheel",
      "pressing thumb into ball",
      "slabs",
      "molds"
    ],
    "correct": 1
  },
  {
    "question": "Slab building uses?",
    "choices": [
      "coils",
      "flat sheets of clay",
      "pinches",
      "molds"
    ],
    "correct": 1
  },
  {
    "question": "Glazes are essentially?",
    "choices": [
      "paint",
      "glass forming on clay",
      "plastic",
      "wax"
    ],
    "correct": 1
  },
  {
    "question": "'Reduction' firing reduces?",
    "choices": [
      "temperature",
      "oxygen in kiln",
      "clay",
      "fuel"
    ],
    "correct": 1
  },
  {
    "question": "'Sgraffito' decoration is?",
    "choices": [
      "dotting",
      "scratching through slip",
      "glazing",
      "painting"
    ],
    "correct": 1
  },
  {
    "question": "Greenware is clay that is?",
    "choices": [
      "fired",
      "unfired",
      "glazed",
      "green-colored"
    ],
    "correct": 1
  },
  {
    "question": "'Grog' added to clay improves?",
    "choices": [
      "color",
      "strength/thermal shock",
      "glaze fit",
      "plasticity"
    ],
    "correct": 1
  },
  {
    "question": "A potter's wheel originated around?",
    "choices": [
      "3500 BCE",
      "500 CE",
      "1200 CE",
      "1800 CE"
    ],
    "correct": 0
  },
  {
    "question": "Saggar firing protects pieces using?",
    "choices": [
      "water",
      "container/saggar in kiln",
      "oxygen",
      "heat"
    ],
    "correct": 1
  },
  {
    "question": "Crystalline glazes form crystals during?",
    "choices": [
      "bisque",
      "cooling phase",
      "drying",
      "wedging"
    ],
    "correct": 1
  },
  {
    "question": "Celadon is a famous green/blue?",
    "choices": [
      "clay",
      "glaze",
      "wheel",
      "kiln"
    ],
    "correct": 1
  },
  {
    "question": "Majolica is tin-glazed?",
    "choices": [
      "porcelain",
      "earthenware",
      "stoneware",
      "raku"
    ],
    "correct": 1
  },
  {
    "question": "Bone china includes?",
    "choices": [
      "bone ash",
      "glass",
      "metal",
      "sand"
    ],
    "correct": 0
  },
  {
    "question": "Soda firing introduces sodium during?",
    "choices": [
      "wedging",
      "firing",
      "drying",
      "glazing"
    ],
    "correct": 1
  },
  {
    "question": "Pyrometric cones measure?",
    "choices": [
      "temperature only",
      "heatwork (time+temp)",
      "weight",
      "color"
    ],
    "correct": 1
  },
  {
    "question": "'Crawling' is a glaze defect of?",
    "choices": [
      "cracking",
      "beading/separating",
      "pinholing",
      "crazing"
    ],
    "correct": 1
  },
  {
    "question": "'Crazing' is a glaze defect of?",
    "choices": [
      "bubbles",
      "fine cracks",
      "running",
      "matte spots"
    ],
    "correct": 1
  },
  {
    "question": "A potter's 'rib' is a tool for?",
    "choices": [
      "wedging",
      "smoothing/shaping",
      "firing",
      "glazing"
    ],
    "correct": 1
  },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: PotteryQuizSettings): PotteryQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: PotteryQuizState, action: PotteryQuizAction): PotteryQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: PotteryQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
