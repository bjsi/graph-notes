import * as React from "react";
import {
  Input,
  FormGroup,
  ButtonGroup,
  Badge,
  Button,
  Container
} from "reactstrap";

export class Editor extends React.Component {
  state = {
    text: ""
  };

  handleSubmit = () => {};

  cancelEdit = () => {
    console.log("Cancel edit");
  };

  handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      [event.target.name]: event.target.value
    });
    console.log(this.state);
  };

  render() {
    return (
      <Container>
        <Container>
          <ButtonGroup>
            <Button type="button" className="mb-2" onClick={this.handleSubmit}>
              Add
            </Button>
            <Button type="button" className="mb-2" onClick={this.cancelEdit}>
              Cancel Edit
            </Button>
          </ButtonGroup>
        </Container>
        <Container>
          <FormGroup>
            <Input
              name="text"
              type="textarea"
              value={this.state.text}
              placeholder="Add some text..."
              onChange={this.handleChange}
            ></Input>
          </FormGroup>
        </Container>
      </Container>
    );
  }
}
