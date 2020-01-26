import * as React from "react";
import { Store } from "../../Store";
import {
  Input,
  FormGroup,
  ButtonGroup,
  Badge,
  Button,
  Container,
  Row
} from "reactstrap";
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
      payload: { note: this.props.note, editing: true }
    });
  };

  render() {
    return (
      <Button
        onClick={this.editNote}
        className={this.context.state.editing.editing ? "disabled" : ""}
      >
        E
      </Button>
    );
  }
}
