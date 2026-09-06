# Mantavya Security Specification & Test Vectors

## 1. Data Invariants
1. **Zero-Trust User Isolation**: A user can only access `/users/{userId}/...` paths where `request.auth.uid == userId`.
2. **Identity Integrity**: Reflections must store `userId` matching `request.auth.uid`. No user can create or update a reflection with another user's UID.
3. **No Unauthenticated Access**: Unauthenticated users have zero read or write access across the entire database.
4. **No Cross-User Leakage**: Users cannot list, get, create, update, or delete reflections belonging to any other user.
5. **Bounded Content Lengths**: All user text fields and messages are constrained to prevent Denial-of-Wallet payload attacks.
6. **Immutable Identity**: `userId` and `id` cannot be modified during updates.

## 2. The Dirty Dozen Payloads (Rejection Matrix)

1. **Unauthenticated Read Attempt**
   - Path: `/users/user_abc/reflections/ref_1`
   - Auth: `null`
   - Result: PERMISSION_DENIED

2. **Cross-User Snooping (Read Other User's Reflection)**
   - Path: `/users/victim_user/reflections/ref_secret`
   - Auth: `{ uid: "attacker_user" }`
   - Result: PERMISSION_DENIED

3. **Cross-User Listing Attack**
   - Path: `/users/victim_user/reflections`
   - Auth: `{ uid: "attacker_user" }`
   - Result: PERMISSION_DENIED

4. **Spoofed Creation (Forged userId in Payload)**
   - Path: `/users/user_123/reflections/ref_1`
   - Auth: `{ uid: "user_123" }`
   - Payload: `{ id: "ref_1", userId: "victim_user", mode: "understand", ... }`
   - Result: PERMISSION_DENIED (incoming().userId must match request.auth.uid)

5. **Path Mismatch Write**
   - Path: `/users/attacker_user/reflections/ref_1`
   - Auth: `{ uid: "attacker_user" }`
   - Payload: Trying to target `/users/victim_user/reflections/ref_1`
   - Result: PERMISSION_DENIED

6. **Denial-of-Wallet Payload Injection (1MB String)**
   - Path: `/users/user_123/reflections/ref_1`
   - Auth: `{ uid: "user_123" }`
   - Payload: `{ title: "A".repeat(500000), ... }`
   - Result: PERMISSION_DENIED (title.size() <= 200)

7. **Invalid Mode Type / Injection**
   - Path: `/users/user_123/reflections/ref_1`
   - Auth: `{ uid: "user_123" }`
   - Payload: `{ mode: "sql_injection_mode", ... }`
   - Result: PERMISSION_DENIED (mode must be in enum)

8. **Ghost Field / Shadow Property Creation**
   - Path: `/users/user_123/reflections/ref_1`
   - Auth: `{ uid: "user_123" }`
   - Payload: `{ isAdmin: true, bypassRules: true, ... }`
   - Result: PERMISSION_DENIED

9. **Owner Tampering via Update**
   - Path: `/users/user_123/reflections/ref_1`
   - Auth: `{ uid: "user_123" }`
   - Update: `{ userId: "other_user" }`
   - Result: PERMISSION_DENIED (incoming().userId == existing().userId)

10. **Arbitrary Root Document Write**
    - Path: `/arbitrary_collection/item_1`
    - Auth: `{ uid: "user_123" }`
    - Result: PERMISSION_DENIED (Global default deny catch-all)

11. **Malicious ID Path Poisoning**
    - Path: `/users/user_123/reflections/<1000-char-invalid-id>`
    - Auth: `{ uid: "user_123" }`
    - Result: PERMISSION_DENIED (isValidId guard)

12. **Unauthenticated Bulk Query / Scraping**
    - Path: Collection group `reflections`
    - Auth: `null`
    - Result: PERMISSION_DENIED
