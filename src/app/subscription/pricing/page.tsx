"use client";
import { useState, type ReactNode } from "react";
import {
  Container,
  Title,
  Text,
  SimpleGrid,
  Card,
  Button,
  List,
  Badge,
  Group,
  Stack,
  Loader,
  Indicator,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Check, Star, Zap, CheckIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { SUBSCRIPTION_PLANS, type PlanDetails } from "@/utils";
import {
  hasActiveSubscription,
  isPaidPlan,
  type PaidPlan,
  type SubscriptionPlan,
} from "@/lib/payments/plans";

const PLAN_ICONS: Record<SubscriptionPlan, ReactNode> = {
  basic: <Check size={48} color="#10b981" />,
  premium: <Star size={48} color="#3b82f6" />,
  pro: <Zap size={48} color="#f59e0b" />,
};

export default function PricingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<PaidPlan | null>(null);

  const isSubscribed = hasActiveSubscription(user?.subscriptionStatus);
  const currentPlan: SubscriptionPlan =
    isSubscribed && isPaidPlan(user?.subscriptionPlan) ? user.subscriptionPlan : "basic";

  const handleSubscribe = async (plan: PaidPlan) => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    setLoadingPlan(plan);
    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data: { url?: string; message?: string } = await response.json();

      if (!response.ok || !data.url) {
        throw new Error(data.message ?? "Could not start checkout");
      }

      window.location.assign(data.url);
    } catch (error) {
      notifications.show({
        title: "Checkout failed",
        message: error instanceof Error ? error.message : "Could not start checkout",
        color: "red",
      });
      setLoadingPlan(null);
    }
  };

  const getButtonLabel = (plan: PlanDetails) => {
    if (plan.id === currentPlan) return "Current Plan";
    if (plan.id === "basic") return "Free";
    if (isSubscribed) return "Plan changes coming soon";
    return `Subscribe to ${plan.name}`;
  };

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl" align="center">
        <div data-aos="fade-down">
          <Title size="3rem" fw={700} ta="center" c="white" mb="md">
            Choose Your Plan
          </Title>
          <Text size="xl" ta="center" c="dimmed" maw={600}>
            Unlock premium features and enhance your movie discovery experience
          </Text>
        </div>

        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl" w="100%">
          {SUBSCRIPTION_PLANS.map((plan, index) => {
            const isCurrentPlan = plan.id === currentPlan;
            const paidPlan = isPaidPlan(plan.id) ? plan.id : null;
            const canSubscribe = paidPlan !== null && !isSubscribed;

            return (
              <Indicator
                key={plan.id}
                disabled={!isCurrentPlan}
                color="green"
                size="lg"
                label={<CheckIcon />}
              >
                <Card
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                  p="xl"
                  radius="lg"
                  bg="dark.7"
                  className={`subscription-card ${plan.popular ? "popular" : ""} ${plan.id}`}
                  style={{
                    border: isCurrentPlan
                      ? "2px solid #10b981"
                      : plan.popular
                        ? "2px solid #3b82f6"
                        : "1px solid rgba(255, 255, 255, 0.1)",
                    position: "relative",
                    transform: plan.popular ? "scale(1.05)" : "scale(1)",
                  }}
                >
                  {plan.popular && (
                    <Badge
                      variant="filled"
                      color="blue"
                      size="lg"
                      leftSection={<Star size={14} />}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: "50%",
                        transform: "translateX(-50%)",
                      }}
                    >
                      Most Popular
                    </Badge>
                  )}

                  <Stack gap="md" align="center" mb="xl">
                    <div style={{ textAlign: "center" }}>{PLAN_ICONS[plan.id]}</div>

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
                    icon={<Check size={16} color="#10b981" />}
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
                    onClick={() => paidPlan && handleSubscribe(paidPlan)}
                    disabled={!canSubscribe || loadingPlan !== null}
                    className={plan.popular ? "blue" : ""}
                    styles={{
                      root: {
                        transition: "all 0.3s ease",
                        "&:hover:not(:disabled)": {
                          transform: "translateY(-2px)",
                          boxShadow: plan.popular
                            ? "0 8px 25px rgba(59, 130, 246, 0.4)"
                            : "0 8px 25px rgba(255, 255, 255, 0.1)",
                        },
                      },
                    }}
                  >
                    {loadingPlan === plan.id ? <Loader size="sm" /> : getButtonLabel(plan)}
                  </Button>
                </Card>
              </Indicator>
            );
          })}
        </SimpleGrid>

        <div data-aos="fade-up" data-aos-delay="400">
          <Text ta="center" c="dimmed" size="sm">
            Payments run in Stripe test mode. Use card 4242 4242 4242 4242 with any future date and
            any CVC.
          </Text>
        </div>
      </Stack>
    </Container>
  );
}
