import { Button, Card, Layout, Typography } from "antd";
import { useDispatch } from "react-redux";
import { Outlet, useLocation } from "react-router-dom";
import { setOpenUserModel } from "../modules/users/slice";
import { menuItems } from "../utils/menuItems";
import AppSidebar from "./AppSidebar";

const { Content } = Layout;

function AppLayout() {
  const { Title } = Typography;
  const location = useLocation();
  const dispatch = useDispatch();
  const handleAddUser = () => dispatch(setOpenUserModel());
  // const heading =
  //   menuItems.find((m) => m.key === location.pathname).label || "/";

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
      <Button
        style={{ margin: 0, width: "80px", backgroundColor: "#5567ed" }}
        type="primary"
        onClick={handleAddUser}
      >
        Add
      </Button>
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
              {/* <h2 style={{ margin: 0 }}>{heading}</h2> */}
              <Outlet />
            </div>
          </Content>
        </Layout>
      </Card>
    </Layout>
  );
}

export default AppLayout;
