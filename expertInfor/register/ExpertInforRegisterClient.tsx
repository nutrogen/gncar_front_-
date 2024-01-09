"use client";

import { useRef, useState, FormEvent, useEffect, useMemo } from "react";
import Style from "../ExpertInforRegister.module.css";
import Input from "@/components/common/Input/Input";
import { Button } from "@/components/common/Button/Button";
import FileInput from "@/components/common/FileInput/FileInput";
import CommonSelect, {
  commonSelectType,
} from "@/components/common/CommonSelect/CommonSelect";
import Chip from "@/components/common/Chip/Chip";
import { FiRefreshCcw, FiX } from "react-icons/fi";
import _, { cloneDeep, split } from "lodash";
import { RiSearchLine } from "react-icons/ri";
import { useRouter } from "next/navigation";
import moment from "moment";
import { User } from "next-auth";
import { useAutoAlert } from "@/hooks/alert/useAutoAlert";
import { useCnstntInfoPage } from "@/hooks/tn/useTechConsulAppliList";
import { useSpecialInfoPage } from "@/hooks/tn/useSpecialistRegister";
import {
  ApiResponse,
  AttachFile,
  InputErrorMsgType,
  TablePageResponse,
} from "@/types/common/commonType";
import { useMemberChangeLogList } from "@/hooks/portalCms/mb/useMemberChangeLogList";
import AgreementCheck from "@/components/lg/mbjoin/AgreementCheck/AgreementCheck";
import {
  RegisterCnstntInfoAdminCommand,
  CnstntInfoDtlResponse,
  CnstnHistoryResponse,
  CnstntStngResponse,
} from "@/types/portalCms/ts/techConsult/techConsultType";
import { headers } from "next/headers";
import Table, { TableHeader } from "@/components/common/Table/Table";
import TableTop from "@/components/common/TableTop/TableTop";
import {
  returnEmailEffectivenessMsg,
  returnPhoneEffectivenessMsg,
} from "@/utils/component/common/Input/input";

interface ExpertRegisterProps {
  menuName: string;
}

interface NumFile {
  fileNumber: number;
  fileList: FileList;
}

