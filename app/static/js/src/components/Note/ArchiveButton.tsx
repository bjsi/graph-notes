import * as React from "react";
import { Store } from "../../Store";
import { Button } from "reactstrap";
import { INote } from "../../interfaces/Note.interfaces";

export class ArchiveButton extends React.Component<{ note: INote }> {
  static contextType = Store;

  archiveNote = async (e: React.MouseEvent) => {
    e.preventDefault;
    let url = "/api/1/notes/" + this.props.note.id + "/archive";
    let data = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-type": "application/json"
      }
    });
    let dataJSON = await data.json();
    return this.context.dispatch({
      type: "REMOVE_NOTE",
      payload: this.props.note
    });
  };

  render() {
    return (
      <Button
        onClick={this.archiveNote}
        disabled={this.context.state.editing.currentlyEditing ? true : false}
        className="float-right ml-auto"
        size="sm"
      >
        A
      </Button>
    );
  }
}
