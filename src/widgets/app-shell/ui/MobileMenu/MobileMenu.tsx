"use client";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ActionIcon, Avatar, Group, Modal, Text, UnstyledButton } from "@mantine/core";
import { CreditCard, LogOut, User, X } from "lucide-react";
import { motion, type PanInfo } from "motion/react";
import { useAuth } from "@/entities/user/hooks/useAuth";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { MovieSearchBox } from "@/features/search-movies/ui/MovieSearchBox/MovieSearchBox";
import { useEntitlements } from "@/entities/user/hooks/useEntitlements";
import { getPlanName } from "@/entities/subscription/lib/entitlements";
import { APP_NAME } from "@/shared/constants";
import { ROUTES } from "@/shared/routes";
import { SPRINGS, STAGGER_STEP } from "@/shared/ui/motion/motion.constants";
import { AuthButtons } from "@/widgets/app-shell/ui/Navbar/AuthButtons";
import { lockedPlanName, visibleGroups } from "@/widgets/app-shell/ui/Sidebar/sidebar-links";
import classes from "./MobileMenu.module.scss";

// The panel can be pulled this far left; past the threshold (or flicked fast enough) it closes
const DRAG_LIMIT_PX = 320;
const CLOSE_OFFSET_PX = 96;
const CLOSE_VELOCITY = 500;
const ENTER_OFFSET_PX = 16;
// Rows further down start together, so the whole menu is in within half a second
const MAX_STAGGERED_ROWS = 8;

interface MobileMenuProps {
  opened: boolean;
  onClose: () => void;
}

/**
 * Navigation for phones, over the whole screen: it slides in from the left over a blurred page,
 * its rows follow one after another, and it closes with the X, Escape or a swipe to the left.
 */
export function MobileMenu({ opened, onClose }: MobileMenuProps) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const { plan } = useEntitlements();
  const logout = useLogout();

  // Any navigation (a link, a search result) closes the menu
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  const closeOnSwipe = (_event: PointerEvent, { offset, velocity }: PanInfo) => {
    if (offset.x < -CLOSE_OFFSET_PX || velocity.x < -CLOSE_VELOCITY) onClose();
  };

  const groups = visibleGroups(user);
  let row = 0;
  // Each row enters a step after the one above it
  const enter = () => ({
    initial: { opacity: 0, x: -ENTER_OFFSET_PX },
    animate: { opacity: 1, x: 0 },
    transition: { ...SPRINGS.gentle, delay: Math.min(row++, MAX_STAGGERED_ROWS) * STAGGER_STEP },
  });

  return (
    <Modal.Root
      opened={opened}
      onClose={onClose}
      fullScreen
      // Motion animates the panel; Mantine's own transition would run on top of it
      transitionProps={{ duration: 0 }}
    >
      <Modal.Overlay className={classes.overlay} />
      <Modal.Content className={classes.content}>
        <motion.div
          className={classes.panel}
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          transition={SPRINGS.snappy}
          drag="x"
          dragConstraints={{ left: -DRAG_LIMIT_PX, right: 0 }}
          dragElastic={{ left: 0.2, right: 0 }}
          dragSnapToOrigin
          onDragEnd={closeOnSwipe}
          data-menu-panel
        >
          <Group justify="space-between" className={classes.header}>
            <Modal.Title className={classes.title}>{APP_NAME}</Modal.Title>
            <ActionIcon
              variant="subtle"
              size="lg"
              c="white"
              aria-label="Close menu"
              onClick={onClose}
            >
              <X size={22} />
            </ActionIcon>
          </Group>

          {!loading && (
            <motion.div {...enter()}>
              {user ? (
                <Link href={ROUTES.profile} className={classes.profile} onClick={onClose}>
                  <Avatar size={48} color="blue" radius="xl">
                    {user.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <div className={classes.profileText}>
                    <Text fw={600} c="white" truncate>
                      {user.name}
                    </Text>
                    <Text size="sm" c="dimmed">
                      {getPlanName(plan)} plan
                    </Text>
                  </div>
                </Link>
              ) : (
                <div className={classes.signIn}>
                  <Text fw={600} c="white">
                    Sign in to save movies
                  </Text>
                  <Text size="sm" c="dimmed" mb="sm">
                    Favorites, a watchlist and your own lists, on every device.
                  </Text>
                  <AuthButtons fullWidth />
                </div>
              )}
            </motion.div>
          )}

          <motion.div {...enter()}>
            <MovieSearchBox placeholder="Search movies..." clearOnSubmit />
          </motion.div>

          <nav aria-label="Main" className={classes.nav}>
            {groups.map((group) => (
              <div key={group.label} className={classes.group}>
                <motion.p className={classes.groupLabel} {...enter()}>
                  {group.label}
                </motion.p>
                {group.links
                  // The search box above replaces the sidebar's search entry
                  .filter((link) => !link.opensSearch)
                  .map((link) => {
                    const Icon = link.icon;
                    const locked = lockedPlanName(link, plan);
                    return (
                      <motion.div key={link.label} {...enter()}>
                        <Link
                          href={link.href}
                          className={classes.link}
                          aria-current={pathname === link.href ? "page" : undefined}
                          onClick={onClose}
                        >
                          <Icon size={22} />
                          <span className={classes.linkLabel}>{link.label}</span>
                          {locked && <span className={classes.plan}>{locked}</span>}
                        </Link>
                      </motion.div>
                    );
                  })}
              </div>
            ))}
          </nav>

          {user && (
            <motion.div className={classes.account} {...enter()}>
              <Link href={ROUTES.pricing} className={classes.link} onClick={onClose}>
                <CreditCard size={22} />
                <span className={classes.linkLabel}>Subscription</span>
              </Link>
              <Link href={ROUTES.profile} className={classes.link} onClick={onClose}>
                <User size={22} />
                <span className={classes.linkLabel}>Profile</span>
              </Link>
              <UnstyledButton
                className={classes.link}
                onClick={() => {
                  onClose();
                  logout.mutate();
                }}
              >
                <LogOut size={22} />
                <span className={classes.linkLabel}>Logout</span>
              </UnstyledButton>
            </motion.div>
          )}
        </motion.div>
      </Modal.Content>
    </Modal.Root>
  );
}
