"use client";
import { ActionIcon, Button, Center, Group, Loader, Modal, Text, Title } from "@mantine/core";
import { Play, X } from "lucide-react";
import { useMovieVideos } from "@/features/movies/hooks/useMovieVideos";
import { getTrailerUrl } from "@/features/movies/lib/trailers";
import { COLORS } from "@/shared/theme/colors";
import classes from "./TrailerModal.module.scss";

const STAGE_HEIGHT = 400;
const YOUTUBE_PERMISSIONS =
  "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";

interface TrailerModalProps {
  opened: boolean;
  onClose: () => void;
  movieId: number;
  movieTitle: string;
}

export const TrailerModal = ({ opened, onClose, movieId, movieTitle }: TrailerModalProps) => {
  // Only fetched once the modal is opened; cached afterwards
  const {
    data: videos,
    isPending,
    isError,
    refetch,
  } = useMovieVideos(movieId, { enabled: opened });
  const trailerUrl = videos ? getTrailerUrl(videos) : null;
  const loading = opened && isPending;
  const noTrailer = Boolean(videos) && !trailerUrl;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      centered
      withCloseButton={false}
      classNames={{ content: classes.content, body: classes.body }}
    >
      <Group justify="space-between" p="md" className={classes.header}>
        <Group gap="sm">
          <Play size={20} color={COLORS.primary} />
          <Title size="lg" c="white">
            {movieTitle}
          </Title>
        </Group>
        <ActionIcon variant="subtle" size="lg" onClick={onClose} c="white" aria-label="Close">
          <X size={20} />
        </ActionIcon>
      </Group>

      <div className={classes.stage}>
        {loading && (
          <Center h={STAGE_HEIGHT}>
            <div className={classes.message}>
              <Loader size="lg" mb="md" />
              <Text c="white">Loading trailer...</Text>
            </div>
          </Center>
        )}

        {(isError || noTrailer) && (
          <Center h={STAGE_HEIGHT}>
            <div className={classes.message}>
              <Play size={48} color={COLORS.mutedDark} className={classes.messageIcon} />
              <Text size="lg" c="white" mb="xs">
                {isError ? "Failed to load trailer" : "No trailer available for this movie"}
              </Text>
              {isError ? (
                <Button variant="light" size="xs" onClick={() => refetch()}>
                  Try again
                </Button>
              ) : (
                <Text size="sm" c="dimmed">
                  This movie doesn&apos;t have a trailer available
                </Text>
              )}
            </div>
          </Center>
        )}

        {trailerUrl && !loading && (
          <div className={classes.player}>
            <iframe
              src={trailerUrl}
              title={`${movieTitle} Trailer`}
              allow={YOUTUBE_PERMISSIONS}
              allowFullScreen
            />
          </div>
        )}
      </div>
    </Modal>
  );
};
