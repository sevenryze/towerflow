import * as React from "react";
import { hot } from "react-hot-loader";
import { MyComponent } from "../src";

class App extends React.Component {
  public render() {
    return (
      <div>
        加载和测试组件: <MyComponent />
      </div>
    );
  }
}

export default hot(module)(App);
