/*
  Score format
  Copyright (C) 2021 Archie Maclean
*/
import { Stave } from '../Stave';
import { TextBox } from '../TextBox';
import { DraggedSecondTiming, SecondTiming } from '../SecondTiming';
import { TimeSignature } from '../TimeSignature';
import { settings } from '../global/settings';
import { svg, V } from '../../render/h';
import { clickBackground, mouseUp } from '../Controllers/Mouse';
import { Demo } from '../DemoNote';
import { NoteState } from '../Note/state';
import { Dispatch } from '../Controllers/Controller';
import { Selection } from '../Selection';
import { GracenoteState } from '../Gracenote/state';
import { last, nlast } from '../global/utils';

import { Triplet } from '../Note';
import { ID, Item } from '../global/id';
import { Bar } from '../Bar';

interface ScoreProps {
  selection: Selection | null;
  dispatch: Dispatch;
  noteState: NoteState;
  demoNote: Demo | null;
  gracenoteState: GracenoteState;
}
export class Score {
  private name: string;
  private landscape: boolean;
  private _staves: Stave[];
  // an array rather than a set since it makes rendering easier (with map)
  private textBoxes: TextBox[];
  private secondTimings: SecondTiming[];

  public zoom: number;

  constructor(
    name = 'My Tune',
    numberOfStaves = 2,
    timeSignature: TimeSignature | undefined = undefined
  ) {
    this.name = name;
    this.landscape = false;
    this._staves = [...Array(numberOfStaves).keys()].map(
      () => new Stave(timeSignature)
    );
    this.textBoxes = [new TextBox(name, true)];
    this.secondTimings = [];
    this.zoom =
      (100 * 0.9 * (Math.max(window.innerWidth, 800) - 300)) / this.width();
  }
  private width() {
    return this.landscape ? 297 * 5 : 210 * 5;
  }
  private height() {
    return this.landscape ? 210 * 5 : 297 * 5;
  }
  public orientation() {
    return this.landscape ? 'landscape' : 'portrait';
  }
  public toggleLandscape() {
    this.landscape = !this.landscape;

    this.textBoxes.forEach((text) =>
      text.adjustAfterOrientation(this.width(), this.height())
    );
    this.zoom = (this.zoom * this.height()) / this.width();
  }
  public updateName() {
    this.textBoxes[0] && (this.name = this.textBoxes[0].text());
  }
  public addText(text: TextBox) {
    this.textBoxes.push(text);
  }
  public addSecondTiming(secondTiming: SecondTiming) {
    if (secondTiming.isValid(this.secondTimings)) {
      this.secondTimings.push(secondTiming);
      return true;
    }
    return false;
  }
  public addStave(afterStave: Stave | null, before: boolean) {
    // Appends a stave after afterStave
    if (
      settings.topOffset + settings.staveGap * this._staves.length >
      this.height() - settings.margin
    ) {
      const tmp = settings.staveGap;
      settings.staveGap =
        (this.height() - settings.topOffset - settings.margin) /
        (this._staves.length + 0.5);
      if (settings.staveGap < Stave.minWidth()) {
        alert(
          'Cannot add stave - not enough space. Consider adding a second page, or reducing the margin at the top of the page.'
        );
        settings.staveGap = tmp;
        return;
      }
    }
    if (afterStave) {
      const adjacentBar = before ? afterStave.firstBar() : afterStave.lastBar();
      const ts = adjacentBar && adjacentBar.timeSignature();
      const ind = this._staves.indexOf(afterStave);
      const newStave = new Stave(ts || new TimeSignature());
      if (ind !== -1) this._staves.splice(before ? ind : ind + 1, 0, newStave);
    } else {
      this._staves.push(new Stave(new TimeSignature()));
    }
  }

  public nextNote(id: ID) {
    return Bar.nextNote(id, this.bars());
  }
  public previousNote(id: ID) {
    return Bar.previousNote(id, this.bars());
  }
  public deleteStave(stave: Stave) {
    // Deletes the stave from the score
    // Does not worry about purging notes/bars; that should be handled elsewhere

    const ind = this._staves.indexOf(stave);
    if (ind !== -1) this._staves.splice(ind, 1);
  }
  public notesAndTriplets() {
    return this.bars().flatMap((bar) => bar.notesAndTriplets());
  }
  public notes() {
    return Triplet.flatten(this.notesAndTriplets());
  }
  public bars() {
    return this._staves.flatMap((stave) => stave.allBars());
  }
  public staves() {
    return this._staves;
  }
  public lastStave() {
    return last(this._staves);
  }

