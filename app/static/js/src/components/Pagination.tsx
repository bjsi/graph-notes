import * as React from "react";
import { Container, Button, Row, Col } from "reactstrap";
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
    <>
      <div className="text-center">
        <small>
          Current page: {state.paginationInfo.currentPage} | Items per page:{" "}
          {state.paginationInfo.itemsPerPage}
        </small>
      </div>
      <div className="text-center">
        <span>
          <Button
            onClick={loadPrevPage}
            className={state.paginationLinks.prevPageEndpoint ? "" : "disabled"}
          >
            <i className="fa fa-arrow-left"></i> prev
          </Button>{" "}
        </span>
        <span>
          <Button
            onClick={loadNextPage}
            className={state.paginationLinks.nextPageEndpoint ? "" : "disabled"}
          >
            next <i className="fa fa-arrow-right"></i>
          </Button>
        </span>
      </div>
    </>
  );
}
