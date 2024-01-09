import { headers } from "next/headers";
import { getQueryParams, makeHostUrl, makeUrlQuery } from "@/utils/utils";
import { serverSideFetch } from "@/utils/serverSideFetch";
import { ApiResponse, TablePageResponse } from "@/types/common/commonType";
import {
  SearchCnstntInfoPageCommand,
  CnstntInfoResponse,
} from "@/types/tn/techConsulAppliType";
import Url from "url-parse";
import ExpertInforClient from "./ExpertInforClient";

async function getCnstntInfoPage(queryInstance: SearchCnstntInfoPageCommand) {
  const headersInstance = headers();
  const hostUrl = makeHostUrl(headersInstance);

  const res = await serverSideFetch(
    hostUrl + `/api/techDscsn/getCnstntInfoPage?${makeUrlQuery(queryInstance)}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch data.");
  }

  return res.json();
}

export default async function ExpertInforClientServer() {
  const headerList = headers();
  const xUrl = headerList.get("x-url") || "";
  const url = new Url(xUrl);
  let queryInstance: SearchCnstntInfoPageCommand = {
    page: 0,
    size: 10,
    sort: "cnstntNm",
    orderBy: "desc",
    mnfcPrcsEnu: "DESIGN",
    sprtArtclEnu: "DESIGN_1",
    ogdpNm: "",
    searchKeyword: "",
  };
  if (url.query !== "") {
    queryInstance = getQueryParams(url.query);
  }

  const { data }: ApiResponse<TablePageResponse<CnstntInfoResponse[]>> =
    await getCnstntInfoPage(queryInstance);

  let tempQueryInstance: SearchCnstntInfoPageCommand = {
    page: queryInstance.page,
    size: queryInstance.size,
    sort: queryInstance.sort,
    orderBy: queryInstance.orderBy,
    mnfcPrcsEnu: queryInstance.mnfcPrcsEnu,
    sprtArtclEnu: queryInstance.sprtArtclEnu,
    ogdpNm: queryInstance.ogdpNm,
    searchKeyword: queryInstance.searchKeyword,
    statusEnu: queryInstance.statusEnu,
  };

  return (
    <ExpertInforClient
      menuName="전문가 조회 페이징"
      data={data}
      queryInstance={tempQueryInstance}
    />
  );
}
