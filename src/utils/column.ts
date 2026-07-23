import type { CheckboxGroupProps } from "antd/es/checkbox";
import type { ColumnsType } from "antd/es/table";
import { type ReactNode } from "react";
import type {
  FailReportTable,
  IFileTable,
  IUserTable,
} from "../interfaces/interface";

export const userColumns = (
  func: (record: IUserTable) => ReactNode,
): ColumnsType<IUserTable> => {
  return [
    {
      title: "Index",
      dataIndex: "id",
      align: "center",
      width: "5%",
    },
    {
      title: "Username",
      dataIndex: "userName",
      align: "center",
      width: "15%",
    },
    {
      title: "Email",
      dataIndex: "email",
      align: "center",
      width: "20%",
    },
    {
      title: "Total",
      dataIndex: "total",
      align: "center",
      width: "15%",
    },
    {
      title: "Used",
      dataIndex: "consumed",
      align: "center",
      width: "15%",
    },
    {
      title: "Available",
      dataIndex: "available",
      align: "center",
      width: "15%",
    },
    {
      title: "Action",
      key: "action",
      dataIndex: "action",
      align: "center",
      width: "15%",
      render: (_, record) => func(record),
    },
  ];
};

export const fileColumns = (
  func: (record: IFileTable) => ReactNode,
): ColumnsType<IFileTable> => {
  return [
    {
      title: "Index",
      dataIndex: "id",
      align: "center",
      width: "15%",
    },
    {
      title: "User",
      dataIndex: "userName",
      align: "center",
      width: "25%",
    },
    {
      title: "Platform",
      dataIndex: "platform",
      align: "center",
      width: "35%",
    },
    {
      title: "Action",
      key: "action",
      dataIndex: "action",
      align: "center",
      width: "25%",
      render: (_, record) => func(record),
    },
  ];
};

export const failReportColumns = (
  func: (record: FailReportTable) => ReactNode,
): ColumnsType<FailReportTable> => {
  return [
    {
      title: "Index",
      dataIndex: "id",
      align: "center",
      width: "15%",
    },
    {
      title: "User",
      dataIndex: "userName",
      align: "center",
      width: "20%",
    },
    {
      title: "Platform",
      dataIndex: "platform",
      align: "center",
      width: "25%",
    },
    {
      title: "Length",
      dataIndex: "limit",
      align: "center",
      width: "15%",
    },
    {
      title: "Attempt",
      dataIndex: "attempt",
      align: "center",
      width: "10%",
    },
    {
      title: "Action",
      key: "action",
      dataIndex: "action",
      align: "center",
      width: "15%",
      render: (_, record) => func(record as FailReportTable),
    },
  ];
};

export const fileSizeOptions = [
  // {
  //   label: "Bytes",
  //   value: "bytes",
  // },
  {
    label: "KB",
    value: "KB",
  },
  {
    label: "MB",
    value: "MB",
  },
  {
    label: "GB",
    value: "GB",
  },
];

export const unitOptions: CheckboxGroupProps<string>["options"] = [
  { label: "File Size", value: "size" },
  { label: "Minutes", value: "time" },
];