export default function ExportInforRegisterClient({
  menuName,
}: ExpertRegisterProps) {
  const tableRef = useRef<HTMLTableElement>(null);
  const fileInputRef1 = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);
  const fileInputRef3 = useRef<HTMLInputElement>(null);
  const fileInputRef4 = useRef<HTMLInputElement>(null);
  const fileInputRefList = useRef<HTMLInputElement[]>(null);
  const router = useRouter();

  const [attachFile, setAttachFile] = useState<NumFile[]>([]);
  const [firstSelectBoxValue, setFirstSelectBoxValue] =
    useState<RegisterCnstntInfoAdminCommand>();
  const [arrayForFirstSelectBox, setArrayForFirstSelectBox] = useState([]);
  const { setIsChange, setText, setStatus } = useAutoAlert();

  interface ExpertInforRegisterType {
    no: number;
    process: string;
    support: string;
    person: string;
    date: string;
    status: string;
  }

  // 임시 테이블 데이터
  const tableHeader: TableHeader[] = [
    {
      name: "번호",
      value: "no",
      width: "80px",
    },
    {
      name: "공정과정",
      value: "process",
      width: "",
    },
    {
      name: "지원항목",
      value: "support",
      width: "",
    },
    {
      name: "신청자/기업",
      value: "person",
      width: "",
    },
    {
      name: "신청일",
      value: "date",
      width: "",
    },
    {
      name: "진행상태",
      value: "status",
      accessFn: (item: ExpertInforRegisterType) => {
        return (
          <div className={Style.table_chip_wrap}>
            <Chip
              chipData={{
                name: item.status === "NOT_RECEIVE" ? "미접수" : "매칭완료",
                value: item.status,
                group: "",
              }}
              chipStyle={"rect"}
              color={
                item.status === "NOT_RECEIVE"
                  ? "var(--green01)"
                  : "var(--gray-700)"
              }
              borderColor={
                item.status === "NOT_RECEIVE"
                  ? "var(--green01)"
                  : "var(--gray-300)"
              }
            />
          </div>
        );
      },
      width: "",
    },
  ];

  const tempData: ExpertInforRegisterType[] = [
    {
      no: 1,
      process: "시제품제작",
      support: "설계/부품가공",
      person: "A",
      date: "YYYY-MM-DD",
      status: "NOT_RECEIVE",
    },
    {
      no: 2,
      process: "설계",
      support: "분석/평가서비스",
      person: "A",
      date: "YYYY-MM-DD",
      status: "매칭완료",
    },
  ];

  const [expertInfoRegister, setExpertInfoRegister] =
    useState<RegisterCnstntInfoAdminCommand>({
      cnstntNm: "",
      cnstntBrdt: "",
      cnstntSchl: "",
      cnstntMjr: "",
      cnstntTelno: "",
      cnstntEmail: "",
      ogdpNm: "",
      jbps: "",
      stngList: [],
    });

  const [selectMnfcPrcsEnu, setSelectMnfcPrcsEnu] = useState<
    "ALL" | "DESIGN" | "FBCTN" | "TEST_CERT"
  >("ALL");

  const [selectSprtArtclEnu, setSelectSprtArtclEnu] = useState<
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
  >("ALL");

  interface selectChipType {
    firstSelectVal: "ALL" | "DESIGN" | "FBCTN" | "TEST_CERT";
    secondSelectVal:
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
      | "TEST_CERT_4";
  }

  const [selectChipData, setSelectChipData] = useState<selectChipType[]>([]);

  const [searchMnfcPrcsEnu, setSearchMnfcPrcsEnu] =
    useState<CnstntInfoDtlResponse>({} as CnstntInfoDtlResponse);

  const selectMnfcPrcsEnuAll = (items: commonSelectType[]) => {
    const allButton: commonSelectType = {
      name: "전체",
      value: "ALL",
      group: "",
    };
    return [allButton, ...items];
  };

  const firstSelectBoxItems: commonSelectType[] = [
    // {
    //   name: "전체",
    //   value: "ALL",
    //   group: "",
    // },
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

  useEffect(() => {
    const list: any[] = selectChipData.map((chip) => {
      return {
        mnfcPrcsEnu: chip.firstSelectVal,
        sprtArtclEnu: chip.secondSelectVal,
      };
    });
    setExpertInfoRegister((old) => {
      return { ...old, stngList: list };
    });
  }, [selectChipData]);
  // 유효성 검사: 이메일 확인
  const [emailEffectivenessMsg, setEmailEffectivenessMsg] =
    useState<InputErrorMsgType>({
      isSuccess: true,
      msg: "",
    });
  // 유효성 검사: 휴대전화 확인
  const [phoneEffectivenessMsg, setPhoneEffectivenessMsg] =
    useState<InputErrorMsgType>({
      isSuccess: true,
      msg: "",
    });
  return (
    <div className={Style.page_wrap}>
      <span className={Style.input_name}>전문가 정보</span>
      <div className={Style.content_wrap}>
        <div className={Style.content_inner_wrap}>
          {/* 이름 */}
          <div className={Style.form_border_item}>
            <div className={Style.form_input_item}>
              <span className={Style.form_input_text}>
                이름<span className="essential">*</span>
              </span>
              <Input
                size={"lg"}
                id={"name_input"}
                value={expertInfoRegister.cnstntNm}
                labelTitle={"이름"}
                placeholder={"이름 입력"}
                onChange={(e: FormEvent<HTMLInputElement>) => {
                  const copy = _.cloneDeep(expertInfoRegister);
                  setExpertInfoRegister({
                    ...copy,
                    cnstntNm: e.currentTarget.value,
                  });
                }}
              />
            </div>

            {/* 생년월일 */}
            <div className={Style.form_input_item}>
              <span className={Style.form_input_text}>
                생년월일<span className="essential">*</span>
              </span>
              <Input
                size={"lg"}
                id={"dob_input"}
                value={moment(expertInfoRegister.cnstntBrdt).format(
                  "YYYY-MM-DD"
                )}
                labelTitle={"생년월일"}
                placeholder={"YYYY-MM-DD"}
                type={"date"}
                onChange={(e: FormEvent<HTMLInputElement>) => {
                  const copy = _.cloneDeep(expertInfoRegister);
                  setExpertInfoRegister({
                    ...copy,
                    cnstntBrdt: moment(e.currentTarget.value).format(
                      "YYYYMMDD"
                    ),
                  });
                }}
              />
            </div>
          </div>

          {/* 출신학교 */}
          <div className={Style.form_border_item}>
            <div className={Style.form_input_item}>
              <span className={Style.form_input_text}>
                출신학교<span className="essential">*</span>
              </span>
              <Input
                size={"lg"}
                id={"shcool_input"}
                value={expertInfoRegister.cnstntSchl}
                labelTitle={"출신학교"}
                placeholder={"학교명 입력"}
                onChange={(e: FormEvent<HTMLInputElement>) => {
                  const copy = _.cloneDeep(expertInfoRegister);
                  setExpertInfoRegister({
                    ...copy,
                    cnstntSchl: e.currentTarget.value,
                  });
                }}
              />
            </div>

            {/* 전공 */}
            <div className={Style.form_input_item}>
              <span className={Style.form_input_text}>
                전공<span className="essential">*</span>
              </span>
              <Input
                size={"lg"}
                id={"major_input"}
                value={expertInfoRegister.cnstntMjr}
                labelTitle={"전공"}
                placeholder={"전공 입력"}
                onChange={(e: FormEvent<HTMLInputElement>) => {
                  const copy = _.cloneDeep(expertInfoRegister);
                  setExpertInfoRegister({
                    ...copy,
                    cnstntMjr: e.currentTarget.value,
                  });
                }}
              />
            </div>
          </div>

          <div className={Style.form_border_item}>
            {/* 소속기관 */}
            <div className={Style.form_input_item}>
              <span className={Style.form_input_text}>
                소속기관<span className="essential">*</span>
              </span>
              <Input
                size={"lg"}
                id={"curInsti_input"}
                value={expertInfoRegister.ogdpNm}
                labelTitle={"소속기관"}
                placeholder={"기관명을 입력해주세요."}
                onChange={(e: FormEvent<HTMLInputElement>) => {
                  const copy = _.cloneDeep(expertInfoRegister);
                  setExpertInfoRegister({
                    ...copy,
                    ogdpNm: e.currentTarget.value,
                  });
                }}
              />
            </div>
            {/* 직위 */}
            <div className={Style.form_input_item}>
              <span className={Style.form_input_text}>
                직위<span className="essential">*</span>
              </span>
              <Input
                size={"lg"}
                id={"curInsti_input"}
                value={expertInfoRegister.jbps}
                labelTitle={"직위"}
                placeholder={"직위를 입력해주세요."}
                onChange={(e: FormEvent<HTMLInputElement>) => {
                  const copy = _.cloneDeep(expertInfoRegister);
                  setExpertInfoRegister({
                    ...copy,
                    jbps: e.currentTarget.value,
                  });
                }}
              />
            </div>
          </div>
          {/* 연락처 */}
          <div className={Style.form_border_item}>
            <div className={Style.form_input_item}>
              <span className={Style.form_input_text}>
                휴대전화<span className="essential">*</span>
              </span>
              <Input
                size={"lg"}
                id={"mobile_input"}
                value={expertInfoRegister.cnstntTelno.replace(
                  /(\d{3})(\d{3,4})(\d{4})/,
                  "$1-$2-$3"
                )}
                labelTitle={"휴대전화"}
                placeholder={"휴대전화번호 입력"}
                onChange={(e: FormEvent<HTMLInputElement>) => {
                  const copy = _.cloneDeep(expertInfoRegister);
                  setExpertInfoRegister({
                    ...copy,
                    cnstntTelno: e.currentTarget.value
                      .replace(/-/g, "")
                      .replace(/[^0-9]/g, ""),
                  });
                  setPhoneEffectivenessMsg(
                    returnPhoneEffectivenessMsg(
                      e.currentTarget.value
                        .replace(/-/g, "")
                        .replace(/[^0-9]/g, "")
                    )
                  );
                }}
                effectivenessMsg={phoneEffectivenessMsg}
              />
            </div>

            {/* 이메일 */}
            <div className={Style.form_input_item}>
              <span className={Style.form_input_text}>
                이메일<span className="essential">*</span>
              </span>
              <Input
                size={"lg"}
                id={"email_input"}
                value={expertInfoRegister.cnstntEmail}
                labelTitle={"이메일"}
                placeholder={"이메일 입력"}
                onChange={(e: FormEvent<HTMLInputElement>) => {
                  const copy = _.cloneDeep(expertInfoRegister);
                  setExpertInfoRegister({
                    ...copy,
                    cnstntEmail: e.currentTarget.value,
                  });
                  setEmailEffectivenessMsg(
                    returnEmailEffectivenessMsg(e.currentTarget.value)
                  );
                }}
                effectivenessMsg={emailEffectivenessMsg}
              />
            </div>
          </div>

          {/* 전문분야 */}
          <div className={Style.form_input_item}>
            <span className={Style.form_input_text}>
              전문분야<span className="essential">*</span>
            </span>
            <div className={Style.setting_select_wrap}>
              {/* 공정과정선택 */}
              <div className={Style.setting_select}>
                <CommonSelect
                  items={firstSelectBoxItems}
                  width={"100%"}
                  placeHolder={"공정과정선택"}
                  ariaLabel={"공정과정"}
                  id={"setting_select_process"}
                  size={"lg"}
                  value={selectMnfcPrcsEnu === "ALL" ? "" : selectMnfcPrcsEnu}
                  onValueChange={(
                    status: "ALL" | "DESIGN" | "FBCTN" | "TEST_CERT"
                  ) => {
                    setSelectMnfcPrcsEnu(status);
                    setSelectSprtArtclEnu("ALL");
                    //setSelectSprtArtclEnu(undefined);
                  }}
                />
              </div>

              {/* 항목선택 */}
              <div className={Style.setting_select}>
                <CommonSelect
                  items={
                    selectMnfcPrcsEnu === "ALL"
                      ? []
                      : selectMnfcPrcsEnu === "DESIGN"
                        ? designItems
                        : selectMnfcPrcsEnu === "FBCTN"
                          ? fbctnItems
                          : selectMnfcPrcsEnu === "TEST_CERT"
                            ? testCertItems
                            : [...designItems, ...fbctnItems, ...testCertItems]
                  }
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
                    //console.log(e);
                  }}
                  value={selectSprtArtclEnu === "ALL" ? "" : selectSprtArtclEnu}
                  width={"100%"}
                  placeHolder={"항목선택"}
                  ariaLabel={"항목"}
                  id={"setting_select_list"}
                  size={"lg"}
                />
              </div>

              {/* 등록 */}
              <div className={Style.setting_register_btn}>
                <Button
                  btnSize={"lg"}
                  btnColor={"black"}
                  btnStyle={"br_3"}
                  title={"등록"}
                  onClick={() => {
                    if (
                      selectMnfcPrcsEnu &&
                      selectSprtArtclEnu &&
                      selectMnfcPrcsEnu !== "ALL" &&
                      selectSprtArtclEnu !== "ALL"
                    ) {
                      if (
                        selectChipData.some(
                          (chip) => chip.secondSelectVal === selectSprtArtclEnu
                        )
                      ) {
                      } else {
                        setSelectChipData((old) => {
                          return [
                            ...old,
                            {
                              firstSelectVal: selectMnfcPrcsEnu,
                              secondSelectVal: selectSprtArtclEnu,
                            },
                          ];
                        });
                      }
                    } else {
                      setText("전문분야와 항목을 모두 선택해주세요.");
                      setStatus("error");
                      setIsChange(true);
                    }
                  }}
                >
                  등록
                </Button>
              </div>
            </div>
            <div className={Style.setting_chip_wrap}>
              {selectChipData.map((item: selectChipType, index: number) => {
                return (
                  <div key={index}>
                    <Chip
                      group={
                        selectMnfcPrcsEnu === "ALL"
                          ? "전체"
                          : selectMnfcPrcsEnu === "DESIGN"
                            ? "설계"
                            : selectMnfcPrcsEnu === "FBCTN"
                              ? "시제품제작"
                              : selectMnfcPrcsEnu === "TEST_CERT"
                                ? "시험/평가/신뢰성/인증"
                                : ""
                      }
                      chipData={{
                        name: String(
                          [
                            ...designItems,
                            ...fbctnItems,
                            ...testCertItems,
                          ].find(
                            (select) => select.value === item.secondSelectVal
                          )?.name
                        ),
                        value: item.secondSelectVal,
                        group: item.firstSelectVal,
                      }}
                      chipStyle={"round"}
                      color={"--gray-700"}
                      borderColor={"var(--gray-300)"}
                      chipRightIcon={<FiX size={20} color={"--gray-700"} />}
                      iconClickButtonTitle={"삭제"}
                      iconClick={(e) => {
                        const filteredFromChipList = selectChipData.filter(
                          (item) => {
                            return item.secondSelectVal !== e.value;
                          }
                        );
                        setSelectChipData(filteredFromChipList);
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* 제출서류 */}
          <div className={Style.form_input_item}>
            <span className={Style.form_input_text}>제출서류</span>
            <div className={Style.form_file_item}>
              <span className={Style.form_input_text}>재직증명서</span>

              <FileInput
                size="sm"
                id={"admin_enter_docu"}
                onFile={(e: FileList) => {
                  setAttachFile((old) => {
                    if (e.length == 1) {
                      if (old.some((item) => item?.fileNumber == 0)) {
                        const filter = old.filter(
                          (item) => item.fileNumber !== 0
                        );
                        return [...filter, { fileNumber: 0, fileList: e }];
                      } else {
                        return [...old, { fileNumber: 0, fileList: e }];
                      }
                    } else {
                      const filter = _.cloneDeep(attachFile).filter(
                        (file) => file.fileNumber !== 0
                      );
                      return filter;
                    }
                  });
                }}
                onDelete={() => {}}
                compName={""}
                ref={fileInputRef1}
                isAvailableDeleteFile
              />
              <span className={Style.form_input_text}>경력증명서</span>

              <FileInput
                size="sm"
                id={""}
                onFile={(e: FileList) => {
                  setAttachFile((old) => {
                    if (e.length == 1) {
                      if (old.some((item) => item?.fileNumber == 1)) {
                        const filter = old.filter(
                          (item) => item.fileNumber !== 1
                        );
                        return [...filter, { fileNumber: 1, fileList: e }];
                      } else {
                        return [...old, { fileNumber: 1, fileList: e }];
                      }
                    } else {
                      const filter = _.cloneDeep(attachFile).filter(
                        (file) => file.fileNumber !== 1
                      );
                      return filter;
                    }
                  });
                }}
                onDelete={() => {}}
                compName={""}
                ref={fileInputRef2}
                isAvailableDeleteFile
              />

              <span className={Style.form_input_text}>4대보험 가입증명서</span>

              <FileInput
                size="sm"
                id={""}
                onFile={(e: FileList) => {
                  setAttachFile((old) => {
                    if (e.length == 1) {
                      if (old.some((item) => item?.fileNumber == 2)) {
                        const filter = old.filter(
                          (item) => item.fileNumber !== 2
                        );
                        return [...filter, { fileNumber: 2, fileList: e }];
                      } else {
                        return [...old, { fileNumber: 2, fileList: e }];
                      }
                    } else {
                      const filter = _.cloneDeep(attachFile).filter(
                        (file) => file.fileNumber !== 2
                      );
                      return filter;
                    }
                  });
                }}
                onDelete={() => {}}
                compName={""}
                ref={fileInputRef3}
                isAvailableDeleteFile
              />

              <span className={Style.form_input_text}>학위증명서</span>

              <FileInput
                size="sm"
                id={""}
                onFile={(e: FileList) => {
                  setAttachFile((old) => {
                    if (e.length == 1) {
                      if (old.some((item) => item?.fileNumber == 3)) {
                        const filter = old.filter(
                          (item) => item.fileNumber !== 3
                        );
                        return [...filter, { fileNumber: 3, fileList: e }];
                      } else {
                        return [...old, { fileNumber: 3, fileList: e }];
                      }
                    } else {
                      const filter = _.cloneDeep(attachFile).filter(
                        (file) => file.fileNumber !== 3
                      );
                      return filter;
                    }
                  });
                }}
                onDelete={() => {}}
                compName={""}
                ref={fileInputRef4}
                isAvailableDeleteFile
              />
            </div>
          </div>
        </div>
      </div>
      <p style={{ marginTop: "10px" }}>
        * 업로드 파일 유형 : jpg, jpeg, png, gif, hwp, pdf, zip, ppt, pptx, doc,
        xls, xlsx / 파일 용량 제한: 10 MB
      </p>
      <p className={Style.essential_des} style={{ margin: "10px 0 0 0" }}>
        <span className="essential" style={{ margin: "0" }}>
          *
        </span>{" "}
        표시는 필수입력 항목입니다.
      </p>
      <div className={Style.btn_wrap}>
        <div className={Style.btn}>
          <Button
            btnSize={"md"}
            btnColor={"white"}
            btnStyle={"br_3"}
            title={"목록"}
            onClick={() => {
              router.push("/portalCms/ts/expertInfor");
            }}
          >
            목록
          </Button>
        </div>
        <div className={Style.btn}>
          <Button
            btnSize={"md"}
            btnColor={"black"}
            btnStyle={"br_3"}
            title={"승인"}
            onClick={() => {
              const fileNameArr = attachFile.map(
                (item) => item.fileList[0].name
              );
              const uniq = _.uniq(fileNameArr);

              if (
                expertInfoRegister.cnstntNm === "" ||
                expertInfoRegister.cnstntBrdt === "" ||
                expertInfoRegister.cnstntSchl === "" ||
                expertInfoRegister.cnstntMjr === "" ||
                expertInfoRegister.ogdpNm === "" ||
                expertInfoRegister.cnstntTelno === "" ||
                expertInfoRegister.cnstntEmail === "" ||
                expertInfoRegister.jbps === "" ||
                expertInfoRegister.stngList.length === 0
              ) {
                setText("입력되지 않은 항목이 있습니다.");
                setStatus("error");
                setIsChange(true);
              } else if (!phoneEffectivenessMsg.isSuccess) {
                setText(phoneEffectivenessMsg.msg);
                setStatus("error");
                setIsChange(true);
              } else if (!emailEffectivenessMsg.isSuccess) {
                setText(emailEffectivenessMsg.msg);
                setStatus("error");
                setIsChange(true);
              } else if (uniq.length !== attachFile.length) {
                setStatus("error");
                setIsChange(true);
                setText("제출서류 중 중복되는 파일명이 있습니다.");
              } else {
                let fileList: AttachFile[] = [];
                const formData = new FormData();

                if (attachFile.length) {
                  for (let i = 0; i < attachFile.length; i++) {
                    formData.append("files", attachFile[i].fileList[0]);
                    fileList[i] = {
                      cliFileNm: attachFile[i].fileList.item(0)!.name,
                      fileAttachNo: attachFile[i].fileNumber,
                    };
                  }
                }

                const postData: RegisterCnstntInfoAdminCommand = {
                  ...expertInfoRegister,
                  fileList: fileList,
                };

                formData.append("json", JSON.stringify(postData));

                // 이동할 리스트 화면에서 방금 등록한 전문분야의 첫번째 항목으로
                // 검색해서 보여주기 위해
                const mn = expertInfoRegister.stngList[0].mnfcPrcsEnu;
                const sp = expertInfoRegister.stngList[0].sprtArtclEnu;

                fetch("/api/file/techDscsn/registerCnstntInfoAdmin", {
                  method: "POST",
                  body: formData,
                })
                  .then((res) => res)
                  .then((result) => {
                    if (result.status.toString() == "200") {
                      setText("전문가 등록을 성공했습니다.");
                      setStatus("success");
                      setIsChange(true);
                      router.replace(
                        `/portalCms/ts/expertInfor?mnfcPrcsEnu=${mn}&sprtArtclEnu=${sp}&page=0&size=10&sort=cnstntNm&orderBy=desc&ogdpNm=&searchKeyword`
                      );
                      router.refresh();
                    } else {
                      console.log("error", result);
                    }
                  });
              }
            }}
          >
            등록
          </Button>
        </div>
      </div>

      <span className={Style.input_name}>활동이력</span>
      <Table<ExpertInforRegisterType>
        data={tempData}
        headers={tableHeader}
        tableType={"vertical"}
        itemTitle={""}
        ref={tableRef}
        trHover={true}
        tableCaption="전문가 활동이력"
      />
    </div>
  );
}
