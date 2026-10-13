export const faqItems = [
  {
    question: "What is the purpose of the ALSO Security Policy Templates Navigator Site?",
    answer: [
      "The purpose of the ALSO Security Policy Templates Navigator is to help partners and customers quickly identify which security policy templates are available for their Microsoft licenses. The site maps popular Microsoft licenses to the relevant security policy templates provided by ALSO, making it easier to understand what can be deployed and what features are supported.",
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
              {answer.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
