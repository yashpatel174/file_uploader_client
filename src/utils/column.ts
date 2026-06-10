import type { CheckboxGroupProps } from "antd/es/checkbox";
import type { ColumnsType } from "antd/es/table";
import { type ReactNode } from "react";
import type { IUserTableRow } from "../interfaces/interface";

export const tableColumn = (
  func: (record: IUserTableRow) => ReactNode,
): ColumnsType<IUserTableRow> => {
  return [
    {
      title: "Index",
      dataIndex: "id",
      align: "center",
      width: 180,
    },
    {
      title: "Username",
      dataIndex: "userName",
      align: "center",
      width: 360,
    },
    {
      title: "Total",
      dataIndex: "total",
      align: "center",
      width: 270,
    },
    {
      title: "Used",
      dataIndex: "consumed",
      align: "center",
      width: 270,
    },
    {
      title: "Available",
      dataIndex: "available",
      align: "center",
      width: 270,
    },
    {
      title: "Action",
      key: "action",
      dataIndex: "action",
      align: "center",
      width: 200,
      render: (_, record) => func(record),
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
