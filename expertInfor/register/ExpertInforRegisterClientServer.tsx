import { headers } from "next/headers";
import ExpertInforRegisterClient from "./ExpertInforRegisterClient";
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
import ExportInforRegisterClient from "./ExpertInforRegisterClient";
import { makeHostUrl } from "@/utils/utils";
import { ApiResponse, TablePageResponse } from "@/types/common/commonType";

async function getCnstntInfo() {
  const headerInstance = headers();
  const hostUrl = makeHostUrl(headerInstance);
  const res = await serverSideFetch(
    hostUrl + `/api/techDscsn/getCnstntInfo?cnstntInfoSeq`
  );

  // if (!res.ok) {
  //   throw new Error("Failed to fetch data.");
  // }
  // return res.json();
}

export default async function ExpertInforRegisterClientServer() {
  const headerList = headers();
  const xUrl = headerList.get("x-url") || "";
  const url = new Url(xUrl);

  // const { data }: ApiResponse<TablePageResponse<CnstnHistoryResponse[]>> =
  //   await getCnstntInfo();

  return <ExportInforRegisterClient menuName="전문가등록페이지_관리자" />;
}
