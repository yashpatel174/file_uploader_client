import React from "react";
import { Button, Card, Col, Form, Input, Row, Typography } from "antd";
import { useDispatch } from "react-redux";

import { handleLogin } from "./slice";
import { password, username } from "../../utils/validation";
import { useNavigate } from "react-router-dom";
import type { AppDispatch } from "../../config/store";

const { Title } = Typography;

export interface LoginFormValues {
  userName: string;
  password: string;
}

const Login: React.FC = () => {
  const [form] = Form.useForm<LoginFormValues>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleFinish = async (values: LoginFormValues) => {
    const { success } = await dispatch(
      handleLogin(values as LoginFormValues),
    ).unwrap();
    if (success === true) await navigate("/login");
  };

  return (
    <Row
      justify="center"
      align="middle"
      style={{
        minHeight: "100vh",
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
              rules={username}
            >
              <Input placeholder="Enter username" allowClear />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              validateFirst
              rules={password}
            >
              <Input.Password placeholder="Enter password" />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button type="primary" htmlType="submit" block size="large">
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
