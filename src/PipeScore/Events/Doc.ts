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
import Documentation from '../Documentation';

export function hoverDoc(
  element: keyof typeof Documentation | null
): ScoreEvent {
  return async (state: State) => {
    state.doc.current = element;
    return Update.ViewChanged;
  };
}

export function toggleDoc(): ScoreEvent {
  return async (state: State) => {
    state.doc.show = !state.doc.show;
    return Update.ViewChanged;
  };
}
