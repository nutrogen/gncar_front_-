"use client";

import { useEffect, useRef, useState } from "react";
import Style from "./ExpertInfor.module.css";
import CommonSelect, {
  commonSelectType,
} from "@/components/common/CommonSelect/CommonSelect";
import ExcelUpload from "@/components/common/ExcelUpload/ExcelUpload";
import Input from "@/components/common/Input/Input";
import { Button } from "@/components/common/Button/Button";
import SearchBox from "@/components/common/SearchBox/SearchBox";
import TableTop from "@/components/common/TableTop/TableTop";
import moment from "moment";
import { utils, writeFileXLSX } from "xlsx";
import { RiFileExcel2Line, RiPrinterLine } from "react-icons/ri";
import Table, { TableHeader } from "@/components/common/Table/Table";
import { addrToArea, makeUrlQuery } from "@/utils/utils";
import Chip from "@/components/common/Chip/Chip";
import PagingComponent from "@/components/common/Paging/Paging";
import { useReactToPrint } from "react-to-print";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo } from "react";
import Link from "next/link";
import {
  CnstntInfoResponse,
  SearchCnstntInfoPageCommand,
} from "@/types/tn/techConsulAppliType";
import { TablePageResponse } from "@/types/common/commonType";
import { Item } from "@radix-ui/react-select";
import SpecialistRegisterServer from "@/app/virtual/(sub)/tn/speciaListAppli/SpecialListRegisterServer";
import { type } from "os";
import { CnstnStngResponse } from "@/types/portalCms/ts/techConsult/techConsultType";
import _ from "lodash";

interface ExpertInforClientProps {
  menuName: string;
  data: TablePageResponse<CnstntInfoResponse[]>;
  queryInstance: SearchCnstntInfoPageCommand;
}

