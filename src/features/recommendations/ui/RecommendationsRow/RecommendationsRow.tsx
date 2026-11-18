"use client";
import { Anchor, Group, Paper, Stack, Text, ThemeIcon } from "@mantine/core";
import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { HorizontalMovieScroll } from "@/features/movies/ui/HorizontalMovieScroll/HorizontalMovieScroll";
import { RECOMMENDATIONS_ROW_LIMIT } from "@/features/recommendations/constants";
import { useRecommendations } from "@/features/recommendations/hooks/useRecommendations";
import { useEntitlements } from "@/features/subscription/hooks/useEntitlements";
import { ROUTES } from "@/shared/routes";
import { COLORS } from "@/shared/theme/colors";
import { LinkButton } from "@/shared/ui/LinkButton/LinkButton";
import { QueryError } from "@/shared/ui/QueryError/QueryError";
import classes from "./RecommendationsRow.module.scss";

const TITLE = "Recommended for you";

/**
 * "Recommended for you" on the home page: Pro sees its picks, other plans a short note on what Pro
 * would add, logged-out visitors nothing.
 */
export function RecommendationsRow() {
  const { user } = useAuth();
  const { can, loading } = useEntitlements();
  const canUse = can("recommendations");
  const { data, isPending, isError, refetch } = useRecommendations({ enabled: canUse });

  if (!user || loading) return null;

  if (!canUse) {
    return (
      <Paper p="lg" className={classes.locked}>
        <Group justify="space-between" gap="md">
          <Group gap="md" wrap="nowrap">
            <ThemeIcon size="lg" radius="xl" variant="light">
              <Lock size={18} />
            </ThemeIcon>
            <Stack gap={2}>
              <Text fw={600} c="white">
                {TITLE}
              </Text>
              <Text size="sm" c="dimmed">
                Pro picks movies for you from your favorites, watched movies and watchlist.
              </Text>
            </Stack>
          </Group>
          <LinkButton href={ROUTES.pricing} size="sm">
            See Pro
          </LinkButton>
        </Group>
      </Paper>
    );
  }

  if (isError)
    return <QueryError message="Recommendations couldn't be loaded." onRetry={refetch} />;

  return (
    <HorizontalMovieScroll
      title={TITLE}
      icon={<Sparkles size={18} color={COLORS.primary} />}
      movies={data?.results.slice(0, RECOMMENDATIONS_ROW_LIMIT) ?? []}
      loading={isPending}
      action={
        <Anchor component={Link} href={ROUTES.recommendations} size="sm">
          See all
        </Anchor>
      }
    />
  );
}
