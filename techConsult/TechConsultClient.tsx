"use client";

import { FormEvent, useRef, useState } from "react";
import Style from "./TechConsult.module.css";
import CommonSelect, {
  commonSelectType,
} from "@/components/common/CommonSelect/CommonSelect";
import Input from "@/components/common/Input/Input";
import { Button } from "@/components/common/Button/Button";
import SearchBox from "@/components/common/SearchBox/SearchBox";
import TableTop from "@/components/common/TableTop/TableTop";
import moment from "moment";
import { utils, writeFileXLSX } from "xlsx";
import { RiFileExcel2Line, RiPrinterLine } from "react-icons/ri";
import Table, { TableHeader } from "@/components/common/Table/Table";
import Chip from "@/components/common/Chip/Chip";
import PagingComponent from "@/components/common/Paging/Paging";
import { useReactToPrint } from "react-to-print";
import { usePathname, useRouter } from "next/navigation";
import { FiRefreshCcw } from "react-icons/fi";
import { CommonCheckBox } from "@/components/common/CommonCheckBox/CommonCheckBox";
import { HiOutlineX } from "react-icons/hi";
import Dialog from "@/components/common/Dialog/Dialog";
// import { User } from "next-auth";
import { User } from "@/pages/api/user";
import { makeUrlQuery } from "@/utils/utils";
import {
  SearchTechDscsnCommand,
  TechDscsnResponse,
  CnstntInfoResponse,
  CnstnStngResponse,
  SearchTechDscsnEmCommand,
} from "@/types/portalCms/ts/techConsult/techConsultType";
import { AuthListType } from "@/types/nextAuth/next-auth";
import { useTechDscsnList } from "@/hooks/portalCms/ts/usetechConsultList";
import { ApiResponse, TablePageResponse } from "@/types/common/commonType";
import { useAutoAlert } from "@/hooks/alert/useAutoAlert";
import _ from "lodash";
interface TechConsultProps {
  data: TablePageResponse<TechDscsnResponse[]>;
  queryInstance: SearchTechDscsnCommand | SearchTechDscsnEmCommand;
  user: User;
}

