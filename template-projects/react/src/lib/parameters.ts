import type { ServerParams } from "~/types/appsscript/server";

let parameters: ServerParams = {} as ServerParams;

try {
  const parametersJson = "<?!= JSON.stringify(parameters) ?>";
  parameters = JSON.parse(
    parametersJson.slice(1, parametersJson.length - 1).replace(/\\"/g, '"'),
  );
} catch {
  // mockup parameters to simulate as server access
  parameters = {
    ...parameters,
    parameter: {},
    siteTitle: "Mockup Site Title",
    userAddress: "mock-user@example.com",
  };
}

export { parameters };
