import React from "react";
// tslint:disable-next-line:no-implicit-dependencies
import { hot } from "react-hot-loader";
import styled from "styled-components";

class App extends React.Component {
  public render() {
    return <MainWrapper>I'm the man!</MainWrapper>;
  }
}

export default hot(module)(App);

const MainWrapper = styled.button`
  height: 2rem;
  width: 3rem;
  background: red;
`;
