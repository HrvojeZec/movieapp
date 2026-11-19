import { beforeEach, describe, expect, it } from "vitest";
import {
  posterTransitionName,
  useViewTransitionStore,
} from "@/features/movies/store/view-transition.store";

describe("view transition store", () => {
  beforeEach(() => {
    useViewTransitionStore.setState({ activeCard: null });
  });

  it("remembers the clicked movie", () => {
    useViewTransitionStore.getState().setActive("row-1:550");
    expect(useViewTransitionStore.getState().activeCard).toBe("row-1:550");
  });

  it("only the latest card is active, even when the same movie is in another row", () => {
    const { setActive } = useViewTransitionStore.getState();
    setActive("row-1:550");
    setActive("row-2:550");
    expect(useViewTransitionStore.getState().activeCard).toBe("row-2:550");
  });

  it("names the poster after its movie", () => {
    expect(posterTransitionName(550)).toBe("movie-poster-550");
  });
});
