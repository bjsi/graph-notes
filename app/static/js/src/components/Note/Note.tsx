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
  const getChildNote = async (e: React.MouseEvent) => {
    e.preventDefault;
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
    <Card color={state.editing.currentlyEditing ? "warning" : ""}>
      <CardHeader>
        <Row>
          <p>{note.createdAt.substr(0, 10)}</p>
          <ArchiveButton note={note} />
          <EditButton note={note}></EditButton>
        </Row>
      </CardHeader>
      <CardBody>
        <ReactMarkdown>{note.content}</ReactMarkdown>
      </CardBody>
      <CardFooter>
        <Button
          onClick={getParentNote}
          size="small"
          className={note._links.parentNoteEndpoint ? "" : "disabled"}
        >
          Parent
        </Button>{" "}
        {note.tags.map((tag: string) => {
          return (
            <section>
              <NoteTag tag={tag}></NoteTag>{" "}
            </section>
          );
        })}
        <Button
          onClick={getChildNote}
          size="small"
          className={note._links.childNoteEndpoint ? "" : "disabled"}
        >
          Child
        </Button>
      </CardFooter>
    </Card>
  );
}
