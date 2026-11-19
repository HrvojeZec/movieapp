import { List, Text, Title } from "@mantine/core";
import { Check } from "lucide-react";
import type { PlanDetails } from "@/entities/subscription/types";
import { APP_NAME } from "@/shared/constants";
import classes from "./SubscriptionTicket.module.scss";

const CHECK_SIZE = 16;

/** A paid plan shown as a cinema admission ticket: what it includes, and a stub with the price. */
export function SubscriptionTicket({ plan }: { plan: PlanDetails }) {
  return (
    <section
      aria-label={`${plan.name} subscription`}
      className={`${classes.ticket} ${classes[plan.id]}`}
    >
      <div className={classes.main}>
        <Text size="sm" c="dimmed">
          {APP_NAME}
        </Text>
        <Title order={2} className={classes.plan}>
          {plan.name}
        </Title>
        <List
          spacing="xs"
          size="sm"
          mt="md"
          icon={<Check size={CHECK_SIZE} className={classes.check} />}
        >
          {plan.features.map((feature) => (
            <List.Item key={feature.label}>{feature.label}</List.Item>
          ))}
        </List>
      </div>

      <div className={classes.stub}>
        <Text className={classes.price}>${plan.price}</Text>
        <Text size="sm" c="dimmed">
          per month
        </Text>
        <Text size="xs" c="dimmed" className={classes.admit}>
          Admit one
        </Text>
      </div>
    </section>
  );
}
