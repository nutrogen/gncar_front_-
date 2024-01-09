import { headers } from "next/headers";
import ExpertInforRegisterClient from "./ExpertInforDetailModify";
import Url from "url-parse";
import { authOptions } from "@/app/api/auth/[...nextauth]/AuthOptions";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { serverSideFetch } from "@/utils/serverSideFetch";
import {
  RegisterCnstntInfoAdminCommand,
  CnstntInfoDtlResponse,
  CnstnHistoryResponse,
} from "@/types/portalCms/ts/techConsult/techConsultType";
import ExpertInforDetailModify from "./ExpertInforDetailModify";
import { makeHostUrl } from "@/utils/utils";
import { ApiResponse, TablePageResponse } from "@/types/common/commonType";

async function getCnstntInfo(params: string) {
  const headerInstance = headers();
  const hostUrl = makeHostUrl(headerInstance);
  const res = await serverSideFetch(
    hostUrl + `/api/techDscsn/getCnstntInfo?cnstntInfoSeq=${params}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch data.");
  }
  return res.json();
}

export default async function ExpertInforDetailModifyServer({
  params,
}: {
  params: { seq: string };
}) {
  const headerList = headers();
  const xUrl = headerList.get("x-url") || "";
  const url = new Url(xUrl);

  const { data }: ApiResponse<CnstntInfoDtlResponse> = await getCnstntInfo(
    params.seq
  );

  // return (
  //   <>
  //     <ExpertInforDetailModify
  //       expertInforDetailModifyData={data}
  //       menuName="전문가 수정 페이지_관리자"
  //     />
  //   </>
  // );
  return (
    <ExpertInforDetailModify
      menuName="전문가 수정 페이지_관리자"
      data={data.cnstntHistoryList}
      expertInforDetailModifyData={data}
    />
  );
}
