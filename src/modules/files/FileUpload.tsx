import { UploadOutlined } from "@ant-design/icons";
import { useGoogleLogin } from "@react-oauth/google";
import {
  Button,
  Col,
  Form,
  Input,
  message,
  Radio,
  Row,
  Select,
  Space,
  Upload,
  type UploadProps,
} from "antd";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../config/store";
import { unitOptions } from "../../utils/column";
import { openDropboxPopup } from "../../utils/dropboxPopup";
import { fileUploadPlatform } from "../../utils/menuItems";
import { unitValidation } from "../../utils/validation";
import { getAllUsers, googleConnected, uploadFile } from "../users/slice";
import InstructionModel from "./components/InstructionModel";

interface FileUploadFormValues {
  _id: string;
  platform: string;
  unit: string;
  googleId?: string;
  googleSecretKey?: string;
  dropboxAppKey?: string;
  dropboxSecretKey?: string;
}

type IPlatform = "Dropbox" | "Google Drive" | null;

const FileUpload = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch<AppDispatch>();
  const [file, setFile] = useState<boolean>(false);
  const [instructionOf, setInstructionOf] = useState<IPlatform>(null);
  const [openModel, setOpenModel] = useState<boolean>(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const { dropdown, fileLoading } = useSelector(
    (state: RootState) => state.data,
  );

  const _id = Form.useWatch("_id", form);
  const platform = Form.useWatch("platform", form);
  const googleId = Form.useWatch("googleId", form);
  const googleSecretKey = Form.useWatch("googleSecretKey", form);
  const dropboxAppKey = Form.useWatch("dropboxAppKey", form);
  const dropboxSecretKey = Form.useWatch("dropboxSecretKey", form);

  useEffect(() => {
    if (!dropdown?.length) dispatch(getAllUsers());
  }, [dispatch, dropdown]);

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

  const handleReset = async () => {
    form.resetFields();
    setUploadedFile(null);
  };

  const googleConnect = useGoogleLogin({
    flow: "auth-code",
    scope: "https://www.googleapis.com/auth/drive.file",
    onSuccess: async (res: any) => {
      try {
        const values = form.getFieldsValue();
        const payload = {
          code: res.code,
          _id: values._id,
          clientId: values.googleId,
          clientSecretKey: values.googleSecretKey,
        };
        await dispatch(googleConnected(payload));
        const formData = new FormData();
        formData.append("file", uploadedFile);
        formData.append("_id", values._id);
        formData.append("unit", values.unit);
        formData.append("platform", values.platform);
        dispatch(uploadFile(formData))
          .then(() => {
            handleReset();
            dispatch(getAllUsers());
          })
          .catch((err) => console.log("Error =>", err));
      } catch (e: any) {
        message.error(e || "Google connect failed");
      }
    },
    onError: () => message.error("Google login failed"),
  });

  const dropboxAPI = async (values: FileUploadFormValues) => {
    const tokenData = await openDropboxPopup(
      values.dropboxAppKey,
      values.dropboxSecretKey,
      values._id,
    );

    if (tokenData) {
      const formData = new FormData();
      formData.append("file", uploadedFile);
      formData.append("_id", values._id);
      formData.append("unit", values.unit);
      formData.append("platform", values.platform);
      dispatch(uploadFile(formData))
        .then(() => {
          handleReset();
          dispatch(getAllUsers());
        })
        .catch((err) => console.log("Error =>", err));
    }
  };

  const handleSubmit = (values: FileUploadFormValues) => {
    if (values.platform === "drive") {
      googleConnect();
    } else if (values.platform === "dropbox") {
      dropboxAPI(values);
    } else {
      const { _id, platform, unit, googleId, googleSecretKey } = values;
      if (!uploadedFile) {
        message.error("Please select a file");
        return;
      }
      const formData = new FormData();
      formData.append("file", uploadedFile);
      formData.append("_id", _id);
      formData.append("unit", unit);
      formData.append("platform", platform);
      formData.append("googleId", googleId);
      formData.append("googleSecretKey", googleSecretKey);
      dispatch(uploadFile(formData))
        .then(() => {
          handleReset();
          dispatch(getAllUsers());
        })
        .catch((err) => console.log("Error =>", err));
    }
  };

  const isDisable =
    (platform === "drive" && (!googleId || !googleSecretKey)) ||
    (platform === "dropbox" && (!dropboxAppKey || !dropboxSecretKey));

  const handleOpenModal = () => setOpenModel(true);
  return (
    <>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        onValuesChange={(value) => {
          if (value._id) {
            const selectedUser = dropdown.find((u) => u.value === value._id);
            if (selectedUser) {
              form.setFieldValue("unit", selectedUser.unit);
            }
          }
        }}
      >
        <Row gutter={12}>
          <Col span={11}>
            <Row gutter={16} style={{ marginTop: "3vh" }}>
              <Col span={12}>
                <Form.Item label={"Username"} name="_id" required>
                  <Select
                    suffixIcon={null}
                    showSearch={false}
                    placeholder="Please select a user"
                    options={dropdown}
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label={"Platform"}
                  name="platform"
                  required
                  style={{ marginBottom: 0 }}
                >
                  <Select
                    suffixIcon={null}
                    showSearch={false}
                    placeholder="Please select a platform"
                    onChange={(e) => {
                      const platform = fileUploadPlatform?.find(
                        (f) => f.value === e,
                      ).label;
                      setInstructionOf(platform as IPlatform);
                    }}
                    options={fileUploadPlatform}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={10}>
                <Form.Item
                  label={"Unit"}
                  name="unit"
                  validateFirst
                  required
                  rules={unitValidation}
                >
                  <Radio.Group block options={unitOptions} disabled={!_id} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="file"
                  rules={[
                    {
                      required: true,
                      message: "Please upload an mp3 file",
                    },
                  ]}
                  style={{ margin: "10px 0px" }}
                >
                  <Upload {...props}>
                    <Button
                      icon={<UploadOutlined />}
                      disabled={!_id || !platform}
                    >
                      Upload
                    </Button>
                  </Upload>
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Space
                  style={{
                    display: "flex",
                    justifyContent: "end",
                    alignItems: "center",
                  }}
                >
                  <Button
                    onClick={handleReset}
                    disabled={!_id && !platform && !uploadedFile}
                  >
                    Reset
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => form.submit()}
                    loading={fileLoading}
                    disabled={
                      !_id || !platform || !file || !uploadedFile || isDisable
                    }
                  >
                    {fileLoading ? "Submitting..." : "Submit"}
                  </Button>
                </Space>
              </Col>
            </Row>
          </Col>
          <Col flex="none" span={2}>
            <div className="vertical-line" />
          </Col>
          {platform === "dropbox" || platform === "drive" ? (
            <Col span={11}>
              <Row>
                <h3>
                  {instructionOf !== null && (
                    <>
                      {instructionOf}{" "}
                      <a style={{ color: "#344cd3" }} onClick={handleOpenModal}>
                        (Help)
                      </a>
                    </>
                  )}
                </h3>
              </Row>
              {platform === "drive" && (
                <>
                  <Row>
                    <Col span={18} style={{ paddingBottom: "0px" }}>
                      <Form.Item
                        name="googleId"
                        required={platform === "drive"}
                        label="Client ID"
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={4}>
                    <Col span={18}>
                      <Form.Item
                        name="googleSecretKey"
                        required={platform === "drive"}
                        label="Client Secret Key"
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                  </Row>
                </>
              )}
              {platform === "dropbox" && (
                <>
                  <Row>
                    <Col span={18} style={{ paddingBottom: "0px" }}>
                      <Form.Item
                        name="dropboxAppKey"
                        required={platform === "dropbox"}
                        label="Dropbox App Key"
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={4}>
                    <Col span={18}>
                      <Form.Item
                        name="dropboxSecretKey"
                        required={platform === "dropbox"}
                        label="Dropbox Secret Key"
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                  </Row>
                </>
              )}
            </Col>
          ) : (
            <>{null}</>
          )}
        </Row>
      </Form>
      {openModel && (
        <InstructionModel
          platform={instructionOf}
          openModel={openModel}
          setOpenModel={setOpenModel}
        />
      )}
    </>
  );
};

export default FileUpload;
