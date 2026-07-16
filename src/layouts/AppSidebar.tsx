import { menuItems } from "@src/utils/menuItems";
import { Menu } from "antd";
import Sider from "antd/es/layout/Sider";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Sider style={{ background: "#fff" }}>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems.map((item) => ({
          key: item.key,
          label: <Link to={item.key}>{item.label}</Link>,
        }))}
        onClick={({ key }) => navigate(key)}
      />
    </Sider>
  );
}
