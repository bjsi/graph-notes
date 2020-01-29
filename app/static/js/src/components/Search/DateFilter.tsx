import * as React from "react";
import { Store } from "../../Store";
import { Input, InputGroup, InputGroupAddon, InputGroupText } from "reactstrap";

export class DateFilter extends React.Component {
  static contextType = Store;
  handleChangeBeforeDate = (event: React.ChangeEvent<HTMLInputElement>) => {
    return this.context.dispatch({
      type: "UPDATE_BEFORE_DATE",
      payload: event.target.value
    });
  };
  handleChangeAfterDate = (event: React.ChangeEvent<HTMLInputElement>) => {
    return this.context.dispatch({
      type: "UPDATE_AFTER_DATE",
      payload: event.target.value
    });
  };

  render() {
    return (
      <>
        <InputGroup>
          <InputGroupAddon addonType="prepend">
            <InputGroupText>After</InputGroupText>
          </InputGroupAddon>
          <Input
            onChange={this.handleChangeAfterDate}
            name="afterDate"
            value={this.context.state.afterDate}
            rows={1}
          ></Input>
          <InputGroupAddon addonType="prepend">
            <InputGroupText>Before</InputGroupText>
          </InputGroupAddon>
          <Input
            onChange={this.handleChangeBeforeDate}
            name="beforeDate"
            value={this.context.state.beforeDate}
            rows={1}
          ></Input>
        </InputGroup>
      </>
    );
  }
}
