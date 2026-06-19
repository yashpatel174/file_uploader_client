import {
  Button,
  Col,
  Form,
  Input,
  message,
  Modal,
  Radio,
  Row,
  Select,
  Space,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../config/store";
import type { IUserCreate, SizeUnit } from "../../../interfaces/interface";
import { fileSizeOptions, unitOptions } from "../../../utils/column";
import { paginationPayload } from "../../../utils/functions";
import { toBytes } from "../../../utils/sizeConverter";
import { parseDurationToSeconds } from "../../../utils/timeConverter";
import {
  fileSize,
  timeValidation,
  unitValidation,
  username,
} from "../../../utils/validation";
import { createUser, getAllUsers, setCloseUserModel } from "../slice";

const AddUser: React.FC = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch<AppDispatch>();
  const { userLoading, userModel } = useSelector(
    (state: RootState) => state.data,
  );
  const handleClose = async () => {
    form.resetFields();
    dispatch(setCloseUserModel());
  };

  const handleSubmit = async (values: IUserCreate) => {
    let { totalTime, totalSize, userName, unit, sizeUnit } = values;
    let payload: any = { userName, unit };
    if (unit === "time") {
      totalTime = totalTime = totalTime
        ? parseDurationToSeconds(totalTime).totalSeconds
        : 0;
      payload = { ...payload, totalTime: totalTime };
    } else if (unit === "size") {
      totalSize = toBytes(Number(totalSize), sizeUnit as SizeUnit);
      payload = { ...payload, totalSizeBytes: totalSize };
    }

    await dispatch(createUser(payload)).then(async (res) => {
      if (
        res.payload &&
        typeof res.payload !== "string" &&
        "success" in res.payload === true
      ) {
        message.success(res.payload.message);
        form.resetFields();
        await dispatch(getAllUsers(paginationPayload));
        dispatch(setCloseUserModel());
      }
    });
  };

  const userName = Form.useWatch("userName", form);
  const fileSizelimit = Form.useWatch("totalSize", form);
  const selectedUnit = Form.useWatch("sizeUnit", form);
  const unit = Form.useWatch("unit", form);
  const givenTime = Form.useWatch("totalTime", form);
  const hasErrors = form
    .getFieldsError()
    .some(({ errors }) => errors.length > 0);
  const required =
    unit === "size" ? !fileSizelimit || !selectedUnit : !givenTime;

  return (
    <Modal
      title={"Add User"}
      footer={null}
      open={userModel}
      onCancel={handleClose}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          userName: null,
          totalSize: null,
          unit: "size",
          sizeUnit: "KB",
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={"Username"}
              name="userName"
              validateFirst
              required
              rules={username}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={"Unit"}
              name="unit"
              validateFirst
              required
              rules={unitValidation}
            >
              <Radio.Group block options={unitOptions} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          {unit === "time" ? (
            <>
              <Col span={9}>
                <Form.Item
                  label={"Total Minutes"}
                  name="totalTime"
                  validateFirst
                  required
                  rules={timeValidation}
                >
                  <Input />
                </Form.Item>
              </Col>
            </>
          ) : (
            <>
              <Col span={9}>
                <Form.Item
                  label={"Total Size"}
                  name="totalSize"
                  validateFirst
                  required
                  rules={fileSize}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={5}>
                <Form.Item label={"Size Unit"} name="sizeUnit" required>
                  <Select
                    suffixIcon={null}
                    showSearch={false}
                    style={{ width: "100%" }}
                    options={fileSizeOptions}
                  />
                </Form.Item>
              </Col>
            </>
          )}
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
              <Button onClick={handleClose}>Cancel</Button>
              <Button
                type="primary"
                onClick={() => form.submit()}
                loading={userLoading}
                disabled={!userName || hasErrors || required}
              >
                Create
              </Button>
            </Space>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default AddUser;
