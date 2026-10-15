import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Faq, faqItems } from "./Faq";

describe("FAQ page", () => {
  it("renders all fourteen supplied questions and their complete answers accessibly", () => {
    const html = renderToStaticMarkup(<Faq />);

    expect(faqItems).toHaveLength(14);
    expect(html.match(/<details class="faq-item"/g)).toHaveLength(14);
    expect(html).toContain("<summary>");
    expect(html).toContain("<h1 id=\"faq-title\"");
    const decodedHtml = html
      .replaceAll("&#x27;", "'")
      .replaceAll("&quot;", "\"");
    for (const { question, answer } of faqItems) {
      expect(decodedHtml).toContain(question);
      for (const paragraph of answer) {
        expect(html).toContain(renderToStaticMarkup(<>{paragraph}</>));
      }
    }
  });

  it("preserves the import-state emphasis, action list, and production review warning", () => {
    const html = renderToStaticMarkup(<Faq />);

    expect(html).toContain('<span class="faq-number">14</span>');
    expect(html).toContain("<strong>unassigned state</strong>");
    expect(html).toContain("<strong>Conditional Access</strong>");
    expect(html).toContain("<strong>OFF</strong>");
    expect(html.match(/<li>/g)).toHaveLength(5);
    expect(html).not.toContain("<p><ul>");
    expect(html).toContain("<strong>Note:</strong> We strongly recommend thoroughly reviewing all imported policies");
  });
});
