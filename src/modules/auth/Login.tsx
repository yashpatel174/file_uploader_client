import { Button, Card, Col, Form, Input, Row, Typography } from "antd";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { AppDispatch } from "../../config/store";
import { passwordValidation, usernameValidation } from "../../utils/validation";
import { handleLogin } from "./slice";

const { Title } = Typography;
export interface LoginFormValues {
  userName: string;
  password: string;
}

const Login: React.FC = () => {
  const [form] = Form.useForm<LoginFormValues>();
  const dispatch = useDispatch<AppDispatch>();
  const [loginLoading, setLoginLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleFinish = async (values: LoginFormValues) => {
    setLoginLoading(true);
    await dispatch(handleLogin(values as LoginFormValues))
      .unwrap()
      .then((res) => {
        if (res.success === true) navigate("/login");
      })
      .finally(() => {
        setLoginLoading(false);
      });
  };

  const userName = Form.useWatch("userName", form);
  const password = Form.useWatch("password", form);
  const hasErrors = form
    .getFieldsError()
    .some(({ errors }) => errors.length > 0);

  return (
    <Row
      justify="center"
      align="middle"
      style={{
        minHeight: "95vh",
        padding: 16,
      }}
    >
      {" "}
      <Col xs={24} sm={20} md={12} lg={8} xl={6}>
        {" "}
        <Card>
          <Title
            level={3}
            style={{
              textAlign: "center",
              marginBottom: 24,
            }}
          >
            Login{" "}
          </Title>
          <Form<LoginFormValues>
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            autoComplete="off"
          >
            <Form.Item
              label="Username"
              name="userName"
              validateFirst
              rules={usernameValidation}
            >
              <Input placeholder="admin_123" allowClear />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              validateFirst
              rules={passwordValidation}
            >
              <Input.Password placeholder="Admin@123" />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                loading={loginLoading}
                disabled={!userName || !password || hasErrors}
              >
                Login
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>
    </Row>
  );
};

export default Login;
