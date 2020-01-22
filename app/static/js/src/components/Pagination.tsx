import * as React from "react";
import { Container, Button } from "reactstrap";
import { Store } from "../Store";

export function Pagination(): JSX.Element {
  const { state, dispatch } = React.useContext(Store);

  const loadPrevPage = async () => {
    const URL = state.paginationLinks.prevPageEndpoint;
    const data = await fetch(URL);
    const dataJSON = await data.json();
    return dispatch({
      type: "FETCH_DATA",
      payload: dataJSON
    });
  };

  const loadNextPage = async () => {
    const URL = state.paginationLinks.nextPageEndpoint;
    const data = await fetch(URL);
    const dataJSON = await data.json();
    return dispatch({
      type: "FETCH_DATA",
      payload: dataJSON
    });
  };

  return (
    <Container className="justify-content-center">
      <span>
        <Button onClick={loadPrevPage}>prev</Button>
      </span>
      <span>
        <Button onClick={loadNextPage}>next</Button>
      </span>
    </Container>
  );
}
