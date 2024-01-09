"use client";

import style from "./ProjectList.module.scss";
import { GrFormNext, GrHomeRounded } from "react-icons/gr";
import Link from "next/link";
import SearchBox from "@/components/common/SearchBox/SearchBox";
import SearchBoxLine from "@/components/common/SearchBox/SearchBoxLine";
import DateInput from "@/components/common/DateInput/DateInput";
import Input from "@/components/common/Input/Input";
import { FormEvent, useMemo, useRef, useState } from "react";
import { Button } from "@/components/common/Button/Button";
import TableTop from "@/components/common/TableTop/TableTop";
import { RiFileExcel2Line, RiPrinterLine } from "react-icons/ri";
import Table, { TableHeader } from "@/components/common/Table/Table";
import { utils, writeFileXLSX } from "xlsx";
import moment from "moment";
import PagingComponent from "@/components/common/Paging/Paging";
import { useReactToPrint } from "react-to-print";
import CommonSelect, {
  commonSelectType,
} from "@/components/common/CommonSelect/CommonSelect";
import TableNotNesiList from "@/components/nt/TableNotNesiList";
import { head } from "lodash";

export interface TableItemType {
  no: number | string;
  title: string;
  applBeginDt: string;
  applEndDt: string;
  applStatus: string;
}

export default function KorAccsmntList() {
  // table haeder
  const headers: TableHeader[] = useMemo(() => {
    return [
      {
        name: "NO",
        value: "no",
        width: "150px",
      },
      {
        name: "공고명",
        value: "title",
        align: "left",
      },
      {
        name: "접수시작일",
        value: "applBeginDt",
        width: "150px",
      },
      {
        name: "접수마감일",
        value: "applEndDt",
        width: "150px",
      },
      {
        name: "접수상태",
        value: "applStatus",
        width: "150px",
      },
    ];
  }, []);

  const tableRef = useRef<HTMLTableElement>(null);

  // search input
  const [searchWord, setSearchWord] = useState<string>("");

  // print
  const onPrint = useReactToPrint({
    content: () => tableRef.current,
  });

  const applStatusSelectItems: commonSelectType[] = [
    {
      name: "전체",
      value: "All",
      group: "",
    },
    {
      name: "접수전",
      value: "beforeAppl",
      group: "",
    },
    {
      name: "접수중",
      value: "applIng",
      group: "",
    },
    {
      name: "접수마감",
      value: "applEnd",
      group: "",
    },
  ];

  {
    /* test 입력 데이타 */
  }

  const tableItem: TableItemType[] = [
    {
      no: 1,
      title: "Bakhmut Couldron",
      applBeginDt: "2021-08-14",
      applEndDt: "2022-04-23",
      applStatus: "접수 중",
    },
    {
      no: 2,
      title: "Operation Volkov",
      applBeginDt: "1897-01-06",
      applEndDt: "1942-02-16",
      applStatus: "접수 마감",
    },
    {
      no: 3,
      title: "아시아 경제포럼",
      applBeginDt: "1990-05-20",
      applEndDt: "1991-07-07",
      applStatus: "접수 시작",
    },
  ];

  return <>{/* html 이미지 삽입 예정 */}</>;
}
