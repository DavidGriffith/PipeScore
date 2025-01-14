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

import { ScoreEvent, Update } from './common';
import { State } from '../State';
import { Pitch } from '../global/pitch';
import { Note } from '../Note';
import { Bar } from '../Bar';

export function mouseOffPitch(): ScoreEvent {
  return async (state: State) => {
    if (state.preview) {
      if (state.preview.setPitch(null)) return Update.ViewChanged;
    }
    return Update.NoChange;
  };
}

export function mouseOverPitch(pitch: Pitch, where: Note | Bar): ScoreEvent {
  // This event never returns ShouldSave - if it did, the intermediate steps of
  // dragging a note would be in the history, which we don't want. Instead
  // it should be saved only on mouse up.
  return async (state: State) => {
    // This occurs when the note's head is changed from receiving pointer events
    // to not receiving them. That triggers a mouseOver on the note box below,
    // which is undesirable as it moves the note head.
    if (state.justClickedNote) {
      state.justClickedNote = false;
      return Update.NoChange;
    }

    if (state.preview) {
      let changed = false;
      if (where instanceof Bar) {
        changed =
          state.preview.setLocation(where, where.lastNote(), null) || changed;
        changed = state.preview.setPitch(pitch) || changed;
      } else {
        changed =
          state.preview.setLocation(
            state.score.location(where.id).bar,
            state.score.previousNote(where.id),
            where
          ) || changed;
        changed = state.preview.setPitch(pitch) || changed;
      }
      return changed ? Update.ViewChanged : Update.NoChange;
    } else if (state.selection && state.selection.dragging) {
      state.selection.dragOverPitch(pitch, state.score);
      return Update.ViewChanged;
    }
    return Update.NoChange;
  };
}
