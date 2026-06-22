import { Button, Card, Input, Layout, Typography } from "antd";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../config/store";
import { loggingOut } from "../modules/auth/slice";
import AddUser from "../modules/users/components/AddUser";
import { setOpenUserModel } from "../modules/users/slice";
import AppSidebar from "./AppSidebar";

const { Content } = Layout;

function AppLayout() {
  const [search, setSearch] = useState<string>("");
  const { Title } = Typography;
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const userPage = location.pathname === "/users";

  const { user } = useSelector((state: RootState) => state.data);

  const handleAddUser = () => dispatch(setOpenUserModel());
  const handleLogout = async () => {
    const { success } = await dispatch(loggingOut()).unwrap();
    if (success === true) await navigate("/login");
  };

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
      {userPage && (
        <>
          <Input.Search
            placeholder="Search user..."
            disabled={user.length === 0}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 500 }}
          />
          <div>
            <Button
              style={{
                margin: 0,
                width: "80px",
                backgroundColor: "#5567ed",
                marginRight: "10px",
              }}
              type="primary"
              onClick={handleAddUser}
            >
              Add
            </Button>
            <Button
              style={{ margin: 0, width: "80px", backgroundColor: "#5567ed" }}
              type="primary"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </>
      )}
    </div>
  );
  return (
    <Layout style={{ height: "95vh", minHeight: 0 }}>
      <Card
        className="app-layout-card"
        style={{ height: "100%", display: "flex", flexDirection: "column" }}
        title={TableHeader}
      >
        <Layout style={{ height: "100%", backgroundColor: "#fff" }}>
          <AppSidebar />
          <Content
            style={{
              height: "100%",
              marginLeft: "2vw",
              overflow: "hidden",
            }}
          >
            <div style={{ height: "100%", overflow: "hidden" }}>
              <Outlet context={{ search }} />
            </div>
          </Content>
        </Layout>
      </Card>
      <AddUser />
    </Layout>
  );
}

export default AppLayout;
