"use client";
import { useState } from "react";
import { useDebouncedValue } from "@mantine/hooks";
import NextImage from "next/image";
import {
  Group,
  TextInput,
  ActionIcon,
  Menu,
  Avatar,
  Text,
  Button,
  ScrollArea,
  UnstyledButton,
  Box,
  Image,
  Loader,
  Indicator,
  Skeleton,
} from "@mantine/core";
import { Search, Heart, User, LogOut, Film, Flame, CreditCard } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { getImageUrl } from "@/features/movies/lib/images";
import { useMovieSearch } from "@/features/movies/hooks/useMovieSearch";
import { useMoviesByIds } from "@/features/movies/hooks/useMoviesByIds";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SUGGESTION_LIMIT = 8;
const FAVORITES_PREVIEW_LIMIT = 5;

export const Navbar = () => {
  const { user, loading: authLoading } = useAuth();
  const logout = useLogout();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [debouncedQuery] = useDebouncedValue(searchQuery, 400);

  const { data: searchData } = useMovieSearch(debouncedQuery);
  const searchResults = searchData?.results.slice(0, SUGGESTION_LIMIT) ?? [];

  // Shares the cache with movie pages, so opening a favorited movie is instant
  const favorites = user?.favorites ?? [];
  const favoriteIds = favorites.slice(0, FAVORITES_PREVIEW_LIMIT).map(Number);
  const { movies: favoriteMovies, isPending: loadingFavorites } = useMoviesByIds(favoriteIds);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setSelectedIndex(-1);
    setShowResults(value.trim().length > 2);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, searchResults.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, -1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (selectedIndex >= 0) {
        router.push(`/movie/${searchResults[selectedIndex].id}`);
      } else if (searchQuery.trim()) {
        router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      }
      setShowResults(false);
      setSearchQuery("");
    } else if (event.key === "Escape") {
      setShowResults(false);
      setSelectedIndex(-1);
    }
  };

  return (
    <header className="navbar-glass">
      <Group justify="space-between" h={60}>
        <Group>
          <Link href="/" style={{ textDecoration: "none" }}>
            <Group gap="sm">
              <Film size={32} color="#3b82f6" />
              <Text size="xl" fw={700} c="white" visibleFrom="sm">
                MovieHub
              </Text>
            </Group>
          </Link>

          <Group gap="md" ml="xl" visibleFrom="md">
            <Link href="/most-watched" style={{ textDecoration: "none" }}>
              <UnstyledButton>
                <Group gap="xs">
                  <Flame color="red" size={18} />
                  <Text c="white">Most Watched</Text>
                </Group>
              </UnstyledButton>
            </Link>
          </Group>
          <Group gap="sm" ml="md" hiddenFrom="md">
            <Link href="/most-watched" style={{ textDecoration: "none" }}>
              <UnstyledButton>
                <Group gap="xs">
                  <Flame color="red" size={18} />
                  <Text c="white" size="sm">
                    MW
                  </Text>
                </Group>
              </UnstyledButton>
            </Link>
          </Group>
        </Group>

        <Group>
          <Box pos="relative" w={300} visibleFrom="sm">
            <TextInput
              placeholder="Search movies..."
              aria-label="Search movies"
              leftSection={<Search size={16} />}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => searchResults.length > 0 && setShowResults(true)}
              styles={{
                input: {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "white",
                  "&::placeholder": { color: "rgba(255, 255, 255, 0.6)" },
                },
              }}
            />

            {showResults && searchResults.length > 0 && (
              <Box
                className="search-dropdown"
                pos="absolute"
                top={42}
                left={0}
                right={0}
                mah={400}
                style={{ borderRadius: 8, zIndex: 1000 }}
              >
                <ScrollArea mah={400}>
                  {searchResults.map((movie, index) => (
                    <UnstyledButton
                      key={movie.id}
                      w="100%"
                      p="sm"
                      style={{
                        backgroundColor:
                          index === selectedIndex ? "rgba(59, 130, 246, 0.2)" : "transparent",
                        borderRadius: 4,
                      }}
                      onClick={() => {
                        router.push(`/movie/${movie.id}`);
                        setShowResults(false);
                        setSearchQuery("");
                      }}
                    >
                      <Group gap="sm">
                        <NextImage
                          src={getImageUrl(movie.poster_path, "w200")}
                          alt={movie.title}
                          width={40}
                          height={60}
                          style={{ borderRadius: 4 }}
                        />
                        <Box>
                          <Text size="sm" c="white" lineClamp={1}>
                            {movie.title}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {movie.release_date?.split("-")[0]} • ★ {movie.vote_average.toFixed(1)}
                          </Text>
                        </Box>
                      </Group>
                    </UnstyledButton>
                  ))}
                </ScrollArea>
              </Box>
            )}
          </Box>

          <ActionIcon
            variant="subtle"
            size="lg"
            c="white"
            hiddenFrom="sm"
            onClick={() => router.push("/search")}
          >
            <Search size={20} />
          </ActionIcon>
          {authLoading ? (
            <Skeleton height={36} width={160} radius="sm" aria-label="Loading account" />
          ) : user ? (
            <Group gap="sm">
              <Menu shadow="md" width={250}>
                <Menu.Target>
                  <ActionIcon variant="subtle" size="lg" c="white">
                    <Group gap="xs">
                      {favorites.length > 0 ? (
                        <Indicator
                          size={13}
                          color="orange"
                          label={<Text size="xs">{favorites.length}</Text>}
                        >
                          <Heart size={18} />
                        </Indicator>
                      ) : (
                        <div>
                          {" "}
                          <Heart size={18} />
                        </div>
                      )}
                    </Group>
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown bg="dark.7" style={{ border: "1px solid rgba(255, 255, 255, 0.1)" }}>
                  <Menu.Label>Favorites</Menu.Label>
                  {loadingFavorites ? (
                    <Box p="sm" ta="center">
                      <Loader size="sm" />
                    </Box>
                  ) : favorites.length === 0 ? (
                    <Text size="sm" c="dimmed" p="sm" ta="center">
                      No favorites yet
                    </Text>
                  ) : (
                    favoriteMovies.map((movie) => (
                      <Menu.Item
                        key={movie.id}
                        onClick={() => router.push(`/movie/${movie.id}`)}
                        style={{ padding: "8px 12px" }}
                      >
                        <Group gap="sm">
                          <Image
                            src={getImageUrl(movie.poster_path, "w200")}
                            alt={movie.title}
                            width={32}
                            height={48}
                            style={{
                              width: "32px",
                              height: "48px",
                              flexShrink: 0,
                            }}
                            radius="sm"
                            fallbackSrc="/placeholder-movie.svg"
                          />
                          <Box>
                            <Text size="sm" c="white" lineClamp={1} fw={500}>
                              {movie.title}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {movie.release_date?.split("-")[0]}
                            </Text>
                          </Box>
                        </Group>
                      </Menu.Item>
                    ))
                  )}
                  {favorites.length > 5 && (
                    <Menu.Item
                      onClick={() => router.push("/favorites")}
                      style={{
                        borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                      }}
                    >
                      <Text size="sm" c="blue" ta="center">
                        View all {favorites.length} favorites
                      </Text>
                    </Menu.Item>
                  )}
                </Menu.Dropdown>
              </Menu>

              <Menu shadow="md" width={200}>
                <Menu.Target>
                  <ActionIcon variant="subtle" size="lg" aria-label="Account menu">
                    <Avatar size="sm" color="blue">
                      {user.name.charAt(0).toUpperCase()}
                    </Avatar>
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown bg="dark.7" style={{ border: "1px solid rgba(255, 255, 255, 0.1)" }}>
                  <Menu.Label>Signed in as {user.email}</Menu.Label>
                  <Menu.Item
                    leftSection={<User size={16} />}
                    onClick={() => router.push("/profile")}
                  >
                    Profile
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<CreditCard size={16} />}
                    onClick={() => router.push("/subscription/pricing")}
                  >
                    Subscription
                  </Menu.Item>
                  <Menu.Item leftSection={<LogOut size={16} />} onClick={() => logout.mutate()}>
                    Logout
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          ) : (
            <Group gap="sm">
              <Button variant="subtle" onClick={() => router.push("/auth/login")}>
                Login
              </Button>
              <Button onClick={() => router.push("/auth/register")}>Sign Up</Button>
            </Group>
          )}
        </Group>
      </Group>
    </header>
  );
};
