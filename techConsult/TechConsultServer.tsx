import React from "react";
import { cookies, headers } from "next/headers";
import TechConsultClient from "./TechConsultClient";
import Url from "url-parse";
import { getQueryParams, makeHostUrl, makeUrlQuery } from "@/utils/utils";
import {
  SearchTechDscsnCommand,
  SearchTechDscsnEmCommand,
  TechDscsnResponse,
} from "@/types/portalCms/ts/techConsult/techConsultType";
import { ApiResponse, TablePageResponse } from "@/types/common/commonType";
import { serverSideFetch } from "@/utils/serverSideFetch";
import { getRequestCookieToSession } from "@/lib/getRequestCookieToSession";
import { AuthListType } from "@/types/nextAuth/next-auth";

async function getTechDscsnDsctn(queryInstance: SearchTechDscsnCommand) {
  const headersInstance = headers();
  const hostUrl = makeHostUrl(headersInstance);
  const res = await serverSideFetch(
    hostUrl + `/api/techDscsn/getTechDscsnList?${makeUrlQuery(queryInstance)}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  return res.json();
}

async function getTechDscsnEmDsctn(queryInstance: SearchTechDscsnEmCommand) {
  const headersInstance = headers();
  const hostUrl = makeHostUrl(headersInstance);
  const res = await serverSideFetch(
    hostUrl + `/api/techDscsn/getTechDscsnEmList?${makeUrlQuery(queryInstance)}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  return res.json();
}

export default async function CounselingListServer() {
  const session = await getRequestCookieToSession(cookies());
  const headerList = headers();
  const xUrl = headerList.get("x-url") || "";
  const url = new Url(xUrl);
  let queryInstance: SearchTechDscsnCommand = {
    page: 0,
    size: 10,
    sort: "seq",
    orderBy: "desc",
  };
  if (url.query !== "") {
    queryInstance = {
      ...getQueryParams(url.query),
    };
  }

  if (
    session!.user.authList.find(
      (findItem: AuthListType) => findItem.authrtNm === "버추얼 일반관리자"
    )
  ) {
    const { data }: ApiResponse<TablePageResponse<TechDscsnResponse[]>> =
      await getTechDscsnDsctn(queryInstance);

    let tempQueryInstance: SearchTechDscsnCommand = {
      page: queryInstance.page,
      size: queryInstance.size,
      sort: queryInstance.sort,
      orderBy: queryInstance.orderBy,
      searchYear: queryInstance.searchYear,
      searchNm: queryInstance.searchNm,
      mnfcPrcsEnu: queryInstance.mnfcPrcsEnu,
      sprtArtclEnu: queryInstance.sprtArtclEnu,
    };

    return (
      <TechConsultClient
        data={data}
        queryInstance={tempQueryInstance}
        user={session!.user}
      />
    );
  } else {
    const { data }: ApiResponse<TablePageResponse<TechDscsnResponse[]>> =
      await getTechDscsnEmDsctn(queryInstance);

    let tempQueryInstance: SearchTechDscsnEmCommand = {
      page: queryInstance.page,
      size: queryInstance.size,
      sort: queryInstance.sort,
      orderBy: queryInstance.orderBy,
      searchYear: queryInstance.searchYear,
      searchNm: queryInstance.searchNm,
      mnfcPrcsEnu: queryInstance.mnfcPrcsEnu,
      sprtArtclEnu: queryInstance.sprtArtclEnu,
    };

    return (
      <TechConsultClient
        data={data}
        queryInstance={tempQueryInstance}
        user={session!.user}
      />
    );
  }
}