export default function TechConsultClient({
  data,
  queryInstance,
  user,
}: TechConsultProps) {
  const router = useRouter();
  const tableRef = useRef<HTMLTableElement>(null);

  // 상담 선택 시퀀스
  const [checkPrgrSeq, setCheckPrgrSeq] = useState<number | string>("");
  // 전문가 시퀀스
  const [checkExpert, setCheckExpert] = useState<number | string>("");

  const { setIsChange, setText, setStatus } = useAutoAlert();

  const [searchInstance, setSearchInstance] = useState<
    SearchTechDscsnCommand | SearchTechDscsnEmCommand
  >(queryInstance);

  const [showInformationDialog, setShowInformationDialog] =
    useState<boolean>(false);

  const [selectItem, setSelectItem] = useState<TechDscsnResponse | undefined>(
    undefined
  );

  // 전문가정보 불러오기 위한 요소
  const [selectMnfcPrcsEnu, setSelectMnfcPrcsEnu] = useState<string>("");
  const [selectTechDscsnSeq, setSelectTechDscsnSeq] = useState<string>("");

  // useQuery: 전문가정보 조회하기
  const techDscsnSeqList = useTechDscsnList(
    selectMnfcPrcsEnu,
    selectTechDscsnSeq
  );

  const onPrint = useReactToPrint({
    content: () => tableRef.current,
  });

  //신청기간
  function appliYear(startYear: number, endYear: number): commonSelectType[] {
    const yearArray: commonSelectType[] = [];

    for (let year = startYear; year <= endYear; year++) {
      yearArray.push({
        name: year.toString(),
        value: year.toString(),
        group: "",
      });
    }

    return yearArray;
  }

  const currentYear = new Date().getFullYear();
  const startYear = 2023;

  const yearsArray: commonSelectType[] = appliYear(startYear, currentYear);

  const selectInputRef = useRef(null);

  const onClearSelect = () => {
    if (selectInputRef.current) {
      selectInputRef.current;
    }
  };

  const [apiLoading, setApiLoading] = useState<boolean>(false);

  const tableHeader: TableHeader[] = [
    {
      name: "선택",
      value: "rowId",
      width: "5%",
      accessFn: (item: TechDscsnResponse) => {
        return (
          <div className={Style.table_check_box}>
            {item.prgrsSttsEnu && item.prgrsSttsEnu.type === "NOT_RECEIPT" ? (
              <CommonCheckBox
                id={item.rowId.toString()}
                checked={
                  // !!checkPrgrsSttsEnu.find(
                  //   (findItem: number) => findItem === item.techDscsnSeq
                  // )
                  checkPrgrSeq === item.techDscsnSeq
                }
                onClick={() => {}}
                onCheckedChange={(checkState) => {
                  if (checkState) {
                    setCheckPrgrSeq(item.techDscsnSeq);
                    setSelectItem(item);
                  } else {
                    setCheckPrgrSeq("");
                    setSelectMnfcPrcsEnu("");
                    setSelectTechDscsnSeq("");
                    setSelectItem(undefined);
                  }
                }}
                // onCheckedChange={(e: boolean) => {
                //   setCheckPrgrsSttsEnu((old: number[]) => {
                //     let temp: number[] = [...old];
                //     const findIndex = temp.findIndex(
                //       (findItem: number) => findItem === item.techDscsnSeq
                //     );
                //     if (findIndex === -1) {
                //       temp.push(item.techDscsnSeq);
                //     } else {
                //       temp.splice(findIndex, 1);
                //     }
                //     return temp;
                //   });

                //   if (e == true) {
                //     // 체크가됐을때 선택된 아이템이 뭔지?
                //     setSelectItem(item);
                //   } else {
                //     setSelectMnfcPrcsEnu("");
                //     setSelectTechDscsnSeq("");
                //     setSelectItem(undefined);
                //   }
                // }}
              />
            ) : (
              <></>
            )}
          </div>
        );
      },
    },
    {
      name: "공정과정",
      value: "mnfcPrcsEnu",
      width: "10%",
      accessFn: (item: TechDscsnResponse) => {
        return <span>{item.mnfcPrcsEnu.name}</span>;
      },
    },
    {
      name: "지원항목",
      value: "sprtArtclEnu",
      width: "15%",
      accessFn: (item: TechDscsnResponse) => {
        return <span>{item.sprtArtclEnu.name}</span>;
      },
    },
    {
      name: "신청자/기업",
      value: "userNm",
      width: "",
      accessFn: (item: TechDscsnResponse) => {
        return (
          <span>
            {item.userNm && item.entNm
              ? `${item.userNm}/${item.entNm.substring(0, 15)}`
              : ""}
          </span>
        );
      },
    },
    {
      name: "신청일",
      value: "dscsnYmd",
      width: "10%",
    },
    {
      name: "전문가",
      value: "cnstntNm",
      width: "7%",
    },
    {
      name: "전문가 연락처",
      value: "cnstntTelno",
      width: "13%",
      accessFn: (item: TechDscsnResponse) => {
        return (
          <span>
            {item.cnstntTelno?.replace(/(\d{3})(\d{3,4})(\d{4})/, "$1-$2-$3")}
          </span>
        );
      },
    },
    {
      name: "전문가 이메일",
      value: "cnstntEmail",
      width: "10%",
    },
    {
      name: "매칭상태",
      value: "prgrsSttsEnu",
      width: "5%",
      accessFn: (item: TechDscsnResponse) => {
        return (
          <div className={Style.table_chip_wrap}>
            <Chip
              chipData={{
                name:
                  item.prgrsSttsEnu.type === "NOT_RECEIPT"
                    ? "미접수"
                    : "매칭완료",
                value: item.prgrsSttsEnu.type,
                group: "",
              }}
              chipStyle={"rect"}
              color={
                item.prgrsSttsEnu.type === "NOT_RECEIPT"
                  ? "var(--green01)"
                  : "var(--gray-700)"
              }
              borderColor={
                item.prgrsSttsEnu.type === "NOT_RECEIPT"
                  ? "var(--green01)"
                  : "var(--gray-300)"
              }
            />
          </div>
        );
      },
    },
  ];

  /**
   *  매칭가능한 전문가 정보
   */
  const informationDetailTableHeader: TableHeader[] = [
    {
      name: "No.",
      value: "rowId",
      width: "80px",
      accessFn: (item: CnstntInfoResponse, idx: number) => {
        return (
          <div className={Style.table_check_box}>
            <CommonCheckBox
              id={`infomationDetailData_${idx}`}
              checked={
                // !!checkPrgrsSttsEnu.find(
                //   (findItem: number) => findItem === item.techDscsnSeq
                // )
                checkExpert === item.cnstntInfoSeq
              }
              onClick={() => {}}
              onCheckedChange={(checkState) => {
                if (checkState) {
                  setCheckExpert(item.cnstntInfoSeq);
                } else {
                  setCheckExpert("");
                }
              }}
              // onCheckedChange={(e: boolean) => {
              //   setCheckPrgrsSttsEnu((old: number[]) => {
              //     let temp: number[] = [...old];
              //     const findIndex = temp.findIndex(
              //       (findItem: number) => findItem === item.techDscsnSeq
              //     );
              //     if (findIndex === -1) {
              //       temp.push(item.techDscsnSeq);
              //     } else {
              //       temp.splice(findIndex, 1);
              //     }
              //     return temp;
              //   });
              // }}
            />
          </div>
        );
      },
    },
    {
      name: "전문가",
      value: "cnstntNm",
      width: "100px",
      accessFn: (field: CnstntInfoResponse) => {
        return <span className={Style.name_wrap}>{field.cnstntNm}</span>;
      },
    },
    {
      name: "기관",
      value: "ogdpNm",
      width: "150px",
    },
    {
      name: "전문분야",
      value: "cnstntStngList",
      width: "410px",
      accessFn: (field: CnstntInfoResponse) => {
        return (
          <div className={Style.table_wrap}>
            {field.cnstntStngList.map(
              (item: CnstnStngResponse, index: number) => {
                if (item.mnfcPrcsEnu && item.sprtArtclEnu) {
                  const displayText =
                    item.mnfcPrcsEnu.name + " > " + item.sprtArtclEnu.name;
                  if (field.cnstntStngList.length - 1 === index) {
                    return <span key={index}>{displayText}</span>;
                  } else {
                    return <span key={index}>{`${displayText} , `}</span>;
                  }
                } else {
                  return null;
                }
              }
            )}
          </div>
        );
      },
    },
  ];

  /**
   *  매칭상태
   */
  const prgrsSttsEnuSelectItems: commonSelectType[] = [
    {
      name: "전체",
      value: "ALL",
      group: "",
    },
    {
      name: "매칭완료",
      value: "MATCH_COMPLETED",
      group: "",
    },
    {
      name: "미접수",
      value: "NOT_MATCH",
      group: "",
    },
  ];
  /**
   *  공정과정
   */
  const mnfcPrcsEnuSelectItems: commonSelectType[] = [
    {
      name: "전체",
      value: "ALL",
      group: "",
    },
    {
      name: "설계",
      value: "DESIGN",
      group: "",
    },
    {
      name: "시제품제작",
      value: "FBCTN",
      group: "",
    },
    {
      name: "시험/평가/신뢰성/인증",
      value: "TEST_CERT",
      group: "",
    },
  ];
  /**
   * 지원항목 DESIGN
   */
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
  /**
   * 지원항목 FBCTN
   */
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
  /**
   * 지원항목 TEST_CERT
   */
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

  return (
    <div className={Style.page_wrap}>
      <SearchBox>
        <div className={Style.ExpertInfor_search_box}>
          <div className={Style.search_item_gap}>
            <div className={Style.search_item_wrap}>
              <span className={Style.search_item_text}>매칭상태</span>
              <CommonSelect
                items={prgrsSttsEnuSelectItems}
                width="100px"
                placeHolder={"전체"}
                ariaLabel="매칭상태 선택"
                id="prgrs_select"
                onValueChange={(
                  status: "ALL" | "MATCH_COMPLETED" | "NOT_MATCH"
                ) => {
                  setSearchInstance(
                    (
                      old: SearchTechDscsnCommand | SearchTechDscsnEmCommand
                    ) => {
                      let temp:
                        | SearchTechDscsnCommand
                        | SearchTechDscsnEmCommand = { ...old };
                      temp.matchStatusEnu =
                        status === "ALL" ? undefined : status;
                      return JSON.parse(JSON.stringify(temp));
                    }
                  );
                }}
                value={
                  !searchInstance.matchStatusEnu
                    ? ""
                    : searchInstance.matchStatusEnu
                }
              />
            </div>
            <div className={Style.search_item_wrap}>
              <span className={Style.search_item_text}>신청기간</span>
              <CommonSelect
                items={yearsArray}
                width="100px"
                placeHolder={`${currentYear}`}
                ariaLabel="해당연도 선택"
                id="year_select"
                value={
                  searchInstance.searchYear
                    ? searchInstance.searchYear.toString()
                    : ""
                }
                onValueChange={(e) => {
                  const copy = _.cloneDeep(searchInstance);
                  setSearchInstance({
                    ...copy,
                    searchYear: parseInt(e, 10),
                  });
                }}
              />
            </div>
            <div className={Style.search_item_wrap}>
              <span className={Style.search_item_text}>공정과정</span>
              <div className={Style.search_item_btn}>
                <CommonSelect
                  items={mnfcPrcsEnuSelectItems}
                  width="200px"
                  placeHolder="전체"
                  ariaLabel="공정과정선택"
                  id="process_select"
                  onValueChange={(
                    process: "ALL" | "DESIGN" | "FBCTN" | "TEST_CERT"
                  ) => {
                    setSearchInstance(
                      (
                        old: SearchTechDscsnCommand | SearchTechDscsnEmCommand
                      ) => {
                        let temp:
                          | SearchTechDscsnCommand
                          | SearchTechDscsnEmCommand = { ...old };
                        temp.mnfcPrcsEnu =
                          process === "ALL" ? undefined : process;
                        return JSON.parse(JSON.stringify(temp));
                      }
                    );
                  }}
                  value={
                    !searchInstance.mnfcPrcsEnu
                      ? ""
                      : searchInstance.mnfcPrcsEnu
                  }
                />
              </div>
            </div>

            <div className={Style.search_item_wrap}>
              <span className={Style.search_item_text}>지원항목</span>
              <div className={Style.search_item_btn}>
                <CommonSelect
                  items={
                    searchInstance?.mnfcPrcsEnu === "DESIGN"
                      ? [
                          { name: "전체", value: "ALL", group: "" },
                          ...designItems,
                        ]
                      : searchInstance?.mnfcPrcsEnu === "FBCTN"
                        ? [
                            { name: "전체", value: "ALL", group: "" },
                            ...fbctnItems,
                          ]
                        : searchInstance?.mnfcPrcsEnu === "TEST_CERT"
                          ? [
                              { name: "전체", value: "ALL", group: "" },
                              ...testCertItems,
                            ]
                          : [
                              { name: "전체", value: "ALL", group: "" },
                              ...designItems,
                              ...fbctnItems,
                              ...testCertItems,
                            ]
                  }
                  width="100%"
                  placeHolder="전체"
                  ariaLabel="지원항목 선택"
                  id="support_select"
                  value={
                    !searchInstance.sprtArtclEnu
                      ? ""
                      : searchInstance.sprtArtclEnu
                  }
                  onValueChange={(
                    process:
                      | "ALL"
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
                    setSearchInstance(
                      (
                        old: SearchTechDscsnCommand | SearchTechDscsnEmCommand
                      ) => {
                        let temp:
                          | SearchTechDscsnCommand
                          | SearchTechDscsnEmCommand = { ...old };
                        if (process === "ALL") {
                          temp.sprtArtclEnu = undefined;
                        } else {
                          temp.sprtArtclEnu = process;
                        }
                        return JSON.parse(JSON.stringify(temp));
                      }
                    );
                  }}
                />
              </div>
            </div>
            <div className={Style.search_btn_item}>
              <div className={Style.search_input_item}>
                <span className={Style.search_item_text}>신청기업</span>
                <div className={Style.search_input}>
                  <Input
                    size={"md"}
                    id={"search_input"}
                    placeholder={"기업명을 입력해주세요."}
                    labelTitle={"기업명 검색"}
                    value={
                      searchInstance.searchNm ? searchInstance.searchNm : ""
                    }
                    onChange={(e: FormEvent<HTMLInputElement>) => {
                      const value = e.currentTarget.value;
                      setSearchInstance(
                        (
                          old: SearchTechDscsnCommand | SearchTechDscsnEmCommand
                        ) => {
                          return { ...old, searchNm: value };
                        }
                      );
                    }}
                  />
                </div>
              </div>
              <div className={Style.search_btn}>
                <Button
                  btnSize={"md"}
                  btnColor={"black"}
                  btnStyle={"br_3"}
                  title={"검색"}
                  onClick={() => {
                    router.push(
                      `/portalCms/ts/techConsult?${makeUrlQuery({
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
            <button
              className={Style.reset_btn}
              ref={selectInputRef}
              onClick={() => {
                onClearSelect();
                setSearchInstance((old) => {
                  return {
                    orderBy: "desc",
                    page: 0,
                    size: 10,
                    sort: "seq",
                  };
                });
              }}
            >
              <FiRefreshCcw size={24} color={"var(--gray-700)"} />
              <span className={Style.reset_btn_text}>초기화</span>
            </button>
          </div>
        </div>
      </SearchBox>

      <div className={Style.content_wrap}>
        {/* 테이블 탑 */}
        <TableTop countName="총" count={data ? data.totalElements : 0}>
          <Button
            title={"엑셀 다운"}
            btnColor={"white"}
            btnSize={"md"}
            btnStyle={"br_3"}
            className={Style.excel_btn}
            onClick={() => {
              const excel_data = data.content.map((item: TechDscsnResponse) => {
                return {
                  rowId: String(item.rowId),
                  mnfcPrcsEnu: item.mnfcPrcsEnu.name,
                  sprtArtclEnu: item.sprtArtclEnu.name,
                  userNm: item.userNm,
                  dscsnYmd: item.dscsnYmd,
                  cnstntNm: item.cnstntNm,
                  cnstntTelno: item.cnstntTelno?.replace(
                    /(\d{3})(\d{3,4})(\d{4})/,
                    "$1-$2-$3"
                  ),
                  cnstntEmail: item.cnstntEmail,
                  prgrsSttsEnu:
                    item.prgrsSttsEnu.type === "NOT_RECEIPT"
                      ? "미접수"
                      : "매칭완료",
                };
              });
              excel_data.unshift({
                rowId: "선택",
                mnfcPrcsEnu: "공정과정",
                sprtArtclEnu: "지원항목",
                userNm: "신청자/기업",
                dscsnYmd: "신청일",
                cnstntNm: "전문가",
                cnstntTelno: "전문가 연락처",
                cnstntEmail: "전문가 이메일",
                prgrsSttsEnu: "매칭상태",
              });
              const xlsxData = utils.json_to_sheet(excel_data, {
                skipHeader: true,
              });
              xlsxData["!cols"] = [
                { wpx: 80 },
                { wpx: 150 },
                { wpx: 150 },
                { wpx: 396 },
                { wpx: 150 },
                { wpx: 120 },
                { wpx: 150 },
              ];
              const wb = utils.book_new();
              utils.book_append_sheet(wb, xlsxData, "Data");
              writeFileXLSX(
                wb,
                `기술상담 관리_${moment().format("YYYY-MM-DD")}.xlsx`
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
        </TableTop>

        <Table<TechDscsnResponse>
          data={data ? data.content : []}
          headers={tableHeader}
          tableType={"vertical"}
          itemTitle={""}
          ref={tableRef}
          tableCaption=""
        />

        {/* 페이징 */}
        <PagingComponent
          onClickEvent={(num: number) => {
            router.push(
              `/portalCms/ts/techConsult?${makeUrlQuery({
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
      <div className={Style.recent_btn}>
        <Dialog
          open={showInformationDialog}
          setOpen={setShowInformationDialog}
          openTriggerComponent={
            <Button
              btnSize={"md"}
              btnColor={"black"}
              btnStyle={"br_3"}
              title={"전문가 목록 접수"}
              style={{
                fontSize: "var(--fs-16)",
                lineHeight: "1.9rem",
                boxSizing: "border-box",
              }}
              onClick={(e) => {
                e.preventDefault();
                // if (checkPrgrsSttsEnu.length === 0) {
                if (checkPrgrSeq === "") {
                  setStatus("error");
                  setText("선택한 요청이 없습니다.");
                  setIsChange(true);
                } else {
                  setShowInformationDialog(true);
                  if (selectItem) {
                    setSelectMnfcPrcsEnu(selectItem.mnfcPrcsEnu.type);
                    setSelectTechDscsnSeq(selectItem.sprtArtclEnu.type);
                  }
                }
              }}
            >
              접수
            </Button>
          }
          title={"전문가 목록"}
          width={"1200px"}
          closeTriggerComponent={
            <HiOutlineX
              size={28}
              color={"var(--gray-700)"}
              role={"img"}
              aria-label="다이얼로그 닫기 아이콘"
            />
          }
        >
          {/* <Table<CnstntInfoResponse>
              data={techDscsnSeqList.data ? techDscsnSeqList.data : []}
              headers={informationTableHeader}
              tableType={"vertical"}
              itemTitle={""}
              ref={null}
              tableCaption=""
            /> */}
          <div className={Style.infor_table}>
            <table className={Style.infor_top_table}>
              <tbody>
                <tr>
                  <th className={Style.teble_header}>신청정보</th>
                  <td className={Style.table_td}>
                    {selectItem && selectItem.userNm ? selectItem.userNm : ""}/
                    {selectItem && selectItem.entNm ? selectItem.entNm : ""}
                  </td>

                  <th className={Style.teble_header}>공정과정</th>
                  <td className={Style.table_td}>
                    {selectItem && selectItem.mnfcPrcsEnu
                      ? selectItem.mnfcPrcsEnu.name
                      : ""}
                  </td>

                  <th className={Style.teble_header}>지원항목</th>
                  <td className={Style.table_td}>
                    {selectItem && selectItem.sprtArtclEnu
                      ? selectItem.sprtArtclEnu.name
                      : ""}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className={Style.second_table}>
              <Table<CnstntInfoResponse>
                data={techDscsnSeqList.data ? techDscsnSeqList.data : []}
                headers={informationDetailTableHeader}
                tableType={"vertical"}
                itemTitle={""}
                ref={null}
                tableCaption=""
              />
            </div>
          </div>

          <div className={Style.infor_btn}>
            <Button
              btnSize={"md"}
              btnColor={"black"}
              btnStyle={"br_3"}
              title={"전문가 선택"}
              style={{
                fontSize: "var(--fs-16)",
                lineHeight: "1.9rem",
                boxSizing: "border-box",
              }}
              onClick={() => {
                if (!apiLoading) {
                  if (checkExpert === 0) {
                    setStatus("error");
                    setText("선택한 요청이 없습니다.");
                    setIsChange(true);
                  } else {
                    setApiLoading(true);
                    // const postData: ModifyTechDscsnCommand[] =
                    //   checkSeqArr.map((item: number) => {
                    //     const target = data.content.find(
                    //       (findItem: TechDscsnResponse) =>
                    //         findItem.techDscsnSeq === item
                    //     )!;
                    //     return {
                    //       cnstntInfoSeq: target.techDscsnSeq,
                    //       joinProcessType: "DONE_RECEIPT",
                    //     };
                    //   });
                    const postData = {
                      techDscsnSeq: checkPrgrSeq,
                      cnstntInfoSeq: checkExpert,
                    };
                    {
                      user.authList.find(
                        (findItem: AuthListType) =>
                          findItem.authrtNm === "버추얼 일반관리자"
                      )
                        ? fetch(`/api/techDscsn/modifyTechDscsn`, {
                            method: "POST",
                            body: JSON.stringify(postData),
                          })
                            .then((res) => res.json())
                            .then((result: ApiResponse<null>) => {
                              if (result.code === "200") {
                                setApiLoading(false);
                                location.reload();
                              } else {
                                setStatus("error");
                                setText("선택한 요청이 없습니다.");
                                setIsChange(true);
                                setApiLoading(false);
                              }
                            })
                            .catch((e) => {
                              setApiLoading(false);
                            })
                        : fetch(`/api/techDscsn/modifyTechDscsnEm`, {
                            method: "POST",
                            body: JSON.stringify(postData),
                          })
                            .then((res) => res.json())
                            .then((result: ApiResponse<null>) => {
                              if (result.code === "200") {
                                setApiLoading(false);
                                location.reload();
                              } else {
                                setStatus("error");
                                setText("선택한 요청이 없습니다.");
                                setIsChange(true);
                                setApiLoading(false);
                              }
                            })
                            .catch((e) => {
                              setApiLoading(false);
                            });
                    }
                  }
                }
              }}
            >
              전문가선택
            </Button>
          </div>
        </Dialog>
      </div>
    </div>
  );
}
