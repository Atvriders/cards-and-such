import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BonnieClydeQuizSettings { questions: "10" | "20"; }
export interface BonnieClydeQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BonnieClydeQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {"question": "What were Bonnie and Clyde's last names?", "choices": ["Parker & Barrow", "Parker & Bonham", "Parks & Barlow", "Park & Barrows"], "correct": 0},
  {"question": "In which U.S. state did they meet?", "choices": ["Texas", "Oklahoma", "Louisiana", "Arkansas"], "correct": 0},
  {"question": "Year they were ambushed?", "choices": ["1934", "1932", "1936", "1929"], "correct": 0},
  {"question": "State of the ambush?", "choices": ["Louisiana", "Texas", "Oklahoma", "Arkansas"], "correct": 0},
  {"question": "Lawman who led the ambush?", "choices": ["Frank Hamer", "Eliot Ness", "Melvin Purvis", "Buford Pusser"], "correct": 0},
  {"question": "Their gang was nicknamed?", "choices": ["Barrow Gang", "Parker Mob", "Texas Five", "Dixie Gang"], "correct": 0},
  {"question": "Iconic photo featured Bonnie holding what?", "choices": ["Cigar", "Pistol", "Roses", "Cigarette"], "correct": 0},
  {"question": "Clyde's brother in the gang?", "choices": ["Buck", "Billy", "Bobby", "Bart"], "correct": 0},
  {"question": "Buck Barrow's wife?", "choices": ["Blanche", "Sally", "Helen", "Mary"], "correct": 0},
  {"question": "Clyde was first arrested for what as a teen?", "choices": ["Car theft", "Forgery", "Burglary", "Bootlegging"], "correct": 0},
  {"question": "Clyde mutilated his own foot in?", "choices": ["Eastham Prison", "Huntsville", "Folsom", "Sing Sing"], "correct": 0},
  {"question": "How many were killed by the gang (estimate)?", "choices": ["~13", "~3", "~25", "~50"], "correct": 0},
  {"question": "Bonnie wrote what kind of works?", "choices": ["Poems", "Songs", "Plays", "Novels"], "correct": 0},
  {"question": "Famous Bonnie poem?", "choices": ["Story of Bonnie and Clyde", "Outlaw", "Dust", "Texas Roses"], "correct": 0},
  {"question": "Their preferred getaway car?", "choices": ["Ford V-8", "Chevy", "Buick", "Cadillac"], "correct": 0},
  {"question": "Henry Ford reportedly received praise letter from?", "choices": ["Clyde", "Bonnie", "Frank", "Buck"], "correct": 0},
  {"question": "Eastham prison break Clyde planned freed?", "choices": ["Raymond Hamilton", "John Dillinger", "Pretty Boy Floyd", "Baby Face Nelson"], "correct": 0},
  {"question": "Joplin shootout, 1933, killed how many police?", "choices": ["2", "0", "5", "10"], "correct": 0},
  {"question": "Photos found at Joplin gave them what?", "choices": ["Public notoriety", "Alibi", "Pardon", "Disguise"], "correct": 0},
  {"question": "Henry Methvin's family helped set up the ambush in?", "choices": ["Bienville Parish", "Dallas", "Shreveport", "Tyler"], "correct": 0},
  {"question": "Clyde's age at death?", "choices": ["25", "21", "30", "34"], "correct": 0},
  {"question": "Bonnie's age at death?", "choices": ["23", "19", "27", "30"], "correct": 0},
  {"question": "Bonnie was married (not to Clyde) to?", "choices": ["Roy Thornton", "Henry Barrow", "Jack Hill", "Tom Wilson"], "correct": 0},
  {"question": "Number of bullets reportedly fired in ambush?", "choices": ["~130+", "~30", "~60", "~300"], "correct": 0},
  {"question": "They are buried in?", "choices": ["Dallas (separate)", "Same grave", "Louisiana", "Oklahoma"], "correct": 0},
  {"question": "The 1967 film starred?", "choices": ["Beatty & Dunaway", "Newman & Streisand", "Redford & Fonda", "Pacino & Keaton"], "correct": 0},
  {"question": "Clyde's preferred firearm?", "choices": ["BAR", "Tommy gun", "Colt 1911", "Winchester"], "correct": 0},
  {"question": "Frank Hamer was a former what?", "choices": ["Texas Ranger", "FBI Agent", "Sheriff", "Marshal"], "correct": 0},
  {"question": "They robbed mostly which targets?", "choices": ["Small stores/banks", "Big banks", "Trains", "Mail trucks"], "correct": 0},
  {"question": "Iva Methvin's role in betrayal?", "choices": ["Father set decoy", "Sister", "Cousin", "Friend"], "correct": 0}
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: BonnieClydeQuizSettings): BonnieClydeQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questionsArr=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions:questionsArr,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: BonnieClydeQuizState, action: BonnieClydeQuizAction): BonnieClydeQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: BonnieClydeQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
