import * as React from "react";
import * as ReactDOM from "react-dom";
import { NoteList } from "./components/NoteList";
import CardColumns from "reactstrap/lib/CardColumns";
import { Editor } from "./components/Editor";
import { StoreProvider } from "./Store";

export default class App extends React.Component {
  render() {
    return (
      <StoreProvider>
        <Editor />
        <CardColumns>
          <NoteList />
        </CardColumns>
      </StoreProvider>
    );
  }
}
