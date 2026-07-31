import { UploadOutlined } from "@ant-design/icons";
import type { AppDispatch, RootState } from "@src/config/store";
import { ALLOWED_EXTENSIONS, ALLOWED_TYPES } from "@src/utils/fileType";
import { fileUploadPlatform } from "@src/utils/menuItems";
import {
  Button,
  Col,
  Form,
  message,
  Row,
  Select,
  Space,
  Upload,
  type UploadProps,
} from "antd";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers, multipleFilesUpload } from "../users/slice";
import { paginationPayload } from "@src/utils/functions";
import type { RcFile, UploadFile } from "antd/es/upload";
import type { IBulkPlayload } from "@src/interfaces/interface";

const Connector = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch<AppDispatch>();

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const { dropdown, fileUploadLoading } = useSelector(
    (state: RootState) => state.data,
  );

  const _id = Form.useWatch("_id", form);
  const antdFile = Form.useWatch("file", form);

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
        message.error(
          `${file.name}: Only MP3, WAV, OGG and M4A files are allowed.`,
        );
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

  const handleSubmit = (value: IBulkPlayload) => {
    const formData = new FormData();
    formData.append("connector", value.connector);
    uploadedFiles.forEach((file) => {
      formData.append("files", file);
    });
    dispatch(multipleFilesUpload({ payload: formData, _id: value._id }))
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
      .catch((err) => {
        console.log("Error =>", err);
      });
  };

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
          {" "}
          <Col xs={24} md={12} lg={6}>
            <Form.Item label={"Username"} name="_id" required>
              <Select
                suffixIcon={null}
                showSearch={false}
                placeholder="Please select a user"
                options={dropdown}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12} lg={6}>
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
                }}
                options={fileUploadPlatform}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12} lg={6}>
            <Form.Item
              label="Files"
              name="file"
              rules={[
                {
                  required: true,
                  message: "Please upload an mp3 file",
                },
              ]}
            >
              <Upload {...props}>
                <Button icon={<UploadOutlined />} disabled={!_id}>
                  Upload
                </Button>
              </Upload>
            </Form.Item>
          </Col>
          <Col xs={24} md={12} lg={6}>
            <Space
              style={{
                height: "100%",
                display: "flex",
                justifyContent: "space-around",
                alignItems: "center",
              }}
            >
              <Button
                onClick={handleReset}
                disabled={!_id && !uploadedFiles.length}
              >
                Reset
              </Button>
              <Button
                type="primary"
                onClick={() => form.submit()}
                loading={fileUploadLoading}
                disabled={!_id || !antdFile?.fileList.length}
              >
                {fileUploadLoading ? "Submitting..." : "Submit"}
              </Button>
            </Space>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default Connector;
