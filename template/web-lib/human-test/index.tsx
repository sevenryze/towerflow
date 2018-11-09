import React from "react";
import ReactDOM from "react-dom";
import { createGlobalStyle } from "styled-components";
import App from "./app";

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: sans-serif;
  }
`;

const render = (RootComponent: any) => {
  ReactDOM.render(
    <>
      <GlobalStyle />

      <RootComponent />
    </>,
    document.getElementById("root")
  );
};

render(App);

if (process.env.NODE_ENV !== "production") {
  if ((module as any).hot) {
    (module as any).hot.accept("./app", () => {
      render(App);
    });
  }
}
