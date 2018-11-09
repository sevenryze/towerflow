import React from "react";
import styled from "styled-components";

export default class App extends React.Component {
  public render() {
    return <MainWrapper>I'm the man!</MainWrapper>;
  }
}

const MainWrapper = styled.button`
  height: 2rem;
  width: 3rem;
  background: red;
`;
