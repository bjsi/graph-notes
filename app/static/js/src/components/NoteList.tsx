import * as React from "react";
import { Note } from "./Note";
import CardColumns from "reactstrap/lib/CardColumns";

export class NoteList extends React.Component {
  state = {
    notes: []
  };

  addNote = (content: string) => {};

  render() {
    return (
      <div>
        <Note />
      </div>
    );
  }
}
