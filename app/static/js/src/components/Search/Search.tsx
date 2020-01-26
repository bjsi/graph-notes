import * as React from "react";
import { Store } from "../../Store";
import { Input, Form } from "reactstrap";

export class Search extends React.Component {
  static contextType = Store;
  handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let url = "/api/1/notes/?search=" + this.context.state.search;
    let data = await fetch(url);
    let dataJSON = await data.json();
    return this.context.dispatch({
      type: "GET_NOTES",
      payload: dataJSON
    });
  };
  handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    return this.context.dispatch({
      type: "UPDATE_SEARCH",
      payload: event.target.value
    });
  };

  render() {
    return (
      <Form onSubmit={this.handleSubmit}>
        <Input
          onChange={this.handleChange}
          name="search"
          value={this.context.state.search}
          placeholder="Search..."
          rows={1}
        ></Input>
      </Form>
    );
  }
}
