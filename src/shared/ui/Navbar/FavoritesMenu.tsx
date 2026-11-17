"use client";
import Link from "next/link";
import { ActionIcon, Box, Group, Image, Indicator, Loader, Menu, Text } from "@mantine/core";
import { Heart } from "lucide-react";
import { FAVORITES_PREVIEW_LIMIT } from "@/features/favorites/constants";
import { PLACEHOLDER_POSTER } from "@/features/movies/constants";
import { useMoviesByIds } from "@/features/movies/hooks/useMoviesByIds";
import { getImageUrl } from "@/features/movies/lib/images";
import { formatYear } from "@/shared/lib/format";
import { ROUTES } from "@/shared/routes";

const MENU_WIDTH = 250;
const THUMBNAIL = { width: 32, height: 48 };

/** Heart icon with the favorites count and a preview of the latest favorites. */
export function FavoritesMenu({ favorites }: { favorites: string[] }) {
  // Shares the cache with movie pages, so opening a favorited movie is instant
  const previewIds = favorites.slice(0, FAVORITES_PREVIEW_LIMIT).map(Number);
  const { movies, isPending } = useMoviesByIds(previewIds);

  return (
    <Menu shadow="md" width={MENU_WIDTH}>
      <Menu.Target>
        <ActionIcon variant="subtle" size="lg" c="white" aria-label="Favorites">
          {favorites.length > 0 ? (
            <Indicator size={13} color="orange" label={<Text size="xs">{favorites.length}</Text>}>
              <Heart size={18} />
            </Indicator>
          ) : (
            <Heart size={18} />
          )}
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Favorites</Menu.Label>
        {isPending ? (
          <Box p="sm" ta="center">
            <Loader size="sm" />
          </Box>
        ) : favorites.length === 0 ? (
          <Text size="sm" c="dimmed" p="sm" ta="center">
            No favorites yet
          </Text>
        ) : (
          movies.map((movie) => (
            <Menu.Item key={movie.id} component={Link} href={ROUTES.movie(movie.id)}>
              <Group gap="sm" wrap="nowrap">
                <Image
                  src={getImageUrl(movie.poster_path, "w200")}
                  alt={movie.title}
                  w={THUMBNAIL.width}
                  h={THUMBNAIL.height}
                  radius="sm"
                  fallbackSrc={PLACEHOLDER_POSTER}
                />
                <Box>
                  <Text size="sm" c="white" lineClamp={1} fw={500}>
                    {movie.title}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {formatYear(movie.release_date)}
                  </Text>
                </Box>
              </Group>
            </Menu.Item>
          ))
        )}
        {favorites.length > FAVORITES_PREVIEW_LIMIT && (
          <>
            <Menu.Divider />
            <Menu.Item component={Link} href={ROUTES.favorites}>
              <Text size="sm" c="blue" ta="center">
                View all {favorites.length} favorites
              </Text>
            </Menu.Item>
          </>
        )}
      </Menu.Dropdown>
    </Menu>
  );
}
