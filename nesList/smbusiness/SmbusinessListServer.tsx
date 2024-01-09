import SmbusinessList from "./SmbusinessList";
import { headers } from "next/headers";
import { getQueryParams, makeHostUrl, makeUrlQuery } from "@/utils/utils";
import { serverSideFetch } from "@/utils/serverSideFetch";
import { ApiResponse, TablePageResponse } from "@/types/common/commonType";
import {
  MssResponse,
  SearchBoardCrawlingCommand,
} from "@/types/nt/nesList/NesListType";
import Url from "url-parse";

// search request
async function getMssList(queryInstance: SearchBoardCrawlingCommand) {
  const headersInstance = headers();
  const hostUrl = makeHostUrl(headersInstance);
  const res = await serverSideFetch(
    hostUrl + `/api/common/crawling/getMssList?${makeUrlQuery(queryInstance)}`,
  );

  if (!res.ok) {
    throw new Error("Failed to fetch data.");
  }

  return res.json();
}

// search response
export default async function SmbusinessListServer() {
  const headerList = headers();
  const xUrl = headerList.get("x-url") || "";
  const url = new Url(xUrl);
  let queryInstance: SearchBoardCrawlingCommand = {
    page: 0,
    size: 10,
    sort: "seq",
    orderBy: "desc",
  };
  if (url.query !== "") {
    queryInstance = getQueryParams(url.query);
  }

  const { data }: ApiResponse<TablePageResponse<MssResponse[]>> =
    await getMssList(queryInstance);

  let tempQueryInstance: SearchBoardCrawlingCommand = {
    page: queryInstance.page,
    size: queryInstance.size,
    orderBy: queryInstance.orderBy,
    sort: queryInstance.sort,
    startYmd: queryInstance.startYmd,
    endYmd: queryInstance.endYmd,
    searchKeyword: queryInstance.searchKeyword,
  };

  return (
    <SmbusinessList
      menuName="보도자료_중소벤처기업부"
      data={data}
      queryInstance={tempQueryInstance}
    />
  );
}
