import { Center, Loader } from "@mantine/core";

// Shown instantly while the home page loads its data on the server. Deliberately not at the app
// root: a loading boundary above /movie/[id] makes the response stream with status 200 before
// notFound() can turn it into a 404.
export default function Loading() {
  return (
    <Center mih="60vh" role="status" aria-label="Loading">
      <Loader size="lg" />
    </Center>
  );
}
