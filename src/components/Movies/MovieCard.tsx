"use client";
import {
  Card,
  Image,
  Text,
  Group,
  Badge,
  ActionIcon,
  Box,
} from "@mantine/core";
import { Heart, Star } from "lucide-react";
import { useState } from "react";
import { Movie, getImageUrl } from "@/lib/external/tmdb";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface MovieCardProps {
  movie: Movie;
  size?: "sm" | "md" | "lg";
}

export const MovieCard = ({ movie, size = "md" }: MovieCardProps) => {
  const { user, updateFavorites } = useAuth();
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const isFavorited = user?.favorites?.includes(movie.id.toString()) || false;

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      router.push("/auth/login");
      return;
    }

    const currentFavorites = user.favorites || [];
    const movieIdStr = movie.id.toString();

    let newFavorites;
    if (isFavorited) {
      newFavorites = currentFavorites.filter((id) => id !== movieIdStr);
    } else {
      newFavorites = [...currentFavorites, movieIdStr];
    }

    updateFavorites(newFavorites);
  };

  const handleCardClick = () => {
    try {
      router.push(`/movie/${movie.id}`);
    } catch (error) {
      console.log(error);
    }
  };
  const cardHeight = size === "sm" ? 280 : size === "lg" ? 400 : 340;
  const imageHeight = size === "sm" ? 180 : size === "lg" ? 300 : 240;

  return (
    <Card
      data-aos="zoom-in"
      data-aos-duration="600"
      shadow="md"
      padding="md"
      radius="md"
      h={cardHeight}
      className="movie-card"
      bg="dark.7"
      style={{
        cursor: "pointer",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <Card.Section>
        <Image
          src={getImageUrl(movie.poster_path)}
          height={imageHeight}
          alt={movie.title}
          fallbackSrc="/placeholder-movie.jpg"
        />
      </Card.Section>

      <Box
        pos="absolute"
        top={8}
        right={8}
        style={{ opacity: isHovered ? 1 : 0, transition: "opacity 0.2s" }}
      >
        <ActionIcon
          variant="filled"
          radius="xl"
          color={isFavorited ? "red" : "dark"}
          size="md"
          onClick={toggleFavorite}
          className={`favorite-heart ${isFavorited ? "favorited" : ""}`}
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Heart size={16} fill={isFavorited ? "currentColor" : "none"} />
        </ActionIcon>
      </Box>

      <Text fw={600} size="sm" lineClamp={2} mt="xs" c="white">
        {movie.title}
      </Text>

      <Group justify="space-between" mt="xs">
        <Group gap={4}>
          <Star size={12} fill="#fbbf24" color="#fbbf24" />
          <Text size="xs" c="dimmed">
            {movie.vote_average.toFixed(1)}
          </Text>
        </Group>
        <Text size="xs" c="dimmed">
          {movie.release_date?.split("-")[0]}
        </Text>
      </Group>
    </Card>
  );
};
