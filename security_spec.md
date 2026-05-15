# Security Specification - FitTrack Pro

## 1. Data Invariants
- **Users**: A user can only read and write their own profile document.
- **Activities**: An activity must have a `userId` that matches the authenticated user. Users can only list their own activities.
- **Challenges**: Read-only for all users. Only admins (if any) can write.
- **Badges**: Read-only for all users. Only admins can write.
- **Identity**: Identity spoofing is prevented by ensuring `userId` fields in data match `request.auth.uid`.

## 2. Invariant Payloads (The "Dirty Dozen")
1. **Spoof Profile**: Write to `/users/other_user_id` as `current_user`. (DENY)
2. **Elevate XP**: User tries to update their own `xp` by 1,000,000. (DENY - through action-based updates)
3. **Orphaned Activity**: Create activity with `userId` of another user. (DENY)
4. **Delete History**: Try to delete another user's activity. (DENY)
5. **Collection Scraping**: `getDocs` on `/users` collection without filter. (DENY)
6. **Junk ID**: Create resource with 2MB string as ID. (DENY)
7. **Ghost Field**: Add `isAdmin: true` to a profile update. (DENY)
8. **Bad Type**: Setting `totalSteps` to a string. (DENY)
9. **Negative Stats**: Setting `totalDistance` to -500. (DENY)
10. **Challenge Hack**: User tries to delete a global Challenge. (DENY)
11. **Future Date**: Setting `startTime` to 2099. (DENY)
12. **Unverified Access**: Writing while `email_verified` is false. (DENY - if strict mode enabled)
