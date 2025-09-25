import {
  getPromisedServerScripts,
  type PartialScriptType,
} from '@ciderjs/gasnuki/promise';
import type { ServerScripts } from '~/types/appsscript/client';

// mockup function to simulate as fetching appsscript time
export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const mockup: PartialScriptType<ServerScripts> = {
  sayHello: async (name) => {
    await sleep(1000);
    return `Hello, ${name}!`;
  },
};

export const serverScripts = getPromisedServerScripts<ServerScripts>(mockup);
