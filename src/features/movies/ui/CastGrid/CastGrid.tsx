import { Avatar, Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { CAST_LIMIT, GRID_COLUMNS } from "@/features/movies/constants";
import { getImageUrl } from "@/features/movies/lib/images";
import type { MovieDetails } from "@/features/movies/types";

type CastMember = NonNullable<MovieDetails["credits"]>["cast"][number];

/** The first billed actors with their roles. */
export function CastGrid({ cast }: { cast: CastMember[] }) {
  return (
    <Stack gap="xl">
      <Title size="xl" fw={600} c="white">
        Cast
      </Title>

      <SimpleGrid cols={GRID_COLUMNS} spacing="md">
        {cast.slice(0, CAST_LIMIT).map((actor) => (
          <Paper key={actor.id} p="md" radius="md">
            <Stack align="center" gap="sm">
              <Avatar
                src={actor.profile_path ? getImageUrl(actor.profile_path, "w200") : null}
                alt={actor.name}
                size="lg"
                radius="md"
              />
              <Stack gap={2} align="center">
                <Text size="sm" fw={500} c="white" ta="center" lineClamp={1}>
                  {actor.name}
                </Text>
                <Text size="xs" c="dimmed" ta="center" lineClamp={1}>
                  {actor.character}
                </Text>
              </Stack>
            </Stack>
          </Paper>
        ))}
      </SimpleGrid>
    </Stack>
  );
}
