import { createRouter } from "@ciderjs/city-gas";
import { RouterProvider } from "@ciderjs/city-gas/react";
import React from "react";
import ReactDOM from "react-dom/client";
import { dynamicRoutes, pages, specialPages } from "./generated/routes";
import "./index.css";

const router = createRouter(pages, { specialPages, dynamicRoutes });

// biome-ignore lint/style/noNonNullAssertion: root element is always present
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