export default function ExpertInforClient({
  menuName,
  data,
  queryInstance,
}: ExpertInforClientProps) {
  const router = useRouter();
  const [excelData, setExcelData] = useState<any[]>([]);

  const [selectMnfcPrcsEnu, setSelectMnfcPrcsEnu] = useState<
    "DESIGN" | "FBCTN" | "TEST_CERT"
  >();

  const [searchInstance, setSearchInstance] =
    useState<SearchCnstntInfoPageCommand>(queryInstance);

  const stateSelectItems: commonSelectType[] = [
    { name: "전체", value: "ALL", group: "" },
    {
      name: "신청",
      value: "APPLY",
      group: "",
    },
    {
      name: "승인",
      value: "APPROVAL",
      group: "",
    },
    {
      name: "반려",
      value: "REJECT ",
      group: "",
    },
  ];

  const [selectStatus, setSelectStatus] = useState<
    "ALL" | "APPLY" | "APPROVAL" | "REJECT"
  >(queryInstance.statusEnu ? queryInstance.statusEnu : "ALL");

  const [searchKeyword, setSearchKeyword] = useState<string>(
    queryInstance.searchKeyword
      ? decodeURIComponent(queryInstance.searchKeyword)
      : ""
  );

  const firstSelectBoxItems: commonSelectType[] = [
    {
      name: "설계",
      value: "DESIGN",
      group: "",
    },
    {
      name: "시제품",
      value: "FBCTN",
      group: "",
    },
    {
      name: "시험/평가/신뢰성/인증",
      value: "TEST_CERT",
      group: "",
    },
  ];

  const [selectSprtArtclEnu, setSelectSprtArtclEnu] = useState<
    | "DESIGN_1"
    | "DESIGN_2"
    | "DESIGN_3"
    | "DESIGN_4"
    | "DESIGN_5"
    | "DESIGN_6"
    | "DESIGN_7"
    | "FBCTN_1"
    | "FBCTN_2"
    | "FBCTN_3"
    | "FBCTN_4"
    | "FBCTN_5"
    | "FBCTN_6"
    | "FBCTN_7"
    | "TEST_CERT_1"
    | "TEST_CERT_2"
    | "TEST_CERT_3"
    | "TEST_CERT_4"
  >();

  // 1차 셀렉트 값과 2차 셀렉트 값을 별도로 담는다.
  interface selectChipType {
    firstSelectVal: "DESIGN" | "FBCTN" | "TEST_CERT";
    secondSelectVal:
      | "DESIGN_1"
      | "DESIGN_2"
      | "DESIGN_3"
      | "DESIGN_4"
      | "DESIGN_5"
      | "DESIGN_6"
      | "DESIGN_7"
      | "FBCTN_1"
      | "FBCTN_2"
      | "FBCTN_3"
      | "FBCTN_4"
      | "FBCTN_5"
      | "FBCTN_6"
      | "FBCTN_7"
      | "TEST_CERT_1"
      | "TEST_CERT_2"
      | "TEST_CERT_3"
      | "TEST_CERT_4";
  }

  const designItems: commonSelectType[] = [
    {
      name: "기술과제 협업/R&D 과제발굴 지원",
      value: "DESIGN_1",
      group: "",
    },
    {
      name: "구축된 장비와 연계된 기술개발 기획",
      value: "DESIGN_2",
      group: "",
    },
    {
      name: "설계 및 해석 기술지원",
      value: "DESIGN_3",
      group: "",
    },
    {
      name: "역설계",
      value: "DESIGN_4",
      group: "",
    },
    {
      name: "최적화 설계/설계기술지원",
      value: "DESIGN_5",
      group: "",
    },
    {
      name: "분석/평가 서비스",
      value: "DESIGN_6",
      group: "",
    },
    {
      name: "제조 공정 지원/공정 기술개발",
      value: "DESIGN_7",
      group: "",
    },
  ];

  const fbctnItems: commonSelectType[] = [
    {
      name: "기술개발 장비활용",
      value: "FBCTN_1",
      group: "",
    },
    {
      name: "설계부품가공",
      value: "FBCTN_2",
      group: "",
    },
    {
      name: "시제품 생산 지원 서비스",
      value: "FBCTN_3",
      group: "",
    },
    {
      name: "금형제작 기술지원",
      value: "FBCTN_4",
      group: "",
    },
    {
      name: "제조 자동화/공정기술 지원",
      value: "FBCTN_5",
      group: "",
    },
    {
      name: "초기 시제품 제작 및 분석지원",
      value: "FBCTN_6",
      group: "",
    },
    {
      name: "소프트웨어 기술지원",
      value: "FBCTN_7",
      group: "",
    },
  ];

  const testCertItems: commonSelectType[] = [
    {
      name: "시험/분석/평가/성능시험",
      value: "TEST_CERT_1",
      group: "",
    },
    {
      name: "내수/수명 예측",
      value: "TEST_CERT_2",
      group: "",
    },
    {
      name: "신뢰성/인증",
      value: "TEST_CERT_3",
      group: "",
    },
    {
      name: "결함분석",
      value: "TEST_CERT_4",
      group: "",
    },
  ];

  const [selectChipData, setSelectChipData] = useState<selectChipType[]>([]);

  const tableHeader: TableHeader[] = [
    {
      name: "번호",
      value: "rowId",
      width: "80px",
    },
    {
      name: "전문가",
      value: "cnstntNm",
      width: "200px",
      accessFn: (item: CnstntInfoResponse) => {
        return (
          <Link
            href={`/portalCms/ts/expertInfor/${item.cnstntInfoSeq}`}
            prefetch={false}
            title={`${item.cnstntNm}에 대한 전문가 상세 페이지 이동`}
          >
            <span>{item.cnstntNm}</span>
          </Link>
        );
      },
    },
    {
      name: "소속처",
      value: "ogdpNm",
      width: "303px",
      accessFn: (item: CnstntInfoResponse) => {
        return <span>{item.ogdpNm}</span>;
      },
    },
    // 마지막에 구현
    {
      name: "전문분야",
      value: "mnfcPrcsEnu,sprtArtclEnu ",
      width: "",
      accessFn: (item: CnstntInfoResponse) => {
        let string = "";
        item.cnstntStngList.map((ctItem: CnstnStngResponse, index: number) => {
          if (index !== 0) {
            string +=
              ", " + ctItem.mnfcPrcsEnu.name + " > " + ctItem.sprtArtclEnu.name;
          } else {
            string +=
              ctItem.mnfcPrcsEnu.name + " > " + ctItem.sprtArtclEnu.name;
          }
        });
        return <span className={Style.table_cnstn}>{string}</span>;
      },
    },
    {
      name: "연락처",
      value: "cnstntTelno",
      width: "200px",
      accessFn: (item: CnstntInfoResponse) => {
        return (
          <span>
            {item.cnstntTelno?.replace(/(\d{3})(\d{3,4})(\d{4})/, "$1-$2-$3")}
          </span>
        );
      },
    },
    {
      name: "이메일",
      value: "cnstntEmail",
      width: "250px",
      accessFn: (item: CnstntInfoResponse) => {
        return <span>{item.cnstntEmail || ""}</span>;
      },
    },
    {
      name: "진행상태",
      value: "statusEnu",
      width: "150px",
      accessFn: (item: CnstntInfoResponse) => {
        return (
          <div className={Style.table_chip_wrap}>
            {item.statusEnu ? (
              <Chip
                chipData={{
                  name: item.statusEnu.name,
                  value: item.statusEnu.type,
                  group: "",
                }}
                chipStyle={"rect"}
                color={
                  item.statusEnu.type === "APPLY"
                    ? "var(--green01)"
                    : "var(--gray-700)"
                }
                borderColor={
                  item.statusEnu.type === "APPLY"
                    ? "var(--green01)"
                    : "var(--gray-300)"
                }
              />
            ) : (
              <></>
            )}
          </div>
        );
      },
    },
  ];

  // {true ? <>데이터가 있는경우</> : <>데이터가 없는경우</>}
  // {true && <>데이터가 있는경우</>}
  // {true || ""}
  // const number3 = tableRef || "";
  const tableRef = useRef<HTMLTableElement>(null);

  const onPrint = useReactToPrint({
    content: () => tableRef.current,
  });

  return (
    <div className={Style.page_wrap}>
      <SearchBox>
        <div className={Style.ExpertInfor_search_box}>
          <div className={Style.search_item_gap}>
            <div className={Style.search_item_wrap}>
              <span className={Style.search_item_text}>진행상태</span>
              <CommonSelect
                items={stateSelectItems}
                width="200px"
                placeHolder="진행상태"
                ariaLabel="진행상태"
                id="state_select"
                value={selectStatus}
                onValueChange={(
                  status: "ALL" | "REJECT" | "APPLY" | "APPROVAL"
                ) => {
                  setSearchInstance((old) => {
                    if (status == "ALL") {
                      const copy = _.cloneDeep(old);
                      delete copy.statusEnu;
                      return copy;
                    } else {
                      return { ...old, statusEnu: status };
                    }
                  });
                  setSelectStatus(status);
                  // setSearchInstance((old: SearchCnstntInfoPageCommand) => {
                  //   let temp: SearchCnstntInfoPageCommand = { ...old };
                  //   temp.mnfcPrcsEnu = [
                  //     "ALL",
                  //     "APPLY",
                  //     "APPROVAL",
                  //   ].includes(status)
                  //     ? status
                  //     : old.mnfcPrcsEnu;
                  //   return temp;
                  // });
                  // setSelectMnfcPrcsEnu(status);
                  // setSelectSprtArtclEnu(undefined);
                }}
              />
            </div>
            <div className={Style.search_item_wrap}>
              <span className={Style.search_item_text}>검색어</span>
              <Input
                className={Style.input_search}
                size={"md"}
                id={"search"}
                placeholder="전문가/기관 검색어 입력"
                value={searchKeyword}
                onChange={(e: FormEvent<HTMLInputElement>) => {
                  const input = e.currentTarget.value;
                  setSearchKeyword(input);
                  setSearchInstance((old: SearchCnstntInfoPageCommand) => {
                    let temp: SearchCnstntInfoPageCommand = { ...old };
                    temp.searchKeyword = input === "" ? undefined : input;
                    return JSON.parse(JSON.stringify(temp));
                  });
                }}
              />
            </div>

            {/* 공정과정 */}
            <div className={Style.search_item_wrap}>
              <span className={Style.search_item_text}>공정과정</span>
              <CommonSelect
                items={firstSelectBoxItems}
                width="200px"
                placeHolder="설계"
                ariaLabel="공정과정"
                id="process_select"
                value={searchInstance.mnfcPrcsEnu}
                onValueChange={(status: "DESIGN" | "FBCTN" | "TEST_CERT") => {
                  setSearchInstance((old: SearchCnstntInfoPageCommand) => {
                    let temp: SearchCnstntInfoPageCommand = { ...old };
                    temp.mnfcPrcsEnu = [
                      "DESIGN",
                      "FBCTN",
                      "TEST_CERT",
                    ].includes(status)
                      ? status
                      : old.mnfcPrcsEnu;

                    return temp;
                  });
                  setSelectMnfcPrcsEnu(status);
                  setSelectSprtArtclEnu(undefined);
                }}
              />
            </div>

            {/* 항목선택 */}
            <div className={Style.search_item_wrap}>
              <span className={Style.search_item_text}>항목</span>
              <div className={Style.search_item_btn}>
                <CommonSelect
                  items={
                    searchInstance?.mnfcPrcsEnu === "DESIGN"
                      ? designItems
                      : searchInstance?.mnfcPrcsEnu === "FBCTN"
                        ? fbctnItems
                        : searchInstance?.mnfcPrcsEnu === "TEST_CERT"
                          ? testCertItems
                          : [...designItems, ...fbctnItems, ...testCertItems]
                  }
                  value={searchInstance.sprtArtclEnu}
                  onValueChange={(
                    e:
                      | "DESIGN_1"
                      | "DESIGN_2"
                      | "DESIGN_3"
                      | "DESIGN_4"
                      | "DESIGN_5"
                      | "DESIGN_6"
                      | "DESIGN_7"
                      | "FBCTN_1"
                      | "FBCTN_2"
                      | "FBCTN_3"
                      | "FBCTN_4"
                      | "FBCTN_5"
                      | "FBCTN_6"
                      | "FBCTN_7"
                      | "TEST_CERT_1"
                      | "TEST_CERT_2"
                      | "TEST_CERT_3"
                      | "TEST_CERT_4"
                  ) => {
                    setSelectSprtArtclEnu(e);
                    setSearchInstance((old) => {
                      return { ...old, sprtArtclEnu: e };
                    });
                  }}
                  width="200px"
                  placeHolder="분석/평가 서비스"
                  ariaLabel="항목"
                  id="list_select"
                />
              </div>

              <div className={Style.search_btn}>
                <Button
                  btnSize={"md"}
                  btnColor={"black"}
                  btnStyle={"br_3"}
                  title={"검색"}
                  onClick={() => {
                    router.push(
                      `/portalCms/ts/expertInfor?${makeUrlQuery({
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
          </div>
        </div>
      </SearchBox>

      <div className={Style.content_wrap}>
        {/* 테이블 탑 */}
        <TableTop countName="총" count={data ? data.totalElements : 0}>
          <ExcelUpload<any[]> setStateAction={setExcelData} />
          <Button
            title={"엑셀 다운"}
            btnColor={"white"}
            btnSize={"md"}
            btnStyle={"br_3"}
            className={Style.excel_btn}
            onClick={() => {
              const excel_data = data.content.map(
                (item: CnstntInfoResponse) => {
                  let string = "";
                  item.cnstntStngList.map(
                    (ctItem: CnstnStngResponse, index: number) => {
                      if (index !== 0) {
                        string +=
                          ", " +
                          ctItem.mnfcPrcsEnu.name +
                          " > " +
                          ctItem.sprtArtclEnu.name;
                      } else {
                        string +=
                          ctItem.mnfcPrcsEnu.name +
                          " > " +
                          ctItem.sprtArtclEnu.name;
                      }
                    }
                  );
                  return {
                    rowId: String(item.rowId),
                    cnstntNm: item.cnstntNm,
                    ogdpNm: item.ogdpNm,
                    cnstntList: string,
                    cnstntTelno: item.cnstntTelno,
                    cnstntEmail: item.cnstntEmail,
                    statusEnu: item.statusEnu?.name,
                  };
                }
              );
              excel_data.unshift({
                rowId: "번호",
                cnstntNm: "전문가",
                ogdpNm: "소속기관",
                cnstntList: "전문분야",
                cnstntTelno: "전화번호",
                cnstntEmail: "이메일",
                statusEnu: "상태",
              });
              const xlsxData = utils.json_to_sheet(excel_data, {
                skipHeader: true,
              });
              xlsxData["!cols"] = [
                { wpx: 80 },
                { wpx: 200 },
                { wpx: 303 },
                { wpx: 396 },
                { wpx: 200 },
                { wpx: 250 },
                { wpx: 150 },
              ];
              const wb = utils.book_new();
              utils.book_append_sheet(wb, xlsxData, "Data");
              writeFileXLSX(
                wb,
                `전문가관리_${moment().format("YYYY-MM-DD")}.xlsx`
              );
            }}
          >
            <RiFileExcel2Line role="img" aria-label="엑셀 아이콘" />
            엑셀다운로드
          </Button>
          <Button
            title={"프린트"}
            btnSize={"md"}
            btnColor={"white"}
            btnStyle={"br_3"}
            onClick={() => {
              onPrint();
            }}
            style={{ width: "114px" }}
            className={Style.print_btn}
          >
            <RiPrinterLine role="img" aria-label="프린트 아이콘" />
            프린트
          </Button>
          <Button
            btnSize={"md"}
            btnColor={"black"}
            btnStyle={"br_3"}
            title={"전문가등록"}
            className={Style.create_btn}
            onClick={() => {
              router.push("/portalCms/ts/expertInfor/register");
            }}
          >
            전문가 등록
          </Button>
        </TableTop>

        <div className={Style.table}>
          <Table<CnstntInfoResponse>
            data={data ? data.content : []}
            headers={tableHeader}
            tableType={"vertical"}
            itemTitle={""}
            ref={tableRef}
            trHover={true}
            tableCaption="전문가 목록"
          />
        </div>
        {/* 페이징 */}
        <PagingComponent
          onClickEvent={(num: number) => {
            router.push(
              `/portalCms/ts/expertInfor?${makeUrlQuery({
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

      {/* <div className={Style.btn_wrap}>
        <div className={Style.btn}>
          <Button
            btnSize={"md"}
            btnColor={"black"}
            btnStyle={"br_3"}
            title={"저장"}
          >
            저장
          </Button>
        </div>
      </div> */}
    </div>
  );
}
