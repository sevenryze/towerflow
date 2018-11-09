import React from "react";
import styled from "styled-components";
import { MyComponent } from "../lib";

export default class App extends React.Component {
  public render() {
    return (
      <MainWrapper>
        加载和测试组件: <MyComponent />
      </MainWrapper>
    );
  }
}

const MainWrapper = styled.div`
  color: black;
  height: 10rem;
`;
