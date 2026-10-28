import { useHello } from "./modules/hello.js";

export function myFunction() {
  Logger.log(useHello("world"));
}
