// sample code from https://developers.google.com/apps-script/guides/web-apps

type _AppsScriptRun = {
  [key: string]: (...args: any[]) => any;
  withSuccessHandler: <T = string | number | boolean | undefined, U = any>(
    callback: (returnValues: T, userObject?: U) => void,
  ) => _AppsScriptRun;
  withFailureHandler: <U = any>(
    callback: (error: Error, userObject?: U) => void,
  ) => _AppsScriptRun;
  withUserObject: <U = any>(userObject: U) => _AppsScriptRun;
};

type _AppsScriptHistoryFunction = (
  stateObject: object,
  params: object,
  hash: string,
) => void;

interface _WebAppLocationType {
  hash: string;
  parameter: Record<string, string>;
  parameters: Record<string, string[]>;
}

export declare interface GoogleClientSideApi {
  script: {
    run: _AppsScriptRun;
    url: {
      getLocation: (callback: (location: _WebAppLocationType) => void) => void;
    };
    history: {
      push: _AppsScriptHistoryFunction;
      replace: _AppsScriptHistoryFunction;
      setChangeHandler: (
        callback: (e: { state: object; location: _WebAppLocationType }) => void,
      ) => void;
    };
  };
}

declare global {
  const google: GoogleClientSideApi;
}
