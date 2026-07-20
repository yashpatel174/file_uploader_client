import { Modal } from "antd";

const ErrorModel = ({ errModel, setErrModel, apiError, setApiError }) => {
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
        <p style={{ marginTop: "5px" }}>{apiError}</p>
      </Modal>
    </>
  );
};

export default ErrorModel;
