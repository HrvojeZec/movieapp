"use client";
import { useState } from "react";
import { ActionIcon, Group, Image, Text } from "@mantine/core";
import { ArrowDown, ArrowUp, GripVertical } from "lucide-react";
import { Reorder, useDragControls } from "motion/react";
import { PLACEHOLDER_POSTER } from "@/features/movies/constants";
import { getImageUrl } from "@/features/movies/lib/images";
import type { MovieSummary } from "@/features/movies/types";
import classes from "./ReorderList.module.scss";

const THUMBNAIL = { width: 40, height: 60 };

interface ReorderListProps {
  /** The list's movie IDs in their saved order. */
  movieIds: string[];
  movies: MovieSummary[];
  /** Saves an order; called when a drag ends or a move button is pressed. */
  onCommit: (movieIds: string[]) => void;
}

const sameOrder = (a: string[], b: string[]) =>
  a.length === b.length && a.every((id, index) => id === b[index]);

/**
 * The list as rows that can be dragged by their grip (the others make way on a spring) or moved
 * with the up and down buttons. Mounted fresh each time reordering starts, so it begins from the
 * saved order.
 */
export function ReorderList({ movieIds, movies, onCommit }: ReorderListProps) {
  const [order, setOrder] = useState(movieIds);
  const byId = new Map(movies.map((movie) => [String(movie.id), movie]));

  const commit = (next: string[]) => {
    if (!sameOrder(next, movieIds)) onCommit(next);
  };
  const move = (index: number, offset: -1 | 1) => {
    const next = [...order];
    [next[index], next[index + offset]] = [next[index + offset], next[index]];
    setOrder(next);
    commit(next);
  };

  return (
    <Reorder.Group axis="y" values={order} onReorder={setOrder} as="ol" className={classes.list}>
      {order.map((id, index) => (
        <ReorderRow
          key={id}
          id={id}
          movie={byId.get(id)}
          first={index === 0}
          last={index === order.length - 1}
          onMove={(offset) => move(index, offset)}
          onDragEnd={() => commit(order)}
        />
      ))}
    </Reorder.Group>
  );
}

interface ReorderRowProps {
  id: string;
  movie?: MovieSummary;
  first: boolean;
  last: boolean;
  onMove: (offset: -1 | 1) => void;
  onDragEnd: () => void;
}

function ReorderRow({ id, movie, first, last, onMove, onDragEnd }: ReorderRowProps) {
  // Only the grip starts a drag, so the buttons and the rest of the row stay clickable
  const controls = useDragControls();
  const title = movie?.title ?? `Movie ${id}`;

  return (
    <Reorder.Item
      value={id}
      dragListener={false}
      dragControls={controls}
      onDragEnd={onDragEnd}
      className={classes.row}
      whileDrag={{ scale: 1.02 }}
    >
      <span className={classes.grip} onPointerDown={(event) => controls.start(event)} aria-hidden>
        <GripVertical size={18} />
      </span>
      <Image
        src={getImageUrl(movie?.poster_path ?? null, "w200")}
        alt=""
        w={THUMBNAIL.width}
        h={THUMBNAIL.height}
        radius="sm"
        fallbackSrc={PLACEHOLDER_POSTER}
      />
      <Text c="white" fw={500} className={classes.title} lineClamp={1}>
        {title}
      </Text>
      <Group gap={4} wrap="nowrap">
        <ActionIcon
          variant="subtle"
          color="gray"
          disabled={first}
          onClick={() => onMove(-1)}
          aria-label={`Move ${title} up`}
        >
          <ArrowUp size={16} />
        </ActionIcon>
        <ActionIcon
          variant="subtle"
          color="gray"
          disabled={last}
          onClick={() => onMove(1)}
          aria-label={`Move ${title} down`}
        >
          <ArrowDown size={16} />
        </ActionIcon>
      </Group>
    </Reorder.Item>
  );
}
