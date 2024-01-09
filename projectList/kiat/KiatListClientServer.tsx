import { headers } from "next/headers";
import { getQueryParams, makeHostUrl, makeUrlQuery } from "@/utils/utils";
import { serverSideFetch } from "@/utils/serverSideFetch";
import { ApiResponse, TablePageResponse } from "@/types/common/commonType";
import {
  KiatResponse,
  SearchCrawlingCommand,
} from "@/types/nt/projectList/ProjectListType";
import Url from "url-parse";
import KiatListClient from "./KiatListClient";

async function getKiatList(queryInstance: SearchCrawlingCommand) {
  const headersInstance = headers();
  const hostUrl = makeHostUrl(headersInstance);
  const res = await serverSideFetch(
    hostUrl + `/api/common/crawling/getKiatList?${makeUrlQuery(queryInstance)}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  return res.json();
}

export default async function KiatListClientServer() {
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

  const { data }: ApiResponse<TablePageResponse<KiatResponse[]>> =
    await getKiatList(queryInstance);

  let tempQueryInstance: SearchCrawlingCommand = {
    page: queryInstance.page,
    size: queryInstance.size,
    sprtFldKind: queryInstance.sprtFldKind,
    rcptStartDt: queryInstance.rcptStartDt,
    rcptEndDt: queryInstance.rcptEndDt,
    searchKeyword: queryInstance.searchKeyword,
  };

  return (
    <KiatListClient
      menuName="사업공고_한국산업기술진흥원"
      data={data}
      queryInstance={tempQueryInstance}
    />
  );
}
