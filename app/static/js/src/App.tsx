import * as React from "react";
import * as ReactDOM from "react-dom";
import { NoteList } from "./components/NoteList";
import CardColumns from "reactstrap/lib/CardColumns";
import { Editor } from "./components/Editor";
import { Store } from "./Store";
import { Pagination } from "./components/Pagination";

export default function App(): JSX.Element {
  const { state, dispatch } = React.useContext(Store);
  React.useEffect(() => {
    state.notes.length === 0 && fetchDataAction();
  });
  const fetchDataAction = async () => {
    const data = await fetch("/api/1/notes/");
    const dataJSON = await data.json();
    return dispatch({
      type: "FETCH_DATA",
      payload: dataJSON
    });
  };

  return (
    <div>
      <Editor />
      <CardColumns>
        <NoteList />
      </CardColumns>
      <Pagination />
    </div>
  );
}
