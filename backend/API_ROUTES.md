# NouveauDepart API routes

The backend exposes the same API under both prefixes:

- `/API/` for Railway production compatibility.
- `/api/` for local/backward compatibility.

The React frontend uses `frontend/src/services/api.js`, which currently targets `/API`.

## Main Routes

Auth:
- `POST /API/auth/register/`
- `POST /API/auth/login/`
- `GET/PATCH /API/auth/me/`

Onboarding and profile:
- `GET /API/universities/`
- `GET /API/universities/<id>/`
- `GET /API/integration-stages/`
- `POST /API/integration-stages/select/`
- `GET /API/integration-stages/current/`

Dashboard:
- `GET /API/dashboard/`
- `GET /API/integration-stages/dashboard/`

Assistant:
- `POST /API/assistant/chat/`
- `POST /API/assistant/ask/`
- `POST /API/assistant/feedback/`

Guides and checklist:
- `GET /API/guides/steps/`
- `GET /API/guides/steps/<id>/tasks/`
- `POST /API/guides/tasks/<id>/toggle/`
- `GET /API/guides/progress/`

Mentors and appointments:
- `GET /API/mentors/`
- `GET /API/mentors/recommended/`
- `GET /API/mentors/<id>/`
- `GET /API/mentors/available/`
- `POST /API/mentor-appointments/`
- `GET /API/mentor-appointments/my/`
- `GET /API/mentor-appointments/received/`
- `POST /API/mentor-appointments/<id>/accept/`
- `POST /API/mentor-appointments/<id>/refuse/`
- `POST /API/mentor-appointments/<id>/cancel/`

Messages:
- `GET /API/chat/conversations/`
- `GET/POST /API/chat/conversations/<id>/messages/`
- `GET/POST /API/chat/conversations/<id>/resources/`

Student life:
- `GET /API/events/`
- `GET /API/events/<id>/`
- `GET/POST/PUT /API/budget/`

Admin API:
- `GET/POST /API/admin/universities/`
- `GET/POST /API/admin/guides/`
- `GET/POST /API/admin/events/`
