"use client";
import Link from "next/link";
import { ActionIcon, Box, Burger, Group, Text } from "@mantine/core";
import { useDisclosure, useWindowScroll } from "@mantine/hooks";
import { Film, Search } from "lucide-react";
import { useCommandPaletteStore } from "@/features/movies/store/command-palette.store";
import { ShortcutHint } from "@/features/movies/ui/CommandPalette/ShortcutHint";
import { MovieSearchBox } from "@/features/movies/ui/MovieSearchBox/MovieSearchBox";
import { APP_NAME } from "@/shared/constants";
import { ROUTES } from "@/shared/routes";
import { COLORS } from "@/shared/theme/colors";
import { MobileMenu } from "@/shared/ui/MobileMenu/MobileMenu";
import { SidebarToggle } from "@/shared/ui/Sidebar/SidebarToggle";
import { AccountArea } from "./AccountArea";
import classes from "./Navbar.module.scss";

const BAR_HEIGHT = 48;
const SEARCH_WIDTH = 320;

/**
 * The top bar across the whole width, above the sidebar: the sidebar toggle (the menu button on
 * phones) and the logo, which never move, then search and notifications. It turns to glass once
 * the page scrolls under it.
 */
export function Navbar() {
  const [menuOpened, menu] = useDisclosure(false);
  const openPalette = useCommandPaletteStore((state) => state.open);
  const [scroll] = useWindowScroll();

  return (
    // A div: AppShell.Header around it is already the page's one banner
    <div className={classes.header} data-scrolled={scroll.y > 0 || undefined}>
      <Group justify="space-between" h={BAR_HEIGHT} wrap="nowrap">
        <Group gap="sm" wrap="nowrap" className={classes.start}>
          <Burger
            opened={menuOpened}
            onClick={menu.toggle}
            size="sm"
            hiddenFrom="sm"
            aria-label={menuOpened ? "Close navigation" : "Open navigation"}
          />
          <Box visibleFrom="sm">
            <SidebarToggle />
          </Box>
          <Link href={ROUTES.home} className={classes.link}>
            <Group gap="xs" wrap="nowrap">
              <Film size={28} color={COLORS.primary} />
              <Text size="lg" fw={700} c="white">
                {APP_NAME}
              </Text>
            </Group>
          </Link>
        </Group>

        <Box w={SEARCH_WIDTH} maw="100%" visibleFrom="sm">
          <MovieSearchBox
            placeholder="Search movies..."
            clearOnSubmit
            rightSection={<ShortcutHint />}
          />
        </Box>

        <Group gap="sm" wrap="nowrap">
          {/* On phones the search opens as a full-screen palette */}
          <ActionIcon
            onClick={openPalette}
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

      <MobileMenu opened={menuOpened} onClose={menu.close} />
    </div>
  );
}
