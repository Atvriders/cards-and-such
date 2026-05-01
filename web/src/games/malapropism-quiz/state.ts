import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MalapropismQuizSettings { questions: "8" | "10" | "12"; }
export interface MalapropismQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MalapropismQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Which is a malapropism for 'allegations'?",
    "choices": [
      "alligators ('lay our alligators on the table')",
      "advocations",
      "allegiances",
      "agitations"
    ],
    "correct": 0
  },
  {
    "question": "Which is a malapropism for 'pinnacle'?",
    "choices": [
      "pineapple ('the pineapple of success')",
      "panicle",
      "pinochle",
      "pinnacle"
    ],
    "correct": 0
  },
  {
    "question": "Which is a malapropism for 'electoral'?",
    "choices": [
      "electrical ('electrical college')",
      "electric",
      "electronics",
      "electoral"
    ],
    "correct": 0
  },
  {
    "question": "Which is a malapropism for 'vicinity'?",
    "choices": [
      "vichyssoise",
      "viscosity ('in the viscosity of the school')",
      "velocity",
      "vicarage"
    ],
    "correct": 0
  },
  {
    "question": "Which is a malapropism for 'allegory'?",
    "choices": [
      "allergy ('allergy on the banks of the Nile')",
      "alley",
      "allegro",
      "alimony"
    ],
    "correct": 0
  },
  {
    "question": "Which is a malapropism for 'epithets'?",
    "choices": [
      "epitaphs ('he uses epitaphs')",
      "epaulets",
      "epistles",
      "epitomes"
    ],
    "correct": 0
  },
  {
    "question": "Which is a malapropism for 'comparisons'?",
    "choices": [
      "comparisons / 'comparisons are odorous'",
      "compactions",
      "compositions",
      "comparators"
    ],
    "correct": 0
  },
  {
    "question": "Which is a malapropism for 'apprehend'?",
    "choices": [
      "reprehend ('she will reprehend any little knowledge')",
      "apprehend",
      "appraise",
      "approach"
    ],
    "correct": 0
  },
  {
    "question": "Which is a malapropism for 'reprehensible'?",
    "choices": [
      "reprehensive",
      "comprehensive ('comprehensive crime')",
      "apprehensive",
      "represensible"
    ],
    "correct": 0
  },
  {
    "question": "Which is a malapropism for 'obligated'?",
    "choices": [
      "obliterated ('he was obliterated to attend')",
      "obligation",
      "objected",
      "obstructed"
    ],
    "correct": 0
  },
  {
    "question": "Which is a malapropism for 'precedent'?",
    "choices": [
      "president ('set a new president')",
      "precept",
      "precedence",
      "precision"
    ],
    "correct": 0
  },
  {
    "question": "Which is a malapropism for 'insinuating'?",
    "choices": [
      "insulating ('don't be insulating')",
      "instigating",
      "infiltrating",
      "investigating"
    ],
    "correct": 0
  },
  {
    "question": "Which is a malapropism for 'pedestrian'?",
    "choices": [
      "equestrian ('use the equestrian crossing')",
      "pedicure",
      "pediatrician",
      "pestilence"
    ],
    "correct": 0
  },
  {
    "question": "Which is a malapropism for 'specifically'?",
    "choices": [
      "pacifically ('pacifically I told you')",
      "scientifically",
      "specifically",
      "spectacularly"
    ],
    "correct": 0
  },
  {
    "question": "Which is a malapropism for 'flamboyant'?",
    "choices": [
      "flammable",
      "flamingo ('a flamingo personality')",
      "flamenco",
      "fluent"
    ],
    "correct": 0
  },
  {
    "question": "Which is a malapropism for 'dilemma'?",
    "choices": [
      "delegate",
      "diploma ('I'm in a diploma')",
      "diaphragm",
      "dilettante"
    ],
    "correct": 0
  },
  {
    "question": "Which is a malapropism for 'monogamous'?",
    "choices": [
      "monotonous ('a monotonous marriage')",
      "monogamous",
      "monolithic",
      "magnanimous"
    ],
    "correct": 0
  },
  {
    "question": "Which is a malapropism for 'hieroglyphics'?",
    "choices": [
      "hydraulics ('Egyptian hydraulics')",
      "hyperbolics",
      "hilarity",
      "homilies"
    ],
    "correct": 0
  },
  {
    "question": "Which is a malapropism for 'Alzheimer's'?",
    "choices": [
      "old-timer's ('old-timer's disease')",
      "old-fashioned",
      "old-mind",
      "old-age"
    ],
    "correct": 0
  },
  {
    "question": "Which is a malapropism for 'prosecuted'?",
    "choices": [
      "persecuted ('texas chainsaw persecution')",
      "prosecuted",
      "perpetrated",
      "prostituted"
    ],
    "correct": 0
  },
  {
    "question": "Which is a malapropism for 'irrelevant'?",
    "choices": [
      "irreverent",
      "irrigant",
      "irreparable",
      "irrelephant ('irrelephant to the matter')"
    ],
    "correct": 0
  },
  {
    "question": "Which is a malapropism for 'integral'?",
    "choices": [
      "integer",
      "intersectional",
      "intergalactic ('intergalactic part of the team')",
      "integrity"
    ],
    "correct": 0
  },
  {
    "question": "Which is a malapropism for 'punctual'?",
    "choices": [
      "punctuated ('be more punctuated')",
      "punctual",
      "punctilious",
      "pungent"
    ],
    "correct": 0
  },
  {
    "question": "Which is a malapropism for 'derogatory'?",
    "choices": [
      "dermatology ('a dermatology comment')",
      "derogatory",
      "demagogic",
      "deregulatory"
    ],
    "correct": 0
  },
  {
    "question": "Which is a malapropism for 'metaphor'?",
    "choices": [
      "meteorite ('use a meteorite to describe it')",
      "metaphor",
      "metallurgy",
      "meridian"
    ],
    "correct": 0
  },
  {
    "question": "Which is a malapropism for 'extinct'?",
    "choices": [
      "extant",
      "exotic ('the dodo went exotic')",
      "extinct",
      "extricated"
    ],
    "correct": 0
  },
  {
    "question": "Which is a malapropism for 'fluorescent'?",
    "choices": [
      "florescent / 'flatulent lights'",
      "florid",
      "flamboyant",
      "flagrant"
    ],
    "correct": 0
  },
  {
    "question": "Which is a malapropism for 'caustic'?",
    "choices": [
      "castigate",
      "Catholic ('Catholic remarks')",
      "caucus",
      "caustic"
    ],
    "correct": 0
  },
  {
    "question": "Which is a malapropism for 'urinate'?",
    "choices": [
      "urinate",
      "originate ('I have to originate')",
      "urgently",
      "urbanate"
    ],
    "correct": 0
  },
  {
    "question": "Which is a malapropism for 'nuclear'?",
    "choices": [
      "nucular ('nucular weapons')",
      "nuclear",
      "muscular",
      "circular"
    ],
    "correct": 0
  }
] as QuizQuestion[];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: MalapropismQuizSettings): MalapropismQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MalapropismQuizState, action: MalapropismQuizAction): MalapropismQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MalapropismQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
