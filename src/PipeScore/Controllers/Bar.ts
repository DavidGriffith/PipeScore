/*
  Controller for bar-related events
  Copyright (C) 2021 Archie Maclean
*/
import {
  ScoreEvent,
  noChange,
  viewChanged,
  shouldSave,
  location,
} from './Controller';
import { State } from '../State';

import { Bar, Anacrusis } from '../Bar/model';
import { Barline } from '../Bar/barline';
import { ScoreModel } from '../Score/model';
import { TimeSignatureModel } from '../TimeSignature/model';

import Score from '../Score/functions';
import TimeSignature from '../TimeSignature/functions';

import { itemBefore } from '../global/xy';
import { ScoreSelection } from '../Selection/model';
import { StaveModel } from '../Stave/model';

function setTimeSignatureFrom(
  timeSignature: TimeSignatureModel,
  newTimeSignature: TimeSignatureModel,
  score: ScoreModel
): ScoreModel {
  Bar.setTimeSignatureFrom(timeSignature, newTimeSignature, Score.bars(score));
  return score;
}
export function editTimeSignature(
  timeSignature: TimeSignatureModel,
  newTimeSignature: TimeSignatureModel
): ScoreEvent {
  return async (state: State) =>
    shouldSave({
      ...state,
      score: setTimeSignatureFrom(timeSignature, newTimeSignature, state.score),
    });
}
// TODO put this into Stave class
function addBarToStave(
  newBar: Bar,
  stave: StaveModel,
  oldBar: Bar,
  before: boolean
) {
  const barInd = stave.bars.indexOf(oldBar);
  const ind = before ? barInd : barInd + 1;
  stave.bars.splice(ind, 0, newBar);
}

export function addAnacrusis(before: boolean): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof ScoreSelection) {
      const { bar, stave } = location(state.selection.start, state.score);
      addBarToStave(new Anacrusis(bar.timeSignature()), stave, bar, before);
      return shouldSave(state);
    }
    return noChange(state);
  };
}

export function addBar(before: boolean): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof ScoreSelection) {
      const { bar, stave } = location(state.selection.start, state.score);
      addBarToStave(new Bar(bar.timeSignature()), stave, bar, before);
      return shouldSave(state);
    }
    return noChange(state);
  };
}

export function clickBar(bar: Bar, mouseEvent: MouseEvent): ScoreEvent {
  return async (state: State) => {
    if (mouseEvent.shiftKey && state.selection instanceof ScoreSelection) {
      if (itemBefore(state.selection.end, bar.id)) {
        state.selection.end = bar.id;
        return viewChanged(state);
      } else if (itemBefore(bar.id, state.selection.end)) {
        state.selection.start = bar.id;
        return viewChanged(state);
      }
    }
    return viewChanged({
      ...state,
      selection: new ScoreSelection(bar.id, bar.id),
    });
  };
}

export function setBarRepeat(
  which: 'start' | 'end',
  what: Barline
): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof ScoreSelection) {
      const { bar } = location(state.selection.start, state.score);
      bar.setBarline(which, what);
      return shouldSave(state);
    }
    return noChange(state);
  };
}

export function editBarTimeSignature(): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof ScoreSelection) {
      const { bar } = location(state.selection.start, state.score);
      const newTimeSignature = await TimeSignature.getNewInput(
        bar.timeSignature()
      );
      return shouldSave({
        ...state,
        score: setTimeSignatureFrom(
          bar.timeSignature(),
          newTimeSignature,
          state.score
        ),
      });
    }
    return noChange(state);
  };
}
