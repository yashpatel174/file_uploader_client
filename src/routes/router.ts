import { createElement } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import AppLayout from "../layouts/AppLayout";
import UserPage from "../modules/users/UserPage";
import FileUpload from "../modules/files/FileUpload";
import DropboxCallback from "../modules/files/components/DropboxCallback";

export const router = createBrowserRouter([
  {
    path: "/",
    element: createElement(AppLayout),
    children: [
      {
        index: true,
        element: createElement(Navigate, { to: "/users", replace: true }),
      },
      {
        path: "",
        element: createElement(UserPage),
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
    ],
  },
]);
