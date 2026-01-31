import { serialize } from "@ciderjs/gasnuki/json";
import {
  getPromisedServerScripts,
  type PartialScriptType,
} from "@ciderjs/gasnuki/promise";
import type { ServerScripts } from "~/types/appsscript/client";

// mockup function to simulate as fetching appsscript time
export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const mockupFunctions: PartialScriptType<ServerScripts> = {
  sayHello: async (name) => {
    await sleep(1000);
    return `Hello, ${name}!`;
  },
  getHelloMember: async () => {
    await sleep(1000);
    return serialize({
      name: "John Doe",
      age: 30,
      isMember: true,
    });
  },
};

export const serverScripts = getPromisedServerScripts<ServerScripts>({
  mockupFunctions,
  parseJson: true,
});
