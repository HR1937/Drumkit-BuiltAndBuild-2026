import {
  Check,
  Sparkles,
  Zap,
  Building2,
} from "lucide-react";

const plans = [
  {
    name: "Free",
    description:
      "Explore NexJour and understand your customer journeys.",
    price: "₹0",
    period: "/ month",
    icon: Sparkles,
    features: [
      "Up to 1,000 journeys / month",
      "Cross-channel journey stitching",
      "Unified customer timeline",
      "Basic journey analytics",
      "Drop-off detection",
      "Standard reports",
    ],
    button: "Get Started",
  },
  {
    name: "Starter",
    description:
      "For small teams beginning their journey analytics.",
    price: "₹4,999",
    period: "/ month",
    icon: Zap,
    features: [
      "Up to 10,000 journeys / month",
      "Everything in Free",
      "Identity resolution",
      "Issue & escalation detection",
      "Repeat-contact detection",
      "Advanced journey reports",
    ],
    button: "Start with Starter",
  },
  {
    name: "Growth",
    description:
      "For teams turning journey data into actionable insights.",
    price: "₹14,999",
    period: "/ month",
    icon: Zap,
    popular: true,
    features: [
      "Up to 50,000 journeys / month",
      "Everything in Starter",
      "Advanced identity resolution",
      "Churn signals",
      "Custom dashboards",
      "Priority support",
    ],
    button: "Start Free Trial",
  },
  {
    name: "Enterprise",
    description:
      "For organizations with complex journeys at scale.",
    price: "Custom",
    period: "",
    icon: Building2,
    features: [
      "Custom journey volume",
      "Everything in Growth",
      "Custom integrations",
      "Advanced identity resolution",
      "Custom analytics & reports",
      "Dedicated support",
    ],
    button: "Talk to Sales",
  },
];

export default function Pricing() {
  return (
    <section
      id="pricing"
      className="relative overflow-hidden bg-paper px-6 py-28"
    >
      {/* Background Glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-thread/10 blur-[120px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl">

        {/* Section Heading */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-thread">
            Pricing
          </p>

          <h2 className="font-display text-4xl tracking-tight text-ink md:text-5xl">
            Simple Pricing.{" "}
            <span className="text-thread">
              Powerful Insights.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted md:text-lg">
            Start free and scale as your customer journeys grow.
            Choose the plan that fits your organization.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-6 lg:grid-cols-4">
          {plans.map((plan) => {
            const Icon = plan.icon;

            return (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-3xl border p-7 transition-all duration-300 hover:-translate-y-2 ${
                  plan.popular
                    ? "border-thread/60 bg-[#FFF7F2] shadow-[0_20px_50px_-15px_rgba(255,90,54,0.25)]"
                    : "border-ink/8 bg-surface shadow-[0_8px_30px_-12px_rgba(18,22,43,0.12)] hover:border-thread/40"
                }`}
              >
                {/* Most Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-thread to-thread-2 px-4 py-1 text-xs font-bold text-white shadow-[0_6px_18px_-5px_rgba(255,90,54,0.45)]">
                    MOST POPULAR
                  </div>
                )}

                {/* Plan Icon */}
                <div
                  className={`mb-6 flex h-12 w-12 items-center justify-center rounded-2xl ${
                    plan.popular
                      ? "bg-thread/10 text-thread"
                      : "bg-ink/5 text-thread"
                  }`}
                >
                  <Icon
                    className="h-6 w-6"
                    strokeWidth={1.8}
                  />
                </div>

                {/* Plan Name */}
                <h3 className="text-2xl font-bold text-ink">
                  {plan.name}
                </h3>

                {/* Description */}
                <p className="mt-3 min-h-[72px] text-sm leading-6 text-muted">
                  {plan.description}
                </p>

                {/* Price */}
                <div className="mt-6 flex items-end gap-1">
                  <span className="text-3xl font-bold text-ink">
                    {plan.price}
                  </span>

                  {plan.period && (
                    <span className="mb-1 text-sm text-muted">
                      {plan.period}
                    </span>
                  )}
                </div>

                {/* CTA Button */}
                <button
                  className={`mt-7 w-full rounded-full px-4 py-3 text-sm font-medium transition-all duration-300 ${
                    plan.popular
                      ? "bg-gradient-to-r from-thread to-thread-2 text-white shadow-[0_8px_24px_-8px_rgba(255,90,54,0.45)] hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-6px_rgba(255,90,54,0.5)]"
                      : "border border-ink/10 bg-ink/5 text-ink hover:border-thread/40 hover:bg-thread/5"
                  }`}
                >
                  {plan.button}
                </button>

                {/* Divider */}
                <div className="my-7 h-px bg-ink/8" />

                {/* Features Heading */}
                <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted">
                  What's included
                </p>

                {/* Features */}
                <ul className="space-y-4">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm text-ink/75"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-thread/10">
                        <Check
                          className="h-3.5 w-3.5 text-thread"
                          strokeWidth={2.5}
                        />
                      </span>

                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Bottom Note */}
        <p className="mt-10 text-center text-sm text-muted">
          Start with Free. Upgrade when your customer journeys grow.
        </p>
      </div>
    </section>
  );
}