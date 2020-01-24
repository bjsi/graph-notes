import * as React from "react";
import * as ReactMarkdown from "react-markdown";
import { Store } from "../Store";
import {
  Input,
  FormGroup,
  ButtonGroup,
  Badge,
  Button,
  Container,
  Row
} from "reactstrap";
import { MarkdownButtons } from "./MarkdownButtons";

const previewStyle = {
  padding: "10px",
  margin: "10px",
  borderStyle: "dotted",
  borderWidth: "1px",
  backgroundColor: "#FDFDFD"
};

export function Editor(): JSX.Element {
  const { state, dispatch } = React.useContext(Store);

  const handleSubmit = async () => {
    if (!state.text) {
      return;
    }
    const url = "/api/1/notes/";
    const data = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-type": "application/json"
      },
      body: JSON.stringify({ content: state.text })
    });

    const dataJSON = await data.json();
    return dispatch({
      type: "ADD_NOTE",
      payload: dataJSON
    });
  };

  const cancelEdit = () => {
    console.log("Cancel edit");
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    return dispatch({
      type: "UPDATE_TEXT",
      payload: event.target.value
    });
  };

  return (
    <Container>
      <Container className="mb-2">
        <Row className="mb-2">
          <Button type="button" size="small" onClick={handleSubmit}>
            Add
          </Button>{" "}
          <Button
            type="button"
            color="warning"
            className="disabled"
            onClick={cancelEdit}
          >
            Cancel Edit
          </Button>{" "}
          <MarkdownButtons />
        </Row>
      </Container>
      <Container>
        <FormGroup>
          <Input
            name="text"
            type="textarea"
            value={state.text}
            placeholder="Add some text..."
            onChange={handleChange}
            rows={4}
          ></Input>
        </FormGroup>
      </Container>
      <Container>
        <div style={previewStyle}>
          <ReactMarkdown source={state.text}></ReactMarkdown>
        </div>
      </Container>
    </Container>
  );
}
