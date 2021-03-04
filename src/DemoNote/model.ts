/*
   Copyright (C) 2020 Archie Maclean
 */
import { Pitch } from '../global/pitch';
import { NoteLength } from '../Note/model';

export interface DemoNoteModel {
  pitch: Pitch | null,
  length: NoteLength,
  staveIndex: number,
  x: number
}
