import { Button, Card, Input, Layout, Typography } from "antd";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import type { AppDispatch, RootState } from "../config/store";
import { logout } from "../modules/auth/slice";
import AddUser from "../modules/users/components/AddUser";
import { setOpenUserModel } from "../modules/users/slice";
import AppSidebar from "./AppSidebar";

const { Content } = Layout;

function AppLayout() {
  const { Title } = Typography;
  const [search, setSearch] = useState<string>("");
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const userPage = location.pathname === "/users";

  const { user, fileLoading, deleteLoading } = useSelector(
    (state: RootState) => state.data,
  );

  const handleAddUser = () => dispatch(setOpenUserModel());
  const handleLogout = async () => {
    const { success } = await dispatch(logout()).unwrap();
    if (success) await navigate("/login");
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
      {logo ? (
        <>
          <img
            style={{ margin: 0 }}
            src={logo}
            height={50}
            alt={"File Size Access Limit"}
          />
        </>
      ) : (
        <>
          <Title level={5} style={{ margin: 0 }}>
            File Size Access Limit
          </Title>
        </>
      )}
      <>
        {userPage && (
          <Input.Search
            placeholder="Search user..."
            disabled={user.length === 0}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 500 }}
          />
        )}
        <div>
          {userPage && (
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
          )}
          <Button
            style={{
              margin: 0,
              width: "80px",
              backgroundColor: "#5567ed",
              color: "#fff",
            }}
            type="primary"
            onClick={handleLogout}
            disabled={fileLoading || deleteLoading}
          >
            Logout
          </Button>
        </div>
      </>
    </div>
  );
  return (
    <Layout style={{ height: "95vh", minHeight: 0 }}>
      <Card
        className="app-layout-card"
        styles={{
          body: {
            height: "calc(100vh - 90px)",
            display: "flex",
            flexDirection: "column",
          },
        }}
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
            <div
              style={{
                flex: 1,
                minHeight: 0,
                overflow: "hidden",
              }}
            >
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
