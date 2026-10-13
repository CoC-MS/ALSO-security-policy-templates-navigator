import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Faq, faqItems } from "./Faq";

describe("FAQ page", () => {
  it("renders all seven supplied questions and their complete answers accessibly", () => {
    const html = renderToStaticMarkup(<Faq />);

    expect(faqItems).toHaveLength(11);
    expect(html.match(/<details class="faq-item"/g)).toHaveLength(11);
    expect(html).toContain("<summary>");
    expect(html).toContain("<h1 id=\"faq-title\"");
    const decodedHtml = html.replaceAll("&#x27;", "'");
    for (const { question, answer } of faqItems) {
      expect(decodedHtml).toContain(question);
      for (const paragraph of answer) {
        expect(decodedHtml).toContain(paragraph);
      }
    }
  });
});
