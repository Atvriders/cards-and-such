import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface VietnamWarQuizSettings { questions: "10" | "20" | "30"; }
export interface VietnamWarQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type VietnamWarQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Vietnam was divided at which parallel after 1954?", choices: ["38th","17th","23rd","45th"], correct: 1 },
  { question: "What 1954 battle led to French withdrawal from Vietnam?", choices: ["Dien Bien Phu","Hanoi","Saigon","Hue"], correct: 0 },
  { question: "What treaty divided Vietnam in 1954?", choices: ["Geneva Accords","Paris Peace","Tonkin Treaty","Saigon Pact"], correct: 0 },
  { question: "Who led North Vietnam?", choices: ["Ho Chi Minh","Vo Nguyen Giap","Le Duan","Pham Van Dong"], correct: 0 },
  { question: "What was the South Vietnamese capital?", choices: ["Hanoi","Saigon","Hue","Da Nang"], correct: 1 },
  { question: "What 1964 incident escalated US involvement?", choices: ["Gulf of Tonkin","Tet","My Lai","Cambodia Bombing"], correct: 0 },
  { question: "What U.S. president signed the Gulf of Tonkin Resolution?", choices: ["Eisenhower","Kennedy","Johnson","Nixon"], correct: 2 },
  { question: "What was the Vietnamese guerrilla force allied with North Vietnam?", choices: ["Viet Cong","Khmer Rouge","Pathet Lao","NVA"], correct: 0 },
  { question: "What was the major 1968 surprise offensive?", choices: ["Tet Offensive","Easter Offensive","Spring Offensive","Linebacker"], correct: 0 },
  { question: "What U.S. helicopter became iconic of the war?", choices: ["Apache","Cobra","Huey","Black Hawk"], correct: 2 },
  { question: "What chemical defoliant was used by US forces?", choices: ["Agent Orange","Sarin","White Phosphorus","Tear gas"], correct: 0 },
  { question: "What 1975 event ended the war?", choices: ["Fall of Saigon","Tet Offensive","Battle of Khe Sanh","Hanoi Accords"], correct: 0 },
  { question: "What was the supply route through Laos and Cambodia called?", choices: ["Mekong Trail","Ho Chi Minh Trail","Hanoi Express","Saigon Highway"], correct: 1 },
  { question: "What U.S. president began troop withdrawals?", choices: ["Johnson","Nixon","Ford","Carter"], correct: 1 },
  { question: "What was the Saigon evacuation operation called?", choices: ["Operation Rolling Thunder","Operation Frequent Wind","Operation Linebacker","Operation Pegasus"], correct: 1 },
  { question: "What 1973 accord brought US troop withdrawal?", choices: ["Paris Peace Accords","Geneva Accords","Hanoi Treaty","Tet Treaty"], correct: 0 },
  { question: "What rifle was the standard US infantry weapon?", choices: ["M14","M16","AK-47","M1 Garand"], correct: 1 },
  { question: "What 1968 massacre by US troops became infamous?", choices: ["My Lai","Hue","Khe Sanh","Tay Ninh"], correct: 0 },
  { question: "What was the policy of training South Vietnamese to take over fighting?", choices: ["Vietnamization","Strategic Hamlets","Pacification","Counterinsurgency"], correct: 0 },
  { question: "What U.S. bombing campaign began 1965?", choices: ["Operation Rolling Thunder","Operation Linebacker","Arc Light","Operation Niagara"], correct: 0 },
  { question: "What was the song that played as Saigon fell, signal for Americans to evacuate?", choices: ["White Christmas","Yankee Doodle","Auld Lang Syne","Star-Spangled Banner"], correct: 0 },
  { question: "What was the major U.S. base in Da Nang area?", choices: ["Cam Ranh Bay","Da Nang Air Base","Tan Son Nhut","Bien Hoa"], correct: 1 },
  { question: "What conscription system drafted young Americans?", choices: ["Selective Service","Draft Lottery","Conscription Act","All names used"], correct: 3 },
  { question: "What was the famous photograph of a Vietnamese girl burned by napalm?", choices: ["Napalm Girl","Saigon Execution","Boat People","Last Helicopter"], correct: 0 },
  { question: "What term referred to the morale impact felt by US soldiers?", choices: ["Vietnam Syndrome","Battle Fatigue","Shell Shock","PTSD"], correct: 0 },
  { question: "What peace activist group protested the war?", choices: ["SDS","Yippies","Doves","All did"], correct: 3 },
  { question: "What 1970 incident saw US troops kill students in Ohio?", choices: ["Kent State shootings","Jackson State","Berkeley protest","Chicago 1968"], correct: 0 },
  { question: "What war started after Vietnam reunified?", choices: ["Sino-Vietnamese War (1979)","Cambodian War","Both","Korean War"], correct: 2 },
  { question: "How many U.S. service members died in Vietnam (approximate)?", choices: ["10,000","58,000","100,000","150,000"], correct: 1 },
  { question: "Vietnam reunified under which name?", choices: ["Socialist Republic of Vietnam","Democratic Republic","People's Republic","Federal Republic"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: VietnamWarQuizSettings): VietnamWarQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: VietnamWarQuizState, action: VietnamWarQuizAction): VietnamWarQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: VietnamWarQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
