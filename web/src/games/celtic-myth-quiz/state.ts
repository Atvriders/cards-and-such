import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CelticMythQuizSettings { questions: "10" | "20" | "30"; }
export interface CelticMythQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CelticMythQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Who is the Celtic goddess of fire and poetry?",
    "choices": [
      "Brigid",
      "Morrigan",
      "Danu",
      "Rhiannon"
    ],
    "correct": 0
  },
  {
    "question": "Who is the horned god of the wild?",
    "choices": [
      "Lugh",
      "Cernunnos",
      "Dagda",
      "Manannan"
    ],
    "correct": 1
  },
  {
    "question": "What is the divine race of Irish myth?",
    "choices": [
      "Fomorians",
      "Tuatha Dé Danann",
      "Aos Sí",
      "Milesians"
    ],
    "correct": 1
  },
  {
    "question": "Who is the Welsh goddess linked to horses and the otherworld?",
    "choices": [
      "Arianrhod",
      "Rhiannon",
      "Blodeuwedd",
      "Cerridwen"
    ],
    "correct": 1
  },
  {
    "question": "Who is the Irish god of the sea?",
    "choices": [
      "Lugh",
      "Manannan mac Lir",
      "Nuada",
      "Bran"
    ],
    "correct": 1
  },
  {
    "question": "Who is the Irish 'Great God' chieftain with a magical cauldron?",
    "choices": [
      "Lugh",
      "Dagda",
      "Bres",
      "Ogma"
    ],
    "correct": 1
  },
  {
    "question": "What is the name of the cauldron of plenty?",
    "choices": [
      "Cauldron of the Dagda",
      "Cauldron of Cerridwen",
      "Cauldron of Bran",
      "Cauldron of Annwn"
    ],
    "correct": 0
  },
  {
    "question": "Who is the warrior queen and shape-shifting goddess of war?",
    "choices": [
      "Brigid",
      "Morrigan",
      "Boann",
      "Macha"
    ],
    "correct": 1
  },
  {
    "question": "Which hero is famous for going mad in battle ('warp spasm')?",
    "choices": [
      "Cuchulainn",
      "Finn",
      "Bran",
      "Pwyll"
    ],
    "correct": 0
  },
  {
    "question": "Who leads the Fianna warriors?",
    "choices": [
      "Cuchulainn",
      "Finn mac Cumhaill",
      "Conchobar",
      "Lugh"
    ],
    "correct": 1
  },
  {
    "question": "Which youthful master of all crafts is known as 'Long Arm'?",
    "choices": [
      "Lugh",
      "Dagda",
      "Ogma",
      "Goibniu"
    ],
    "correct": 0
  },
  {
    "question": "What is the Welsh otherworld realm?",
    "choices": [
      "Annwn",
      "Tír na nÓg",
      "Mag Mell",
      "Avalon"
    ],
    "correct": 0
  },
  {
    "question": "What is the Irish 'Land of Youth'?",
    "choices": [
      "Annwn",
      "Tír na nÓg",
      "Mag Mell",
      "Hy-Brasil"
    ],
    "correct": 1
  },
  {
    "question": "What is Cuchulainn's invincible spear called?",
    "choices": [
      "Gae Bulg",
      "Fragarach",
      "Caladbolg",
      "Brionac"
    ],
    "correct": 0
  },
  {
    "question": "What is the king's truth sword Fragarach also called?",
    "choices": [
      "The Whisperer",
      "The Answerer",
      "The Sun-Sword",
      "The Truth-Strike"
    ],
    "correct": 1
  },
  {
    "question": "Who is the Welsh shape-shifting witch with a cauldron of inspiration?",
    "choices": [
      "Cerridwen",
      "Rhiannon",
      "Branwen",
      "Modron"
    ],
    "correct": 0
  },
  {
    "question": "Bran the Blessed is a giant king of which Welsh tale collection?",
    "choices": [
      "The Dindshenchas",
      "The Mabinogion",
      "The Tain",
      "The Senchas Mar"
    ],
    "correct": 1
  },
  {
    "question": "What is the Irish epic about a cattle raid?",
    "choices": [
      "Tain Bo Cuailnge",
      "Fenian Cycle",
      "Lebor Gabala",
      "Cath Maige Tuired"
    ],
    "correct": 0
  },
  {
    "question": "Who is the Celtic god of light and craftsmanship known by the inscription 'Lugus'?",
    "choices": [
      "Lugh",
      "Belenus",
      "Taranis",
      "Toutatis"
    ],
    "correct": 0
  },
  {
    "question": "Which festival on May 1 marks summer's start?",
    "choices": [
      "Imbolc",
      "Beltane",
      "Lughnasadh",
      "Samhain"
    ],
    "correct": 1
  },
  {
    "question": "Which festival on November 1 honors the dead?",
    "choices": [
      "Imbolc",
      "Beltane",
      "Lughnasadh",
      "Samhain"
    ],
    "correct": 3
  },
  {
    "question": "Imbolc is sacred to which goddess?",
    "choices": [
      "Brigid",
      "Morrigan",
      "Danu",
      "Rhiannon"
    ],
    "correct": 0
  },
  {
    "question": "Who are the chaotic, often monstrous foes of the Tuatha Dé?",
    "choices": [
      "Fomorians",
      "Milesians",
      "Fir Bolg",
      "Sídhe"
    ],
    "correct": 0
  },
  {
    "question": "What are the Irish 'fairy folk' descended from the Tuatha Dé Danann?",
    "choices": [
      "Aos Sí",
      "Pictish",
      "Galli",
      "Cruithni"
    ],
    "correct": 0
  },
  {
    "question": "Who is the divine king of the Tuatha Dé who lost a hand?",
    "choices": [
      "Nuada",
      "Lugh",
      "Bres",
      "Dagda"
    ],
    "correct": 0
  },
  {
    "question": "Who is the Welsh trickster magician of the Mabinogion?",
    "choices": [
      "Math",
      "Gwydion",
      "Pryderi",
      "Manawydan"
    ],
    "correct": 1
  },
  {
    "question": "Who is the woman made of flowers in the Mabinogion?",
    "choices": [
      "Rhiannon",
      "Branwen",
      "Blodeuwedd",
      "Arianrhod"
    ],
    "correct": 2
  },
  {
    "question": "What is Avalon known as in Arthurian legend?",
    "choices": [
      "Isle of Apples",
      "Isle of Bards",
      "Isle of Mists",
      "Isle of Saints"
    ],
    "correct": 0
  },
  {
    "question": "Druids served as which role?",
    "choices": [
      "Priests and seers",
      "Warrior chiefs",
      "Slaves",
      "Foreign envoys"
    ],
    "correct": 0
  },
  {
    "question": "What animal often represents Cernunnos?",
    "choices": [
      "Boar",
      "Stag",
      "Wolf",
      "Eagle"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: CelticMythQuizSettings): CelticMythQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: CelticMythQuizState, action: CelticMythQuizAction): CelticMythQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: CelticMythQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
