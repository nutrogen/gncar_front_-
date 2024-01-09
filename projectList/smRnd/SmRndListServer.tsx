import SmRndListClient from "./SmRndListClient";
import { headers } from "next/headers";
import { getQueryParams, makeHostUrl, makeUrlQuery } from "@/utils/utils";
import { serverSideFetch } from "@/utils/serverSideFetch";
import { ApiResponse, TablePageResponse } from "@/types/common/commonType";
import {
  SmtechResponse,
  SearchCrawlingCommand,
} from "@/types/nt/projectList/ProjectListType";
import Url from "url-parse";

async function getSmRndList(queryInstance: SearchCrawlingCommand) {
  const headersInstance = headers();
  const hostUrl = makeHostUrl(headersInstance);
  const res = await serverSideFetch(
    hostUrl +
      `/api/common/crawling/getSmRndList?${makeUrlQuery(queryInstance)}`,
  );

  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  return res.json();
}

export default async function SmRndListServer() {
  const headerList = headers();
  const xUrl = headerList.get("x-url") || "";
  const url = new Url(xUrl);
  let queryInstance: SearchCrawlingCommand = {
    page: 0,
    size: 10,
  };
  if (url.query !== "") {
    queryInstance = getQueryParams(url.query);
  }

  const { data }: ApiResponse<TablePageResponse<SmtechResponse[]>> =
    await getSmRndList(queryInstance);

  let tempQueryInstance: SearchCrawlingCommand = {
    page: queryInstance.page,
    size: queryInstance.size,
    rcptStatus: queryInstance.rcptStatus,
    rcptStartDt: queryInstance.rcptStartDt,
    rcptEndDt: queryInstance.rcptEndDt,
    searchKeyword: queryInstance.searchKeyword,
  };

  return (
    <SmRndListClient
      menuName="사업공고_중소기업기술정보진흥원 R&D 지원사업"
      data={data}
      queryInstance={tempQueryInstance}
    />
  );
}
