import { Modal } from "antd";
import { instruction } from "../../../utils/instruction";

const InstructionModel = ({ platform, openModel, setOpenModel }) => {
  const handleClose = () => setOpenModel(false);
  const platformKey = (platform: string) => {
    switch (platform) {
      case "Google Drive":
        return "google_drive";

      case "Dropbox":
        return "dropbox_platform";

      default:
        return "";
    }
  };

  const data = instruction[platformKey(platform)] || [];

  return (
    <>
      <Modal
        title={`${platform} Instructions`}
        open={openModel}
        onCancel={handleClose}
        styles={{
          header: { textAlign: "center" },
          body: { height: "60vh", overflowY: "scroll" },
        }}
        footer={null}
      >
        <>
          {data?.map((instruction, index) => (
            <div key={index}>
              {Object.entries(instruction).map(
                ([heading, steps]: [string, string[]]) => (
                  <div key={heading} style={{ marginBottom: 20 }}>
                    <h3>{heading}</h3>

                    <ol>
                      {steps.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  </div>
                ),
              )}
            </div>
          ))}
        </>
      </Modal>
    </>
  );
};

export default InstructionModel;
