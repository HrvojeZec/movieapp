"use client";
import type { ReactNode } from "react";
import { Container, Paper, Title } from "@mantine/core";
import { AuthBackground } from "@/features/auth/ui/AuthBackground/AuthBackground";
import BlurText from "@/shared/vendor/react-bits/BlurText/BlurText";
import classes from "./AuthLayout.module.scss";

// Words of the subtitle come into focus one after another
const SUBTITLE_WORD_DELAY_MS = 60;

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

/** The frame of every account page: animated background, title, subtitle and a card. */
export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className={classes.stage}>
      <AuthBackground />
      <Container size="xs" py="xl" className={classes.content}>
        <Title ta="center" c="white" mb="xs">
          {title}
        </Title>
        <BlurText
          key={subtitle}
          text={subtitle}
          className={classes.subtitle}
          delay={SUBTITLE_WORD_DELAY_MS}
          trigger="load"
        />
        <Paper shadow="md" p="xl" radius="md">
          {children}
        </Paper>
      </Container>
    </div>
  );
}
