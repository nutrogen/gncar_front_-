import React from "react";
import CmsSubTop from "@/components/cms/CmsSubTop/CmsSubTop";
import ExpertInforClientServer from "./ExpertInforClientServer";

export default function SubPage() {
  return (
    <>
      <CmsSubTop menuTitle={"전문가 관리"} />
      <ExpertInforClientServer />
    </>
  );
}
