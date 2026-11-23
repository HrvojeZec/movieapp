import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Anchor, Container, Stack, Text, Title } from "@mantine/core";
import { APP_NAME, REPO_URL } from "@/shared/constants";
import { ROUTES } from "@/shared/routes";
import { TMDB_LOGO, TMDB_NOTICE, TMDB_URL } from "@/shared/tmdb-attribution";
import classes from "./AboutView.module.scss";

const REACT_BITS_URL = "https://reactbits.dev";
const YOUTUBE_TERMS_URL = "https://www.youtube.com/t/terms";
// Production builds from master, so the notices linked here match the code that is running
const THIRD_PARTY_NOTICES_URL = `${REPO_URL}/blob/master/THIRD_PARTY_NOTICES.md`;
const LICENSE_URL = `${REPO_URL}/blob/master/LICENSE`;
const TMDB_LOGO_SIZE = { width: 182, height: 24 };

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Anchor href={href} target="_blank" rel="noopener noreferrer" className={classes.link}>
      {children}
    </Anchor>
  );
}

// A heading-labelled <section> is a "region" landmark, so each part can be found on its own
function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <Stack component="section" aria-labelledby={id} gap="sm">
      <Title id={id} order={2} size="h3" c="white">
        {title}
      </Title>
      {children}
    </Stack>
  );
}

export function AboutView() {
  return (
    <Container size="sm" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={1} c="white" mb="xs">
            About &amp; credits
          </Title>
          <Text c="dimmed">What {APP_NAME} is, and whose work it is built on.</Text>
        </div>

        <Section id="about-app" title={`About ${APP_NAME}`}>
          <Text>
            {APP_NAME} is a non-commercial portfolio project: browse and search movies, keep
            favorites, a watchlist and your own lists, and get recommendations and statistics built
            from what you watch.
          </Text>
          <Text>
            It is a demo. The paid plans are there to show a real subscription flow, but payments
            run in Stripe test mode, so no real money is ever charged. The{" "}
            <Link href={ROUTES.pricing} className={classes.link}>
              pricing page
            </Link>{" "}
            lists the test card to use.
          </Text>
          <Text>
            The source code is on <ExternalLink href={REPO_URL}>GitHub</ExternalLink>, and{" "}
            {APP_NAME}&apos;s own code is{" "}
            <ExternalLink href={LICENSE_URL}>MIT licensed</ExternalLink>.
          </Text>
        </Section>

        <Section id="movie-data" title="Movie data">
          <a href={TMDB_URL} target="_blank" rel="noopener noreferrer" className={classes.tmdbLogo}>
            <Image src={TMDB_LOGO.src} alt={TMDB_LOGO.alt} {...TMDB_LOGO_SIZE} />
          </a>
          <Text>
            Movie titles, posters, ratings, cast and trailer listings come from{" "}
            <ExternalLink href={TMDB_URL}>TMDB</ExternalLink> (The Movie Database) through its API.{" "}
            {TMDB_NOTICE}
          </Text>
          <Text>
            As TMDB&apos;s terms require, data kept from TMDB, such as the genres of the movies you
            mark as watched, is refreshed and never stored for longer than 6 months.
          </Text>
        </Section>

        <Section id="trailers" title="Trailers">
          <Text>
            Trailers play from YouTube in an embedded player, so YouTube&apos;s{" "}
            <ExternalLink href={YOUTUBE_TERMS_URL}>terms of service</ExternalLink> apply when you
            play one.
          </Text>
        </Section>

        <Section id="software" title="Open-source software">
          <Text>
            {APP_NAME} is built with Next.js, React, Mantine, TanStack Query, Motion and other
            open-source libraries, each under its own license.
          </Text>
          <Text>
            Some animated effects, such as the blurred and glare effects on posters and the login
            background, come from <ExternalLink href={REACT_BITS_URL}>React Bits</ExternalLink> by
            David Haz, used under the MIT + Commons Clause license. The full license texts are in
            the project&apos;s{" "}
            <ExternalLink href={THIRD_PARTY_NOTICES_URL}>third-party notices</ExternalLink>.
          </Text>
        </Section>
      </Stack>
    </Container>
  );
}
