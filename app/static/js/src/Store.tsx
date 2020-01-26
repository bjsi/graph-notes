import * as React from "react";
import {
  INote,
  IPaginationInfo,
  IPageLinks
} from "./interfaces/Note.interfaces";

interface IEditing {
  currentlyEditing: boolean;
  note: INote | null;
}

interface IAlert {
  visible: boolean;
  text: string;
  color: string;
}

interface IState {
  notes: INote[];
  paginationInfo: IPaginationInfo;
  paginationLinks: IPageLinks;
  text: string;
  editing: IEditing;
  alert: IAlert;
}

const initialState: IState = {
  notes: [],
  paginationInfo: {
    currentPage: 1,
    itemsPerPage: 5
  },
  paginationLinks: {
    currentPageEndpoint: "",
    nextPageEndpoint: "",
    prevPageEndpoint: ""
  },
  text: "",
  editing: {
    currentlyEditing: false,
    note: null
  },
  alert: {
    visible: false,
    text: "",
    color: ""
  }
};

interface IAction {
  type: string;
  payload: any;
}

export const Store = React.createContext<IState | any>(initialState);

function reducer(state: IState, action: IAction) {
  switch (action.type) {
    case "GET_NOTES":
      return {
        ...state,
        notes: action.payload.data,
        paginationInfo: action.payload._meta,
        paginationLinks: action.payload._links
      };
    case "REMOVE_NOTE":
      var newState = { ...state };
      newState.notes.forEach((note: INote, index: number) => {
        if (note.id === action.payload.id) {
          // TODO change to filter
          newState.notes.splice(index, 1);
        }
      });
      return {
        ...newState
      };
    case "REPLACE_NOTE":
      var newState = { ...state };
      newState.notes.forEach((note: INote, index: number) => {
        if ((note.id = action.payload.targetId)) {
          // TODO change to filter
          newState.notes.splice(index, 1, note);
        }
      });
      return {
        ...newState
      };
    case "ADD_NOTE":
      return {
        ...state,
        notes: [action.payload, ...state.notes]
      };
    case "UPDATE_TEXT":
      return {
        ...state,
        text: action.payload
      };
    case "EDITING":
      return {
        ...state,
        editing: action.payload
      };
    case "UPDATE_ALERT":
      return {
        ...state,
        alert: action.payload
      };
    default:
      return state;
  }
}

export function StoreProvider(props: any): JSX.Element {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  return (
    <Store.Provider value={{ state, dispatch }}>
      {props.children}
    </Store.Provider>
  );
}
