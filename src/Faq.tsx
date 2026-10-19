import { Fragment } from "react";

export const faqItems = [
  {
    question: "What is the purpose of the ALSO Security Policy Templates Navigator Site?",
    answer: [
      <p>The purpose of the ALSO Security Policy Templates Navigator is to help partners and customers quickly identify which security policy templates are available for their Microsoft licenses <strong>and security challenges</strong>. The site maps popular Microsoft licenses and common security scenarios to the relevant security policy templates provided by ALSO, making it easier to understand what can be deployed, what features are supported, and which templates can help address specific security needs.</p>,
      "Our goal is to remove blockers, simplify decision-making, and help organizations get started with Microsoft Security faster. We understand that navigating security features, licensing requirements, and deployment prerequisites can be complex, and this site is designed to make that process easier.",
    ],
  },
  {
    question: "What is the purpose of the ALSO Security Policy Templates?",
    answer: [
      "The purpose of the ALSO Security Policy Templates is to help organizations adopt Microsoft Security best practices and Zero Trust principles more quickly and consistently.",
      "The templates reduce the time and effort required to build security policies from scratch for every customer tenant. Partners can use the provided policies as-is, customize them to meet specific requirements, or integrate them into existing security baselines.",
      "By combining templates, deployment guides, scripts, and free import tools, we help partners standardize deployments, reduce repetitive work, and scale security implementations more efficiently across multiple customers.",
    ],
  },
  {
    question: "What type of customers are the security policy templates designed for?",
    answer: [
      "The security policy templates are primarily designed for SMB (Small and Medium Business), SMC (Small and Medium Corporate), and SME (Small and Medium Enterprise) organizations.",
      "While the templates can also provide value to larger organizations, Enterprise customers often have more complex requirements that may require additional customization, governance, and architecture planning.",
    ],
  },
  {
    question: "We use CIPP today. How does this solution differ from CIPP?",
    answer: [
      "The ALSO Security Policy Templates do not replace CIPP.",
      "CIPP is a multi-tenant management and administration platform that includes monitoring, automation, and security-related capabilities. The ALSO solution focuses specifically on providing Microsoft Security policy templates, deployment guides, and free tools for importing those templates.",
      "Partners using CIPP can easily incorporate ALSO policy templates into their existing CIPP baselines and deployment processes.",
    ],
  },
  {
    question: "We use Inforcer or a similar platform today. How does this solution differ?",
    answer: [
      "The ALSO Security Policy Templates do not replace Inforcer or similar third-party management platforms.",
      "Platforms such as Inforcer provide multi-tenant management, monitoring, automation, and their own security baselines. The ALSO solution focuses on delivering Microsoft Security policy templates, deployment guidance, and import tools.",
      "Partners can use the ALSO templates alongside their existing platform and incorporate selected policies into their current security baselines where appropriate.",
    ],
  },
  {
    question: "How does the import process work?",
    answer: [
      "The import process uses Microsoft Graph APIs to deploy supported security policies and configurations into a customer tenant.",
      "The provided scripts and third-party import tools use an Entra ID enterprise application that requires administrative consent before any changes can be made. The application requests the necessary permissions to read and write supported configurations, and these permissions must be approved by an administrator with the appropriate rights.",
      "This approach is similar to the deployment methods used by many other Microsoft management and automation solutions available today.",
    ],
  },
  {
    question: "We are concerned about security when using the provided tools. What should we do?",
    answer: [
      "The provided tools follow a similar security model to many existing Microsoft administration and automation solutions that interact with Microsoft Graph APIs.",
      "Administrators maintain full control over consent, permissions, and access throughout the process. At any time, administrators can review or revoke application permissions, remove administrator consent, or delete the associated Entra ID enterprise application from the tenant.",
      "We encourage all partners and customers to review the requested permissions, perform their own security assessment, and follow their organization's governance and approval processes before using any deployment tool.",
    ],
  },
  {
    question: "I do not want to use the provided import scripts or tools, and/or I do not want to import policies directly into production tenants. What are my options?",
    answer: [
      "That is completely understandable, and how you use the templates is entirely your decision.",
      "Many organizations choose to import the policies into a development or test environment first, where they can review, validate, and customize the configurations before deployment. This allows them to build their own security baseline, perform internal testing, and ensure the policies align with their or customer requirements.",
      "Once the policies have been reviewed and approved, organizations can deploy their customized baseline to production environments using their preferred deployment solutions. Many of the templates are intended to provide a starting point and can be adapted to fit your organization's governance and operational requirements.",
    ],
  },
  {
    question: "Who created these templates, and who maintains them?",
    answer: [
      "The security policy templates are developed and maintained by ALSO's central Microsoft Security technical team.",
      "The repository contains a combination of original work created by ALSO security specialists, security best practices, hardening recommendations, and selected content inspired by or rebuilt from publicly available open-source projects released under permissive licenses such as MIT, where applicable.",
      "All templates, documentation, and updates are maintained exclusively by authorized members of ALSO's central Microsoft Security technical team. Only designated team members have permission to manage changes to the GitHub repositories and the Navigator website.",
    ],
  },
  {
    question: "I cannot report an issue on the site. What should I do?",
    answer: [
      "To report an issue with the Navigator website, you must sign in with a GitHub account.",
      "The site uses GitHub Issues for issue tracking and feedback submission. If you do not have a GitHub account, you will need to create one before you can submit a report, feature request, or bug report.",
      "Once signed in, you can use the available issue templates to provide details about the problem you have encountered.",
    ],
  },
  {
    question: "How do I report an issue with a security policy template?",
    answer: [
      "Each security policy template repository has its own GitHub issue tracker and issue templates.",
      "To report a problem, navigate to the relevant repository, select Issues, and create a new issue using the most appropriate template. Providing clear information about the problem helps us investigate and resolve issues more efficiently.",
      "For security and privacy reasons, never include sensitive information, credentials, tenant details, screenshots containing confidential data, or other private information in issue reports, as all repositories are publicly accessible.",
    ],
  },
  {
    question: "Can I use ALSO security policy templates that are licensed under Apache 2.0 and include them in a paid commercial offering?",
    answer: [
      "Yes. The Apache 2.0 license generally allows companies to use, modify, distribute, package, and include software, code, or configuration templates in commercial products and services.",
      "However, organizations must comply with the applicable license requirements, including preserving copyright notices, license notices, and any required NOTICE file information. The original Apache-licensed content remains subject to its license terms, and its original authors retain ownership of their work.",
      "Always review the license files and documentation within each repository before use. Some repositories may contain content from multiple sources and therefore include more than one license, such as Apache 2.0 and MIT. Understanding the applicable licenses helps ensure compliance with the original licensing terms.",
    ],
  },
  {
    question: "Why do you use \"ALSO\" in front of every policy name, and can it be removed?",
    answer: [
      "The ALSO prefix is included in policy names to make it easier to identify and manage the policies after they have been imported into a tenant.",
      "This naming convention helps administrators quickly distinguish ALSO-provided policies from existing customer-created policies and other configurations within the environment.",
      "The prefix is fully customizable and can be removed, renamed, or replaced at any time. Organizations are free to modify policy names to align with their own naming standards, operational requirements, or governance practices.",
    ],
  },
  {
    question: "What happens to my existing security policies if I import the ALSO Security Policy Templates?",
    answer: [
      "Your existing security policies will not be affected, and there is no requirement to remove or modify them before importing the ALSO Security Policy Templates.",
      <p>All ALSO templates follow a consistent naming convention, making it easy to distinguish imported policies from your existing configurations. In addition, the security policy templates are designed to be imported in an <strong>unassigned state</strong>. The exception is <strong>Conditional Access</strong> policies, where you should always ensure they are imported in an <strong>OFF</strong> state. This means they will not impact users, devices, or workloads immediately after import, provided they are deployed using the recommended import settings.</p>,
      "After import, you are free to review and manage the policies as you see fit. You can:",
      <ul>
        <li>Remove policies that are not relevant to your environment.</li>
        <li>Modify settings to align with your security requirements.</li>
        <li>Test policies using pilot users or test groups.</li>
        <li>Gradually assign policies to production users and devices.</li>
        <li>Integrate selected policies into your existing security baseline.</li>
      </ul>,
      "You remain in full control of how, when, and if the imported policies are deployed within your environment.",
      <p><strong>Note:</strong> We strongly recommend thoroughly reviewing all imported policies before assigning them to users, groups, devices, or workloads in production environments.</p>,
    ],
  },
  {
    question: "Can I copy this site, add my own logo, and use or redistribute it?",
    answer: [
      <p>No. This website and its content are protected under <strong>All Rights Reserved</strong> copyright.</p>,
      "You may view and use the site for its intended purpose, but you may not copy, modify, rebrand, redistribute, publish, or create derivative versions of the site without prior written permission from ALSO.",
      "Adding your own logo or company branding does not grant permission to reuse the website, its design, content, structure, or functionality.",
      "If you require permission for a specific use case, please contact ALSO before reproducing or distributing any part of the site.",
      <p><strong>Note:</strong> Licensing may differ between the website and individual GitHub repositories. Always review the license information within each repository to determine how specific templates, scripts, or other assets may be used.</p>,
    ],
  },
] as const;

export function Faq() {
  return (
    <section className="result-wrap faq-page" aria-labelledby="faq-title">
      <div className="result-heading">
        <div className="eyebrow">Help and information</div>
        <h1 id="faq-title" tabIndex={-1}>Frequently asked questions</h1>
        <p>Learn about the ALSO Security Policy Templates Navigator, our templates, and deployment tools.</p>
      </div>
      <div className="faq-list">
        {faqItems.map(({ question, answer }, index) => (
          <details className="faq-item" key={question}>
            <summary>
              <span className="faq-number">{String(index + 1).padStart(2, "0")}</span>
              <span>{question}</span>
              <span className="faq-chevron" aria-hidden="true" />
            </summary>
            <div className="faq-answer">
              {answer.map((paragraph, paragraphIndex) => (
                <Fragment key={paragraphIndex}>
                  {typeof paragraph === "string" ? <p>{paragraph}</p> : paragraph}
                </Fragment>
              ))}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
