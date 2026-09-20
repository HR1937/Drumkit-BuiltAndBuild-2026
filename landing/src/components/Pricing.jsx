import { Check } from "lucide-react";

const plans = [
  {
    name: "FREE TRIAL",
    price: "₹0",
    cadence: "/ 7 Days",
    features: [
      "Events: 100K",
      "Identity Resolution: 25K",
      "Reports: All seven available",
      "AI Chatbot: Not included",
    ],
  },
  {
    name: "PAY-AS-YOU-GO",
    price: "Pay per usage",
    cadence: "",
    featured: true,
    features: [
      "Events: ₹1,499 / 100K",
      "Identity Resolution: ₹99 / 10K",
      "Reports: All seven available",
      "AI Chatbot: ₹29 / 10 Credits",
    ],
  },
  {
    name: "ENTERPRISE",
    price: "₹9,999",
    cadence: "/ Month",
    features: [
      "Events: 2M / Month",
      "Identity Resolution: 500K / Month",
      "Reports: All seven available",
      "AI Chatbot: 3,000 Credits + PAYG",
      "Complaints Scanning from Reddit & X: Available",
    ],
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="pricing-section">
      <div className="section-heading">
        <span className="section-eyebrow">PRICING</span>
        <h2>A clear path from prototype to production</h2>
        <p>Start with real journey data, then scale usage as your customer graph grows.</p>
      </div>

      <div className="pricing-grid">
        {plans.map((plan) => (
          <article className={`pricing-card${plan.featured ? " featured" : ""}`} key={plan.name}>
            {plan.featured && <span className="pricing-badge">FLEXIBLE</span>}
            <h3>{plan.name}</h3>
            <div className="pricing-price">
              <strong>{plan.price}</strong>
              {plan.cadence && <span>{plan.cadence}</span>}
            </div>
            <ul>
              {plan.features.map((feature) => (
                <li key={feature}>
                  <Check size={17} aria-hidden="true" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <p className="pricing-disclaimer">
        Pricing shown represents our proposed revenue model for the prototype. Payment processing and subscription
        billing are not currently connected.
      </p>
    </section>
  );
}
