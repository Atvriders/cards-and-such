import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface HeteronymQuizSettings { questions: "8" | "10" | "12"; }
export interface HeteronymQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type HeteronymQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Which is a heteronym pair?",
    "choices": [
      "BASS (fish/instrument)",
      "CHAIR (seat/lead)",
      "RUN (jog/operate)",
      "FAST (quick/abstain)"
    ],
    "correct": 0
  },
  {
    "question": "Which is a heteronym pair?",
    "choices": [
      "LEAD (metal/guide)",
      "TABLE (furniture/data)",
      "BANK (river/money)",
      "MATCH (fire/pair)"
    ],
    "correct": 0
  },
  {
    "question": "Which is a heteronym pair?",
    "choices": [
      "BOW (ribbon/bend)",
      "DUCK (bird/avoid)",
      "RING (jewelry/sound)",
      "PARK (place/stop)"
    ],
    "correct": 0
  },
  {
    "question": "Which is a heteronym pair?",
    "choices": [
      "TEAR (rip/cry)",
      "BAT (animal/club)",
      "FAIR (just/festival)",
      "LIGHT (lamp/weight)"
    ],
    "correct": 0
  },
  {
    "question": "Which is a heteronym pair?",
    "choices": [
      "WIND (air/coil)",
      "ROSE (flower/got up)",
      "BARK (dog/tree)",
      "PINE (tree/yearn)"
    ],
    "correct": 0
  },
  {
    "question": "Which is a heteronym pair?",
    "choices": [
      "DOVE (bird/jumped)",
      "COULD (able/preserve)",
      "WAVE (sea/hand)",
      "FLY (insect/travel)"
    ],
    "correct": 0
  },
  {
    "question": "Which is a heteronym pair?",
    "choices": [
      "MINUTE (time/tiny)",
      "SAW (tool/past see)",
      "WELL (good/water)",
      "JAM (fruit/stuck)"
    ],
    "correct": 0
  },
  {
    "question": "Which is a heteronym pair?",
    "choices": [
      "DESERT (abandon/sand)",
      "PALM (hand/tree)",
      "CRANE (bird/machine)",
      "SEAL (animal/close)"
    ],
    "correct": 0
  },
  {
    "question": "Which is a heteronym pair?",
    "choices": [
      "OBJECT (thing/oppose)",
      "MEAN (cruel/average)",
      "FAIR (event/just)",
      "BARK (tree/dog)"
    ],
    "correct": 0
  },
  {
    "question": "Which is a heteronym pair?",
    "choices": [
      "CONTENT (happy/contents)",
      "RING (sound/jewelry)",
      "SCALE (weight/fish)",
      "BAT (animal/club)"
    ],
    "correct": 0
  },
  {
    "question": "Which is a heteronym pair?",
    "choices": [
      "RECORD (data/log)",
      "SPRING (season/coil)",
      "LIGHT (sun/weight)",
      "MATCH (fire/pair)"
    ],
    "correct": 0
  },
  {
    "question": "Which is a heteronym pair?",
    "choices": [
      "PRESENT (gift/show)",
      "BANK (money/river)",
      "PEN (writer/cage)",
      "BARK (dog/tree)"
    ],
    "correct": 0
  },
  {
    "question": "Which is a heteronym pair?",
    "choices": [
      "CONDUCT (lead/behavior)",
      "FLY (insect/travel)",
      "MATCH (fire/pair)",
      "TIE (knot/draw)"
    ],
    "correct": 0
  },
  {
    "question": "Which is a heteronym pair?",
    "choices": [
      "CONTRACT (deal/shrink)",
      "BAT (animal/wood)",
      "BARK (tree/dog)",
      "FAIR (event/just)"
    ],
    "correct": 0
  },
  {
    "question": "Which is a heteronym pair?",
    "choices": [
      "REFUSE (decline/trash)",
      "JAM (fruit/stuck)",
      "WAVE (sea/hand)",
      "BEAR (animal/carry)"
    ],
    "correct": 0
  },
  {
    "question": "Which is a heteronym pair?",
    "choices": [
      "PRODUCE (make/groceries)",
      "FAIR (event/just)",
      "WAVE (water/hand)",
      "SCALE (weight/climb)"
    ],
    "correct": 0
  },
  {
    "question": "Which is a heteronym pair?",
    "choices": [
      "INVALID (not valid/sick person)",
      "BAT (animal/club)",
      "TIE (knot/draw)",
      "WELL (water/good)"
    ],
    "correct": 0
  },
  {
    "question": "Which is a heteronym pair?",
    "choices": [
      "POLISH (clean) vs Polish (Poland)",
      "MATCH (fire/pair)",
      "BARK (dog/tree)",
      "JAM (fruit/stuck)"
    ],
    "correct": 0
  },
  {
    "question": "Which is a heteronym pair?",
    "choices": [
      "MOPED (sulked/scooter)",
      "BARK (dog/tree)",
      "TIE (knot/draw)",
      "FAIR (event/just)"
    ],
    "correct": 0
  },
  {
    "question": "Which is a heteronym pair?",
    "choices": [
      "NUMBER (digit/more numb)",
      "BAT (animal/club)",
      "BANK (river/money)",
      "LIGHT (lamp/weight)"
    ],
    "correct": 0
  },
  {
    "question": "Which is a heteronym pair?",
    "choices": [
      "CLOSE (near/shut)",
      "PEN (cage/writer)",
      "MATCH (fire/pair)",
      "LIGHT (sun/weight)"
    ],
    "correct": 0
  },
  {
    "question": "Which is a heteronym pair?",
    "choices": [
      "HOUSE (noun/verb)",
      "BAT (animal/club)",
      "BANK (river/money)",
      "FAIR (event/just)"
    ],
    "correct": 0
  },
  {
    "question": "Which is a heteronym pair?",
    "choices": [
      "USE (noun/verb)",
      "BAT (animal/wood)",
      "MATCH (fire/pair)",
      "JAM (fruit/stuck)"
    ],
    "correct": 0
  },
  {
    "question": "Which is a heteronym pair?",
    "choices": [
      "EXCUSE (noun/verb)",
      "TIE (knot/draw)",
      "WAVE (sea/hand)",
      "BARK (dog/tree)"
    ],
    "correct": 0
  },
  {
    "question": "Which is a heteronym pair?",
    "choices": [
      "ABUSE (noun/verb)",
      "FAIR (event/just)",
      "BAT (animal/club)",
      "PEN (cage/writer)"
    ],
    "correct": 0
  },
  {
    "question": "Which is a heteronym pair?",
    "choices": [
      "ENTRANCE (doorway/charm)",
      "BANK (river/money)",
      "MATCH (fire/pair)",
      "JAM (fruit/stuck)"
    ],
    "correct": 0
  },
  {
    "question": "Which is a heteronym pair?",
    "choices": [
      "AUGUST (month/majestic)",
      "TIE (knot/draw)",
      "BAT (animal/club)",
      "WAVE (sea/hand)"
    ],
    "correct": 0
  },
  {
    "question": "Which is a heteronym pair?",
    "choices": [
      "INTIMATE (close/imply)",
      "BARK (dog/tree)",
      "FAIR (event/just)",
      "LIGHT (lamp/weight)"
    ],
    "correct": 0
  },
  {
    "question": "Which is a heteronym pair?",
    "choices": [
      "SEPARATE (adj/verb)",
      "PEN (writer/cage)",
      "MATCH (fire/pair)",
      "BAT (animal/club)"
    ],
    "correct": 0
  },
  {
    "question": "Which is a heteronym pair?",
    "choices": [
      "PERFECT (flawless/complete a task)",
      "JAM (fruit/stuck)",
      "TIE (knot/draw)",
      "WAVE (sea/hand)"
    ],
    "correct": 0
  }
] as QuizQuestion[];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: HeteronymQuizSettings): HeteronymQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: HeteronymQuizState, action: HeteronymQuizAction): HeteronymQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: HeteronymQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
