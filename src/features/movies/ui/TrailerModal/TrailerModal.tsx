"use client";
import { Modal, Title, Text, Loader, Center, Group, ActionIcon, Button } from "@mantine/core";
import { X, Play } from "lucide-react";
import { getTrailerUrl } from "@/features/movies/lib/trailers";
import { useMovieVideos } from "@/features/movies/hooks/useMovieVideos";

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
      styles={{
        content: {
          backgroundColor: "#1a1b23",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        },
        body: {
          padding: 0,
        },
      }}
    >
      <Group
        justify="space-between"
        p="md"
        style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}
      >
        <Group gap="sm">
          <Play size={20} color="#3b82f6" />
          <Title size="lg" c="white">
            {movieTitle}
          </Title>
        </Group>
        <ActionIcon variant="subtle" size="lg" onClick={onClose} c="white">
          <X size={20} />
        </ActionIcon>
      </Group>

      <div style={{ minHeight: 400 }}>
        {loading && (
          <Center h={400}>
            <div style={{ textAlign: "center" }}>
              <Loader size="lg" mb="md" />
              <Text c="white">Loading trailer...</Text>
            </div>
          </Center>
        )}

        {(isError || noTrailer) && (
          <Center h={400}>
            <div style={{ textAlign: "center" }}>
              <Play size={48} color="#6b7280" style={{ margin: "0 auto 16px" }} />
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
          <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
            <iframe
              src={trailerUrl}
              title={`${movieTitle} Trailer`}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                border: "none",
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
      </div>
    </Modal>
  );
};
