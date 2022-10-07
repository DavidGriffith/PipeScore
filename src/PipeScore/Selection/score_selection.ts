// A ScoreSelection is any selection of notes / bars
// It has considerably more functionality than the other selections
// So it goes in its own file

import { Drags } from './model';
import { ID } from '../global/id';
import { Pitch } from '../global/pitch';
import { car, last, foreach } from '../global/utils';
import { getXY, deleteXY, before } from '../global/xy';
import { Item } from '../global/id';
import { settings } from '../global/settings';
import m from 'mithril';
import { Score } from '../Score';
import { Stave } from '../Stave';
import { Bar } from '../Bar';
import { Note, SingleNote, Triplet } from '../Note';
import { Gracenote } from '../Gracenote';

interface ScoreSelectionProps {
  page: number;
  score: Score;
  staveStartX: number;
  staveEndX: number;
  staveGap: number;
}

export class ScoreSelection extends Drags {
  public start: ID;
  public end: ID;

  constructor(start: ID, end: ID) {
    super();
    this.start = start;
    this.end = end;
  }
  public dragOverPitch(pitch: Pitch, score: Score) {
    for (const note of this.notes(score)) {
      note.drag(pitch);
      note.makeCorrectTie(score.notes());
    }
  }
  public delete(score: Score) {
    let started = false;
    let deleteBars = false;
    const notesToDelete: [Note, Bar][] = [];
    const barsToDelete: [Bar, Stave][] = [];

    all: for (const stave of score.staves()) {
      for (const bar of stave.bars()) {
        if (bar.hasID(this.start)) {
          deleteBars = true;
          started = true;
        }
        for (const note of bar.notesAndTriplets()) {
          if (note.hasID(this.start)) started = true;
          if (started) notesToDelete.push([note, bar]);
          if (note.hasID(this.end)) break all;
        }
        if (started) barsToDelete.push([bar, stave]);
        if (bar.hasID(this.end)) break all;
      }
    }
    notesToDelete.forEach(([note, bar]) => bar.deleteNote(note));

    if (deleteBars) {
      barsToDelete.forEach(([bar, stave]) => {
        stave.deleteBar(bar);
        if (stave.numberOfBars() === 0) score.deleteStave(stave);
      });
    }

    this.purgeItems(
      [...notesToDelete.map(car), ...barsToDelete.map(car)],
      score
    );
  }
  public lastNoteAndBar(score: Score): { note: Note | null; bar: Bar } {
    const notes = this.notes(score);
    return { note: last(notes), bar: score.location(this.end).bar };
  }
  // Get all selected notes and triplets
  public notesAndTriplets(score: Score): Note[] {
    return this.collectNotes(score, false);
  }
  // Get all selected single notes, including notes
  // that are part of a triplet
  public notes(score: Score): SingleNote[] {
    // When true is passed, this will always be a SingleNote[]
    return this.collectNotes(score, true) as SingleNote[];
  }
  public bars(score: Score): Bar[] {
    const allBars = score.bars();
    let foundStart = false;
    const bars: Bar[] = [];
    for (const bar of allBars) {
      if (bar.hasID(this.start)) foundStart = true;
      if (foundStart) bars.push(bar);
      if (bar.hasID(this.end)) break;
    }
    return bars;
  }
  public note(score: Score): Note | null {
    const notes = this.notesAndTriplets(score);
    if (notes.length > 0) {
      return notes[0];
    }
    return null;
  }
  public bar(score: Score): Bar | null {
    if (this.start === this.end) {
      for (const bar of score.bars()) {
        if (bar.id === this.start) return bar;
      }
    }
    return null;
  }
  public gracenote(score: Score): Gracenote | null {
    const notes = this.notes(score);
    if (notes.length === 1) {
      return notes[0].gracenoteType();
    }
    return null;
  }
  public addAnacrusis(before: boolean, score: Score) {
    const { bar, stave } = score.location(this.start);
    stave.insertBar(new Bar(bar.timeSignature(), true), bar, before);
  }
  public addBar(before: boolean, score: Score) {
    const { bar, stave } = score.location(this.start);
    stave.insertBar(new Bar(bar.timeSignature()), bar, before);
  }
  // Deletes all references to the items in the array
  private purgeItems(items: Item[], score: Score) {
    score.purgeSecondTimings(items);
    for (const note of items) {
      deleteXY(note.id);
    }
  }
  private collectNotes(
    score: Score,
    addSingleNotesInTriplets: boolean
  ): Note[] {
    const bars = score.bars();
    let foundStart = false;
    const notes: Note[] = [];
    all: for (const bar of bars) {
      if (bar.hasID(this.start)) foundStart = true;
      const barNotes = addSingleNotesInTriplets
        ? Triplet.flatten(bar.notesAndTriplets())
        : bar.notesAndTriplets();
      for (const note of barNotes) {
        if (note.hasID(this.start)) foundStart = true;
        if (foundStart && !note.isDemo()) notes.push(note);
        if (note.hasID(this.end)) break all;
      }
      if (bar.hasID(this.end)) break;
    }
    return notes;
  }

  public render(props: ScoreSelectionProps): m.Children {
    const a = getXY(this.start);
    const b = getXY(this.end);
    if (!a || !b) {
      console.error('Invalid note in selection');
      return m('g');
    }
    const start = before(a, b) ? a : b;
    const end = before(a, b) ? b : a;

    if (
      start.page !== props.page &&
      end.page !== props.page &&
      !(start.page < props.page && props.page < end.page)
    ) {
      return m('g');
    }

    const height = 6 * settings.lineGap;

    if (end.page !== start.page) {
      if (start.page === props.page) {
        const last = props.score.lastOnPage(props.page);
        if (last) return new ScoreSelection(this.start, last.id).render(props);
      } else if (end.page === props.page) {
        const first = props.score.firstOnPage(props.page);
        if (first) return new ScoreSelection(first.id, this.end).render(props);
      } else {
        const first = props.score.firstOnPage(props.page);
        const last = props.score.lastOnPage(props.page);
        if (first && last)
          return new ScoreSelection(first.id, last.id).render(props);
      }
      return m('g');
    } else if (end.y !== start.y) {
      const higher = start.y > end.y ? end : start;
      const lower = start.y > end.y ? start : end;
      const numStavesBetween =
        Math.round((lower.y - higher.y) / props.staveGap) - 1;
      return m('g[class=selection]', [
        m('rect', {
          x: higher.beforeX,
          y: higher.y - settings.lineGap,
          width: props.staveEndX - higher.beforeX,
          height,
          fill: 'orange',
          opacity: 0.5,
          'pointer-events': 'none',
        }),
        m('rect', {
          x: props.staveStartX,
          y: lower.y - settings.lineGap,
          width: lower.afterX - props.staveStartX,
          height,
          fill: 'orange',
          opacity: 0.5,
          'pointer-events': 'none',
        }),
        ...foreach(numStavesBetween, (i) => i + 1).map((i) =>
          m('rect', {
            x: props.staveStartX,
            y: higher.y + i * props.staveGap - settings.lineGap,
            width: props.staveEndX - props.staveStartX,
            height,
            fill: 'orange',
            opacity: 0.5,
            'pointer-events': 'none',
          })
        ),
      ]);
    } else {
      const width = end.afterX - start.beforeX;
      return m('g[class=selection]', [
        m('rect', {
          x: start.beforeX,
          y: start.y - settings.lineGap,
          width,
          height,
          fill: 'orange',
          opacity: 0.5,
          'pointer-events': 'none',
        }),
      ]);
    }
  }
}