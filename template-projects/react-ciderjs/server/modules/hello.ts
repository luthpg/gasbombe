import { serialize } from "@ciderjs/gasnuki/json";

export function sayHello(name: string): string {
  Logger.log("sayHello");
  return `Hello, ${name}!`;
}

export function getHelloMember() {
  return serialize({
    name: "John Doe",
    age: 30,
    isMember: true,
  });
}
