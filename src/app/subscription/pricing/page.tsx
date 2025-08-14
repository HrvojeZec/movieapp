"use client";
import { useState } from "react";
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
  Center,
  Loader,
  Alert,
  Indicator,
} from "@mantine/core";
import { Check, Star, Zap, AlertCircle, CheckIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { stripePromise } from "@/lib/payments/stripe-clients";
import { STRIPE_CONFIG } from "@/utils/index";
import { useRouter } from "next/navigation";

export default function PricingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const isStripeConfigured = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  const handleSubscribe = async (plan: keyof typeof STRIPE_CONFIG.PLANS) => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    const planConfig = STRIPE_CONFIG.PLANS[plan];

    const usePaymentLinks = true;

    if (usePaymentLinks) {
      if (!("paymentLink" in planConfig) || !planConfig.paymentLink) {
        return;
      }

      const paymentUrl = planConfig.paymentLink.replace(
        "{USER_EMAIL}",
        encodeURIComponent(user.email)
      );

      const urlWithParams = new URL(paymentUrl);
      urlWithParams.searchParams.set(
        "success_url",
        `${window.location.origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`
      );
      urlWithParams.searchParams.set(
        "cancel_url",
        `${window.location.origin}/subscription/pricing`
      );

      window.location.href = urlWithParams.toString();
      setLoading(plan);
      try {
        window.location.href = (planConfig as any).paymentLink;
      } catch (error) {
        console.error("Error redirecting to payment:", error);
      } finally {
        setLoading(null);
      }
    } else {
      if (!("priceId" in planConfig) || !planConfig.priceId) return;

      setLoading(plan);
      try {
        const response = await fetch("/api/stripe/create-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            priceId: (planConfig as any).priceId,
            planName: planConfig.name,
          }),
        });

        const { sessionId } = await response.json();

        const stripe = await stripePromise;
        if (stripe) {
          await stripe.redirectToCheckout({ sessionId });
        }
      } catch (error) {
        console.error("Error creating checkout session:", error);
      } finally {
        setLoading(null);
      }
    }
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

        {!isStripeConfigured && (
          <Alert
            icon={<AlertCircle size={16} />}
            color="yellow"
            variant="light"
            title="Stripe Not Configured"
            maw={600}
          >
            Payment processing is currently unavailable. Please contact support
            to set up your subscription.
          </Alert>
        )}

        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl" w="100%">
          {Object.entries(STRIPE_CONFIG.PLANS).map(([key, plan], index) => {
            const planKey = key as keyof typeof STRIPE_CONFIG.PLANS;
            const isPopular = planKey === "PREMIUM";
            const isFree = planKey === "BASIC";
            const isCurrentPlan =
              user && user.subscriptionPlan === planKey.toLowerCase();
            console.log(isCurrentPlan);
            console.log(user?.subscriptionPlan);

            return (
              <Indicator
                disabled={!isCurrentPlan}
                color="green"
                size="lg"
                label={<CheckIcon />}
              >
                <Card
                  key={key}
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                  p="xl"
                  radius="lg"
                  bg="dark.7"
                  className={`subscription-card ${
                    isPopular ? "popular" : ""
                  } ${planKey.toLowerCase()}`}
                  style={{
                    border: isCurrentPlan
                      ? "2px solid #10b981"
                      : isPopular
                      ? "2px solid #3b82f6"
                      : "1px solid rgba(255, 255, 255, 0.1)",
                    position: "relative",
                    transform: isPopular ? "scale(1.05)" : "scale(1)",
                    cursor: "pointer",
                  }}
                >
                  {isPopular && (
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
                    <div style={{ textAlign: "center" }}>
                      {planKey === "BASIC" && (
                        <Check size={48} color="#10b981" />
                      )}
                      {planKey === "PREMIUM" && (
                        <Star size={48} color="#3b82f6" />
                      )}
                      {planKey === "PRO" && <Zap size={48} color="#f59e0b" />}
                    </div>

                    <Title size="xl" c="white">
                      {plan.name}
                    </Title>

                    <Group gap={4} align="baseline">
                      <Text size="3rem" fw={700} c="white">
                        ${plan.price}
                      </Text>
                      {!isFree && <Text c="dimmed">/month</Text>}
                    </Group>
                  </Stack>

                  <List
                    spacing="sm"
                    size="sm"
                    center
                    icon={<Check size={16} color="#10b981" />}
                    mb="xl"
                  >
                    {plan.features.map((feature, idx) => (
                      <List.Item key={idx} c="gray.3">
                        {feature}
                      </List.Item>
                    ))}
                  </List>

                  <Button
                    fullWidth
                    size="lg"
                    variant={isPopular ? "filled" : "outline"}
                    color={isPopular ? "blue" : "gray"}
                    onClick={() => handleSubscribe(planKey)}
                    disabled={
                      isFree || loading === planKey || !isStripeConfigured
                    }
                    className={isPopular ? "blue" : ""}
                    styles={{
                      root: {
                        transition: "all 0.3s ease",
                        "&:hover:not(:disabled)": {
                          transform: "translateY(-2px)",
                          boxShadow: isPopular
                            ? "0 8px 25px rgba(59, 130, 246, 0.4)"
                            : "0 8px 25px rgba(255, 255, 255, 0.1)",
                        },
                      },
                    }}
                  >
                    {loading === planKey ? (
                      <Loader size="sm" />
                    ) : isFree ? (
                      "Current Plan"
                    ) : (
                      `Subscribe to ${plan.name}`
                    )}
                  </Button>
                </Card>
              </Indicator>
            );
          })}
        </SimpleGrid>

        <div data-aos="fade-up" data-aos-delay="400">
          <Text ta="center" c="dimmed" size="sm">
            All plans include a 14-day free trial. Cancel anytime.
          </Text>
        </div>
      </Stack>
    </Container>
  );
}
