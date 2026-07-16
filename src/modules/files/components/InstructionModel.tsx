import { Modal } from "antd";
import type { Dispatch, SetStateAction } from "react";
import { instruction } from "@src/utils/instruction";
import type { IPlatform } from "../FileUpload";

interface IProp {
  platform: IPlatform;
  openModel: boolean;
  setOpenModel: Dispatch<SetStateAction<boolean>>;
}

type InstructionItem = Record<string, string[]>;

const InstructionModel = ({ platform, openModel, setOpenModel }: IProp) => {
  const handleClose = () => setOpenModel(false);
  const platformKey = (loc: IPlatform) => {
    switch (loc) {
      case "Google Drive":
        return "google_drive";

      case "Dropbox":
        return "dropbox_platform";

      default:
        return "";
    }
  };

  if (!platform) return null;
  const key = platform ? platformKey(platform as IPlatform) : null;
  const data = key ? instruction[key] : [];

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
          {data?.map((instruction: InstructionItem, index: number) => (
            <div key={index}>
              {Object.entries(instruction as Record<string, string[]>).map(
                ([heading, steps]) => (
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
