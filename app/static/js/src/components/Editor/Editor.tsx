import * as React from "react";
import * as ReactMarkdown from "react-markdown";
import { Store } from "../../Store";
import { Input, Container, Row, Col } from "reactstrap";
import { MarkdownButtons } from "./MarkdownButtons";
import { AddNoteButton } from "./AddNoteButton";
import { CancelEditButton } from "./CancelEditButton";
import { AlertMessage } from "../AlertMessage";
import { Search } from "../Search/Search";
import { DateFilter } from "../Search/DateFilter";
import { MermaidEditor } from "./MermaidEditor";

const previewStyle = {
  padding: "10px",
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
      <div className="mb-2">
        <Container className="mb-2">
          <AddNoteButton focusEditor={this.focusEditor} />
          {this.context.state.editing.currentlyEditing ? (
            <CancelEditButton focusEditor={this.focusEditor} />
          ) : null}
          <MarkdownButtons focusEditor={this.focusEditor} />
        </Container>
        <Container className="mb-2">
          <Row>
            <Col xs="4">
              <Input
                innerRef={this.editorInput}
                name="text"
                type="textarea"
                value={this.context.state.text}
                placeholder="Add some text..."
                onChange={this.handleChange}
                rows={4}
              ></Input>
            </Col>
            <Col xs="8">
              <MermaidEditor />
            </Col>
          </Row>
        </Container>
        <Container className="mb-2">
          <AlertMessage />
        </Container>
        <Container className="mb-2">
          <div style={previewStyle}>
            <ReactMarkdown source={this.context.state.text}></ReactMarkdown>
          </div>
        </Container>
        <Container>
          <Search />
        </Container>
      </div>
    );
  }
}
