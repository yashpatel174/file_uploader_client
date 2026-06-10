import { useEffect } from "react";

const DropboxCallback = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code && window.opener) {
      window.opener.postMessage({ code }, window.location.origin);
      window.close();
    }
  }, []);

  return <div>Connecting Dropbox...</div>;
};

export default DropboxCallback;
