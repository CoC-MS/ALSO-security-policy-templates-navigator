import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Faq, faqItems } from "./Faq";

describe("FAQ page", () => {
  it("uses the reviewed German wording for security concerns, production and repositories", () => {
    const html = renderToStaticMarkup(<Faq locale="de" />);
    expect(html).toContain("Sicherheitsbedenken bezüglich der Tools");
    expect(html).toContain("in der Produktivumgebung");
    expect(html).toContain("GitHub-Repositories");
    expect(html).not.toMatch(/Bedenken zur Sicherheit der Tools|Produktion|Repositorys/);
  });

  it("uses the supplied French wording for the purpose and customer questions", () => {
    const html = renderToStaticMarkup(<Faq locale="fr" />);
    expect(html).toContain("Quel est l’objectif de ALSO Security Policy Templates ?");
    expect(html).toContain("À quel type de clients policy templates sont-ils destinés ?");
  });

  it.each([
    ["ru", "Для чего предназначен сайт ALSO Security Policy Templates Navigator?"],
    ["it", "Qual è lo scopo del sito ALSO Security Policy Templates Navigator?"],
    ["pl", "Jaki jest cel witryny ALSO Security Policy Templates Navigator?"],
  ] as const)("renders all fifteen fully localized FAQ entries in %s", (locale, firstQuestion) => {
    const html = renderToStaticMarkup(<Faq locale={locale} />);
    expect(html).toContain(firstQuestion);
    expect(html.match(/<details class="faq-item"/g)).toHaveLength(15);
    expect(html).not.toContain("How do I report an issue with a security policy template?");
    if (locale === "pl") {
      expect(html).toContain("Szablony pomagają organizacjom szybciej i bardziej konsekwentnie");
      expect(html).toContain("zasady dostępu warunkowego");
      expect(html).not.toContain("What happens to my existing security policies");
      expect(html).not.toContain("<strong>");
    }
  });

  it("uses скрипты for Russian mentions of scripts, not scenarios", () => {
    const html = renderToStaticMarkup(<Faq locale="ru" />);
    expect(html).toContain("Руководства, скрипты и бесплатные средства импорта");
    expect(html).toContain("Скрипты и средства импорта используют корпоративное приложение Entra ID");
  });

  it("updates the first answer to include license and security challenge mapping", () => {
    const html = renderToStaticMarkup(<Faq />);

    expect(html).toContain("licenses and security challenges.");
    expect(html).not.toContain("<strong>and security challenges</strong>");
    expect(html).toContain("maps popular Microsoft licenses and common security scenarios");
    expect(html).toContain("which templates can help address specific security needs.");
  });

  it("renders all fifteen supplied questions and their complete answers accessibly", () => {
    const html = renderToStaticMarkup(<Faq />);

    expect(faqItems).toHaveLength(15);
    expect(html.match(/<details class="faq-item"/g)).toHaveLength(15);
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

  it("includes the website reuse restriction and distinguishes repository licensing", () => {
    const html = renderToStaticMarkup(<Faq />);

    expect(faqItems[14].question).toBe("Can I copy this site, add my own logo, and use or redistribute it?");
    expect(html).toContain('<span class="faq-number">15</span>');
    expect(html).toContain("<strong>All Rights Reserved</strong>");
    expect(html).toContain("without prior written permission from ALSO.");
    expect(html).toContain("<strong>Note:</strong> Licensing may differ between the website and individual GitHub repositories.");
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
