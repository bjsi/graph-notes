import * as React from "react";
import * as ReactMarkdown from "react-markdown";
import { Store } from "../../Store";
import { Input, Container, Row } from "reactstrap";
import { MarkdownButtons } from "./MarkdownButtons";
import { AddNoteButton } from "./AddNoteButton";
import { CancelEditButton } from "./CancelEditButton";
import { AlertMessage } from "../AlertMessage";

const previewStyle = {
  padding: "10px",
  margin: "10px",
  borderStyle: "dotted",
  borderWidth: "1px",
  backgroundColor: "#FDFDFD"
};

export class Editor extends React.Component {
  static contextType = Store;
  private editorInput: React.RefObject<HTMLInputElement> = React.createRef();

  focusEditor = () => {
    const node = this.editorInput.current;
    if (node) {
      node.focus();
    }
  };

  handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    return this.context.dispatch({
      type: "UPDATE_TEXT",
      payload: event.target.value
    });
  };

  render() {
    return (
      <Container>
        <Container className="mb-2">
          <Row className="mb-2">
            <AddNoteButton focusEditor={this.focusEditor} />
            <CancelEditButton focusEditor={this.focusEditor} />
            <MarkdownButtons focusEditor={this.focusEditor} />
          </Row>
        </Container>
        <Container>
          <Input
            innerRef={this.editorInput}
            name="text"
            type="textarea"
            value={this.context.state.text}
            placeholder="Add some text..."
            onChange={this.handleChange}
            rows={4}
          ></Input>
        </Container>
        <Container>
          <div style={previewStyle}>
            <ReactMarkdown source={this.context.state.text}></ReactMarkdown>
          </div>
        </Container>
      </Container>
    );
  }
}
