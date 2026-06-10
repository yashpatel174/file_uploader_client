import {
  Button,
  Col,
  Form,
  Input,
  message,
  Modal,
  Radio,
  Row,
  Segmented,
  Select,
  Space,
} from "antd";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../config/store";
import type {
  IUnitProps,
  IUserData,
  SizeUnit,
} from "../../../interfaces/interface";
import { fileSizeOptions, unitOptions } from "../../../utils/column";
import { buildPayload, dynamicData } from "../../../utils/functions";
import { toBytes } from "../../../utils/sizeConverter";
import { parseDurationToSeconds } from "../../../utils/timeConverter";
import { timeValidation, unitValidation } from "../../../utils/validation";
import { getAllUsers, setCloseModel, updateUserInfo } from "../slice";

const EditModel: React.FC<IUnitProps> = ({ unit }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [form] = Form.useForm();
  const [userData, setUserData] = useState({});

  const newUnit: SizeUnit = Form.useWatch("newUnit", form);
  const operator: string = Form.useWatch("opearation", form);
  const toggleUnit: string = Form.useWatch("unit", form);

  const { isModelOpen, userInfo } = useSelector(
    (state: RootState) => state.data,
  );

  useEffect(() => {
    setUserData(userInfo);
    const formattedData = dynamicData(userInfo as any, userInfo.unit);
    form.setFieldsValue({ ...(userInfo as IUserData), ...formattedData });
  }, []);

  const handleUnitChange = (e) => {
    const value = e.target.value;
    const data = dynamicData(userData as any, value);
    form.setFieldsValue(data);
  };

  const handleSubmit = async (values) => {
    try {
      const finalData = buildPayload(values, userInfo);
      await dispatch(updateUserInfo(finalData));

      dispatch(setCloseModel());
      form.resetFields();
      dispatch(getAllUsers());
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
                    validateFirst
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
                              const availableSize =
                                userInfo[toggleUnit].available;
                              if (newValue > Number(availableSize)) {
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
                    validateFirst
                    required
                    rules={[
                      ...timeValidation,
                      {
                        validator: (_, value) => {
                          if (operator === "-") {
                            if (toggleUnit === "time") {
                              const { totalSeconds } =
                                parseDurationToSeconds(value);
                              const availableTime =
                                userInfo[toggleUnit].available;
                              if (totalSeconds > Number(availableTime)) {
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
                <Button onClick={handleClose}>Cancel</Button>

                <Button type="primary" onClick={() => form.submit()}>
                  OK
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default EditModel;
