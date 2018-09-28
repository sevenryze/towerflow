import * as React from "react";
import { hot } from "react-hot-loader";
import styled from "styled-components";
import "./App.css";
import logo from "./logo.svg";

class App extends React.Component {
  public render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.tsx</code> and save to reload.
        </p>
        <Button>I'm test styled components</Button>
      </div>
    );
  }
}

export default hot(module)(App);

const Button = styled.button`
  height: 2rem;
  width: 3rem;
  background: red;
`;
