import * as React from "react";
import {
  CardHeader,
  Card,
  CardFooter,
  CardBody,
  Badge,
  Button,
  Tag,
  CardText,
  Row
} from "reactstrap";
import { INote } from "../../interfaces/Note.interfaces";
import { NoteTag } from "./NoteTag";
import { Store } from "../../Store";
import { EditButton } from "./EditButton";
import { ArchiveButton } from "./ArchiveButton";
import * as ReactMarkdown from "react-markdown";
import { NoteTags } from "./NoteTags";

const textStyle = {
  fontSize: "16px"
};

export function Note(note: INote) {
  const { state, dispatch } = React.useContext(Store);

  const getParentNote = async (e: React.MouseEvent) => {
    e.preventDefault;
    let data = await fetch(note._links.parentNoteEndpoint);
    let dataJSON = await data.json();
    return;
  };
  const getChildNote = async () => {
    let data = await fetch(note._links.childNoteEndpoint);
    let dataJSON = await data.json();
    return dispatch({
      type: "REPLACE_NOTE",
      payload: {
        note: dataJSON,
        replaceId: note.id
      }
    });
  };

  const editNote = () => {
    return dispatch({
      type: "UPDATE_TEXT",
      payload: note.content
    });
  };

  return (
    <Card
      color={
        state.editing.currentlyEditing && state.editing.note.id === note.id
          ? "warning"
          : ""
      }
    >
      <CardHeader style={{ fontSize: 18 }}>
        {note.createdAt.substr(0, 10)}
        <ArchiveButton note={note} />
        <EditButton note={note} />
      </CardHeader>
      <CardBody>
        <ReactMarkdown renderers={{}} source={note.content}></ReactMarkdown>
        <hr />
        <small>Source: </small>
        <span>
          <p>
            <i className="fa fa-tags"></i>:{" "}
          </p>
        </span>
        <span>
          <NoteTags note={note}></NoteTags>
        </span>
      </CardBody>
      <CardFooter>
        <Row>
          <Button
            onClick={getParentNote}
            size="sm"
            className={
              "float-left" +
              " " +
              (note._links.parentNoteEndpoint ? "" : "disabled")
            }
          >
            Parent
          </Button>{" "}
          <Button
            onClick={getChildNote}
            size="sm"
            className={
              "float-right" +
              " " +
              (note._links.childNoteEndpoint ? "" : "disabled")
            }
          >
            Child
          </Button>
        </Row>
      </CardFooter>
    </Card>
  );
}
