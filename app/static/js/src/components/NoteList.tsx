import * as React from "react";
import { Note } from "./Note";
import CardColumns from "reactstrap/lib/CardColumns";
import { Store } from "../Store";
import { INote } from "../interfaces/Note.interfaces";

export function NoteList(props: INote[]): JSX.Element {
  // const state = React.useContext(Store);

  return (
    <div>
      {props.map((note: any) => {
        return;
        <Note {...note} />;
      })}
    </div>
  );
}
