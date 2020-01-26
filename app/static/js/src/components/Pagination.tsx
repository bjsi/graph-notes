import * as React from "react";
import { Container, Button } from "reactstrap";
import { Store } from "../Store";
import { IPaginationInfo, IPageLinks } from "../interfaces/Note.interfaces";

interface IPagination {
  paginationInfo: IPaginationInfo;
  pageLinks: IPageLinks;
}

export function Pagination(): JSX.Element {
  const { state, dispatch } = React.useContext(Store);

  const loadPrevPage = async () => {
    const URL = state.paginationLinks.prevPageEndpoint;
    if (!URL) {
      return;
    }
    const data = await fetch(URL);
    const dataJSON = await data.json();
    return dispatch({
      type: "GET_NOTES",
      payload: dataJSON
    });
  };

  const loadNextPage = async () => {
    const URL = state.paginationLinks.nextPageEndpoint;
    if (!URL) {
      return;
    }
    const data = await fetch(URL);
    const dataJSON = await data.json();
    return dispatch({
      type: "GET_NOTES",
      payload: dataJSON
    });
  };

  return (
    <Container className="justify-content-center">
      <span>
        <Button
          onClick={loadPrevPage}
          className={state.paginationLinks.prevPageEndpoint ? "" : "disabled"}
        >
          prev
        </Button>{" "}
      </span>
      <span>
        <Button
          onClick={loadNextPage}
          className={state.paginationLinks.nextPageEndpoint ? "" : "disabled"}
        >
          next
        </Button>
      </span>
    </Container>
  );
}
