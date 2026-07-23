import { QuestionCircleOutlined, RedoOutlined } from "@ant-design/icons";
import type { AppDispatch, RootState } from "@src/config/store";
import type { FailReportTable } from "@src/interfaces/interface";
import { failReportColumns } from "@src/utils/column";
import {
  Button,
  Empty,
  message,
  Pagination,
  Space,
  Table,
  Tooltip,
} from "antd";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { errorReportList, retryError, setApiLoading } from "../fileList/slice";
import ErrorModel from "./component/ErrorModel";

const FailReport = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [errModel, setErrModel] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [retry, setRetry] = useState<string | null>(null);

  const { file, apiLoading, total, reports } = useSelector(
    (state: RootState) => state.file,
  );
  const { refreshKey } = useSelector((state: RootState) => state.data);

  const handleErrorReport = () => {
    dispatch(errorReportList()).finally(() => {
      dispatch(setApiLoading(false));
    });
  };

  useEffect(() => {
    handleErrorReport();
  }, [dispatch, page, pageSize, file.length, refreshKey]);

  const handleRetry = useCallback(
    async (jobId: string) => {
      dispatch(setApiLoading(true));
      setRetry(jobId);

      const res = await dispatch(retryError(jobId));

      if (
        res.payload &&
        typeof res.payload !== "string" &&
        "success" in res.payload
      ) {
        message.success(res.payload.message);
        await navigate("/users");
      }

      handleErrorReport();
    },
    [dispatch, navigate, handleErrorReport, reports.length],
  );

  const handlePopupModel = async (record: FailReportTable) => {
    const { error }: { error: string } = record;
    setApiError(error);
    setErrModel(true);
  };

  const renderAction = (record: FailReportTable): ReactNode => {
    const disable = !record.retryable;
    const loading = retry === record.jobId;
    return (
      <Space size={[4, 4]}>
        <Tooltip title={"Resubmit"}>
          <Button
            type="link"
            icon={<RedoOutlined />}
            disabled={disable}
            loading={apiLoading && loading}
            onClick={() => handleRetry(record.jobId)}
          />
        </Tooltip>
        <Tooltip title={"Error"}>
          <Button
            style={!disable ? { color: "red" } : {}}
            type="link"
            icon={<QuestionCircleOutlined />}
            disabled={disable || apiLoading}
            onClick={() => handlePopupModel(record)}
          />
        </Tooltip>
      </Space>
    );
  };

  const allColumn = failReportColumns(renderAction);

  return (
    <>
      <Table<FailReportTable>
        className="custom-table"
        bordered
        rowKey="_id"
        // loading={reportLoading}
        dataSource={reports}
        tableLayout="fixed"
        pagination={false}
        scroll={{
          x: 900,
          y: "calc(100vh - 238px)",
        }}
        locale={{
          emptyText: !reports.length && (
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
      <ErrorModel
        errModel={errModel}
        setErrModel={setErrModel}
        apiError={apiError}
        setApiError={setApiError}
      />
    </>
  );
};

export default FailReport;
