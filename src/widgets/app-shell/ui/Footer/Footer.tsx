import Image from "next/image";
import Link from "next/link";
import { Anchor, Box, Container, Group, Stack, Text } from "@mantine/core";
import { Film } from "lucide-react";
import { ROUTES } from "@/shared/routes";
import { COLORS } from "@/shared/theme/colors";
import classes from "./Footer.module.scss";

const TMDB_URL = "https://www.themoviedb.org";
// TMDB's official logo (public/tmdb-logo.svg, 273×36): shown smaller than our own name, as their
// attribution rules require
const TMDB_LOGO = { src: "/tmdb-logo.svg", width: 122, height: 16 };

const FOOTER_LINKS = [
  { label: "Most Watched", href: ROUTES.mostWatched },
  { label: "Search", href: ROUTES.search() },
  { label: "Pricing", href: ROUTES.pricing },
];

export function Footer() {
  return (
    <footer className={classes.footer}>
      <Container size="xl">
        <Stack gap="md">
          <Group justify="space-between" align="flex-start" gap="lg">
            <Group gap="xs">
              <Film size={20} color={COLORS.primary} />
              <Text fw={700} c="white">
                MovieHub
              </Text>
            </Group>

            <Box component="nav" aria-label="Footer">
              <Group gap="lg">
                {FOOTER_LINKS.map(({ label, href }) => (
                  <Link key={href} href={href} className={classes.link}>
                    {label}
                  </Link>
                ))}
              </Group>
            </Box>
          </Group>

          {/* Required by the TMDB API terms of use */}
          <Group gap="sm" wrap="wrap">
            <a
              href={TMDB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={classes.tmdbLogo}
            >
              <Image {...TMDB_LOGO} alt="TMDB (The Movie Database)" />
            </a>
            <Text size="sm" c="dimmed">
              Movie data and images from{" "}
              <Anchor
                href={TMDB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={classes.tmdbLink}
              >
                TMDB
              </Anchor>
              . This product uses the TMDB API but is not endorsed or certified by TMDB.
            </Text>
          </Group>

          <Text size="xs" c="dimmed">
            © {new Date().getFullYear()} MovieHub. A portfolio project; payments run in Stripe test
            mode.
          </Text>
        </Stack>
      </Container>
    </footer>
  );
}
