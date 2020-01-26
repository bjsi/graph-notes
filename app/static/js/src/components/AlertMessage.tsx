import * as React from "react";
import { Store } from "../Store";
import { Alert } from "reactstrap";

export function AlertMessage(): JSX.Element {
  const { state, dispatch } = React.useContext(Store);
  return (
    <Alert show={state.alert.visible} variant={state.alert.color}>
      {state.alert.text}
    </Alert>
  );
}
