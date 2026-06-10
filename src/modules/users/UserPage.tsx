import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  SwapOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { Button, Empty, Space, Table, Tooltip } from "antd";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../config/store";
import type {
  ISelectedUser,
  IUserFilePayload,
  IUserTable,
  IUserUsage,
  SizeUnit,
  UnitType,
} from "../../interfaces/interface";
import { tableColumn } from "../../utils/column";
import { dynamicData } from "../../utils/functions";
import AddUser from "./components/AddUser";
import EditModel from "./components/EditModel";
import UploadModal from "./components/FileUpload";
import UserData from "./components/UserData";
import {
  getAllUsers,
  setDeleteModel,
  setOpenModel,
  setOpenUpload,
  setOpenUserData,
  setUserInfo,
  setUserUnitMap,
} from "./slice";
import DeleteModel from "./components/DeleteModel";

const UserPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [unit, setUnit] = useState<SizeUnit>("GB");
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [userData, setUserData] = useState<ISelectedUser>({
    userName: null,
    userId: null,
    count: 0,
  });

  const [userFileInfo, setUserFileInfo] = useState<IUserFilePayload>({
    userId: null,
    unit: null,
  });

  const {
    user,
    loading,
    userModel,
    fileModel,
    deleteModel,
    isModelOpen,
    userUnitMap,
    fileUploadModel,
  } = useSelector((state: RootState) => state.data);

  useEffect(() => {
    if (!user?.length) dispatch(getAllUsers());
  }, [user, dispatch]);

  const userList = useMemo(() => {
    return user?.map((u, idx) => {
      const currentUnit: UnitType = userUnitMap[u._id] ?? u.unit ?? "size";
      const formattedData = dynamicData(u as IUserUsage, currentUnit);

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
  }, [user, userUnitMap]);

  const handleFileUpload = async (record) => {
    setUserFileInfo({ userId: record._id, unit: record.unit });
    dispatch(setOpenUpload());
  };

  const handleUpdate = async (record) => {
    const data = {
      size: record.size,
      time: record.time,
      unit: record.unit,
      _id: record._id,
      userName: record.userName,
    };

    dispatch(setOpenModel());
    const currentUnit = record.available.split(" ")[1] as SizeUnit;
    setUnit(currentUnit);
    dispatch(setUserInfo(data));
  };

  const handleUserData = async (record) => {
    setUserData({
      userName: record.userName,
      userId: record._id,
      count: record.totalDocuments,
    });
    dispatch(setOpenUserData());
  };

  const handleDeleteUser = async (record) => {
    setDeleteUserId(record._id);
    dispatch(setDeleteModel(true));
  };

  const renderAction = (record: IUserTable): ReactNode => {
    const { unit, totalDocuments, _id } = record;
    const { total, consumed } = record[unit] || {};
    const isDisableUpload = total === consumed;
    const isDisableview = totalDocuments === 0;
    return (
      <Space size="middle">
        <Tooltip title={"Convert"}>
          <Button
            type="link"
            icon={<SwapOutlined />}
            onClick={() => {
              dispatch(
                setUserUnitMap({
                  userId: _id,
                  defaultUnit: unit as UnitType,
                }),
              );
            }}
          />
        </Tooltip>
        {/* <Tooltip title={"Upload"}>
          <Button
            type="link"
            icon={<UploadOutlined />}
            disabled={isDisableUpload}
            onClick={() => handleFileUpload(record)}
          />
        </Tooltip> */}
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
        loading={{ spinning: loading }}
        rowKey="_id"
        dataSource={userList}
        style={{ height: 530, overflowY: "scroll" }}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{
                height: 430,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            />
          ),
        }}
        columns={allColumn}
        pagination={false}
      />
      {userModel && <AddUser />}
      {fileUploadModel && <UploadModal userFileInfo={userFileInfo} />}
      {isModelOpen && <EditModel unit={unit} />}
      {fileModel && <UserData userData={userData} />}
      {deleteModel && (
        <DeleteModel userId={deleteUserId} setDeleteUserId={setDeleteUserId} />
      )}
    </>
  );
};

export default UserPage;
