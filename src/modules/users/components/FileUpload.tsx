import { UploadOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";
import { Button, Col, Form, message, Modal, Row, Space, Upload } from "antd";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../config/store";
import type { IUserFilePayload } from "../../../interfaces/interface";
import { getAllUsers, setCloseUpload, uploadFile } from "../slice";

const UploadModal: React.FC<{
  userFileInfo: IUserFilePayload;
}> = ({ userFileInfo }) => {
  const [form] = Form.useForm();
  const [file, setFile] = useState<boolean>(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const { userId, unit } = userFileInfo;
  const { fileUploadModel, fileLoading } = useSelector(
    (state: RootState) => state.data,
  );

  const props: UploadProps = {
    name: "file",
    accept: ".mp3,audio/mpeg",
    multiple: false,
    maxCount: 1,
    beforeUpload: (f: File) => {
      const isMP3 = f.type === "audio/mpeg" || f.name.endsWith(".mp3");
      const isWav =
        f.type === "audio/wav" ||
        f.type === "audio/x-wav" ||
        f.name.endsWith(".wav");
      const isOgg = f.type === "audio/ogg" || f.name.endsWith(".ogg");
      const isM4a =
        f.type === "audio/mp4" ||
        f.type === "audio/x-m4a" ||
        f.name.endsWith(".m4a");

      if (!isMP3 && !isWav && !isOgg && !isM4a) {
        setFile(false);
        message.error("Only MP3, wav, ogg & m4a files allowed");
        return;
      }

      setUploadedFile(f);
      setFile(true);
      return false;
    },
    onRemove: () => {
      setFile(false);
      setUploadedFile(null);
    },
  };

  const handleClose = async () => dispatch(setCloseUpload());

  const handleSubmit = async () => {
    if (!uploadedFile) {
      message.error("Please select a file");
      return;
    }
    const formData = new FormData();
    formData.append("file", uploadedFile);
    formData.append("userId", userId);
    formData.append("unit", unit);
    dispatch(uploadFile(formData))
      .then(() => {
        setFile(false);
        setUploadedFile(null);
        dispatch(getAllUsers());
        dispatch(setCloseUpload());
      })
      .catch((err) => console.log("Error =>", err));
  };

  return (
    <Modal
      title={"File Upload"}
      footer={null}
      open={fileUploadModel}
      onCancel={handleClose}
    >
      <Form
        form={form}
        title="File Upload"
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ file: null }}
      >
        <Form.Item
          name="file"
          rules={[
            {
              required: true,
              message: "Please upload an mp3 file",
            },
          ]}
          style={{ margin: "20px 0px" }}
        >
          <Upload {...props}>
            <Button icon={<UploadOutlined />}>Upload</Button>
          </Upload>
        </Form.Item>
        <Row>
          <Col span={24}>
            <Space
              style={{
                display: "flex",
                justifyContent: "end",
                alignItems: "center",
              }}
            >
              <Button onClick={handleClose}>Cancel</Button>
              <Button
                type="primary"
                onClick={() => form.submit()}
                loading={fileLoading}
                disabled={!file || fileLoading}
              >
                {fileLoading ? "Submitting..." : "Submit"}
              </Button>
            </Space>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default UploadModal;
