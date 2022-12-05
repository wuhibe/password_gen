import { render } from "solid-js/web";
import "./index.css";
import App from "./App";
import * as PouchDB from "pouchdb";

render(() => <App />, document.getElementById("app"));
