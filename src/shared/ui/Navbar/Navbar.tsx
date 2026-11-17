"use client";
import Link from "next/link";
import { ActionIcon, Box, Burger, Group, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Film, Search } from "lucide-react";
import { MovieSearchBox } from "@/features/movies/ui/MovieSearchBox/MovieSearchBox";
import { ROUTES } from "@/shared/routes";
import { COLORS } from "@/shared/theme/colors";
import { AccountArea } from "./AccountArea";
import { NavDrawer } from "./NavDrawer";
import { PRIMARY_LINKS } from "./nav-links";
import classes from "./Navbar.module.scss";

const BAR_HEIGHT = 60;
const SEARCH_WIDTH = 300;

export function Navbar() {
  const [drawerOpened, drawer] = useDisclosure(false);

  return (
    <header className={classes.header}>
      <Group justify="space-between" h={BAR_HEIGHT} wrap="nowrap">
        <Group gap="sm" wrap="nowrap">
          <Burger
            opened={drawerOpened}
            onClick={drawer.toggle}
            hiddenFrom="md"
            size="sm"
            aria-label={drawerOpened ? "Close navigation" : "Open navigation"}
          />

          <Link href={ROUTES.home} className={classes.link}>
            <Group gap="sm" wrap="nowrap">
              <Film size={32} color={COLORS.primary} />
              <Text size="xl" fw={700} c="white">
                MovieHub
              </Text>
            </Group>
          </Link>

          <Box component="nav" aria-label="Main" ml="xl" visibleFrom="md">
            <Group gap="lg" wrap="nowrap">
              {PRIMARY_LINKS.map(({ label, href, icon: Icon }) => (
                <Link key={href} href={href} className={classes.navLink}>
                  <Icon size={18} />
                  {label}
                </Link>
              ))}
            </Group>
          </Box>
        </Group>

        <Group gap="sm" wrap="nowrap">
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

      <NavDrawer opened={drawerOpened} onClose={drawer.close} />
    </header>
  );
}
