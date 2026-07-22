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
    let completed = false;

    const cleanup = () => {
      window.removeEventListener("message", handleMessage);
      clearInterval(checkPopup);
      if (!popup.closed) {
        popup.close();
      }
    };

    const checkPopup = setInterval(() => {
      if (!popup.closed || completed) {
        return;
      }
      clearInterval(checkPopup);
      setTimeout(() => {
        if (!completed) {
          cleanup();
          reject(new Error("Authentication cancelled"));
        }
      }, 500);
    }, 300);

    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      const { code } = await event.data;
      if (!code) return;

      completed = true;
      cleanup();

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
        let errorMessage = "";
        if (axios.isAxiosError(error)) {
          errorMessage = error.response?.data?.message || error.message;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        reject(error);
        message.error(errorMessage);
      }
    };

    window.addEventListener("message", handleMessage);
  });
};
