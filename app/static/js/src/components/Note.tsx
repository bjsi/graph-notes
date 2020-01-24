import * as React from "react";
import {
  CardHeader,
  Card,
  CardFooter,
  CardBody,
  Badge,
  Button,
  Tag,
  CardText
} from "reactstrap";
import { INote } from "../interfaces/Note.interfaces";
import { NoteTag } from "../components/NoteTag";

const textStyle = {
  fontSize: "16px"
};

export function Note(note: INote) {
  const archiveNote = async (e: React.MouseEvent) => {
    e.preventDefault;
    let url = "/api/1/notes/archive";
    let data = await fetch(url);
    let dataJSON = await data.json();
  };

  return (
    <Card>
      <CardHeader>
        <span>
          <p>{note.createdAt.substr(0, 10)}</p>
        </span>
        <span>
          <Badge onClick={archiveNote}>A</Badge>
        </span>
      </CardHeader>
      <CardBody>
        <CardText>{note.content}</CardText>
      </CardBody>
      <CardFooter>
        {note.tags.map((tag: string) => {
          return (
            <section>
              <NoteTag tag={tag}></NoteTag>
            </section>
          );
        })}
      </CardFooter>
    </Card>
  );
}
