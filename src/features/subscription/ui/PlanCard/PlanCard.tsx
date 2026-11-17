"use client";
import type { ReactNode } from "react";
import {
  Badge,
  Button,
  Card,
  Group,
  Indicator,
  List,
  Loader,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { Check, CheckIcon, Star, Zap } from "lucide-react";
import type { PlanDetails, SubscriptionPlan } from "@/features/subscription/types";
import { COLORS } from "@/shared/theme/colors";
import classes from "./PlanCard.module.scss";

const PLAN_ICON_SIZE = 48;

const PLAN_ICONS: Record<SubscriptionPlan, ReactNode> = {
  basic: <Check size={PLAN_ICON_SIZE} color={COLORS.success} />,
  premium: <Star size={PLAN_ICON_SIZE} color={COLORS.primary} />,
  pro: <Zap size={PLAN_ICON_SIZE} color={COLORS.warning} />,
};

interface PlanCardProps {
  plan: PlanDetails;
  isCurrent: boolean;
  buttonLabel: string;
  disabled: boolean;
  /** This plan's checkout is starting. */
  pending: boolean;
  onSubscribe: () => void;
  animationDelay: number;
}

export function PlanCard({
  plan,
  isCurrent,
  buttonLabel,
  disabled,
  pending,
  onSubscribe,
  animationDelay,
}: PlanCardProps) {
  const cardClasses = [
    classes.card,
    classes[plan.id],
    plan.popular && classes.popular,
    isCurrent && classes.current,
  ];

  return (
    <Indicator disabled={!isCurrent} color="green" size="lg" label={<CheckIcon />}>
      <Card
        data-aos="fade-up"
        data-aos-delay={animationDelay}
        p="xl"
        radius="lg"
        className={cardClasses.filter(Boolean).join(" ")}
      >
        {plan.popular && (
          <Badge
            variant="filled"
            color="blue"
            size="lg"
            leftSection={<Star size={14} />}
            className={classes.badge}
          >
            Most Popular
          </Badge>
        )}

        <Stack gap="md" align="center" mb="xl">
          <div className={classes.icon}>{PLAN_ICONS[plan.id]}</div>

          <Title size="xl" c="white">
            {plan.name}
          </Title>

          <Group gap={4} align="baseline">
            <Text size="3rem" fw={700} c="white">
              ${plan.price}
            </Text>
            {plan.price > 0 && <Text c="dimmed">/month</Text>}
          </Group>
        </Stack>

        <List
          spacing="sm"
          size="sm"
          center
          icon={<Check size={16} color={COLORS.success} />}
          mb="xl"
        >
          {plan.features.map((feature) => (
            <List.Item key={feature.label} c={feature.comingSoon ? "dimmed" : "gray.3"}>
              <Group gap={6} wrap="nowrap">
                {feature.label}
                {feature.comingSoon && (
                  <Badge size="xs" variant="light" color="gray">
                    Coming soon
                  </Badge>
                )}
              </Group>
            </List.Item>
          ))}
        </List>

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
      </Card>
    </Indicator>
  );
}
