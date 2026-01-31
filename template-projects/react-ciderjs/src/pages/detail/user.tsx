import { useParams } from "@ciderjs/city-gas/react";
import { z } from "zod";

export const schema = z.object({
  id: z.string(),
});

export default function Page() {
  const { id } = useParams("/detail/user");
  return (
    <>
      <h1>
        Detail of User <code>{id}</code>
      </h1>
      <p>Enjoy your code life!</p>
    </>
  );
}
