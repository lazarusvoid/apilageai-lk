# apilageai-lk
Archive of apilageai.lk source code, database schema, and related files - shared for security analysis and to understand the platform's internal workings.

## Why this is public

The platform's **Terms & Conditions**[](/public_html/termsconditions/index.html) and **Privacy Policy**[](/public_html/privacypolicy/index.html) make several strong claims that do not match reality:

### Key Misrepresentations
- **Uploaded images** are claimed to be stored with "AES-256 encryption at rest and in transit" and "automatically deleted after processing (typically within 24 hours)", **none of this is true**. Images are stored indefinitely in plaintext with no encryption.
- **Chat histories** and AI interactions are described as "end-to-end encrypted" with no access or monitoring by personnel, **complete fiction**. All conversations are stored in readable plaintext in the database.
- General "industry-standard encryption" is mentioned in the Privacy Policy, but the actual implementation offers zero meaningful protection.

### Result
- **Zero real privacy** for over 1,200 Sri Lankan students who uploaded personal photos, chat messages, and other sensitive data.
- Complete exposure of personal information (PII), images, and conversations, no encryption, no deletion, no safeguards.
- Users were misled about the security of their data.

This codebase is published to expose the gap between what the platform claimed and what it actually happened

> review the code, understand how data is handled internally, inspect the architecture, and see exactly what the platform was doing behind the scenes.** Transparency matters.**

**Use at your own risk.**  
This content is shared for transparency and awareness only. Do not use for malicious purposes or unauthorized access. Any use that violates laws (including Sri Lanka's Computer Crimes Act and PDPA) is your responsibility.
