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
import { INote } from "../interfaces/Note.interfaces";
import { NoteTag } from "../components/NoteTag";
import { Store } from "../Store";

const textStyle = {
  fontSize: "16px"
};

export function Note(note: INote) {
  const { state, dispatch } = React.useContext(Store);

  const archiveNote = async (e: React.MouseEvent) => {
    e.preventDefault;
    let url = "/api/1/notes/" + note.id + "/archive";
    let data = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-type": "application/json"
      }
    });
    let dataJSON = await data.json();
    return dispatch({
      type: "REMOVE_NOTE",
      payload: note
    });
  };
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

  console.log(note._links.parentNoteEndpoint);
  console.log(note._links.childNoteEndpoint);

  return (
    <Card>
      <CardHeader>
        <Row>
          <p>{note.createdAt.substr(0, 10)}</p>{" "}
          <Button onClick={archiveNote}>A</Button>{" "}
          <Button onClick={editNote}>E</Button>
        </Row>
      </CardHeader>
      <CardBody>
        <CardText>{note.content}</CardText>
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
