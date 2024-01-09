"use client";

import style from "./NesiList.module.scss";
import { GrFormNext, GrHomeRounded } from "react-icons/gr";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Table, { TableHeader } from "@/components/common/Table/Table";
import TableNotNesiList from "@/components/nt/TableNotNesiList";
import moment from "moment";
import {
  MotieResponse,
  SearchBoardCrawlingCommand,
} from "@/types/nt/nesList/NesListType";
import { TablePageResponse } from "@/types/common/commonType";
import { QuerystringParser } from "formidable/parsers";
import { usePathname, useRouter } from "next/navigation";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/common/Button/Button";
import { makeUrlQuery } from "@/utils/utils";
import { utils, writeFileXLSX } from "xlsx";
import { RiFileExcel2Line, RiPrinterLine } from "react-icons/ri";
import PagingComponent from "@/components/common/Paging/Paging";
import SearchBox from "@/components/common/SearchBox/SearchBox";
import Input from "@/components/common/Input/Input";
import TableTop from "@/components/common/TableTop/TableTop";

interface MotieListProps {
  menuName: string;
  data: TablePageResponse<MotieResponse[]>;
  queryInstance: SearchBoardCrawlingCommand;
}

export default function MotieList({
  menuName,
  data,
  queryInstance,
}: MotieListProps) {
  const router = useRouter();
  const pathname = usePathname();

  const headers: TableHeader[] = useMemo(() => {
    return [
      {
        name: "NO",
        value: "no",
        width: "5%",
      },
      {
        name: "제목",
        value: "title",
        width: "35%",
        align: "left",
        accessFn: (item: MotieResponse) => {
          return (
            <Link
              href={`https://www.motie.go.kr/motie/ne/presse/press2/bbs/${item.titleHref}`}
              target="_blank"
            >
              {item.title}
            </Link>
          );
        },
      },
      {
        name: "담당부서",
        value: "tkcgDeptNm",
        width: "8%",
      },
      {
        name: "등록일",
        value: "boardRegDt",
        width: "8%",
        accessFn: (item: MotieResponse) => {
          return (
            <span>
              {item.boardRegDt
                ? moment(item.boardRegDt).format("YYYY-MM-DD")
                : ""}
            </span>
          );
        },
      },
      {
        name: "조회수",
        value: "intqCnt",
        width: "5%",
      },
      // 디자인팀의 요청으로 사용하지 않는 것으로 협의_20231220
      // {
      //   name: "첨부파일",
      //   value: "",
      //   width: "5%",
      // },
    ];
  }, []);

  const tableRef = useRef<HTMLTableElement>(null);

  // search Input
  const [searchWord, setSearchWord] = useState<string>(
    queryInstance.searchKeyword ? queryInstance.searchKeyword : ""
  );
  const [searchInstance, setSearchInstance] =
    useState<SearchBoardCrawlingCommand>(queryInstance);

  // print
  const onPrint = useReactToPrint({
    content: () => tableRef.current,
  });

  return (
    <>
      <div className={style.page_wrap}>
        {/* table search */}
        <SearchBox>
          <div className={style.nes_list_search_box}>
            <div className={style.search_date}>
              <p className={style.mo_none}>기간</p>
              <p className={style.pc_none}>검색시작</p>
              <Input
                type={"date"}
                size={"md"}
                id={"startDate"}
                value={
                  searchInstance.startYmd
                    ? moment(searchInstance.startYmd).format("YYYY-MM-DD")
                    : ""
                }
                className={style.inp_date}
                onChange={(e: FormEvent<HTMLInputElement>) => {
                  const value = e.currentTarget.value;
                  setSearchInstance((old: SearchBoardCrawlingCommand) => {
                    let temp = {
                      ...old,
                      startYmd:
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
                  searchInstance.endYmd
                    ? moment(searchInstance.endYmd).format("YYYY-MM-DD")
                    : ""
                }
                className={style.inp_date}
                onChange={(e: FormEvent<HTMLInputElement>) => {
                  const value = e.currentTarget.value;
                  setSearchInstance((old: SearchBoardCrawlingCommand) => {
                    let temp = {
                      ...old,
                      endYmd:
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
                  setSearchInstance((old: SearchBoardCrawlingCommand) => {
                    let temp: SearchBoardCrawlingCommand = { ...old };
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
                    }/nt/nesList/motie?${makeUrlQuery({
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
            //style={{ width: "155px" }}
            onClick={() => {
              const excel_data = data.content.map((item: MotieResponse) => {
                return {
                  no: String(item.no),
                  title: item.title,
                  tkcgDeptNm: item.tkcgDeptNm,
                  boardRegDt: item.boardRegDt,
                  intqCnt: item.intqCnt,
                };
              });
              // 아래 문의할 것
              excel_data.unshift({
                no: "번호",
                title: "제목",
                tkcgDeptNm: "담당부서",
                boardRegDt: "등록일",
                intqCnt: 0,
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
            <span className={style.mo_none}>엑셀다운로드</span>
          </Button>
          <span className={style.mo_none}>
            <Button
              title={"프린트"}
              btnColor={"white"}
              btnSize={"md"}
              btnStyle={"br_3"}
              onClick={() => {
                onPrint();
              }}
              style={{ width: "114px" }}
            >
              <RiPrinterLine role="img" aria-label="프린트 아이콘" />
              프린트
            </Button>
          </span>
        </TableTop>

        {/* table */}
        <Table<MotieResponse>
          data={data ? data.content : []}
          headers={headers}
          tableType={"vertical"}
          itemTitle={""}
          ref={tableRef}
          trHover={true}
          tableCaption=""
        />
        <PagingComponent
          onClickEvent={(num: number) => {
            router.push(
              `/${
                pathname?.includes("/virtual") ? "virtual" : "reusebattery"
              }/nt/nesList/motie?${makeUrlQuery({
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
