import { TimeSignatureModel } from './TimeSignature/model';
import { TextBoxModel } from './TextBox/model';
import { GroupNoteModel, NoteModel, NoteLength } from './Note/model';
import { Pitch } from './all';
export type ScoreEvent
  = MouseMovedOver
  | Copy
  | Paste
  | NoteClicked
  | BackgroundClicked
  | MouseUp
  | DeleteSelectedNotes
  | SetGracenoteOnSelected
  | SetInputLength
  | StopInputtingNotes
  | NoteAdded
  | TieSelectedNotes
  | ToggleDotted
  | ChangeZoomLevel
  | TextClicked
  | TextMouseUp
  | TextDragged
  | AddSecondTiming
  | EditText
  | EditTimeSignatureNumerator
  | EditTimeSignatureDenominator
  | AddBar
  | AddStave
  | DeleteBar
  | DeleteStave;


type Copy = {
  name: 'copy'
}
export function isCopy(e: ScoreEvent): e is Copy {
  return e.name === 'copy';
}

type Paste = {
  name: 'paste'
}
export function isPaste(e: ScoreEvent): e is Paste {
  return e.name === 'paste';
}

type MouseMovedOver = {
  name: 'mouse over pitch',
  pitch: Pitch
}
export function isMouseMovedOver(e: ScoreEvent): e is MouseMovedOver {
  return e.name === 'mouse over pitch';
}

type NoteClicked = {
  name: 'note clicked',
  note: NoteModel,
  event: MouseEvent
}
export function isNoteClicked(e: ScoreEvent): e is NoteClicked {
  return e.name === 'note clicked';
}

type BackgroundClicked = {
  name: 'background clicked'
}
export function isBackgroundClicked(e: ScoreEvent): e is BackgroundClicked {
  return e.name === 'background clicked';
}

type MouseUp = {
  name: 'mouse up'
}
export function isMouseUp(e: ScoreEvent): e is MouseUp {
  return e.name === 'mouse up';
}

type DeleteSelectedNotes = {
  name: 'delete selected notes'
}
export function isDeleteSelectedNotes(e: ScoreEvent): e is DeleteSelectedNotes {
  return e.name === 'delete selected notes';
}

type SetGracenoteOnSelected = {
  name: 'set gracenote',
  value: string
}
export function isSetGracenoteOnSelected(e: ScoreEvent): e is SetGracenoteOnSelected {
  return e.name === 'set gracenote';
}

type SetInputLength = {
  name: 'set note input length',
  length: NoteLength
}
export function isSetInputLength(e: ScoreEvent): e is SetInputLength {
  return e.name === 'set note input length';
}

type StopInputtingNotes = {
  name: 'stop inputting notes'
}
export function isStopInputtingNotes(e: ScoreEvent): e is StopInputtingNotes {
  return e.name === 'stop inputting notes';
}

type NoteAdded = {
  name: 'note added',
  pitch: Pitch,
  index: number,
  groupNote: GroupNoteModel
}
export function isNoteAdded(e: ScoreEvent): e is NoteAdded {
  return e.name === 'note added';
}

type ToggleDotted = {
  name:  'toggle dotted'
}
export function isToggleDotted(e: ScoreEvent): e is ToggleDotted {
  return e.name === 'toggle dotted';
}

type ChangeZoomLevel = {
  name: 'change zoom level',
  zoomLevel: number
}
export function isChangeZoomLevel(e: ScoreEvent): e is ChangeZoomLevel {
  return e.name === 'change zoom level';
}

type TextClicked = {
  name: 'text clicked',
  text: TextBoxModel
}
export function isTextClicked(e: ScoreEvent): e is TextClicked {
  return e.name === 'text clicked';
}

type EditText = {
  name: 'edit text',
  text: TextBoxModel
}
export function isEditText(e: ScoreEvent): e is EditText {
  return e.name === 'edit text';
}

type AddBar = {
  name: 'add bar'
}
export function isAddBar(e: ScoreEvent): e is AddBar {
  return e.name === 'add bar';
}

type DeleteBar = {
  name: 'delete bar'
}
export function isDeleteBar(e: ScoreEvent): e is DeleteBar {
  return e.name === 'delete bar';
}

type AddStave = {
  name: 'add stave'
}
export function isAddStave(e: ScoreEvent): e is AddStave {
  return e.name === 'add stave';
}

type DeleteStave = {
  name: 'delete stave'
}
export function isDeleteStave(e: ScoreEvent): e is DeleteStave {
  return e.name === 'delete stave';
}

type TieSelectedNotes = {
  name: 'tie selected notes'
}
export function isTieSelectedNotes(e: ScoreEvent): e is TieSelectedNotes {
  return e.name === 'tie selected notes';
}

type TextDragged = {
  name: 'text dragged',
  x: number,
  y: number
}
export function isTextDragged(e: ScoreEvent): e is TextDragged {
  return e.name === 'text dragged';
}

type TextMouseUp = {
  name: 'text mouse up'
}
export function isTextMouseUp(e: ScoreEvent): e is TextMouseUp {
  return e.name === 'text mouse up';
}

type AddSecondTiming = {
  name: 'add second timing',
}
export function isAddSecondTiming(e: ScoreEvent): e is AddSecondTiming {
  return e.name === 'add second timing';
}

type EditTimeSignatureNumerator = {
  name: 'edit time signature numerator',
  timeSignature: TimeSignatureModel
}
export function isEditTimeSignatureNumerator(e: ScoreEvent): e is EditTimeSignatureNumerator {
  return e.name === 'edit time signature numerator';
}

type EditTimeSignatureDenominator = {
  name: 'edit time signature denominator',
  timeSignature: TimeSignatureModel
}
export function isEditTimeSignatureDenominator(e: ScoreEvent): e is EditTimeSignatureDenominator {
  return e.name === 'edit time signature denominator';
}

