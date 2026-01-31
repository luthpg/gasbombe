import { createRouter } from "@ciderjs/city-gas";
import { createRouterPlugin, RouterOutlet } from "@ciderjs/city-gas/vue";
import { createApp } from "vue";
import { dynamicRoutes, pages, specialPages } from "./generated/routes";
import "@/style.css";

const router = createRouter(pages, { specialPages, dynamicRoutes });
const app = createApp(RouterOutlet);

app.use(createRouterPlugin(router));
app.mount("#app");
