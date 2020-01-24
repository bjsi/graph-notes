import * as React from "react";
import * as ReactDOM from "react-dom";
import { NoteList } from "./components/NoteList";
import CardColumns from "reactstrap/lib/CardColumns";
import { Editor } from "./components/Editor";
import { Store } from "./Store";
import { Pagination } from "./components/Pagination";
import { INote } from "./interfaces/Note.interfaces";
import {
  CardHeader,
  Card,
  CardFooter,
  CardBody,
  Button,
  Container
} from "reactstrap";
import { Note } from "./components/Note";

export default function App(): JSX.Element {
  const { state, dispatch } = React.useContext(Store);
  React.useEffect(() => {
    state.notes.length === 0 && fetchDataAction();
  });
  const fetchDataAction = async () => {
    const data = await fetch("/api/1/notes/");
    const dataJSON = await data.json();
    return dispatch({
      type: "GET_NOTES",
      payload: dataJSON
    });
  };

  return (
    <div>
      <Editor />
      <Container>
        <CardColumns>
          {state.notes.map((note: INote) => {
            return (
              <section key={note.id}>
                <Note {...note} />
              </section>
            );
          })}
        </CardColumns>
      </Container>
      <Pagination />
    </div>
  );
}
