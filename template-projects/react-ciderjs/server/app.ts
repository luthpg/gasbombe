import type { ServerParams, WebAppParams } from "~/types/appsscript/server";

export * from "./modules/hello";

const SITE_TITLE = "WebApp";

/**
 * Procedure to handle GET requests when published as a web app
 */
export function doGet(e: WebAppParams) {
  const htmlTemplate = HtmlService.createTemplateFromFile("index");
  const title = SITE_TITLE;
  const userAddress = Session.getActiveUser().getEmail();

  // set initial data for front-end
  htmlTemplate.parameters = JSON.stringify({
    ...e,
    siteTitle: title,
    userAddress: userAddress,
  } satisfies ServerParams);

  const htmlOutput = htmlTemplate.evaluate();
  htmlOutput.setTitle(title);
  htmlOutput.addMetaTag(
    "viewport",
    "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, minimal-ui",
  );
  return htmlOutput;
}
