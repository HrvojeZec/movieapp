"use client";
import Link from "next/link";
import { Button, type ButtonProps } from "@mantine/core";

type LinkButtonProps = ButtonProps & { href: string };

/**
 * A button-styled link. Server Components can't pass `component={Link}` to Mantine themselves
 * (a component is a function, which can't cross the server/client boundary), so this wraps it.
 */
export function LinkButton({ href, ...props }: LinkButtonProps) {
  return <Button component={Link} href={href} {...props} />;
}
