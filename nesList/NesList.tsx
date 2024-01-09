"use client";

import style from "./NesiList.module.scss";
import { GrFormNext, GrHomeRounded } from "react-icons/gr";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/common/Button/Button";
import TableTop from "@/components/common/TableTop/TableTop";
import { RiFileExcel2Line, RiPrinterLine } from "react-icons/ri";
import Table, { TableHeader } from "@/components/common/Table/Table";
import { utils, writeFileXLSX } from "xlsx";
import moment from "moment";
import PagingComponent from "@/components/common/Paging/Paging";
import { useReactToPrint } from "react-to-print";
import TableNotNesiList from "@/components/nt/TableNotNesiList";

interface NesListProps {}

export interface TableItemType {
  no: number | string;
  title: string;
  name: string;
  group: string;
  date: string;
  count: string;
}

export default function NesList({}: NesListProps) {
  // table header
  const headers: TableHeader[] = useMemo(() => {
    return [
      {
        name: "NO",
        value: "no",
        width: "150px",
      },
      {
        name: "제목",
        value: "title",
        align: "left",
        accessFn: (tr: TableItemType) => {
          const today = moment(new Date()).format("YYYY-MM-DD");
          const week = moment(
            new Date().setDate(new Date().getDate() - 7)
          ).format("YYYY-MM-DD");
          const registDate = moment(tr.date).format("YYYY-MM-DD");

          return (
            <Link href={`/virtual/nt/nesList/${tr.no}`}>
              {tr.title}{" "}
              {week <= registDate && registDate <= today ? (
                <span className="ico_new_list"></span>
              ) : (
                <></>
              )}
            </Link>
          );
        },
      },
      {
        name: "담당부서",
        value: "group",
        width: "230px",
      },
      {
        name: "등록자",
        value: "name",
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
  const tabelItem: TableItemType[] = [
    {
      no: 1,
      title: "카드뮴화합물",
      name: "Barium",
      group: "123",
      date: "2020-12-12",
      count: "9",
    },
    {
      no: 2,
      title: "보도자료 제목2",
      name: "홍길동",
      group: "123",
      date: "2020-12-12",
      count: "123",
    },
  ];
  return (
    <div className={style.page_wrap}>
      <TableNotNesiList
        headers={headers}
        tabelItem={tabelItem}
        menuName="보도자료"
      />
    </div>
  );
}
