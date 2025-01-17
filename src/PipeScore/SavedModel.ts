//  PipeScore - online bagpipe notation
//  Copyright (C) macarc
//
//  This program is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with this program.  If not, see <https://www.gnu.org/licenses/>.

//  The format in which scores are saved to Firebase

import { ID } from './global/id';
import { Pitch } from './global/pitch';
import { NoteLength } from './Note/notelength';

export function scoreIsPresent(data: SavedData): data is SavedScore {
  return (data as { justCreated: true }).justCreated !== true;
}

export type SavedData = SavedScore | { name: string; justCreated: true };

export type SavedScore = {
  name: string;
  landscape: boolean;
  _staves: SavedStave[];
  textBoxes: SavedTextBoxPage[];
  secondTimings: SavedTiming[];
  showNumberOfPages: boolean;
  settings: SavedSettings;
};

export type SavedStave = {
  gap: 'auto' | number | undefined;
  bars: SavedBar[];
};

export type SavedBar = {
  id: ID;
  isAnacrusis: boolean;
  timeSignature: SavedTimeSignature;
  notes: SavedNoteOrTriplet[];
  width: 'auto' | number | undefined;
  frontBarline: SavedBarline;
  backBarline: SavedBarline;
};

export type SavedBarline = {
  type: 'normal' | 'repeat' | 'end';
};

export type SavedTimeSignature = {
  ts: [number, 2 | 4 | 8] | 'cut time' | 'common time';
  breaks: number[];
};

export type SavedNote = {
  id: ID | undefined;
  pitch: Pitch;
  length: NoteLength;
  tied: boolean;
  hasNatural: boolean | undefined;
  gracenote: SavedGracenote;
};

export type SavedTriplet = {
  id: ID | undefined;
  length: NoteLength;
  notes: SavedNote[];
};

export type SavedNoteOrTriplet =
  | {
      notetype: 'single';
      value: SavedNote;
    }
  | {
      notetype: 'triplet';
      value: SavedTriplet;
    }
  | DeprecatedSavedNoteOrTriplet;

export type SavedReactiveGracenote = {
  grace: string;
};

export type SavedSingleGracenote = {
  note: Pitch;
};

export type SavedCustomGracenote = {
  pitches: Pitch[];
};

export type SavedGracenote =
  | {
      type: 'reactive';
      value: SavedReactiveGracenote;
    }
  | {
      type: 'single';
      value: SavedSingleGracenote;
    }
  | {
      type: 'custom';
      value: SavedCustomGracenote;
    }
  | {
      type: 'none';
    };

export type SavedTextBoxPage = {
  texts: SavedTextBox[];
};

export type SavedTextBox = {
  x: number;
  y: number;
  size: number;
  _text: string;
  centred: boolean;
  font: 'sans-serif' | 'serif' | undefined;
};

export type SavedSecondTiming = {
  start: ID;
  middle: ID;
  end: ID;
  firstText: string;
  secondText: string;
};

export type SavedSingleTiming = {
  start: ID;
  end: ID;
  text: string;
};

export type SavedTiming =
  | {
      type: 'second timing';
      value: SavedSecondTiming;
    }
  | {
      type: 'single timing';
      value: SavedSingleTiming;
    };

export type SavedSettings = {
  bpm: number;
  staveGap: number;
  lineGap: number;
  margin: number;
  gapAfterGracenote: number;
};

export type DeprecatedSavedNoteOrTriplet =
  | {
      notetype: 'single';
      // deprecated : use id in SavedNote instead
      id: ID;
      value: SavedNote;
    }
  | {
      notetype: 'triplet';
      // deprecated : use id in SavedTriplet instead
      id: ID;
      value: SavedTriplet;
    };

export function isDeprecatedSavedNoteOrTriplet(
  noteOrTriplet: SavedNoteOrTriplet
): noteOrTriplet is DeprecatedSavedNoteOrTriplet {
  return (noteOrTriplet as any).id !== undefined;
}
