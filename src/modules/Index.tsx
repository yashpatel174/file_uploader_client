import { EditOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Empty,
  Form,
  Input,
  message,
  Modal,
  Row,
  Segmented,
  Select,
  Space,
  Table,
  Tooltip,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { slotOperation, toBytes } from "../utils/sizeConverter";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 5000,
  withCredentials: true,
});

interface ISize {
  bytes: string;
  kb: string;
  mb: string;
  gb: string;
}

interface IUserTable {
  _id: string;
  userName: string;
  totalSize: ISize;
  consumedSize: ISize;
  availableSize: ISize;
}

interface IUserTableHeader {
  action?: string;
  _id: string;
  id: number;
  userName: string;
  totalSize: string;
  consumedSize: string;
  availableSize: string;
}

type SizeUnit = "bytes" | "kb" | "mb" | "gb";

const fileSizeOptions = [
  {
    label: "Bytes",
    value: "bytes",
  },
  {
    label: "KB",
    value: "kb",
  },
  {
    label: "MB",
    value: "mb",
  },
  {
    label: "GB",
    value: "gb",
  },
];

const Index = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState<IUserTable[]>([]);
  const [userData, setUserData] = useState<IUserTableHeader>({
    action: "",
    _id: "",
    id: 0,
    availableSize: "",
    consumedSize: "",
    totalSize: "",
    userName: "",
  });
  const [openModel, setOpenModel] = useState<boolean>(false);
  const [unit, setUnit] = useState<SizeUnit>("bytes");
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = async () => {
    setLoading(true);
    await api
      .get("/users")
      .then((res) => {
        const result = res.data.result;
        console.log("result: ", result);
        result.map((r) => {
          console.log("r =>", r);
        });
        setData(result);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formattedData = useMemo(() => {
    return data?.map((user, idx: number) => ({
      ...user,
      _id: user._id,
      id: idx + 1,
      totalSize: user.totalSize[unit as SizeUnit],
      consumedSize: user.consumedSize[unit as SizeUnit],
      availableSize: user.availableSize[unit as SizeUnit],
      action: "",
    }));
  }, [data, unit]);

  const renderAction = (record: IUserTableHeader): any => {
    return (
      <Space size="middle">
        <Tooltip title={"edit"}>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleUpdate(record)}
          />
        </Tooltip>
      </Space>
    );
  };

  const handleUnitChange = (value: SizeUnit) => {
    form.setFieldsValue({ unit: value });
    setUnit(value);
  };

  const handleUpdate = (record: IUserTableHeader): void => {
    setOpenModel(true);
    setUserData(record);
    form.setFieldsValue({ ...record, unit });
  };

  const handleUnitUpdate = (value: SizeUnit) => {
    const initialUnit = form.getFieldValue("unit");
    const selectedUser = data.find((d) => d._id == userData._id);
    if (!selectedUser) throw new Error("User not found");

    const updated = {
      ...userData,
      totalSize: selectedUser.totalSize[initialUnit as SizeUnit],
      consumedSize: selectedUser.consumedSize[initialUnit as SizeUnit],
      availableSize: selectedUser.availableSize[initialUnit as SizeUnit],
      unit: value,
    };
    setUserData(updated);
    form.setFieldsValue({ ...updated, _id: userData._id });
  };

  const column: ColumnsType<IUserTableHeader> = [
    {
      title: "Index",
      dataIndex: "id",
      align: "center",
      width: 180,
    },
    {
      title: "Username",
      dataIndex: "userName",
      align: "center",
      width: 360,
    },
    {
      title: "Total Size",
      dataIndex: "totalSize",
      align: "center",
      width: 270,
    },
    {
      title: "Used Size",
      dataIndex: "consumedSize",
      align: "center",
      width: 270,
    },
    {
      title: "Available Size",
      dataIndex: "availableSize",
      align: "center",
      width: 270,
    },
    {
      title: "Action",
      key: "action",
      dataIndex: "action",
      align: "center",
      width: 270,
      render: (_, record) => renderAction(record),
    },
  ];
  const { Title } = Typography;

  const TableHeader = (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
      }}
    >
      <Title level={5} style={{ margin: 0 }}>
        File Size Access Limit
      </Title>
      <Select
        suffixIcon={null}
        showSearch={false}
        value={unit}
        style={{ width: "100px", height: "32px", textAlign: "center" }}
        options={fileSizeOptions}
        onChange={handleUnitChange}
      />
    </div>
  );

  const newSize = Form.useWatch("newSize", form);
  const newUnit = Form.useWatch("newUnit", form);
  const operator = Form.useWatch("difference", form);
  const prevUnit = Form.useWatch("unit", form);
  const availableSize = Form.useWatch("availableSize", form);

  const handleSubmit = async (values: any) => {
    try {
      const total = toBytes(
        Number(values.totalSize.split(" ")[0]),
        values.unit,
      );
      const available = toBytes(
        Number(values.availableSize.split(" ")[0]),
        values.unit,
      );
      const consumed = toBytes(
        Number(values.consumedSize.split(" ")[0]),
        values.unit,
      );
      const newValue = toBytes(Number(values.newSize), values.newUnit);
      const { newTotal } = slotOperation(
        total,
        available,
        consumed,
        newValue,
        values.difference,
      );

      const res = await api.patch(`/users/${userData._id}`, {
        totalSizeBytes: newTotal,
      });
      message.success(res.data.message);
      setOpenModel(false);
      form.resetFields();
      fetchData();
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    }
  };

  return (
    <div style={{ margin: "auto"! }}>
      <Card title={TableHeader}>
        <Table
          className="custom-table"
          bordered
          loading={loading}
          rowKey="_id"
          dataSource={formattedData}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style={{
                  height: 430,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              />
            ),
          }}
          columns={column}
          pagination={false}
        />
      </Card>
      {openModel && (
        <Modal
          title={"Update Data"}
          open={openModel}
          footer={null}
          okButtonProps={{
            disabled:
              !newSize ||
              !Number(newSize) ||
              Number(newSize) <= 0 ||
              (operator === "-" && newSize > availableSize),
          }}
          onCancel={() => {
            setOpenModel(false);
            form.resetFields();
          }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              unit: unit,
              newUnit: unit,
              difference: "+",
            }}

            // onChange={handleFormChange}
          >
            <Row gutter={16}>
              <Col span={9}>
                <Form.Item label={"Total Size"} name="totalSize" validateFirst>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={9}>
                <Form.Item
                  label={"Consumed Size"}
                  name="consumedSize"
                  validateFirst
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label={"Unit"} name="unit" validateFirst>
                  <Select
                    suffixIcon={null}
                    showSearch={false}
                    style={{
                      width: "106px",
                      height: "32px",
                      textAlign: "center",
                    }}
                    options={fileSizeOptions}
                    onChange={handleUnitUpdate}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={9}>
                <Form.Item
                  label={"Available Size"}
                  name="availableSize"
                  validateFirst
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={9}>
                <Form.Item
                  label={"New Size"}
                  name="newSize"
                  validateFirst
                  rules={[
                    { required: true, message: "New size is required" },
                    {
                      validator: (_, value) => {
                        if (!value) {
                          return Promise.reject("Enter a valid size");
                        }
                        if (!Number(value)) {
                          return Promise.reject("Value must be an integer");
                        }
                        if (Number(value) <= 0) {
                          return Promise.reject(
                            "Value must be a positive integer",
                          );
                        }
                        // if (operator === "-" && value > availableSize) {
                        //   return Promise.reject(
                        //     "Value must lesser than available size",
                        //   );
                        // }

                        const available = toBytes(
                          Number(availableSize.split(" ")[0]),
                          prevUnit,
                        );
                        const newValue = toBytes(Number(value), newUnit);

                        if (operator === "-" && newValue > available) {
                          return Promise.reject(
                            "Value must lesser than available size",
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label={"New Size Unit"} name="newUnit" validateFirst>
                  <Select
                    suffixIcon={null}
                    showSearch={false}
                    style={{
                      width: "106px",
                      height: "32px",
                      textAlign: "center",
                    }}
                    options={fileSizeOptions}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={8}>
                <Form.Item
                  label={"Adjustment Type"}
                  name="difference"
                  validateFirst
                >
                  <Segmented
                    block
                    options={[
                      { label: "Add", value: "+" },
                      { label: "Remove", value: "-" },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col span={16}>
                <Space
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    height: "100%",
                  }}
                >
                  <Button
                    onClick={() => {
                      setOpenModel(false);
                      form.resetFields();
                    }}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="primary"
                    onClick={() => form.submit()}
                    disabled={
                      !newSize ||
                      !Number(newSize) ||
                      Number(newSize) <= 0 ||
                      (operator === "-" && newSize > availableSize)
                    }
                  >
                    OK
                  </Button>
                </Space>
              </Col>
            </Row>
          </Form>
        </Modal>
      )}
    </div>
  );
};

export default Index;
