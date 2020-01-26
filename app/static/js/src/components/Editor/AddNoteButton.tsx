import * as React from "react";
import { Store } from "../../Store";
import { Button } from "reactstrap";

interface IAddNoteProps {
  focusEditor(): void;
}

export function AddNoteButton(props: IAddNoteProps) {
  const { state, dispatch } = React.useContext(Store);

  const addNote = async () => {
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
      return;
    }

    const url = state.editing.currentlyEditing
      ? state.editing.note._links.childNoteEndpoint
      : "/api/1/notes/";

    const data = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-type": "application/json"
      },
      body: JSON.stringify({ content: state.text })
    });
    const dataJSON = await data.json();

    // TODO If it is successful, Alert Note added.
    // Else Alert with error
    dispatch({
      type: "UPDATE_ALERT",
      payload: {
        color: "success",
        text: "Successfully added note.",
        visible: true
      }
    });
    dispatch({ type: "ADD_NOTE", payload: dataJSON });
    dispatch({ type: "EDITING", payload: { noteId: "", editing: false } });
    dispatch({ type: "UPDATE_TEXT", payload: "" });
    props.focusEditor();
  };

  return (
    <>
      <Button color="primary" size="md" onClick={addNote}>
        <i className="fa fa-plus"></i> Add
      </Button>{" "}
    </>
  );
}
