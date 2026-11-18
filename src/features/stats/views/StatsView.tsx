"use client";
import { Center, Container, Loader, Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import dayjs from "dayjs";
import { BarChart3 } from "lucide-react";
import { ProtectedRoute } from "@/features/auth/ui/ProtectedRoute/ProtectedRoute";
import { useUserStats } from "@/features/stats/hooks/useUserStats";
import type { MonthActivity, UserStats } from "@/features/stats/types";
import { BarList } from "@/features/stats/ui/BarList/BarList";
import { ColumnChart } from "@/features/stats/ui/ColumnChart/ColumnChart";
import { LockedFeature } from "@/features/subscription/ui/LockedFeature/LockedFeature";
import { COLORS } from "@/shared/theme/colors";
import { QueryError } from "@/shared/ui/QueryError/QueryError";
import { SectionTitle } from "@/shared/ui/SectionTitle/SectionTitle";

const TILE_COLUMNS = { base: 2, sm: 4 };
const CHART_COLUMNS = { base: 1, md: 2 };

export function StatsView() {
  return (
    <ProtectedRoute>
      <Container size="xl" py="xl">
        <LockedFeature feature="stats" title="Your stats">
          <StatsContent />
        </LockedFeature>
      </Container>
    </ProtectedRoute>
  );
}

function StatsContent() {
  const { data, isPending, isError, refetch } = useUserStats();

  return (
    <Stack gap="xl">
      <SectionTitle icon={<BarChart3 color={COLORS.primary} size={28} />} order={1} size="2rem">
        Your Stats
      </SectionTitle>

      {isError ? (
        <QueryError message="Your stats couldn't be loaded." onRetry={refetch} />
      ) : isPending ? (
        <Center py="xl">
          <Loader size="sm" />
        </Center>
      ) : (
        <StatsPanels stats={data} />
      )}
    </Stack>
  );
}

const monthColumns = (months: MonthActivity[], key: "watched" | "views") =>
  months.map((entry) => {
    const month = dayjs(`${entry.month}-01`);
    return {
      key: entry.month,
      shortLabel: month.format("MMM"),
      fullLabel: month.format("MMMM YYYY"),
      value: entry[key],
    };
  });

function StatsPanels({ stats }: { stats: UserStats }) {
  const tiles = [
    { label: "Movies watched", value: stats.totals.watched },
    { label: "Favorites", value: stats.totals.favorites },
    { label: "On the watchlist", value: stats.totals.watchlist },
    { label: "Lists", value: stats.totals.lists },
  ];

  return (
    <Stack gap="xl">
      <SimpleGrid cols={TILE_COLUMNS} spacing="md">
        {tiles.map((tile) => (
          <Paper key={tile.label} p="lg">
            <Text fz="2rem" fw={700} c="white" lh={1.1}>
              {tile.value}
            </Text>
            <Text size="sm" c="dimmed">
              {tile.label}
            </Text>
          </Paper>
        ))}
      </SimpleGrid>

      <Paper p="lg">
        <Title order={2} size="h4" c="white" mb="md">
          Favorite genres
        </Title>
        {stats.topGenres.length > 0 ? (
          <BarList
            label="Favorite genres, by number of watched and favorite movies"
            items={stats.topGenres.map((genre) => ({
              key: genre.id,
              label: genre.name,
              value: genre.count,
            }))}
            unit={["movie", "movies"]}
          />
        ) : (
          <Text c="dimmed" size="sm">
            Mark movies as watched or add favorites to see which genres you like most.
          </Text>
        )}
      </Paper>

      {/* Two charts rather than one: page views outnumber watched movies, so they need their own scale */}
      <SimpleGrid cols={CHART_COLUMNS} spacing="md">
        <Paper p="lg">
          <Title order={2} size="h4" c="white" mb="xs">
            Movies watched
          </Title>
          <ColumnChart
            label="Movies watched per month, last 12 months"
            columns={monthColumns(stats.activityByMonth, "watched")}
            unit={["movie watched", "movies watched"]}
          />
        </Paper>
        <Paper p="lg">
          <Title order={2} size="h4" c="white" mb="xs">
            Movie pages opened
          </Title>
          <ColumnChart
            label="Movie pages opened per month, last 12 months"
            columns={monthColumns(stats.activityByMonth, "views")}
            unit={["movie page opened", "movie pages opened"]}
          />
        </Paper>
      </SimpleGrid>
    </Stack>
  );
}
