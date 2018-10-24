import React from "react";
// tslint:disable-next-line:no-implicit-dependencies
import { hot } from "react-hot-loader";
import styled from "styled-components";
import { MyComponent } from "../lib";

class App extends React.Component {
  public render() {
    return (
      <MainWrapper>
        加载和测试组件: <MyComponent />
      </MainWrapper>
    );
  }
}

export default hot(module)(App);

const MainWrapper = styled.div`
  color: black;
  height: 10rem;
`;
