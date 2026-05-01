import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AmericanCivilWarQuizSettings { questions: "10" | "20" | "30"; }
export interface AmericanCivilWarQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AmericanCivilWarQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "In what year did the American Civil War begin?", choices: ["1860","1861","1862","1859"], correct: 1 },
  { question: "Where did the Civil War officially begin?", choices: ["Bull Run","Fort Sumter","Antietam","Gettysburg"], correct: 1 },
  { question: "Who was the Confederate States' president?", choices: ["Abraham Lincoln","Robert E. Lee","Jefferson Davis","Stonewall Jackson"], correct: 2 },
  { question: "Who commanded the Union army in 1864?", choices: ["McClellan","Sherman","Ulysses S. Grant","Meade"], correct: 2 },
  { question: "Who commanded the main Confederate army?", choices: ["Robert E. Lee","Stonewall Jackson","James Longstreet","J.E.B. Stuart"], correct: 0 },
  { question: "At what battle is the Civil War's bloodiest single day?", choices: ["Gettysburg","Antietam","Shiloh","Chancellorsville"], correct: 1 },
  { question: "Where was the surrender ceremony in 1865?", choices: ["Richmond","Atlanta","Appomattox Court House","Petersburg"], correct: 2 },
  { question: "In what year did the Civil War end?", choices: ["1864","1865","1866","1867"], correct: 1 },
  { question: "What document declared slaves free in Confederate states (1863)?", choices: ["13th Amendment","Gettysburg Address","Emancipation Proclamation","Homestead Act"], correct: 2 },
  { question: "How many states seceded to form the Confederacy?", choices: ["9","11","13","15"], correct: 1 },
  { question: "Who delivered the Gettysburg Address?", choices: ["Lincoln","Grant","Sherman","Davis"], correct: 0 },
  { question: "In what state was the Battle of Gettysburg fought?", choices: ["Maryland","Virginia","Pennsylvania","West Virginia"], correct: 2 },
  { question: "What was Sherman's famous 1864 campaign?", choices: ["Overland","March to the Sea","Anaconda","Peninsula"], correct: 1 },
  { question: "What naval blockade strategy did Union employ?", choices: ["Trent Plan","Anaconda Plan","Cobra Plan","Trident Plan"], correct: 1 },
  { question: "Which battle ended Lee's invasion of the North in 1863?", choices: ["Vicksburg","Chickamauga","Gettysburg","Bull Run"], correct: 2 },
  { question: "What 1863 siege gave the Union control of the Mississippi?", choices: ["Vicksburg","New Orleans","Charleston","Memphis"], correct: 0 },
  { question: "Who killed Abraham Lincoln?", choices: ["John Wilkes Booth","Lewis Powell","David Herold","George Atzerodt"], correct: 0 },
  { question: "In what theater building was Lincoln shot?", choices: ["Tremont","Ford's","National","Wallack's"], correct: 1 },
  { question: "What was the most famous Confederate ironclad?", choices: ["Monitor","Virginia (Merrimack)","Tennessee","Albemarle"], correct: 1 },
  { question: "What was the most famous Union ironclad?", choices: ["Monitor","Virginia","Galena","New Ironsides"], correct: 0 },
  { question: "What 1862 act gave land to settlers?", choices: ["Homestead Act","Morrill Act","Pacific Railway Act","Land Ordinance"], correct: 0 },
  { question: "What was the term for Northern Democrats opposed to the war?", choices: ["Carpetbaggers","Copperheads","Scalawags","Bushwhackers"], correct: 1 },
  { question: "What general led the Confederate cavalry, killed at Yellow Tavern?", choices: ["Forrest","Stuart","Mosby","Hampton"], correct: 1 },
  { question: "What 1864 battle was Sherman's first major target?", choices: ["Atlanta","Chattanooga","Savannah","Nashville"], correct: 0 },
  { question: "What constitutional amendment abolished slavery?", choices: ["12th","13th","14th","15th"], correct: 1 },
  { question: "Who succeeded Lincoln as president?", choices: ["Andrew Johnson","Hannibal Hamlin","Schuyler Colfax","Salmon Chase"], correct: 0 },
  { question: "In which state was the First Battle of Bull Run fought?", choices: ["Virginia","Maryland","Tennessee","Kentucky"], correct: 0 },
  { question: "What was the largest naval battle of the war?", choices: ["Hampton Roads","Mobile Bay","Memphis","New Orleans"], correct: 1 },
  { question: "Who was the most famous Confederate cavalry commander in the West?", choices: ["Forrest","Morgan","Wheeler","All known"], correct: 0 },
  { question: "What name was given to the prison camp in Georgia?", choices: ["Andersonville","Belle Isle","Libby","Salisbury"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: AmericanCivilWarQuizSettings): AmericanCivilWarQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: AmericanCivilWarQuizState, action: AmericanCivilWarQuizAction): AmericanCivilWarQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: AmericanCivilWarQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
