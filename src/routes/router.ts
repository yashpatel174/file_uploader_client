import { createElement } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import FailReport from "@src/modules/failReport/FailReport";
import FileList from "@src/modules/fileList/FileList";
import AppLayout from "../layouts/AppLayout";
import Login from "../modules/auth/Login";
import PageNotFound from "../modules/auth/components/PageNotFound";
import ProtectedRoute from "../modules/auth/components/ProtectedRoute";
import PublicRoute from "../modules/auth/components/PublicRoute";
import FileUpload from "../modules/files/FileUpload";
import DropboxCallback from "../modules/files/components/DropboxCallback";
import UserPage from "../modules/users/UserPage";
import Connector from "@src/modules/connector/Connector";

export const router = createBrowserRouter([
  {
    element: createElement(ProtectedRoute),
    children: [
      {
        path: "/",
        element: createElement(AppLayout),
        children: [
          {
            index: true,
            element: createElement(Navigate, { to: "/users", replace: true }),
          },
          {
            path: "users",
            element: createElement(UserPage),
          },
          {
            path: "file-upload",
            element: createElement(FileUpload),
          },
          {
            path: "/dropbox/callback",
            element: createElement(DropboxCallback),
          },
          {
            path: "/file-list",
            element: createElement(FileList),
          },
          {
            path: "/fail-reports",
            element: createElement(FailReport),
          },
          {
            path: "/connector",
            element: createElement(Connector),
          },
        ],
      },
    ],
  },
  {
    element: createElement(PublicRoute),
    children: [{ path: "/login", element: createElement(Login) }],
  },
  { path: "*", element: createElement(PageNotFound) },
]);
