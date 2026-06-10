import { createRoot } from "react-dom/client";
import { store } from "./config/store.ts";
import "./index.css";
import App from "./App.tsx";
import { Provider } from "react-redux";
import { GoogleOAuthProvider } from "@react-oauth/google";

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <GoogleOAuthProvider
      clientId={
        "995469866059-k3l8831eqsds5joiocq0lh7e0mmj8s6s.apps.googleusercontent.com"
      }
    >
      <App />
    </GoogleOAuthProvider>
  </Provider>,
);
