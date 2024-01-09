import KoreacarList from "./KoreacarList";
import { headers } from "next/headers";
import { getQueryParams, makeHostUrl, makeUrlQuery } from "@/utils/utils";
import { serverSideFetch } from "@/utils/serverSideFetch";
import { ApiResponse, TablePageResponse } from "@/types/common/commonType";
import {
  KamaResponse,
  SearchBoardCrawlingCommand,
} from "@/types/nt/nesList/NesListType";
import Url from "url-parse";

// search request
async function getKamaList(queryInstance: SearchBoardCrawlingCommand) {
  const headersInstance = headers();
  const hostUrl = makeHostUrl(headersInstance);
  const res = await serverSideFetch(
    hostUrl + `/api/common/crawling/getKamaList?${makeUrlQuery(queryInstance)}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch data.");
  }

  return res.json();
}

// search response
export default async function KoreacarListServer() {
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

  const { data }: ApiResponse<TablePageResponse<KamaResponse[]>> =
    await getKamaList(queryInstance);

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
    <KoreacarList
      menuName="보도자료_한국자동차모빌리티산업협회"
      data={data}
      queryInstance={tempQueryInstance}
    />
  );
}
