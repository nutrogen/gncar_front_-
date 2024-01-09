"use client";

import { GrFormNext, GrHomeRounded } from "react-icons/gr";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { TableHeader } from "@/components/common/Table/Table";
import TableNotNesiListDetail from "@/components/nt/TableNotiNesListDetail";

interface NesListDetailProps {}

export interface TableItemType {
  no: number | string;
  title: string;
  name: string;
  date: string;
  count: string;
  cont?: any;
}

export default function NesListDetail({}: NesListDetailProps) {
  // table header
  const headers: TableHeader[] = useMemo(() => {
    return [
      {
        name: "등록자",
        value: "name",
        width: "230px",
      },
      {
        name: "수정일",
        value: "editDate",
        width: "230px",
      },
      {
        name: "등록일",
        value: "date",
        width: "230px",
      },
      {
        name: "조회수",
        value: "count",
        width: "230px",
      },
    ];
  }, []);

  const tableDetailItem: TableItemType = {
    no: 1,
    title: "보도자료이",
    name: "Barium",
    date: "2020-12-12",
    count: "9",
    cont: "afgbsdhfgasdljfgsljfghsdjl",
  };
  return (
    <TableNotNesiListDetail
      headers={headers}
      tableDetailItem={tableDetailItem}
    />
  );
}
