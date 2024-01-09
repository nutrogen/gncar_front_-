import { headers } from "next/headers";
import { getQueryParams, makeHostUrl, makeUrlQuery } from "@/utils/utils";
import { serverSideFetch } from "@/utils/serverSideFetch";
import { ApiResponse, TablePageResponse } from "@/types/common/commonType";
import {
  GntpResponse,
  SearchCrawlingCommand,
} from "@/types/nt/projectList/ProjectListType";
import Url from "url-parse";
import GntpListClient from "./GntpListClient";

async function getGntpList(queryInstance: SearchCrawlingCommand) {
  const headersInstance = headers();
  const hostUrl = makeHostUrl(headersInstance);
  const res = await serverSideFetch(
    hostUrl + `/api/common/crawling/getGntpList?${makeUrlQuery(queryInstance)}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  return res.json();
}

export default async function GntpListServer() {
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

  const { data }: ApiResponse<TablePageResponse<GntpResponse[]>> =
    await getGntpList(queryInstance);

  let tempQueryInstance: SearchCrawlingCommand = {
    page: queryInstance.page,
    size: queryInstance.size,
    rcptStatus: queryInstance.rcptStatus,
    rcptStartDt: queryInstance.rcptStartDt,
    rcptEndDt: queryInstance.rcptEndDt,
    searchKeyword: queryInstance.searchKeyword,
  };

  return (
    <GntpListClient
      menuName="사업공고_경남테크노파크"
      data={data}
      queryInstance={tempQueryInstance}
    />
  );
}
