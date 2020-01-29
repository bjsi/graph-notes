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
import { Store } from "../../Store";
import { EditButton } from "./EditButton";
import { ArchiveButton } from "./ArchiveButton";
import * as ReactMarkdown from "react-markdown";
import { NoteTag } from "./NoteTag";

export class NoteTags extends React.Component<{ note: INote }> {
  render() {
    return (
      <>
        {this.props.note.tags.map((tag: string) => {
          return (
            <>
              <NoteTag tag={tag}></NoteTag>{" "}
            </>
          );
        })}
      </>
    );
  }
}
