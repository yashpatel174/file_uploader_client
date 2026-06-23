import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import { Button, Empty, Pagination, Space, Table, Tooltip } from "antd";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useOutletContext } from "react-router-dom";
import type { AppDispatch, RootState } from "../../config/store";
import type {
  ISelectedUser,
  IUserTable,
  SizeUnit,
  UnitType,
} from "../../interfaces/interface";
import { tableColumn } from "../../utils/column";
import { dynamicData } from "../../utils/functions";
import DeleteModel from "./components/DeleteModel";
import EditModel from "./components/EditModel";
import UserData from "./components/UserData";
import {
  getAllUsers,
  setDeleteModel,
  setOpenModel,
  setOpenUserData,
  setUserInfo,
  setUserUnitMap,
} from "./slice";

const UserPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [unit, setUnit] = useState<SizeUnit>("GB");
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [userData, setUserData] = useState<ISelectedUser>({
    userName: null,
    userId: null,
    count: 0,
  });
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const { search } = useOutletContext<{ search: string }>();

  const { user, loading, total, fileModel, isModelOpen, userUnitMap } =
    useSelector((state: RootState) => state.data);

  useEffect(() => {
    dispatch(getAllUsers({ page, limit: pageSize }));
  }, [dispatch, page, pageSize]);

  const userList = useMemo(() => {
    const filteredData = user.filter((u) =>
      u.userName.toLowerCase().includes(search.toLowerCase()),
    );

    return filteredData?.map((u, idx) => {
      const currentUnit: UnitType = userUnitMap[u._id] ?? u.unit ?? "size";
      const formattedData = dynamicData(u, currentUnit);

      return {
        ...u,
        id: idx + 1,
        unitType: formattedData,
        total: formattedData.total,
        consumed: formattedData.consumed,
        available: formattedData.available,
        unit: currentUnit,
      };
    });
  }, [user, userUnitMap, search]);

  const handleUpdate = async (record: IUserTable) => {
    const { size, time, unit, _id, userName, available } = record;
    dispatch(setOpenModel());
    const currentUnit = available.split(" ")[1] as SizeUnit;
    setUnit(currentUnit);
    dispatch(setUserInfo({ size, time, unit, _id, userName }));
  };

  const handleUserData = async (record: IUserTable) => {
    const { userName, _id, totalDocuments } = record;
    setUserData({
      userName,
      userId: _id,
      count: totalDocuments,
    });
    dispatch(setOpenUserData());
  };

  const handleDeleteUser = async (record: IUserTable) => {
    setDeleteUserId(record._id);
    dispatch(setDeleteModel(true));
  };

  const renderAction = (record: IUserTable): ReactNode => {
    const { unit, totalDocuments, _id } = record;
    const isDisableview = totalDocuments === 0;
    const payloadProp = { userId: _id, defaultUnit: unit as UnitType };
    return (
      <Space size={[4, 4]}>
        <Tooltip title={"Convert"}>
          <Button
            type="link"
            icon={<SwapOutlined />}
            onClick={() => dispatch(setUserUnitMap(payloadProp))}
          />
        </Tooltip>
        <Tooltip title={"Edit"}>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleUpdate(record)}
          />
        </Tooltip>
        <Tooltip title={"View"}>
          <Button
            type="link"
            icon={<EyeOutlined />}
            disabled={isDisableview}
            onClick={() => handleUserData(record)}
          />
        </Tooltip>
        <Tooltip title={"Delete"}>
          <Button
            type="link"
            style={{ color: "red" }}
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteUser(record)}
          />
        </Tooltip>
      </Space>
    );
  };

  const allColumn = tableColumn(renderAction);

  return (
    <>
      <Table
        className="custom-table"
        bordered
        rowKey="_id"
        loading={{ spinning: loading }}
        dataSource={userList}
        tableLayout="fixed"
        pagination={false}
        scroll={{
          x: 900,
          y: "calc(100vh - 238px)",
        }}
        locale={{
          emptyText: loading ? null : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{
                minHeight: "40vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            />
          ),
        }}
        columns={allColumn}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          flexWrap: "wrap",
          gap: 8,
          padding: "12px 8px",
        }}
      >
        <Pagination
          responsive
          current={page}
          pageSize={pageSize}
          total={total}
          showSizeChanger
          onChange={(newPage, newPageSize) => {
            setPage(newPage);
            setPageSize(newPageSize);
          }}
        />
      </div>
      {isModelOpen && <EditModel unit={unit} />}
      {fileModel && <UserData userData={userData} />}
      <DeleteModel userId={deleteUserId} setDeleteUserId={setDeleteUserId} />
    </>
  );
};

export default UserPage;
