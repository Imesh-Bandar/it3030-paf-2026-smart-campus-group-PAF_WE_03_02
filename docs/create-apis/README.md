# Postman Collection

Import the collection and environment from this folder into Postman:

- `smart-campus.postman_collection.json`
- `smart-campus.postman_environment.json`

## Usage

1. Import both files into Postman.
2. Select the `Smart Campus Backend - Local` environment.
3. Run `Auth -> Login` first and replace `accessToken` and `refreshToken` with real values from the response.
4. Use the admin/user/notification IDs as dummy placeholders or replace them with IDs from your database.

## Included APIs

- Health check
- Auth: register, login, refresh, me, bootstrap, logout, Google OAuth initiation
- Users and Admin Users
- Admin analytics
- Notifications and notification preferences
- Security activity and suspicious login acknowledgment
- Booking admin placeholder endpoint
- Ticket status placeholder endpoint
- Dev 1 check APIs: facilities/resources + maintenance blackout endpoints
- Dev 2 check APIs: booking workflow, check-in, and waitlist endpoints
- Dev 3 check APIs: ticket workflow, comments, attachments, and metrics endpoints

## Notes

- The collection uses the current backend routes from the repository.
- Dev 1/2/3 folders include planned check endpoints from your project task list so you can test module readiness.
- If a module endpoint is not implemented yet in backend controllers/services, Postman will return 404/405 until that developer finishes it.
