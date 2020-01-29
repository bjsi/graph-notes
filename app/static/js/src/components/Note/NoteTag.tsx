import * as React from "react";
import { Badge, ButtonGroup } from "reactstrap";
import { Store } from "../../Store";

export interface ITag {
  tag: string;
}

export function NoteTag(props: ITag) {
  const { state, dispatch } = React.useContext(Store);

  const getNotesByTag = async (e: any) => {
    e.preventDefault;
    const URL = "/api/1/notes/?tag=" + props.tag;
    const data = await fetch(URL);
    const dataJSON = await data.json();
    return dispatch({
      type: "GET_NOTES",
      payload: dataJSON
    });
  };

  return (
    <span className="mb-2">
      <Badge onClick={getNotesByTag}>{props.tag}</Badge>
    </span>
  );
}
