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
  const getNotesByTag = async (tag: string) => {
    let url = "localhost:5000/api/1/tags/" + tag;
    let data = await fetch(url);
    let dataJSON = await data.json();
  };

  return (
    <Card>
      <CardHeader>
        <p>{note.createdAt.substr(0, 10)}</p>
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
