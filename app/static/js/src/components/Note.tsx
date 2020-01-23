import * as React from "react";
import {
  CardHeader,
  Card,
  CardFooter,
  CardBody,
  Button,
  Tag
} from "reactstrap";
import { INote } from "../interfaces/Note.interfaces";
import { NoteTag } from "../components/NoteTag";

export class Note extends React.Component<INote> {
  render() {
    return (
      <Card>
        <CardHeader>
          <p>{this.props.createdAt.substr(0, 10)}</p>
        </CardHeader>
        <CardBody>
          <p className="card-text">{this.props.content}</p>
        </CardBody>
        <CardFooter></CardFooter>
      </Card>
    );
  }
}
