/** 데모 추모관 고정 코드 — 시드·소개 페이지 공통 */
export const DEMO_MEMORIAL_HALLS = [
  {
    code: "DEMO-A101",
    plotNo: "A-101",
    deceasedName: "홍길동",
    deathDate: "2020-03-15",
    visibility: "public" as const,
    coverUrl: "/images/lot-columbarium.png",
  },
  {
    code: "DEMO-B205",
    plotNo: "B-205",
    deceasedName: "김철수",
    deathDate: "2019-11-22",
    visibility: "family" as const,
    coverUrl: "/images/lot-burial.png",
  },
  {
    code: "DEMO-C310",
    plotNo: "C-310",
    deceasedName: "이영희",
    deathDate: "2021-05-01",
    visibility: "family" as const,
    coverUrl: "/images/lot-tree.png",
  },
];

export const DEMO_FAMILY_MEMBER = {
  username: "demo-family",
  password: "Demo001!",
  name: "최창길",
  phone: "01090001001",
  email: "demo-family@anyangpark.local",
  plotNo: "A-101",
};

export function demoHallHref(code: string) {
  return `/memorial/${code}`;
}
