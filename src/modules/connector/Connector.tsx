import { UploadOutlined } from "@ant-design/icons";
import { useGoogleLogin } from "@react-oauth/google";
import type { AppDispatch, RootState } from "@src/config/store";
import type {
  IAuthProviders,
  IDropdown,
  IPlatform,
} from "@src/interfaces/interface";
import { openDropboxPopup } from "@src/utils/dropboxPopup";
import { paginationPayload } from "@src/utils/functions";
import { fileUploadPlatform } from "@src/utils/menuItems";
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
  type UploadFile,
  type UploadProps,
} from "antd";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  authConnection,
  getAllUsers,
  googleConnected,
  multipleFilesUpload,
} from "../users/slice";
import InstructionModel from "../files/components/InstructionModel";
import { ALLOWED_EXTENSIONS, ALLOWED_TYPES } from "@src/utils/fileType";
import type { RcFile } from "antd/es/upload";

interface FileUploadFormValues {
  _id: string;
  connector: string;
  unit: string;
  googleId?: string;
  googleSecretKey?: string;
  dropboxAppKey?: string;
  dropboxSecretKey?: string;
}

const FileUpload = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch<AppDispatch>();
  const [openModel, setOpenModel] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [instructionOf, setInstructionOf] = useState<IPlatform>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const { dropdown, fileUploadLoading } = useSelector(
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
    dispatch(authConnection({ platform: connector, _id }))
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
  const antdFile = Form.useWatch("file", form);
  const googleId = Form.useWatch("googleId", form);
  const connector = Form.useWatch("connector", form);
  const dropboxAppKey = Form.useWatch("dropboxAppKey", form);
  const googleSecretKey = Form.useWatch("googleSecretKey", form);
  const dropboxSecretKey = Form.useWatch("dropboxSecretKey", form);

  useEffect(() => {
    form.resetFields(["connector"]);
    setAuthToken({ googleAuth: false, dropboxAuth: false });
    if (_id) {
      const { googleAuth, dropboxAuth } = dropdown?.find(
        (u) => u.value === _id,
      ) as IDropdown;
      setAuth({ googleAuth, dropboxAuth });
    }
  }, [_id]);

  useEffect(() => {
    if (!_id) return;
    const selectedUser = dropdown.find((item) => item.value === _id);
    if (!selectedUser) return;
    form.setFieldsValue({
      connector: selectedUser.connector,
    });
  }, [_id, dropdown, form]);

  useEffect(() => {
    if (dropdown.length > 0) return;
    const stored = localStorage.getItem("page");
    const pagination = stored ? JSON.parse(stored) : { page: 1, limit: 10 };
    dispatch(getAllUsers(pagination));
  }, [dispatch, dropdown.length]);

  const props: UploadProps = {
    name: "file",
    accept: ".mp3,.wav,.ogg,.m4a",
    multiple: true,
    maxCount: 10,
    beforeUpload: (file: RcFile) => {
      const extension = file.name
        .toLowerCase()
        .substring(file.name.lastIndexOf("."));

      const isValid =
        ALLOWED_TYPES.includes(file.type) ||
        ALLOWED_EXTENSIONS.includes(extension);

      if (!isValid) {
        message.error({
          content: "Only MP3, WAV, OGG and M4A files are allowed.",
          key: "invalid-audio-file",
        });
        return Upload.LIST_IGNORE;
      }

      setUploadedFiles((prev) => [...prev, file]);
      return false;
    },
    onRemove: (file: UploadFile) => {
      setUploadedFiles((prev) => {
        const updated = prev.filter(
          (f) =>
            !(
              f.name === file.name &&
              f.size === file.size &&
              f.lastModified === (file.originFileObj as File)?.lastModified
            ),
        );

        return updated;
      });

      return true;
    },
  };

  const handleReset = async () => {
    form.resetFields();
    setUploadedFiles([]);
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
        await dispatch(googleConnected(payload as any)).then((res) => {
          if (res.payload.success) {
            const { unit } = dropdown.find((d) => d.value === _id) as IDropdown;
            const formData = new FormData();
            formData.append("_id", values._id);
            formData.append("connector", values.connector);
            formData.append("unit", unit);
            uploadedFiles.forEach((file) => formData.append("files", file));
            dispatch(
              multipleFilesUpload({ payload: formData, _id: values._id }),
            )
              .then(async (res) => {
                if (
                  res.payload &&
                  typeof res.payload !== "string" &&
                  "success" in res.payload === true
                ) {
                  await handleReset();
                  await dispatch(getAllUsers(paginationPayload));
                }
              })
              .catch((err) => console.log("Error =>", err));
          }
        });
      } catch (e: any) {
        message.error(e || "Google connect failed");
      }
    },
    onError: () => message.error("Google login failed"),
  });

  const dropboxAPI = async (values: FileUploadFormValues) => {
    const { _id, dropboxAppKey, dropboxSecretKey, connector } = values;
    const tokenData = await openDropboxPopup(
      dropboxAppKey as string,
      dropboxSecretKey as string,
      _id,
    );
    const { unit } = dropdown.find((d) => d.value === _id) as IDropdown;

    if (tokenData) {
      const formData = new FormData();
      formData.append("_id", _id);
      formData.append("connector", connector);
      formData.append("unit", unit);
      uploadedFiles.forEach((file) => formData.append("files", file));
      dispatch(multipleFilesUpload({ payload: formData, _id: values._id }))
        .then(async (res) => {
          if (
            res.payload &&
            typeof res.payload !== "string" &&
            "success" in res.payload === true
          ) {
            await handleReset();
            await dispatch(getAllUsers(paginationPayload));
          }
        })
        .catch((err) => console.log("Error =>", err));
    }
  };

  const handleSubmit = useCallback(
    (values: FileUploadFormValues) => {
      if (values.connector === "drive" && !auth.googleAuth) {
        googleConnect();
        return;
      }

      if (values.connector === "dropbox" && !auth.dropboxAuth) {
        dropboxAPI(values);
        return;
      }

      const { _id, connector, googleId, googleSecretKey } = values;

      if (!uploadedFiles) {
        message.error("Please select a file");
        return;
      }

      const { unit } = dropdown.find((d) => d.value === _id) as IDropdown;

      const formData = new FormData();
      formData.append("_id", _id);
      formData.append("unit", unit);
      formData.append("connector", connector);
      uploadedFiles.forEach((file) => formData.append("files", file));

      if (googleId) formData.append("googleId", googleId);
      if (googleSecretKey) formData.append("googleSecretKey", googleSecretKey);

      dispatch(multipleFilesUpload({ payload: formData, _id: values._id }))
        .then(async (res) => {
          if (
            res.payload &&
            typeof res.payload !== "string" &&
            "success" in res.payload === true
          ) {
            await handleReset();
            await dispatch(getAllUsers(paginationPayload));
          }
        })
        .catch((err) => console.log("Error =>", err))
        .finally(() => setAuthToken({ googleAuth: false, dropboxAuth: false }));
    },
    [
      auth.googleAuth,
      auth.dropboxAuth,
      uploadedFiles,
      dropdown,
      dispatch,
      paginationPayload,
      googleConnect,
      dropboxAPI,
      handleReset,
      setAuthToken,
    ],
  );

  const isAuthenticated =
    (connector === "drive" && auth.googleAuth) ||
    (connector === "dropbox" && auth.dropboxAuth);

  const googleDisabled =
    connector === "drive" &&
    (auth.googleAuth ? !authToken.googleAuth : !googleId || !googleSecretKey);

  const dropboxDisabled =
    connector === "dropbox" &&
    (auth.dropboxAuth
      ? !authToken.dropboxAuth
      : !dropboxAppKey || !dropboxSecretKey);

  const isDisable = googleDisabled || dropboxDisabled;
  const disableAuthButton =
    (connector === "dropbox" && authToken.dropboxAuth) ||
    (connector === "drive" && authToken.googleAuth);

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
                  label={"Connector"}
                  name="connector"
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
                      disabled={!_id || !connector}
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
                    disabled={!_id && !connector && !uploadedFiles.length}
                  >
                    Reset
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => form.submit()}
                    loading={fileUploadLoading}
                    disabled={
                      !_id ||
                      !connector ||
                      !uploadedFiles ||
                      isDisable ||
                      !antdFile?.fileList.length
                    }
                  >
                    {fileUploadLoading ? "Submitting..." : "Submit"}
                  </Button>
                </Space>
              </Col>
            </Row>
          </Col>
          <Col flex="none" span={2}>
            <div className="vertical-line" />
          </Col>
          {connector === "dropbox" || connector === "drive" ? (
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
              {connector === "drive" && auth.googleAuth === false ? (
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
              {connector === "dropbox" && auth.dropboxAuth === false ? (
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
                    disabled={disableAuthButton}
                  >
                    {(connector === "dropbox" && !authToken.dropboxAuth) ||
                    (connector === "drive" && !authToken.googleAuth)
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
