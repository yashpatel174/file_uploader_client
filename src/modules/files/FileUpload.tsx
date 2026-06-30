import { UploadOutlined } from "@ant-design/icons";
import { useGoogleLogin } from "@react-oauth/google";
import {
  Button,
  Col,
  Form,
  Input,
  message,
  Row,
  Select,
  Space,
  Upload,
  type UploadProps,
} from "antd";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../config/store";
import type { IAuthProviders, IDropdown } from "../../interfaces/interface";
import { openDropboxPopup } from "../../utils/dropboxPopup";
import { paginationPayload } from "../../utils/functions";
import { fileUploadPlatform } from "../../utils/menuItems";
import {
  authConnection,
  getAllUsers,
  googleConnected,
  uploadFile,
} from "../users/slice";
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

export type IPlatform = "Dropbox" | "Google Drive" | null;

const FileUpload = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch<AppDispatch>();
  const [file, setFile] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [instructionOf, setInstructionOf] = useState<IPlatform>(null);
  const [openModel, setOpenModel] = useState<boolean>(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const { dropdown, fileLoading } = useSelector(
    (state: RootState) => state.data,
  );
  const [auth, setAuth] = useState<IAuthProviders>({
    googleAuth: false,
    dropboxAuth: false,
  });
  const [authToken, setAuthToken] = useState<IAuthProviders>({
    googleAuth: false,
    dropboxAuth: false,
  });

  const handleAuthConnection = async () => {
    setAuthLoading(true);
    dispatch(authConnection({ platform, _id }))
      .then((res) => {
        if (res.payload === "drive") {
          setAuthToken({ ...authToken, googleAuth: true });
        } else if (res.payload === "dropbox") {
          setAuthToken({ ...authToken, dropboxAuth: true });
        }
      })
      .finally(() => setAuthLoading(false));
  };

  const _id = Form.useWatch("_id", form);
  const platform = Form.useWatch("platform", form);
  const googleId = Form.useWatch("googleId", form);
  const googleSecretKey = Form.useWatch("googleSecretKey", form);
  const dropboxAppKey = Form.useWatch("dropboxAppKey", form);
  const dropboxSecretKey = Form.useWatch("dropboxSecretKey", form);

  useEffect(() => {
    form.resetFields(["platform"]);
    setAuthToken({ googleAuth: false, dropboxAuth: false });
    if (_id) {
      const { googleAuth, dropboxAuth } = dropdown?.find(
        (u) => u.value === _id,
      ) as IDropdown;
      setAuth({ googleAuth, dropboxAuth });
    }
  }, [_id]);

  useEffect(() => {
    dropdown.length ? dropdown : [];
  }, []);

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
        const { unit } = dropdown.find((d) => d.value === _id) as IDropdown;
        const formData = new FormData();
        formData.append("file", uploadedFile as any);
        formData.append("_id", values._id);
        formData.append("unit", unit);
        formData.append("platform", values.platform);
        dispatch(uploadFile(formData))
          .then(async () => {
            handleReset();
            await dispatch(getAllUsers(paginationPayload));
          })
          .catch((err) => console.log("Error =>", err));
      } catch (e: any) {
        message.error(e || "Google connect failed");
      }
    },
    onError: () => message.error("Google login failed"),
  });

  const dropboxAPI = async (values: FileUploadFormValues) => {
    const { _id, dropboxAppKey, dropboxSecretKey, platform } = values;
    const tokenData = await openDropboxPopup(
      dropboxAppKey as string,
      dropboxSecretKey as string,
      _id,
    );
    const { unit } = dropdown.find((d) => d.value === _id) as IDropdown;

    if (tokenData) {
      const formData = new FormData();
      formData.append("file", uploadedFile as any);
      formData.append("_id", _id);
      formData.append("unit", unit);
      formData.append("platform", platform);
      dispatch(uploadFile(formData))
        .then(async () => {
          setAuthToken({ ...authToken, dropboxAuth: false });
          handleReset();
          await dispatch(getAllUsers(paginationPayload));
        })
        .catch((err) => console.log("Error =>", err));
    }
  };

  const handleSubmit = (values: FileUploadFormValues) => {
    if (values.platform === "drive" && !auth.googleAuth) {
      googleConnect();
    } else if (values.platform === "dropbox" && !auth.dropboxAuth) {
      dropboxAPI(values);
    } else {
      const { _id, platform, googleId, googleSecretKey } = values;
      if (!uploadedFile) {
        message.error("Please select a file");
        return;
      }
      const { unit } = dropdown.find((d) => d.value === _id) as IDropdown;
      const formData = new FormData();
      formData.append("file", uploadedFile as any);
      formData.append("_id", _id);
      formData.append("unit", unit);
      formData.append("platform", platform);
      formData.append("googleId", googleId as string);
      formData.append("googleSecretKey", googleSecretKey as string);
      dispatch(uploadFile(formData))
        .then(async () => {
          handleReset();
          await dispatch(getAllUsers(paginationPayload));
        })
        .catch((err) => console.log("Error =>", err))
        .finally(() => setAuthToken({ googleAuth: false, dropboxAuth: false }));
    }
  };

  const isAuthenticated =
    (platform === "drive" && auth.googleAuth) ||
    (platform === "dropbox" && auth.dropboxAuth);

  const googleDisabled =
    platform === "drive" &&
    (auth.googleAuth ? !authToken.googleAuth : !googleId || !googleSecretKey);

  const dropboxDisabled =
    platform === "dropbox" &&
    (auth.dropboxAuth
      ? !authToken.dropboxAuth
      : !dropboxAppKey || !dropboxSecretKey);

  const isDisable = googleDisabled || dropboxDisabled;

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
            if (selectedUser) form.setFieldValue("unit", selectedUser.unit);
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
                    disabled={!_id}
                    showSearch={false}
                    placeholder="Please select a platform"
                    onChange={(e) => {
                      const selectedPlatform = fileUploadPlatform?.find(
                        (f) => f.value === (e as string),
                      );
                      if (!selectedPlatform) return;
                      const platform = selectedPlatform.label as IPlatform;
                      setInstructionOf(platform as IPlatform);
                    }}
                    options={fileUploadPlatform}
                  />
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
              {platform === "drive" && auth.googleAuth === false ? (
                <>
                  <Row>
                    <Col span={18} style={{ paddingBottom: "0px" }}>
                      <Form.Item name="googleId" required label="Client ID">
                        <Input />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={4}>
                    <Col span={18}>
                      <Form.Item
                        name="googleSecretKey"
                        required
                        label="Client Secret Key"
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                  </Row>
                </>
              ) : null}
              {platform === "dropbox" && auth.dropboxAuth === false ? (
                <>
                  <Row>
                    <Col span={18} style={{ paddingBottom: "0px" }}>
                      <Form.Item
                        name="dropboxAppKey"
                        required
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
                        required
                        label="Dropbox Secret Key"
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                  </Row>
                </>
              ) : null}
              {isAuthenticated && (
                <>
                  <Button
                    type="primary"
                    onClick={handleAuthConnection}
                    loading={authLoading}
                  >
                    {(platform === "dropbox" && !authToken.dropboxAuth) ||
                    (platform === "drive" && !authToken.googleAuth)
                      ? "Check Connection"
                      : "Authenticated Successfully!"}
                  </Button>
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
