import { CMS_SLUGS, fillCmsI18n, getCmsPageOrDefault, persistCmsPage } from "./cms";
import { fillFaqI18n, listFaq, persistFaqItem } from "./faq";
import { fillNoticeI18n, listNotices, persistNotice } from "./notices";

export type ContentI18nMigrateResult = {
  cms: number;
  notices: number;
  faq: number;
};

/** 기존 CMS·공지·FAQ 한글을 영어·중국어로 채워 넣습니다. force면 이미 있는 번역도 다시 만듭니다. */
export async function migrateContentI18n(force = false): Promise<ContentI18nMigrateResult> {
  let cms = 0;
  let notices = 0;
  let faq = 0;

  for (const { slug } of CMS_SLUGS) {
    const page = await getCmsPageOrDefault(slug);
    if (!force && page.i18n?.en?.title && page.i18n?.zh?.title) continue;
    page.i18n = await fillCmsI18n(page, force);
    page.updatedAt = new Date().toISOString();
    await persistCmsPage(page);
    cms += 1;
  }

  for (const notice of await listNotices()) {
    if (!force && notice.i18n?.en?.title && notice.i18n?.zh?.title) continue;
    notice.i18n = await fillNoticeI18n(notice, force);
    await persistNotice(notice);
    notices += 1;
  }

  for (const item of await listFaq()) {
    if (!force && item.i18n?.en?.question && item.i18n?.zh?.question) continue;
    item.i18n = await fillFaqI18n(item, force);
    await persistFaqItem(item);
    faq += 1;
  }

  return { cms, notices, faq };
}
