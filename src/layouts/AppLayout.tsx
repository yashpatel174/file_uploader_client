import { Button, Card, Input, Layout, Typography } from "antd";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation } from "react-router-dom";
import type { RootState } from "../config/store";
import AddUser from "../modules/users/components/AddUser";
import { setOpenUserModel } from "../modules/users/slice";
import AppSidebar from "./AppSidebar";

const { Content } = Layout;

function AppLayout() {
  const { Title } = Typography;
  const dispatch = useDispatch();
  const handleAddUser = () => dispatch(setOpenUserModel());
  const [search, setSearch] = useState<string>("");

  const location = useLocation();
  const userPage = location.pathname === "/users";

  const { user } = useSelector((state: RootState) => state.data);

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

          <Button
            style={{ margin: 0, width: "80px", backgroundColor: "#5567ed" }}
            type="primary"
            onClick={handleAddUser}
          >
            Add
          </Button>
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
