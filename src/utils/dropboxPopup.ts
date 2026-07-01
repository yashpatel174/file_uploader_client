import { message } from "antd";
import axios from "axios";
import api from "./intercepter";

export const openDropboxPopup = async (
  appKey: string,
  appSecret: string,
  _id: string,
) => {
  const { data } = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL}/api/dropbox/auth-url`,
    {
      appKey,
    },
  );
  const popup = window.open(data.url, "DropboxAuth", "width=500,height=600");

  if (!popup) throw new Error("Popup blocked");

  return new Promise((resolve, reject) => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      const { code } = await event.data;
      if (!code) return;

      try {
        const tokenResponse = await api.post("/api/dropbox/exchange-token", {
          code,
          appKey,
          appSecret,
          _id,
        });
        if (tokenResponse.data.success === true) {
          window.removeEventListener("message", handleMessage);
          message.success(tokenResponse.data.message);
          popup.close();
          resolve(tokenResponse.data);
        }
      } catch (error) {
        console.log("error in the catch block: ", (error as Error).message);
        reject(error);
      }
    };

    window.addEventListener("message", handleMessage);
  });
};
