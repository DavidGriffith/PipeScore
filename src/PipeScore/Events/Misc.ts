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

import { ScoreEvent, Update, stopInputtingNotes } from './common';
import { State } from '../State';
import { Menu } from '../UI/model';
import m from 'mithril';

import dialogueBox from '../global/dialogueBox';
import { settings, Settings } from '../global/settings';
import { last } from '../global/utils';
import { Score } from '../Score';

export function setPageNumberVisibility(element: HTMLInputElement): ScoreEvent {
  return async (state: State) => {
    const visibility = element.checked;
    state.score.showNumberOfPages = Boolean(visibility);
    return Update.ShouldSave;
  };
}

export function changeSetting<T extends keyof Settings>(
  setting: T,
  target: HTMLInputElement
): ScoreEvent {
  return async () => {
    const v = parseFloat(target.value);
    target.value = settings.validate(setting, v).toString();
    settings[setting] = v as Settings[T];
    return Update.ViewChanged;
  };
}

export function changeZoomLevel(zoom: number): ScoreEvent {
  return async (state: State) => {
    if (state.score.zoom !== zoom) {
      state.score.zoom = zoom;
      return Update.ViewChanged;
    }
    return Update.NoChange;
  };
}

export function loadedAudio(): ScoreEvent {
  return async (state: State) => {
    state.playback.loading = false;
    return Update.ViewChanged;
  };
}

export function setMenu(menu: Menu): ScoreEvent {
  return async (state: State) => {
    state.menu = menu;
    stopInputtingNotes(state);
    return Update.ViewChanged;
  };
}

export function landscape(): ScoreEvent {
  return async (state: State) => {
    return state.score.makeLandscape();
  };
}

export function portrait(): ScoreEvent {
  return async (state: State) => {
    return state.score.makePortrait();
  };
}

export function undo(): ScoreEvent {
  return async (state: State) => {
    const current = state.history.past.pop();
    const previous = last(state.history.past);
    if (current && previous) {
      state.selection = null;
      stopInputtingNotes(state);
      const zoom = state.score.zoom;
      state.score = Score.fromJSON(JSON.parse(previous));
      state.score.zoom = zoom;
      state.history.future.push(current);
      return Update.MovedThroughHistory;
    }
    return Update.NoChange;
  };
}

export function redo(): ScoreEvent {
  return async (state: State) => {
    const next = state.history.future.pop();
    if (next) {
      state.selection = null;
      stopInputtingNotes(state);
      const zoom = state.score.zoom;
      state.score = Score.fromJSON(JSON.parse(next));
      state.score.zoom = zoom;
      state.history.past.push(next);
      return Update.MovedThroughHistory;
    }
    return Update.NoChange;
  };
}

export function print(): ScoreEvent {
  return async (state: State) => {
    // Printing is a bit annoying on browsers - to print the SVG element, a new window is created
    // and that window is printed
    // That doesn't allow all the control I need though - e.g. margins are there by default which
    // makes it uncentred, and that can't be changed in JS. So I'm just adding a plea to the user to fix it :)

    const blankEl = document.createElement('div');
    const props = {
      justAddedNote: false,
      selection: null,
      noteState: {
        dragged: null,
        inputtingNotes: false,
        selectedTripletLine: null,
      },
      gracenoteState: {
        dragged: null,
        selected: null,
      },
      textBoxState: { selectedText: null },
      preview: null,
      playbackState: {
        playing: false,
        userPressedStop: false,
        loading: false,
        cursor: null,
      },
      dispatch: () => null,
    };

    state.score.zoom = 100;
    // Patch it onto a new element with none of the state (e.g. zoom, selected elements)
    m.render(blankEl, m('div', state.score.render(props)));
    const contents = blankEl.querySelector('div')?.innerHTML;

    await dialogueBox(
      'Printing',
      [
        m('section', [
          m('p', [
            'When printing, please ensure you set ',
            m('span', { style: 'font-family: monospace;' }, 'Margins'),
            ' to ',
            m('span', { style: 'font-family: monospace;' }, 'None'),
            '.',
          ]),
          m(
            'p',
            'This means your browser will use the PipeScore margins, rather than its own automatic margins, which will be off-centre.'
          ),
        ]),
      ],
      false
    );
    const popupWindow = window.open(
      '',
      'print_preview',
      `width=${state.score.width()},height=${state.score.height()},scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no,resizable=no`
    );
    if (popupWindow) {
      popupWindow.document.open();
      popupWindow.document.write(
        `<style>* { font-family: sans-serif; margin: 0; padding: 0; } @page { size: A4 ${state.score.orientation()}; margin: 0; }</style>` +
          contents
      );
      popupWindow.print();
      popupWindow.document.close();
    }

    return Update.NoChange;
  };
}

export function download(): ScoreEvent {
  return async (state: State) => {
    const json = state.score.toJSON();
    const blob = new Blob([JSON.stringify(json)], { type: 'text/json' });

    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = json.name + '.pipescore';
    a.click();

    return Update.NoChange;
  };
}

export function commit(): ScoreEvent {
  return async () => Update.ShouldSave;
}

export function updateView(): ScoreEvent {
  return async () => Update.ViewChanged;
}
