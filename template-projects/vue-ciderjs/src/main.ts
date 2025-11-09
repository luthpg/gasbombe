import { createRouter } from "@ciderjs/city-gas";
import { createRouterPlugin } from "@ciderjs/city-gas/vue";
import { createApp } from "vue";
import "@/style.css";
import App from "@/App.vue";
import { pages, specialPages } from "@/generated/routes";

function main() {
  const router = createRouter(pages, { specialPages });
  createApp(App).use(createRouterPlugin(router)).mount("#app");
}

main();
