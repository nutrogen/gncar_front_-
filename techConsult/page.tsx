import React from "react";
import CmsSubTop from "@/components/cms/CmsSubTop/CmsSubTop";
import TechConsultServer from "@/app/portalCms/ts/techConsult/TechConsultServer";

export default function TechConsultPage() {
  return (
    <>
      <CmsSubTop menuTitle={"기술상담 관리"} />
      <TechConsultServer />
    </>
  );
}
