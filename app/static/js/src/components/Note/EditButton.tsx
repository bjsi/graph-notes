import * as React from "react";
import { Store } from "../../Store";
import { Button } from "reactstrap";
import { INote } from "../../interfaces/Note.interfaces";

interface IEditButtonProps {
  note: INote;
}

export class EditButton extends React.Component<IEditButtonProps> {
  static contextType = Store;
  editNote = () => {
    this.context.dispatch({
      type: "UPDATE_TEXT",
      payload: this.props.note.content
    });
    this.context.dispatch({
      type: "EDITING",
      payload: { note: this.props.note, currentlyEditing: true }
    });
  };

  render() {
    return (
      <>
        <Button
          onClick={this.editNote}
          disabled={this.context.state.editing.currentlyEditing ? true : false}
          className="float-right"
          size="sm"
        >
          E
        </Button>{" "}
      </>
    );
  }
}
