import React from "react";
import CmsSubTop from "@/components/cms/CmsSubTop/CmsSubTop";
import ExpertInforRegisterClientServer from "./ExpertInforRegisterClientServer";

export default function SubPage() {
  return (
    <>
      <CmsSubTop menuTitle={"전문가등록페이지_관리자"} />
      <ExpertInforRegisterClientServer />
    </>
  );
}
