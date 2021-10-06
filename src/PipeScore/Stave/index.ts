/*
  Stave format
  Copyright (C) 2021 Archie Maclean
*/
import { svg, V } from '../../render/h';
import { Anacrusis, Bar } from '../Bar';
import { Dispatch } from '../Controllers/Controller';
import { lineHeightOf } from '../global/constants';
import { first, last } from '../global/utils';
import { GracenoteState } from '../Gracenote/state';
import { NoteState } from '../Note/state';
import { TimeSignature } from '../TimeSignature';

interface StaveProps {
  x: number;
  y: number;
  width: number;
  previousStaveY: number;
  previousStave: Stave | null;
  dispatch: Dispatch;
  noteState: NoteState;
  gracenoteState: GracenoteState;
}

export class Stave {
  private bars: Bar[];
  constructor(timeSignature = new TimeSignature()) {
    this.bars = [
      new Bar(timeSignature),
      new Bar(timeSignature),
      new Bar(timeSignature),
      new Bar(timeSignature),
    ];
  }
  public numberOfBars() {
    return this.bars.length;
  }
  public deleteBar(bar: Bar) {
    this.bars.splice(this.bars.indexOf(bar), 1);
  }
  public firstBar() {
    return first(this.bars);
  }
  public lastBar() {
    return last(this.bars);
  }
  public allBars() {
    return this.bars;
  }
  public insertBar(newBar: Bar, oldBar: Bar, before: boolean) {
    const barInd = this.bars.indexOf(oldBar);
    const ind = before ? barInd : barInd + 1;
    this.bars.splice(ind, 0, newBar);
  }
  public play(previous: Stave | null) {
    return this.bars.flatMap((b, i) =>
      b.play(i === 0 ? previous && previous.lastBar() : this.bars[i - 1])
    );
  }
  public renderTrebleClef(x: number, y: number) {
    return svg(
      'g',
      { transform: `translate(${x + 5} ${y - 25}) scale(0.08)` },
      [
        svg('g', { transform: 'matrix(.21599 0 0 .21546 -250.44 -1202.6)' }, [
          svg('path', {
            d: 'm2002 7851c-61 17-116 55-167 113-51 59-76 124-76 194 0 44 15 94 44 147 29 54 73 93 130 118 19 4 28 14 28 28 0 5-7 10-24 14-91-23-166-72-224-145-58-74-88-158-90-254 3-103 34-199 93-287 60-89 137-152 231-189l-69-355c-154 128-279 261-376 401-97 139-147 290-151 453 2 73 17 144 45 212 28 69 70 131 126 188 113 113 260 172 439 178 61-4 126-15 196-33l-155-783zm72-10l156 769c154-62 231-197 231-403-9-69-29-131-63-186-33-56-77-100-133-132s-119-48-191-48zm-205-1040c33-20 71-55 112-104 41-48 81-105 119-169 39-65 70-131 93-198 23-66 34-129 34-187 0-25-2-50-7-72-4-36-15-64-34-83-19-18-43-28-73-28-60 0-114 37-162 111-37 64-68 140-90 226-23 87-36 173-38 260 5 99 21 180 46 244zm-63 58c-45-162-70-327-75-495 1-108 12-209 33-303 20-94 49-175 87-245 37-70 80-123 128-159 43-32 74-49 91-49 13 0 24 5 34 14s23 24 39 44c119 169 179 373 179 611 0 113-15 223-45 333-29 109-72 213-129 310-58 98-126 183-205 256l81 394c44-5 74-9 91-9 76 0 144 16 207 48s117 75 161 130c44 54 78 116 102 186 23 70 36 143 36 219 0 118-31 226-93 323s-155 168-280 214c8 49 22 120 43 211 20 92 35 165 45 219s14 106 14 157c0 79-19 149-57 211-39 62-91 110-157 144-65 34-137 51-215 51-110 0-206-31-288-92-82-62-126-145-130-251 3-47 14-91 34-133s47-76 82-102c34-27 75-41 122-44 39 0 76 11 111 32 34 22 62 51 83 88 20 37 31 78 31 122 0 59-20 109-60 150s-91 62-152 62h-23c39 60 103 91 192 91 45 0 91-10 137-28 47-19 86-44 119-76s55-66 64-102c17-41 25-98 25-169 0-48-5-96-14-144-9-47-23-110-42-188-19-77-33-137-41-178-60 15-122 23-187 23-109 0-212-22-309-67s-182-107-256-187c-73-80-130-170-171-272-40-101-61-207-62-317 4-102 23-200 59-292 36-93 82-181 139-263s116-157 177-224c62-66 143-151 245-254z',
            stroke: 'black',
            'stroke-width': '53.022',
            fill: 'black',
          }),
        ]),
      ]
    );
  }
  public render(props: StaveProps): V {
    const staveHeight = props.y;
    const trebleClefWidth = 40;

    const staveLines = [...Array(5).keys()].map(
      (idx) => lineHeightOf(idx) + staveHeight
    );

    const previousBar = (barIdx: number) =>
      barIdx === 0
        ? props.previousStave && props.previousStave.lastBar()
        : this.bars[barIdx - 1] || null;

    const totalAnacrusisWidth = this.bars.reduce(
      (width, bar, i) =>
        width + (bar instanceof Anacrusis ? bar.width(previousBar(i)) : 0),
      0
    );

    const barWidth =
      (props.width - trebleClefWidth - totalAnacrusisWidth) /
      this.bars.filter((bar) => !(bar instanceof Anacrusis)).length;

    const width = (bar: Bar) =>
      bar instanceof Anacrusis
        ? bar.width(previousBar(this.bars.indexOf(bar)))
        : barWidth;

    const getX = (barIdx: number) =>
      this.bars
        .slice(0, barIdx)
        .reduce((soFar, bar) => soFar + width(bar), props.x + trebleClefWidth);

    const barProps = (bar: Bar, index: number) => ({
      x: getX(index),
      y: staveHeight,
      width: width(bar),
      previousBar: previousBar(index),
      shouldRenderLastBarline: index === this.numberOfBars() - 1,
      endOfLastStave: props.x + props.width, // should always be the same
      dispatch: props.dispatch,
      noteState: props.noteState,
      gracenoteState: props.gracenoteState,
    });

    return svg('g', { class: 'stave' }, [
      this.renderTrebleClef(props.x, props.y),
      svg(
        'g',
        { class: 'bars' },
        this.bars.map((bar, idx) => bar.render(barProps(bar, idx)))
      ),
      svg(
        'g',
        { class: 'stave-lines' },
        staveLines.map((y) =>
          svg('line', {
            x1: props.x,
            x2: props.x + props.width,
            y1: y,
            y2: y,
            stroke: 'black',
            'pointer-events': 'none',
          })
        )
      ),
    ]);
  }
}