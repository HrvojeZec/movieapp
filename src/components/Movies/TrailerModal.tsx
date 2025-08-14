"use client";
import {
  Modal,
  Title,
  Text,
  Loader,
  Center,
  Group,
  ActionIcon,
} from "@mantine/core";
import { X, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { getMovieVideos, getTrailerUrl } from "@/lib/external/tmdb";

interface TrailerModalProps {
  opened: boolean;
  onClose: () => void;
  movieId: number;
  movieTitle: string;
}

export const TrailerModal = ({
  opened,
  onClose,
  movieId,
  movieTitle,
}: TrailerModalProps) => {
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (opened && movieId) {
      fetchTrailer();
    }
  }, [opened, movieId]);

  const fetchTrailer = async () => {
    setLoading(true);
    setError(null);

    try {
      const videos = await getMovieVideos(movieId);
      const url = getTrailerUrl(videos);

      if (url) {
        setTrailerUrl(url);
      } else {
        setError("No trailer available for this movie");
      }
    } catch (error) {
      console.error("Failed to fetch trailer:", error);
      setError("Failed to load trailer");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTrailerUrl(null);
    setError(null);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
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
        <ActionIcon variant="subtle" size="lg" onClick={handleClose} c="white">
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

        {error && (
          <Center h={400}>
            <div style={{ textAlign: "center" }}>
              <Play
                size={48}
                color="#6b7280"
                style={{ margin: "0 auto 16px" }}
              />
              <Text size="lg" c="white" mb="xs">
                {error}
              </Text>
              <Text size="sm" c="dimmed">
                This movie doesn't have a trailer available
              </Text>
            </div>
          </Center>
        )}

        {trailerUrl && !loading && (
          <div
            style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}
          >
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