  public location(id: ID) {
    // Finds the parent bar and stave of the note passed

    const staves = this.staves();

    if (staves.length === 0)
      throw Error('Tried to get location of a note, but there are no staves!');

    for (const stave of staves) {
      const bars = stave.allBars();
      for (const bar of bars) {
        if (bar.hasID(id)) {
          return { stave, bar };
        }
        const loc = bar.location(id);
        if (loc) return { stave, bar };
      }
    }

    const lastStaveBars = nlast(staves).allBars();
    return {
      stave: staves[staves.length - 1],
      bar: lastStaveBars[lastStaveBars.length - 1],
    };
  }

  public coordinateToStaveIndex(y: number): number | null {
    // Converts the y coordinate to the index of stave that the y coordinate lies in
    // If it is below 0, it returns 0; if it doesn't lie on any stave it returns null

    const offset = y + 4 * settings.lineGap - settings.topOffset;
    if (offset > 0 && offset % settings.staveGap <= 12 * settings.lineGap) {
      return Math.max(Math.floor(offset / settings.staveGap), 0);
    } else {
      return null;
    }
  }
  public deleteSecondTiming(secondTiming: SecondTiming) {
    this.secondTimings.splice(this.secondTimings.indexOf(secondTiming), 1);
  }
  public deleteTextBox(text: TextBox) {
    this.textBoxes.splice(this.textBoxes.indexOf(text), 1);
  }
  public dragTextBox(text: TextBox, x: number, y: number) {
    if (x < this.width() && x > 0 && y < this.height() && y > 0) {
      text.setCoords(x, y);
    }
  }
  public dragSecondTiming(
    secondTiming: DraggedSecondTiming,
    x: number,
    y: number
  ) {
    secondTiming.secondTiming.drag(
      secondTiming.dragged,
      x,
      y,
      this.secondTimings
    );
  }

  public purgeSecondTimings(items: Item[]) {
    const secondTimingsToDelete: SecondTiming[] = [];
    for (const item of items) {
      for (const st of this.secondTimings) {
        if (st.pointsTo(item.id)) secondTimingsToDelete.push(st);
      }
    }
    secondTimingsToDelete.forEach((t) => this.deleteSecondTiming(t));
  }
  public play() {
    return this._staves.flatMap((st, i) =>
      st.play(i === 0 ? null : this._staves[i - 1])
    );
  }
  public render(props: ScoreProps): V {
    const width = this.width();
    const height = this.height();
    const staveProps = (stave: Stave, index: number) => ({
      x: settings.margin,
      y: index * settings.staveGap + settings.topOffset,
      width: width - 2 * settings.margin,
      previousStave: this._staves[index - 1] || null,
      previousStaveY: (index - 1) * settings.staveGap + settings.topOffset,
      dispatch: props.dispatch,
      noteState: props.noteState,
      gracenoteState: props.gracenoteState,
    });

    const secondTimingProps = {
      staveStartX: settings.margin,
      staveEndX: width - settings.margin,
      selection: props.selection,
      staveGap: settings.staveGap,
      dispatch: props.dispatch,
    };
    const scoreSelectionProps = {
      staveStartX: settings.margin,
      staveEndX: width - settings.margin,
      staveGap: settings.staveGap,
    };

    return svg(
      'svg',
      {
        id: 'score-svg',
        width: (width * this.zoom) / 100,
        height: (height * this.zoom) / 100,
        viewBox: `0 0 ${width} ${height}`,
      },
      { mouseup: () => props.dispatch(mouseUp()) },
      [
        svg(
          'rect',
          { x: '0', y: '0', width: '100%', height: '100%', fill: 'white' },
          { mousedown: () => props.dispatch(clickBackground()) }
        ),
        ...this._staves.map((stave, idx) =>
          stave.render(staveProps(stave, idx))
        ),
        ...this.textBoxes.map((textBox) =>
          textBox.render({
            dispatch: props.dispatch,
            scoreWidth: width,
            selection: props.selection,
          })
        ),
        ...this.secondTimings.map((secondTiming) =>
          secondTiming.render(secondTimingProps)
        ),
        props.selection && props.selection.render(scoreSelectionProps),
      ]
    );
  }
}
