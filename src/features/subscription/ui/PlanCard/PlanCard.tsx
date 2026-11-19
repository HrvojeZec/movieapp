"use client";
import type { ReactNode } from "react";
import { Badge, Button, Group, Indicator, List, Loader, Stack, Text, Title } from "@mantine/core";
import { Magnetic } from "@/shared/ui/motion/Magnetic";
import { RollingNumber } from "@/shared/ui/motion/RollingNumber/RollingNumber";
import { Check, CheckIcon, Star, Zap } from "lucide-react";
import type { BillingInterval, PlanDetails, SubscriptionPlan } from "@/features/subscription/types";
import { COLORS } from "@/shared/theme/colors";
import ShinyText from "@/shared/vendor/react-bits/ShinyText/ShinyText";
import SpotlightCard from "@/shared/vendor/react-bits/SpotlightCard/SpotlightCard";
import StarBorder from "@/shared/vendor/react-bits/StarBorder/StarBorder";
import classes from "./PlanCard.module.scss";

const PLAN_ICON_SIZE = 48;

const PLAN_ICONS: Record<SubscriptionPlan, ReactNode> = {
  basic: <Check size={PLAN_ICON_SIZE} color={COLORS.success} />,
  premium: <Star size={PLAN_ICON_SIZE} color={COLORS.primary} />,
  pro: <Zap size={PLAN_ICON_SIZE} color={COLORS.warning} />,
};

// The light that follows the pointer takes the plan's color
const SPOTLIGHT_COLORS: Record<SubscriptionPlan, string> = {
  basic: "rgba(16, 185, 129, 0.25)",
  premium: "rgba(59, 130, 246, 0.3)",
  pro: "rgba(245, 158, 11, 0.25)",
};

// A light sheen moving across the "Most Popular" label
const BADGE_SHINE = { base: "#dbeafe", highlight: "#ffffff" };

// A star traveling around the recommended plan's button
const STAR_BORDER = { thickness: 2, radius: 8, duration: 4 };
// StarBorder brings its own padding and surface; here it is only a frame around our button
const STAR_BORDER_FRAME_STYLE = { display: "flex", width: "100%", padding: STAR_BORDER.thickness };

interface PlanCardProps {
  plan: PlanDetails;
  /** Which price to show: per month or for a whole year. */
  interval: BillingInterval;
  isCurrent: boolean;
  buttonLabel: string;
  disabled: boolean;
  /** This plan's checkout is starting. */
  pending: boolean;
  /** Days of free trial a checkout would start with; none when the user can't get one. */
  trialDays?: number;
  onSubscribe: () => void;
}

export function PlanCard({
  plan,
  interval,
  isCurrent,
  buttonLabel,
  disabled,
  pending,
  trialDays,
  onSubscribe,
}: PlanCardProps) {
  const price = interval === "year" ? plan.yearlyPrice : plan.price;
  const cardClasses = [
    classes.card,
    classes[plan.id],
    plan.popular && classes.popular,
    isCurrent && classes.current,
  ];

  const button = (
    <Magnetic block>
      <Button
        fullWidth
        size="lg"
        variant={plan.popular ? "filled" : "outline"}
        color={plan.popular ? "blue" : "gray"}
        onClick={onSubscribe}
        disabled={disabled}
        className={`${classes.subscribe} ${plan.popular ? classes.highlighted : ""}`}
      >
        {pending ? <Loader size="sm" /> : buttonLabel}
      </Button>
    </Magnetic>
  );

  return (
    <Indicator disabled={!isCurrent} color="green" size="lg" label={<CheckIcon />}>
      <SpotlightCard
        className={cardClasses.filter(Boolean).join(" ")}
        spotlightColor={SPOTLIGHT_COLORS[plan.id]}
        theme="dark"
      >
        {plan.popular && (
          <Badge
            variant="filled"
            color="blue"
            size="lg"
            leftSection={<Star size={14} />}
            className={classes.badge}
          >
            <ShinyText
              text="Most Popular"
              color={BADGE_SHINE.base}
              shineColor={BADGE_SHINE.highlight}
            />
          </Badge>
        )}

        <Stack gap="md" align="center" mb="xl">
          <div className={classes.icon}>{PLAN_ICONS[plan.id]}</div>

          <Title size="xl" c="white">
            {plan.name}
          </Title>

          <Group gap={4} align="baseline">
            <Text size="3rem" fw={700} c="white">
              {/* Rolls to the new price on Monthly/Yearly; shown as is before JavaScript loads */}
              <RollingNumber value={price} prefix="$" decimals={price > 0 ? 2 : 0} rollIn={false} />
            </Text>
            {price > 0 && <Text c="dimmed">{interval === "year" ? "/year" : "/month"}</Text>}
          </Group>

          {trialDays && price > 0 ? (
            <Badge variant="light" color="teal" size="lg" className={classes.trial}>
              {trialDays}-day free trial
            </Badge>
          ) : null}
        </Stack>

        <List
          spacing="sm"
          size="sm"
          center
          icon={<Check size={16} color={COLORS.success} />}
          mb="xl"
        >
          {plan.features.map((feature) => (
            <List.Item key={feature.label} c="gray.3">
              {feature.label}
            </List.Item>
          ))}
        </List>

        {plan.popular && !disabled ? (
          <StarBorder
            as="div"
            color={COLORS.primary}
            thickness={STAR_BORDER.thickness}
            radius={STAR_BORDER.radius}
            duration={STAR_BORDER.duration}
            backgroundColor="transparent"
            style={STAR_BORDER_FRAME_STYLE}
          >
            {button}
          </StarBorder>
        ) : (
          button
        )}
      </SpotlightCard>
    </Indicator>
  );
}
