"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Container,
  Group,
  Select,
  NumberInput,
  Stack,
  Text,
  Loader,
  Center,
} from "@mantine/core";
import InfiniteScroll from "react-infinite-scroll-component";
import { discoverMovies, getGenres, Movie, Genre } from "@/lib/external/tmdb";
import { MovieGrid } from "@/components/Movies/MovieGrid";
import { Flame } from "lucide-react";

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 30 }, (_, i) => ({
  value: (currentYear - i).toString(),
  label: (currentYear - i).toString(),
}));

export default function MostWatchedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [movies, setMovies] = useState<Movie[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [genres, setGenres] = useState<Genre[]>([]);

  const [selectedYear, setSelectedYear] = useState<string | null>(
    searchParams.get("year") || null
  );
  const [selectedGenre, setSelectedGenre] = useState<string | null>(
    searchParams.get("genre") || null
  );
  const [minRating, setMinRating] = useState<number | string>(
    searchParams.get("rating") || ""
  );
  const isValidGenre = (genreId: number | null) => {
    if (!genreId) return true;
    return genres.some((genre) => genre.id === genreId);
  };
  const updateURL = useCallback(
    (year: string | null, genre: string | null, rating: number | string) => {
      const params = new URLSearchParams();

      if (year) params.set("year", year);
      if (genre) params.set("genre", genre);
      if (rating) params.set("rating", rating.toString());

      const queryString = params.toString();
      const newUrl = queryString
        ? `/most-watched?${queryString}`
        : "/most-watched";

      router.replace(newUrl, { scroll: false });
    },
    [router]
  );

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const genresData = await getGenres();
        setGenres(genresData);
      } catch (error) {
        console.error("Failed to fetch genres:", error);
      }
    };
    fetchGenres();
  }, []);

  useEffect(() => {
    updateURL(selectedYear, selectedGenre, minRating);
  }, [selectedYear, selectedGenre, minRating, updateURL]);

  const fetchMovies = useCallback(
    async (pageNum: number, reset = false) => {
      try {
        let genreParam = undefined;
        if (selectedGenre) {
          const genreId = parseInt(selectedGenre);

          if (isValidGenre(genreId)) {
            genreParam = genreId;
          }
        }

        const params = {
          page: pageNum,
          year: selectedYear ? parseInt(selectedYear) : undefined,

          genre: genreParam,
          minRating: typeof minRating === "number" ? minRating : undefined,
        };

        const response = await discoverMovies(params);

        if (reset) {
          setMovies(response.results);
        } else {
          setMovies((prev) => [...prev, ...response.results]);
        }

        setHasMore(pageNum < response.total_pages);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch movies:", error);
        setLoading(false);
      }
    },
    [selectedYear, selectedGenre, minRating]
  );

  useEffect(() => {
    setLoading(true);
    setPage(1);
    fetchMovies(1, true);
  }, [fetchMovies]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMovies(nextPage);
  };

  const handleYearChange = (value: string | null) => {
    setSelectedYear(value);
    setPage(1);
  };

  const handleGenreChange = (value: string | null) => {
    setSelectedGenre(value);
    setPage(1);
  };

  const handleRatingChange = (value: number | string) => {
    setMinRating(value);
    setPage(1);
  };

  const genreOptions = genres.map((genre) => ({
    value: genre.id.toString(),
    label: genre.name,
  }));

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Group gap="sm">
          <Flame color="red" size={30} />
          <Text c="white" size="xl">
            Most Watched
          </Text>
        </Group>

        <Group gap="md" wrap="wrap" data-aos="fade-up" data-aos-delay="200">
          <Select
            placeholder="Release Year"
            data={yearOptions}
            value={selectedYear}
            onChange={handleYearChange}
            clearable
            w={150}
            styles={{
              input: { backgroundColor: "rgba(255, 255, 255, 0.05)" },
              dropdown: { backgroundColor: "var(--gray-800)" },
            }}
          />

          <Select
            placeholder="Genre"
            data={genreOptions}
            value={selectedGenre}
            onChange={handleGenreChange}
            clearable
            w={200}
            styles={{
              input: { backgroundColor: "rgba(255, 255, 255, 0.05)" },
              dropdown: { backgroundColor: "var(--gray-800)" },
            }}
          />

          <NumberInput
            placeholder="Min Rating"
            min={0}
            max={10}
            step={0.1}
            value={minRating}
            onChange={handleRatingChange}
            w={150}
            styles={{
              input: { backgroundColor: "rgba(255, 255, 255, 0.05)" },
            }}
          />
        </Group>

        {loading && movies.length === 0 ? (
          <Center h={400}>
            <Loader size="lg" />
          </Center>
        ) : (
          <InfiniteScroll
            dataLength={movies.length}
            next={loadMore}
            hasMore={hasMore}
            style={{ overflow: "hidden" }}
            loader={
              <Center mt="xl">
                <Loader size="md" />
              </Center>
            }
            endMessage={
              <Center mt="xl">
                <Text c="dimmed">No more movies to load</Text>
              </Center>
            }
          >
            <div data-aos="fade-up" data-aos-delay="400">
              <MovieGrid movies={movies} />
            </div>
          </InfiniteScroll>
        )}
      </Stack>
    </Container>
  );
}
