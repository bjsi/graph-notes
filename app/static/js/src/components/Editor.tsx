import * as React from "react";
import * as ReactMarkdown from "react-markdown";

import {
  Input,
  FormGroup,
  ButtonGroup,
  Badge,
  Button,
  Container
} from "reactstrap";

const previewStyle = {
  padding: "10px",
  margin: "10px",
  borderStyle: "dotted",
  borderWidth: "1px",
  backgroundColor: "#FDFDFD"
};

export class Editor extends React.Component {
  state = {
    text: ""
  };

  handleSubmit = async () => {
    if (!this.state.text) {
      return;
    }

    const url = "/api/1/notes/";
    const data = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-type": "application/json"
      },
      body: JSON.stringify({ content: this.state.text })
    });
  };

  cancelEdit = () => {
    console.log("Cancel edit");
  };

  preview = (markdown: string) => {};

  handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      [event.target.name]: event.target.value
    });
  };

  render() {
    return (
      <Container>
        <Container>
          <span>
            <Button type="button" className="mb-2" onClick={this.handleSubmit}>
              Add
            </Button>
          </span>
          <span>
            <Button
              type="button"
              color="warning"
              className="mb-2"
              onClick={this.cancelEdit}
            >
              Cancel Edit
            </Button>
          </span>
        </Container>
        <Container>
          <FormGroup>
            <Input
              name="text"
              type="textarea"
              value={this.state.text}
              placeholder="Add some text..."
              onChange={this.handleChange}
              rows={4}
            ></Input>
          </FormGroup>
        </Container>
        <Container>
          <div style={previewStyle}>
            <ReactMarkdown source={this.state.text}></ReactMarkdown>
          </div>
        </Container>
      </Container>
    );
  }
}
