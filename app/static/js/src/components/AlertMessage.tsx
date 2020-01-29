import * as React from "react";
import { Store } from "../Store";
import { Alert, Container } from "reactstrap";

export function AlertMessage(): JSX.Element {
  const { state, dispatch } = React.useContext(Store);

  return (
    <Container className="mb-2">
      <Alert isOpen={state.alert.visible} variant={state.alert.color}>
        {state.alert.text}
      </Alert>
    </Container>
  );
}
