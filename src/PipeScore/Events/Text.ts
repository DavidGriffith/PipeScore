/*
  Controller for text events
  Copyright (C) 2021 macarc
*/
import { ScoreEvent, Update, stopInputtingNotes } from './common';
import { State } from '../State';

import { TextBox } from '../TextBox';
import { TextSelection } from '../Selection';

export function addText(): ScoreEvent {
  return async (state: State) => {
    state.score.addText(new TextBox(''));
    return Update.ShouldSave;
  };
}

export function changeText(
  newText: string,
  newSize: number,
  text: TextBox
): ScoreEvent {
  return async () => text.set(newText, newSize);
}

export function clickText(text: TextBox): ScoreEvent {
  return async (state: State) => {
    stopInputtingNotes(state);
    state.selection = new TextSelection(text);
    return Update.ViewChanged;
  };
}

export function centreText(): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof TextSelection) {
      state.selection.text.toggleCentre();
      return Update.ShouldSave;
    }
    return Update.NoChange;
  };
}