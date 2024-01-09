import { headers } from "next/headers";
import { getQueryParams, makeHostUrl, makeUrlQuery } from "@/utils/utils";
import { serverSideFetch } from "@/utils/serverSideFetch";
import { ApiResponse, TablePageResponse } from "@/types/common/commonType";
import {
  BizInfoResponse,
  SearchCrawlingCommand,
} from "@/types/nt/projectList/ProjectListType";
import Url from "url-parse";
import SmBizInfoListClient from "./SmBizInfoListClient";

async function getBizInfoList(queryInstance: SearchCrawlingCommand) {
  const headersInstance = headers();
  const hostUrl = makeHostUrl(headersInstance);
  const res = await serverSideFetch(
    hostUrl +
      `/api/common/crawling/getBizInfoList?${makeUrlQuery(queryInstance)}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  return res.json();
}

export default async function SmBizInfoListServer() {
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

  const { data }: ApiResponse<TablePageResponse<BizInfoResponse[]>> =
    await getBizInfoList(queryInstance);

  let tempQueryInstance: SearchCrawlingCommand = {
    page: queryInstance.page,
    size: queryInstance.size,
    sprtFldKind: queryInstance.sprtFldKind,
    rcptStartDt: queryInstance.rcptStartDt,
    rcptEndDt: queryInstance.rcptEndDt,
    searchKeyword: queryInstance.searchKeyword,
  };

  return (
    <SmBizInfoListClient
      menuName="사업공고_중소기업 기업마당"
      data={data}
      queryInstance={tempQueryInstance}
    />
  );
}
