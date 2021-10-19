import React from "react";
import ReactDom from "react-dom";
import { ContextProvider } from "./SocketContext";
import App from "./App";
import "./styles.css";

ReactDom.render(
	<ContextProvider>
		<App />
	</ContextProvider>,
	document.getElementById("root")
);
