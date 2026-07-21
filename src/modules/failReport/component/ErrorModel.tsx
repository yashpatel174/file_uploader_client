import { Modal } from "antd";
import type { Dispatch, SetStateAction } from "react";

interface IModelProp {
  errModel: boolean;
  setErrModel: Dispatch<SetStateAction<boolean>>;
  apiError: string | null;
  setApiError: Dispatch<SetStateAction<string | null>>;
}

const ErrorModel = ({
  errModel,
  setErrModel,
  apiError,
  setApiError,
}: IModelProp) => {
  const handleClear = async () => {
    await setErrModel(false);
    await setApiError(null);
  };

  return (
    <>
      <Modal
        open={errModel}
        onCancel={handleClear}
        onOk={handleClear}
        title="Error"
      >
        <p style={{ marginTop: "5px" }}>{apiError || "Something went wrong"}</p>
      </Modal>
    </>
  );
};

export default ErrorModel;
