import React, { useRef, useState } from "react";
import "./FAQ.css";

const FAQ_ITEMS = [
  {
    question: "What is Breeze?",
    answer:
      "Breeze helps businesses connect customer interactions across channels and understand the complete journey in one place.",
  },
  {
    question: "Who is Breeze built for?",
    answer:
      "Breeze is designed for teams that want better visibility into customer experiences, support interactions, and journey patterns.",
  },
  {
    question: "What channels can Breeze connect?",
    answer:
      "Breeze can bring together interactions from websites, mobile apps, call centers, and physical locations.",
  },
  {
    question: "How does Breeze help businesses?",
    answer:
      "It helps teams identify journey drop-offs, escalations, repeated contacts, unresolved issues, and other important patterns.",
  },
  {
    question: "How does Breeze protect customer data?",
    answer:
      "Breeze is designed with secure data handling and controlled access in mind. Specific security and compliance capabilities depend on the deployment.",
  },
  {
    question: "Can Breeze integrate with existing systems?",
    answer:
      "Breeze can be designed to connect with existing customer, support, and interaction data sources through APIs and data pipelines.",
  },
  {
    question: "Can I try Breeze?",
    answer:
      "Yes. Explore the platform to see how fragmented interactions can become one connected customer journey.",
  },
];

/* one accordion row — only its own content is ever measured/rendered,
   the parent controls which index is open */
function FAQItem({ item, isOpen, onToggle }) {
  const answerRef = useRef(null);

  return (
    <div className={`nx-faq-item ${isOpen ? "nx-faq-item--open" : ""}`}>
      <button
        className="nx-faq-item__question"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span>{item.question}</span>
        <span className="nx-faq-item__icon" aria-hidden="true">
          <span className="nx-faq-item__icon-bar nx-faq-item__icon-bar--v" />
          <span className="nx-faq-item__icon-bar nx-faq-item__icon-bar--h" />
        </span>
      </button>

      <div
        className="nx-faq-item__answer-wrap"
        style={{
          maxHeight: isOpen ? `${answerRef.current?.scrollHeight ?? 200}px` : "0px",
        }}
      >
        <p className="nx-faq-item__answer" ref={answerRef}>
          {item.answer}
        </p>
      </div>
    </div>
  );
}

/**
 * FAQ
 * Accordion-style FAQ section. Only one answer is visible at a time —
 * clicking a question that's already open closes it again.
 */
export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const handleToggle = (index) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <section className="nx-faq" id="faq">
      <div className="nx-faq__bg" aria-hidden="true" />

      <div className="nx-faq__header">
        <span className="nx-eyebrow">FAQ</span>
        <h2 className="nx-faq__title">
          Frequently asked <em>questions</em>
        </h2>
        <p className="nx-faq__subtitle">
          Everything you need to know about how Breeze connects your
          customer journeys.
        </p>
      </div>

      <div className="nx-faq__list">
        {FAQ_ITEMS.map((item, index) => (
          <FAQItem
            key={item.question}
            item={item}
            isOpen={openIndex === index}
            onToggle={() => handleToggle(index)}
          />
        ))}
      </div>
    </section>
  );
}
