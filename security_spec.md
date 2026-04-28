# Security Specification - SMPN 18 Banjarmasin

## Data Invariants
1. News articles must have a valid title, category, and content.
2. Achievements must belong to a specific year and rank.
3. Only Whitelisted UIDs in the `admins` collection can perform write operations.
4. Timestamps (`createdAt`, `updatedAt`) must be strictly enforced on the server.
5. All IDs must be strictly validated for size and character set.

## The "Dirty Dozen" Payloads (Denial Expected)
1. **Unauthenticated Write**: Attempting to create news without logging in.
2. **Identity Spoofing**: Logged in user trying to set `authorId` to someone else's UID.
3. **Ghost Field Update**: Adding `isAdmin: true` to a news document.
4. **Terminal State Bypass**: Attempting to edit a news article's `createdAt` date.
5. **PII Leak**: Unauthorized reading of the `admins` collection.
6. **Resource Poisoning**: Injecting 2MB of text into the `title` field.
7. **ID Injection**: Using `../../../system/config` as a document ID.
8. **Invalid Schema**: Creating an achievement without a `year` field.
9. **Atomic Desync**: Updating an achievement without setting `updatedAt`.
10. **Admin Self-Promotion**: A user creating their own entry in the `admins` collection.
11. **Email Spoofing**: Trying to gain access using an unverified email address.
12. **Mass Query Scraping**: Attempting to list all admin emails without filtering.

## Test Strategy
The security rules will be tested to ensure all write operations require admin privileges and schema validation. Read operations will be public except for sensitive administrative data.
