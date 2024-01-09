"use client";

import style from "./SmRndList.module.scss";
import { GrFormNext, GrHomeRounded } from "react-icons/gr";
import Link from "next/link";
import SearchBox from "@/components/common/SearchBox/SearchBox";
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
import { TablePageResponse } from "@/types/common/commonType";
import {
  SmtechResponse,
  SearchCrawlingCommand,
} from "@/types/nt/projectList/ProjectListType";
import { usePathname, useRouter } from "next/navigation";
import Chip from "@/components/common/Chip/Chip";
import { makeUrlQuery } from "@/utils/utils";

interface SmRndListClientProps {
  menuName: string;
  data: TablePageResponse<SmtechResponse[]>;
  queryInstance: SearchCrawlingCommand;
}

export default function SmRndListClient({
  menuName,
  data,
  queryInstance,
}: SmRndListClientProps) {
  const router = useRouter();
  const pathname = usePathname();

  // table header
  const headers: TableHeader[] = useMemo(() => {
    return [
      {
        name: "NO",
        value: "no",
        width: "120px",
      },
      {
        name: "사업명",
        value: "bizNm",
        width: "150px",
        accessFn: (tr: SmtechResponse) => {
          return <span>{tr.bizNm}</span>;
        },
      },
      {
        name: "공고명",
        value: "title",
        width: "450px",
        align: "left",
        accessFn: (tr: SmtechResponse) => {
          return (
            <Link href={`https://smtech.go.kr/${tr.titleHref}`} target="_blank">
              {tr.title}
            </Link>
          );
        },
      },
      {
        name: "접수시작",
        value: "rcptStartDt",
        width: "120px",
        accessFn: (item: SmtechResponse) => {
          return (
            <span>
              {item.rcptStartDt
                ? moment(item.rcptStartDt).format("YYYY-MM-DD")
                : ""}
            </span>
          );
        },
      },
      {
        name: "접수마감",
        value: "rcptEndDt",
        width: "120px",
        accessFn: (item: SmtechResponse) => {
          return (
            <span>
              {item.rcptEndDt
                ? moment(item.rcptEndDt).format("YYYY-MM-DD")
                : ""}
            </span>
          );
        },
      },
      {
        name: "접수상태",
        value: "rcptStatus",
        width: "120px",
        accessFn: (item: SmtechResponse) => {
          return (
            <div className={style.table_chip_wrap}>
              <Chip
                chipData={{
                  name: item.rcptStatus,
                  value: item.rcptStatus,
                  group: "",
                }}
                chipStyle={"rect"}
                color={
                  item.rcptStatus === "접수완료"
                    ? "var(--blue01)"
                    : "var(--gray-700)"
                }
                borderColor={
                  item.rcptStatus === "접수완료"
                    ? "var(--blue01)"
                    : "var(--gray-300)"
                }
              />
            </div>
          );
        },
      },
    ];
  }, []);

  const tableRef = useRef<HTMLTableElement>(null);

  // search input
  const [searchWord, setSearchWord] = useState<string>(
    queryInstance.searchKeyword ? queryInstance.searchKeyword : ""
  );

  const [searchInstance, setSearchInstance] =
    useState<SearchCrawlingCommand>(queryInstance);

  // print
  const onPrint = useReactToPrint({
    content: () => tableRef.current,
  });

  const applStatusSelectItems: commonSelectType[] = [
    {
      name: "전체",
      value: "ALL",
      group: "",
    },
    {
      name: "접수예정",
      value: "BEFORE",
      group: "",
    },
    {
      name: "접수중",
      value: "ONGOING",
      group: "",
    },
    {
      name: "접수완료",
      value: "DEADLINE",
      group: "",
    },
  ];

  return (
    <>
      <div className={style.page_wrap}>
        {/* table search */}
        <SearchBox>
          <div className={style.project_list_search_box}>
            <div className={style.common_select}>
              <p>접수상태</p>
              <div className={style.select}>
                <CommonSelect
                  items={applStatusSelectItems}
                  width="100%"
                  placeHolder="전체"
                  ariaLabel="접수상태 Select"
                  id="applStatus_select"
                  onValueChange={(
                    status: "BEFORE" | "ONGOING" | "DEADLINE" | "ALL"
                  ) => {
                    setSearchInstance((old: SearchCrawlingCommand) => {
                      let temp: SearchCrawlingCommand = { ...old };
                      temp.rcptStatus = status === "ALL" ? undefined : status;
                      return JSON.parse(JSON.stringify(temp));
                    });
                  }}
                  value={
                    searchInstance.rcptStatus
                      ? searchInstance.rcptStatus
                      : "ALL"
                  }
                />
              </div>
            </div>
            <div className={style.search_date}>
              <p className={style.mo_none}>기간</p>
              <p className={`${style.pc_none} ${style.mg_t10}`}>검색시작</p>
              <Input
                type={"date"}
                size={"md"}
                id={"startDate"}
                value={
                  searchInstance.rcptStartDt
                    ? moment(searchInstance.rcptStartDt).format("YYYY-MM-DD")
                    : ""
                }
                className={style.inp_date}
                onChange={(e: FormEvent<HTMLInputElement>) => {
                  const value = e.currentTarget.value;
                  setSearchInstance((old: SearchCrawlingCommand) => {
                    let temp = {
                      ...old,
                      rcptStartDt:
                        value !== "" ? moment(value).format("YYYYMMDD") : "",
                    };
                    return JSON.parse(JSON.stringify(temp));
                  });
                }}
              />
              <span className={style.mo_none}>~</span>
              <p className={`${style.pc_none} ${style.mg_t10}`}>검색종료</p>
              <Input
                type={"date"}
                size={"md"}
                id={"endDate"}
                value={
                  searchInstance.rcptEndDt
                    ? moment(searchInstance.rcptEndDt).format("YYYY-MM-DD")
                    : ""
                }
                className={style.inp_date}
                onChange={(e: FormEvent<HTMLInputElement>) => {
                  const value = e.currentTarget.value;
                  setSearchInstance((old: SearchCrawlingCommand) => {
                    let temp = {
                      ...old,
                      rcptEndDt:
                        value !== ""
                          ? moment(value).format("YYYYMMDD")
                          : undefined,
                    };
                    return JSON.parse(JSON.stringify(temp));
                  });
                }}
              />
            </div>

            <div className={style.search_word}>
              <p>검색어</p>
              <Input
                className={style.input_search}
                size={"md"}
                id={"search"}
                placeholder="검색어 입력"
                value={searchWord}
                onChange={(e: FormEvent<HTMLInputElement>) => {
                  const value = e.currentTarget.value;
                  setSearchWord(value);
                  setSearchInstance((old: SearchCrawlingCommand) => {
                    let temp: SearchCrawlingCommand = { ...old };
                    temp.searchKeyword = value === "" ? undefined : value;
                    return JSON.parse(JSON.stringify(temp));
                  });
                }}
              />
              <Button
                title={"검색"}
                btnColor={"black"}
                btnSize={"md"}
                btnStyle={"br_3"}
                onClick={() => {
                  router.push(
                    `/${
                      pathname?.includes("/virtual")
                        ? "virtual"
                        : "reusebattery"
                    }/nt/projectList/smRnd?${makeUrlQuery({
                      ...searchInstance,
                      page: 0,
                    })}`
                  );
                }}
              >
                검색
              </Button>
            </div>
          </div>
        </SearchBox>

        <TableTop countName="총" count={data ? data.totalElements : 0}>
          <Button
            title={"엑셀 다운"}
            btnColor={"white"}
            btnSize={"md"}
            btnStyle={"br_3"}
            //   style={{ width: "155px" }}
            onClick={() => {
              const excel_data = data.content.map((item: SmtechResponse) => {
                return {
                  no: String(item.no),
                  bizNm: item.bizNm,
                  title: item.title,
                  rcptStartDt: item.rcptStartDt,
                  rcptEndDt: item.rcptEndDt,
                  rcptStatus: item.rcptStatus,
                };
              });
              excel_data.unshift({
                no: "번호",
                bizNm: "사업명",
                title: "공고명",
                rcptStartDt: "접수시작일",
                rcptEndDt: "접수마감일",
                rcptStatus: "접수상태",
              });
              const xlsxData = utils.json_to_sheet(excel_data, {
                skipHeader: true,
              });
              xlsxData["!cols"] = [
                { wpx: 100 },
                { wpx: 336 },
                { wpx: 210 },
                { wpx: 210 },
                { wpx: 210 },
                { wpx: 210 },
              ];
              const wb = utils.book_new();
              utils.book_append_sheet(wb, xlsxData, "Data");
              writeFileXLSX(
                wb,
                `${menuName}_${moment().format("YYYY-MM-DD")}.xlsx`
              );
            }}
          >
            <RiFileExcel2Line role="img" aria-label="엑셀 아이콘" />
            <span className={style.mo_none}> 엑셀다운로드</span>
          </Button>
          <div className={style.mo_none}>
            <Button
              title={"프린트"}
              btnColor={"white"}
              btnSize={"md"}
              btnStyle={"br_3"}
              onClick={() => {
                onPrint();
              }}
              //   style={{ width: "114px" }}
            >
              <RiPrinterLine role="img" aria-label="프린트 아이콘" />
              프린트
            </Button>
          </div>
        </TableTop>
        <div style={{ overflowX: "auto" }}>
          {/* 테이블 */}
          <Table<SmtechResponse>
            data={data ? data.content : []}
            headers={headers}
            tableType={"vertical"}
            itemTitle={""}
            ref={tableRef}
            trHover={true}
            tableCaption=""
          />
        </div>
        <PagingComponent
          onClickEvent={(num: number) => {
            router.push(
              `/${
                pathname?.includes("/virtual") ? "virtual" : "reusebattery"
              }/nt/projectList/smRnd?${makeUrlQuery({
                ...queryInstance,
                page: num - 1,
              })}`
            );
          }}
          pagingData={{
            first: data ? data.first : true,
            last: data ? data.last : true,
            size: data ? data.size : 10,
            totalPages: data ? data.totalPages : 1,
            totalElements: data ? data.totalElements : 0,
            number: data ? data.number : 0,
          }}
        />
      </div>
    </>
  );
}
