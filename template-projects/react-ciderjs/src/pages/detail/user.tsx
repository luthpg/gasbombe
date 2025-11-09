import { useParams } from "@ciderjs/city-gas/react";

export const params = {
  id: "string",
};

export default function Page() {
  const { id } = useParams<"/detail/user">();
  return (
    <>
      <h1>
        Detail of User <code>{id}</code>
      </h1>
    </>
  );
}
