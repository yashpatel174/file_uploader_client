import { QuestionCircleOutlined, RedoOutlined } from "@ant-design/icons";
import type { AppDispatch, RootState } from "@src/config/store";
import type { FailReportResponse } from "@src/interfaces/interface";
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
import { useEffect, useState, type ReactNode } from "react";
import { useDispatch, useSelector } from "react-redux";
import { errorReport, retryError } from "../fileList/slice";
import ErrorModel from "./component/ErrorModel";

const FailReport = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [report, setReport] = useState<any>([]);
  const [errModel, setErrModel] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiLoading, setApiLoading] = useState<boolean>(false);

  const { file, fileLoading, total } = useSelector(
    (state: RootState) => state.file,
  );

  const handleErrorReport = async () => {
    dispatch(errorReport())
      .then((res) => {
        if (
          res.payload &&
          typeof res.payload !== "string" &&
          "success" in res.payload === true
        ) {
          const { result } = res.payload;
          const { jobs } = result;
          const failReport = jobs?.map((f, idx) => {
            return {
              userName: f.userId.userName,
              platform: f.platform,
              attempt: f.attemptCount,
              error: f.lastError.message,
              jobId: f.jobId,
              id: idx + 1,
              retryable: f.retryable,
            };
          });
          setReport(failReport);
        }
      })
      .finally(() => {
        setApiLoading(false);
      });
  };

  useEffect(() => {
    handleErrorReport();
  }, [dispatch, page, pageSize, file.length]);

  const handleRetry = async (jobId: string) => {
    setApiLoading(true);
    await dispatch(retryError(jobId)).then(async (res) => {
      if (
        res.payload &&
        typeof res.payload !== "string" &&
        "success" in res.payload === true
      ) {
        message.success(res.payload.message);
      }
      await handleErrorReport();
    });
  };

  const handlePopupModel = async (record: FailReportResponse) => {
    const { error }: { error: string } = record;
    setApiError(error);
    setErrModel(true);
  };

  const renderAction = (record: FailReportResponse): ReactNode => {
    const disable = !record.retryable;
    return (
      <Space size={[4, 4]}>
        <Tooltip title={"Resubmit"}>
          <Button
            type="link"
            icon={<RedoOutlined />}
            disabled={disable}
            loading={apiLoading}
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
      <Table
        className="custom-table"
        bordered
        rowKey="_id"
        loading={{ spinning: fileLoading }}
        dataSource={report}
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
