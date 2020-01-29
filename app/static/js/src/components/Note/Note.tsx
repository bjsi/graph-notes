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
    return dispatch({
      type: "REPLACE_NOTE",
      payload: {
        note: dataJSON,
        id: note.id
      }
    });
  };

  const getChildNote = async () => {
    let data = await fetch(note._links.childNoteEndpoint);
    let dataJSON = await data.json();
    return dispatch({
      type: "REPLACE_NOTE",
      payload: {
        note: dataJSON,
        id: note.id
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
        <>
          {note.createdAt.substr(0, 10)}
          <ArchiveButton note={note} />
          <EditButton note={note} />
        </>
      </CardHeader>
      <CardBody>
        <ReactMarkdown renderers={{}} source={note.content}></ReactMarkdown>
        <hr />
        <div>
          <small>Source: </small>
        </div>
        <small>
          <i className="fa fa-tags"></i>:{" "}
        </small>
        <span>
          <NoteTags note={note}></NoteTags>
        </span>
      </CardBody>
      <CardFooter>
        <>
          <Button
            onClick={getParentNote}
            size="sm"
            outline
            className={"float-left mb-2"}
            {...(note._links.parentNoteEndpoint ? "" : "disabled")}
          >
            <i className="fa fa-long-arrow-up"></i> Parent
          </Button>{" "}
          <Button
            outline
            onClick={getChildNote}
            size="sm"
            className={"float-right mb-2"}
            {...(note._links.childNoteEndpoint ? "" : "disabled")}
          >
            <i className="fa fa-long-arrow-down"></i> Child
          </Button>
        </>
      </CardFooter>
    </Card>
  );
}
