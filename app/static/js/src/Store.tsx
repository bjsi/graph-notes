import * as React from "react";

export const Store = React.createContext();

const initialState = {};

function reducer() {
  // pass
}

export class StoreProvider extends React.Component {
  render() {
    return <Store.Provider value="test">{this.props.children}</Store.Provider>;
  }
}
