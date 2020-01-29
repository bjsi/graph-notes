import * as React from "react";
import { Store } from "../../Store";
import { Button } from "reactstrap";

interface IAddNoteProps {
  focusEditor(): void;
}

export function AddNoteButton(props: IAddNoteProps) {
  const { state, dispatch } = React.useContext(Store);

  const editorHasText = (): boolean => {
    if (!state.text) {
      props.focusEditor();
      dispatch({
        type: "UPDATE_ALERT",
        payload: {
          text: "You need to add some text",
          color: "warning",
          visible: true
        }
      });
      return false;
    }
    return true;
  };

  const handleAddNote = () => {
    if (state.editing.currentlyEditing) {
      addChildNote();
      return;
    }
    addParentNote();
  };

  const addParentNote = async () => {
    if (editorHasText()) {
      const url = "/api/1/notes/";
      const data = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-type": "application/json"
        },
        body: JSON.stringify({ content: state.text })
      });
      const dataJSON = await data.json();
      dispatch({
        type: "UPDATE_ALERT",
        payload: {
          color: "success",
          text: "Successfully added new note.",
          visible: true
        }
      });
      dispatch({ type: "ADD_NOTE", payload: dataJSON });
      dispatch({ type: "EDITING", payload: { noteId: "", editing: false } });
      dispatch({ type: "UPDATE_TEXT", payload: "" });
      props.focusEditor();
    }
  };

  const addChildNote = async () => {
    if (editorHasText()) {
      const url = state.editing.note._links.childNoteEndpoint;
      const data = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-type": "application/json"
        },
        body: JSON.stringify({ content: state.text })
      });
      const dataJSON = await data.json();
      dispatch({
        type: "UPDATE_ALERT",
        payload: {
          color: "success",
          text: "Successfully edited child note.",
          visible: true
        }
      });
      dispatch({ type: "REPLACE_NOTE", payload: dataJSON });
      dispatch({ type: "EDITING", payload: { noteId: "", editing: false } });
      dispatch({ type: "UPDATE_TEXT", payload: "" });
      props.focusEditor();
    }
  };

  const addNote = async () => {
    props.focusEditor();
  };

  return (
    <>
      <Button color="primary" size="md" onClick={handleAddNote}>
        <i className="fa fa-plus"></i> Add
      </Button>{" "}
    </>
  );
}
