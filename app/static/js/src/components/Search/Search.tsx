import * as React from "react";
import { Store } from "../../Store";
import { Input, Form, Row, Col } from "reactstrap";
import { DateFilter } from "./DateFilter";

export class Search extends React.Component {
  static contextType = Store;
  handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let url = "/api/1/notes/";
    let params = {
      search: "",
      start: "",
      end: ""
    };

    if (this.context.state.search && !url.includes("search")) {
      params["search"] = this.context.state.search;
    }
    if (this.context.state.afterDate && !url.includes("start")) {
      params["start"] = this.context.state.afterDate;
    }
    if (this.context.state.beforeDate && !url.includes("end")) {
      params["end"] = this.context.state.beforeDate;
    }
    if (params) {
      url = url.concat("?", jQuery.param(params));
    }

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
      <Row>
        <Col xs="4">
          <Form onSubmit={this.handleSubmit}>
            <Input
              onChange={this.handleChange}
              name="search"
              value={this.context.state.search}
              placeholder="Search..."
              rows={1}
            ></Input>
          </Form>
        </Col>
        <Col xs="8">
          <DateFilter />
        </Col>
      </Row>
    );
  }
}
