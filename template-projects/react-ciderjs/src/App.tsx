import { createRouter } from "@ciderjs/city-gas";
import {
  RouterOutlet,
  RouterProvider,
  useNavigate,
} from "@ciderjs/city-gas/react";
import { pages } from "@/generated/routes";
import "@/App.css";

function Navigation() {
  const navigate = useNavigate();
  return (
    <div style={{ marginBottom: "1rem" }}>
      <button
        type="button"
        style={{ marginRight: "1rem" }}
        onClick={() => navigate("/")}
      >
        Home
      </button>
      <button
        type="button"
        style={{ marginRight: "1rem" }}
        onClick={() => navigate("/about")}
      >
        About
      </button>
      <button
        type="button"
        onClick={() => navigate("/detail/user", { id: "1" })}
      >
        Detail of User <code>1</code>
      </button>
    </div>
  );
}

function App() {
  const router = createRouter(pages);

  return (
    <RouterProvider router={router}>
      <Navigation />
      <RouterOutlet />
    </RouterProvider>
  );
}

export default App;
