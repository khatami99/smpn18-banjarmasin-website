# Security Spec - Library Program Sekolah

## Data Invariants
1. Program must have a unique ID.
2. Program `startYear` must be a valid 4-digit numeric string.
3. Program `description` must not exceed 10,000 characters.
4. `documents` items must have a `title` and a valid `url`.
5. Only administrators (defined in `/admins/{uid}`) can write to the `programs` collection.
6. Public can read all programs.

## The Dirty Dozen (Attack Vectors)
1. **Unauthorized Create**: Non-admin trying to add a program.
2. **Identity Spoofing**: Admin trying to set a `createdAt` timestamp from the future (client-side).
3. **Data Poisoning**: Injecting 1MB string into `name`.
4. **Invalid Reference**: Creating a program without a description.
5. **Delete Sweep**: Non-admin trying to delete all programs.
6. **Schema Break**: Adding a field `isAdmin: true` to a program.
7. **Type Poisoning**: Setting `startYear` as a number instead of a string.
8. **Resource Exhaustion**: Adding 10,000 document references to a single program.
9. **Update Gap**: Changing `createdAt` during an update.
10. **ID Poisoning**: Using a 2KB long string as a document ID.
11. **PII Leak**: (Not applicable as programs are public, but checking for hidden fields).
12. **Recursive Cost**: Rule with nested `get()` in a list query.

## Implementation Detail
- Use `isValidProgram()` helper.
- Enforce `affectedKeys().hasOnly()` for updates.
- Use `request.auth.uid` check against `/admins/` collection.
