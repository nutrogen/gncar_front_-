import React from "react";
import CmsSubTop from "@/components/cms/CmsSubTop/CmsSubTop";
import ExpertInforDetailModifyServer from "./ExpertInforDetailModifyServer";

export default function SubPage({ params }: { params: { seq: string } }) {
  return (
    <>
      <CmsSubTop menuTitle={"전문가등록페이지_관리자"} />
      <ExpertInforDetailModifyServer params={params} />
    </>
  );
}
