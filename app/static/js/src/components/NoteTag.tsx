import * as React from "react";
import { Badge, ButtonGroup } from "reactstrap";
import { Store } from "../Store";

export function NoteTag(tag: string) {
  const { state, dispatch } = React.useContext(Store);

  const getNotesByTag = async () => {
    const URL = "/api/1/tags/" + tag;
    const data = await fetch(URL);
    const dataJSON = await data.json();
    return dispatch({
      type: "FETCH_DATA",
      payload: dataJSON
    });
  };

  return (
    <span className="mb-2">
      <Badge onClick={getNotesByTag}>{tag}</Badge>
    </span>
  );
}
