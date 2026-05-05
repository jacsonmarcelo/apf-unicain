# Security Specification for Finanza

## 1. Data Invariants
- Each entry must belong to a valid table and its associated category.
- Every document must have a `userId` that matches the authenticated user.
- Financial amounts must be positive (though some debts could be represented as positive amounts in their respective category).
- Timestamps (`createdAt`, `date`) must be valid formats.

## 2. The "Dirty Dozen" Payloads (Red Team)
1.  **Identity Theft**: Create an entry with someone else's `userId`.
2.  **Shadow Field Injection**: Add a `isVerified: true` field to an entry.
3.  **Cross-Month Poisoning**: Create a budget for a month in the past/future and manipulate others' limits.
4.  **Malicious ID**: Use a 2KB string as a document ID.
5.  **PII Leak**: Attempt to list all entries without a `where userId == auth.uid` filter.
6.  **Immutable Bypass**: Update an entry's `userId` or `createdAt` after creation.
7.  **Resource Exhaustion**: Send a 1MB string in the `description` field.
8.  **Orphaned Entry**: Create an entry targeting a `tableId` that doesn't exist conceptually.
9.  **Unauthorized List**: Try to fetch `budgets` for another user.
10. **State Corruption**: Set a recurring entry to `active` for a user you don't own.
11. **Spoofed Admin**: Try to access an operation that might (future) be admin only by guessing paths.
12. **Null Auth**: Try to write data without an auth token.

## 3. Test Runner (Mock)
(Tests would verify that all above payloads return PERMISSION_DENIED)
