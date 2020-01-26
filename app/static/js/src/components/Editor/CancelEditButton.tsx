import * as React from "react";
import { Store } from "../../Store";
import { Button } from "reactstrap";

interface ICancelEditProps {
  focusEditor(): void;
}

export function CancelEditButton(props: ICancelEditProps) {
  const { state, dispatch } = React.useContext(Store);
  const cancelEdit = () => {
    props.focusEditor();
    dispatch({
      type: "EDITING",
      payload: { noteId: null, editing: false }
    });
    dispatch({
      type: "UPDATE_TEXT",
      payload: ""
    });
  };

  return (
    <Button
      color="warning"
      className={state.editing.currentlyEditing ? "" : "disabled"}
      onClick={cancelEdit}
    >
      Cancel Edit
    </Button>
  );
}
