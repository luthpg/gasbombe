import { useNavigate } from "@ciderjs/city-gas/react";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Navigation />
      <main>{children}</main>
    </div>
  );
}
