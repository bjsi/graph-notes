import * as React from "react";

interface IState {
  notes: [];
}

const initialState: IState = {
  notes: []
};

interface IAction {
  type: string;
  payload: any;
}

export const Store = React.createContext<IState | any>(initialState);

function reducer(state: IState, action: IAction) {
  switch (action.type) {
    case "FETCH_DATA":
      return {
        ...state,
        notes: action.payload.data,
        paginationInfo: action.payload._meta,
        paginationLinks: action.payload._links
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
