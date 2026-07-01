import {
  Button,
  Col,
  Form,
  Input,
  message,
  Modal,
  Progress,
  Radio,
  Row,
  Segmented,
  Select,
  Space,
  Tag,
  type RadioChangeEvent,
} from "antd";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../config/store";
import type {
  EditFormValues,
  IUnitProps,
  IUserData,
  SizeUnit,
  UnitType,
} from "../../../interfaces/interface";
import { fileSizeOptions, unitOptions } from "../../../utils/column";
import {
  buildPayload,
  dynamicData,
  paginationPayload,
} from "../../../utils/functions";
import { getStorageStatus, getUsagePercentage } from "../../../utils/menuItems";
import { toBytes } from "../../../utils/sizeConverter";
import { parseDurationToSeconds } from "../../../utils/timeConverter";
import { timeValidation, unitValidation } from "../../../utils/validation";
import { getAllUsers, setCloseModel, updateUserInfo } from "../slice";

const EditModel: React.FC<IUnitProps> = ({ unit = "KB" }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [form] = Form.useForm();
  const [userData, setUserData] = useState<IUserData | null>(null);
  const [percent, setPercent] = useState<number>(0);

  const newUnit: SizeUnit = Form.useWatch("newUnit", form);
  const operator: string = Form.useWatch("opearation", form);
  const toggleUnit: string = Form.useWatch("unit", form);
  const newSize: string = Form.useWatch("newSize", form);
  const newTime: string = Form.useWatch("newTime", form);

  const { isModelOpen, userInfo } = useSelector(
    (state: RootState) => state.data,
  );
  if (!userInfo) return null;

  useEffect(() => {
    setUserData(userInfo);
    const formattedData = dynamicData(
      userInfo as any,
      userInfo.unit as UnitType,
    );
    form.setFieldsValue({ ...(userInfo as IUserData), ...formattedData });
  }, []);

  const handleUnitChange = (e: RadioChangeEvent) => {
    const value: UnitType = e.target.value;
    const data = dynamicData(userData as any, value);
    if (value === "size") {
      form.resetFields(["newTime"]);
    } else {
      form.resetFields(["newSize", "newUnit"]);
    }
    form.setFieldsValue({ ...data, unit: value });
  };

  const handleSubmit = async (values: EditFormValues) => {
    try {
      const finalData = buildPayload(values, userInfo);
      await dispatch(updateUserInfo(finalData));

      dispatch(setCloseModel());
      form.resetFields();
      await dispatch(getAllUsers(paginationPayload));
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    }
  };

  const handleClose = useCallback(() => {
    dispatch(setCloseModel());
    form.resetFields();
  }, [setCloseModel]);

  const selectedOption = (unit: string) => {
    return {
      total: unit === "time" ? "Total Time" : "Total Size",
      consumed: unit === "time" ? "Consumed Time" : "Consumed Size",
      available: unit === "time" ? "Available Time" : "Available Size",
    };
  };

  const labels = selectedOption(toggleUnit);

  useEffect(() => {
    setPercent(getUsagePercentage(userInfo, toggleUnit));
  }, [toggleUnit]);

  const { status, color } = getStorageStatus(percent);

  useEffect(() => {
    form.validateFields(["newSize", "newTime"]);
  }, [operator, toggleUnit, form]);

  // const required =
  //   unit === "size" ? !fileSizelimit || !selectedUnit : !givenTime;

  return (
    <>
      <Modal
        title={"Update Data"}
        open={isModelOpen}
        footer={null}
        onCancel={handleClose}
        width={"550px"}
        style={{ top: 20 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            newUnit: unit,
            opearation: "+",
            unit: "size",
          }}
        >
          {/* Storage Details */}
          <Row gutter={[16, 0]}>
            <Col span={12}>
              <Form.Item
                label={"Unit"}
                name="unit"
                validateFirst
                required
                rules={unitValidation}
              >
                <Radio.Group
                  block
                  options={unitOptions}
                  onChange={handleUnitChange}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={<Tag color={color}>{status}</Tag>}>
                <Progress percent={percent} strokeColor={color} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item label={labels.total} name="total">
                <Input disabled />
              </Form.Item>
            </Col>

            <Col xs={24} sm={8}>
              <Form.Item label={labels.consumed} name="consumed">
                <Input disabled />
              </Form.Item>
            </Col>

            <Col xs={24} sm={8}>
              <Form.Item label={labels.available} name="available">
                <Input disabled />
              </Form.Item>
            </Col>
          </Row>

          {/* Update Controls */}
          <Row gutter={[16, 0]}>
            <Col span={10}>
              <Form.Item label={"Adjustment Type"} name="opearation">
                <Segmented
                  block
                  options={[
                    { label: "Add", value: "+" },
                    { label: "Remove", value: "-" },
                  ]}
                />
              </Form.Item>
            </Col>
            {toggleUnit === "size" ? (
              <>
                <Col span={8}>
                  <Form.Item
                    label={"New Size"}
                    name="newSize"
                    dependencies={["opearation", "unit", "newUnit"]}
                    validateFirst
                    preserve={false}
                    rules={[
                      { required: true, message: "New size is required" },
                      {
                        validator: (_, value) => {
                          if (!value) {
                            return Promise.reject("Enter a valid size");
                          }

                          if (!Number(value)) {
                            return Promise.reject("Value must be a number");
                          }

                          if (Number(value) <= 0) {
                            return Promise.reject(
                              "Value must be a positive number",
                            );
                          }

                          if (operator === "-") {
                            if (toggleUnit === "size") {
                              const newValue = toBytes(Number(value), newUnit);
                              const { available } = userInfo[toggleUnit];
                              if (newValue > Number(available)) {
                                return Promise.reject(
                                  "Value must lesser than available size",
                                );
                              }
                            }
                          }

                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <Input placeholder="Enter size" />
                  </Form.Item>
                </Col>

                <Col span={6}>
                  <Form.Item label={"New Size Unit"} name="newUnit">
                    <Select
                      suffixIcon={null}
                      showSearch={false}
                      style={{ width: "100%" }}
                      options={fileSizeOptions}
                    />
                  </Form.Item>
                </Col>
              </>
            ) : (
              <>
                <Col span={14}>
                  <Form.Item
                    label={"New Minutes"}
                    name="newTime"
                    dependencies={["opearation"]}
                    validateFirst
                    required
                    preserve={false}
                    rules={[
                      ...timeValidation,
                      {
                        validator: (_, value) => {
                          if (operator === "-") {
                            if (toggleUnit === "time") {
                              const { totalSeconds } =
                                parseDurationToSeconds(value);
                              const { available } = userInfo[toggleUnit];
                              if (totalSeconds > Number(available)) {
                                return Promise.reject(
                                  "Time duration limit exceeds!",
                                );
                              }
                            }
                          }

                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <Input
                      style={{ width: "55%" }}
                      placeholder="Enter a valid time"
                    />
                  </Form.Item>
                </Col>
              </>
            )}
          </Row>

          {/* Footer Buttons */}
          <Row>
            <Col span={24}>
              <Space
                wrap
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <Form.Item>
                  <Button onClick={handleClose}>Cancel</Button>
                </Form.Item>
                <Form.Item shouldUpdate>
                  {() => {
                    const hasErrors = form
                      .getFieldsError()
                      .some(({ errors }) => errors.length > 0);

                    const disable =
                      toggleUnit === "size" ? !newUnit || !newSize : !newTime;

                    return (
                      <Button
                        type="primary"
                        onClick={() => form.submit()}
                        disabled={hasErrors || disable}
                      >
                        OK
                      </Button>
                    );
                  }}
                </Form.Item>
              </Space>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default EditModel;
