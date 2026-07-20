import { AudioOutlined } from "@ant-design/icons";
import type { AppDispatch, RootState } from "@src/config/store";
import type { IFileTable, ISelectedFile } from "@src/interfaces/interface";
import { fileColumns } from "@src/utils/column";
import { Button, Empty, Pagination, Space, Table, Tooltip } from "antd";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useOutletContext } from "react-router-dom";
import UserFileModel from "./components/UserFileModel";
import { getAllFiles, setOpenUserFiles } from "./slice";

const FileList = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [userFiles, setUserFiles] = useState<ISelectedFile>({
    userId: null,
    platform: null,
  });
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const { search } = useOutletContext<{ search: string }>();

  const { file, fileLoading, total, openUserFiles } = useSelector(
    (state: RootState) => state.file,
  );

  useEffect(() => {
    dispatch(getAllFiles());
  }, [dispatch, page, pageSize, file.length]);

  const userList = useMemo(() => {
    const filteredData = file.filter((u) =>
      u.userName.toLowerCase().includes(search.toLowerCase()),
    );

    return filteredData?.map((u, idx) => {
      return {
        ...u,
        id: idx + 1,
        userId: u.userId,
        user: u.userName,
        platform: u.platform,
      };
    });
  }, [file, search]);

  const handleUserData = async (record: IFileTable) => {
    const { userId, platform } = record;
    setUserFiles({ userId, platform });
    dispatch(setOpenUserFiles(true));
  };

  const renderAction = (record: IFileTable): ReactNode => {
    return (
      <Space size={[4, 4]}>
        <Tooltip title={"View"}>
          <Button
            type="link"
            icon={<AudioOutlined />}
            onClick={() => handleUserData(record)}
          />
        </Tooltip>
      </Space>
    );
  };

  const allColumn = fileColumns(renderAction);

  return (
    <>
      <Table
        className="custom-table"
        bordered
        rowKey="_id"
        loading={{ spinning: fileLoading }}
        dataSource={userList}
        tableLayout="fixed"
        pagination={false}
        scroll={{
          x: 900,
          y: "calc(100vh - 238px)",
        }}
        locale={{
          emptyText: fileLoading ? (
            fileLoading
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{
                minHeight: "40vh",
                height: "calc(100vh - 335px)",
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
            const metaPage = JSON.stringify({
              page: newPage,
              limit: newPageSize,
            });
            localStorage.setItem("page", metaPage);
            setPage(newPage);
            setPageSize(newPageSize);
          }}
        />
      </div>
      {openUserFiles && <UserFileModel userFiles={userFiles} />}
    </>
  );
};

export default FileList;
