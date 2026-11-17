"use client";
import Link from "next/link";
import { ActionIcon, Box, Group, Text, UnstyledButton } from "@mantine/core";
import { Film, Flame, Search } from "lucide-react";
import { MovieSearchBox } from "@/features/movies/ui/MovieSearchBox/MovieSearchBox";
import { ROUTES } from "@/shared/routes";
import { COLORS } from "@/shared/theme/colors";
import { AccountArea } from "./AccountArea";
import classes from "./Navbar.module.scss";

const BAR_HEIGHT = 60;
const SEARCH_WIDTH = 300;

export const Navbar = () => (
  <header className={classes.header}>
    <Group justify="space-between" h={BAR_HEIGHT}>
      <Group>
        <Link href={ROUTES.home} className={classes.link}>
          <Group gap="sm">
            <Film size={32} color={COLORS.primary} />
            <Text size="xl" fw={700} c="white" visibleFrom="sm">
              MovieHub
            </Text>
          </Group>
        </Link>

        <Group gap="md" ml="xl" visibleFrom="md">
          <Link href={ROUTES.mostWatched} className={classes.link}>
            <UnstyledButton>
              <Group gap="xs">
                <Flame color="red" size={18} />
                <Text c="white">Most Watched</Text>
              </Group>
            </UnstyledButton>
          </Link>
        </Group>
        <Group gap="sm" ml="md" hiddenFrom="md">
          <Link href={ROUTES.mostWatched} className={classes.link}>
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
        <Box w={SEARCH_WIDTH} visibleFrom="sm">
          <MovieSearchBox placeholder="Search movies..." clearOnSubmit />
        </Box>

        <ActionIcon
          component={Link}
          href={ROUTES.search()}
          variant="subtle"
          size="lg"
          c="white"
          hiddenFrom="sm"
          aria-label="Search"
        >
          <Search size={20} />
        </ActionIcon>

        <AccountArea />
      </Group>
    </Group>
  </header>
);
