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

//  Barlines may be:
//  - normal (a single vertical line)
//  - repeat (a thick line with dots)
//  - end (a thick line only)

import m from 'mithril';
import { dispatch } from '../Controller';
import { clickBarline } from '../Events/Bar';
import { settings } from '../global/settings';
import { SavedBarline } from '../SavedModel';
import { stavelineThickness } from '../Stave';

interface BarlineProps {
  x: number;
  y: number;
  // atStart : is the barline at the start of the bar or not?
  atStart: boolean;
  drag: (x: number) => void;
}

type BarlineType = 'normal' | 'repeat' | 'end';

export class Barline {
  private type: BarlineType;

  static normal = new Barline('normal');
  static repeat = new Barline('repeat');
  static part = new Barline('end'); // It's called end for "legacy reasons"

  private constructor(type: BarlineType) {
    this.type = type;
  }
  static fromJSON(o: SavedBarline): Barline {
    if (o.type === 'normal') return Barline.normal;
    else if (o.type === 'repeat') return Barline.repeat;
    else if (o.type === 'end') return Barline.part;
    else throw new Error(`Unrecognised barline type ${o.type}`);
  }
  toJSON(): SavedBarline {
    return { type: this.type };
  }
  // Repeat and end barlines must be drawn. Normal barlines may
  // be skipped, e.g. if the previous bar ended in a normal barline,
  // there's no need to draw another normal barline at the start of this bar
  mustDraw() {
    return this.type === 'repeat' || this.type === 'end';
  }
  isRepeat() {
    return this.type == 'repeat';
  }
  width() {
    if (this.type === 'normal') {
      return 1;
    } else {
      return 10;
    }
  }
  render(props: BarlineProps) {
    if (this.type === 'normal') {
      return renderNormal(props);
    } else if (this.type === 'repeat') {
      return renderRepeat(props);
    } else {
      return renderPart(props);
    }
  }
}

const lineOffset = 6;
const thickLineWidth = 3;
const dragWidth = 2;

function height() {
  return settings.lineHeightOf(4);
}

function renderNormal({ x, y, drag }: BarlineProps) {
  return m('g', [
    m('line', {
      x1: x,
      x2: x,
      y1: y - stavelineThickness / 2,
      y2: y + height() + stavelineThickness / 2,
      stroke: 'black',
    }),
    m('rect', {
      x: x - dragWidth,
      y: y - stavelineThickness / 2,
      width: 2 * dragWidth,
      height: height() + stavelineThickness,
      opacity: 0,
      style: 'cursor: ew-resize',
      onmousedown: () => dispatch(clickBarline(drag)),
    }),
  ]);
}
function renderRepeat(props: BarlineProps) {
  const { x, y, atStart } = props;
  const circleXOffset = 10;
  const topCircleY = y + settings.lineHeightOf(1.5);
  const bottomCircleY = y + settings.lineHeightOf(2.5);
  const circleRadius = 2;
  const cx = atStart ? x + circleXOffset : x - circleXOffset;
  return m('g[class=barline-repeat]', [
    renderPart(props),
    m('circle', {
      cx,
      cy: topCircleY,
      r: circleRadius,
      fill: 'black',
    }),
    m('circle', {
      cx,
      cy: bottomCircleY,
      r: circleRadius,
      fill: 'black',
    }),
  ]);
}
function renderPart({ x, y, atStart, drag }: BarlineProps) {
  const thickX = atStart ? x : x - thickLineWidth / 2;
  const thinX = atStart ? x + lineOffset : x - lineOffset;
  return m('g[class=barline-end]', [
    m('rect', {
      x: thickX,
      y: y - stavelineThickness / 2,
      width: thickLineWidth,
      height: height() + stavelineThickness,
      fill: 'black',
      style: 'cursor: ew-resize',
      onmousedown: () => dispatch(clickBarline(drag)),
    }),
    m('line', {
      x1: thinX,
      x2: thinX,
      y1: y - stavelineThickness / 2,
      y2: y + height() + stavelineThickness / 2,
      stroke: 'black',
    }),
  ]);
}
