import type { AppDispatch, RootState } from "@src/config/store";
import type {
  EditFormValues,
  IEmailPayload,
  IUnitProps,
  IUserData,
  SizeUnit,
  UnitType,
} from "@src/interfaces/interface";
import { fileSizeOptions, unitOptions } from "@src/utils/column";
import {
  buildPayload,
  dynamicData,
  paginationPayload,
} from "@src/utils/functions";
import { getStorageStatus, getUsagePercentage } from "@src/utils/menuItems";
import { formatBytes, toBytes } from "@src/utils/sizeConverter";
import {
  formatDuration,
  parseDurationToSeconds,
} from "@src/utils/timeConverter";
import { timeValidation, unitValidation } from "@src/utils/validation";
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
import {
  getAllUsers,
  setCloseModel,
  setUpdateLoading,
  updateUserInfo,
} from "../slice";

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
  const { failReport, updateLoading } = useSelector(
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
      dispatch(setUpdateLoading(true));
      const fileData = failReport?.find(
        (r) => r.userId === userInfo._id && r.unit === values.unit,
      );
      const isUnitMatched =
        fileData !== undefined && fileData.unit === values.unit;
      const newData = buildPayload(values, userInfo);
      let isReset: boolean = false;
      let isMail: boolean = values.opearation === "+" ? true : false;

      let emailPayload: IEmailPayload = {
        unit: values.unit,
        total: "",
        used: "",
        updated: "",
      };
      if (isMail) {
        const updatedUnit = values.unit;
        if (updatedUnit === "size") {
          const total = formatBytes(userInfo[updatedUnit].total);
          const used = formatBytes(userInfo[updatedUnit].consumed);
          const updated = formatBytes(Number(values.newSize));
          emailPayload.total = total;
          emailPayload.used = used;
          emailPayload.updated = updated;
        } else if (updatedUnit === "time") {
          const total = formatDuration(userInfo[updatedUnit].total);
          const used = formatDuration(userInfo[updatedUnit].consumed);
          const { totalSeconds } = parseDurationToSeconds(
            Number(values.newTime),
          );
          const updated = formatDuration(Number(totalSeconds));
          emailPayload.total = total;
          emailPayload.used = used;
          emailPayload.updated = updated;
        }
      }
      if (fileData && values.opearation === "+") {
        const { newAvailableValue } = newData;
        if (isUnitMatched) {
          if (newAvailableValue >= fileData.actualLimit) {
            isReset = true;
          } else {
            isReset = false;
          }
        }
      }
      const finalData = {
        ...newData,
        isReset,
        isMail,
        jobId: fileData?.jobId ?? null,
        emailPayload,
      };
      await dispatch(updateUserInfo(finalData));
      await dispatch(getAllUsers(paginationPayload));

      handleClose();
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      dispatch(setUpdateLoading(false));
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
            <Col xs={15} sm={12}>
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
            <Col xs={24} sm={12}>
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
            <Col xs={24} sm={10}>
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
                <Col xs={12} sm={8}>
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

                <Col xs={12} sm={6}>
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
                <Col xs={24} sm={14}>
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
                        disabled={hasErrors || disable || updateLoading}
                        loading={updateLoading}
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
