# Placement Portal

A full-stack placement portal demo built with Express, MongoDB, and a single-page frontend served from the Node app.

## Run locally

```bash
npm install
npm run start
```

Open `http://localhost:3000`.

## Demo flow

- Sign up as a student
- Log in
- Click `Load demo jobs` if the board is empty
- Apply with an uploaded resume
- View your applications in `My applications`

## Notes

- The backend exposes `GET /seed-jobs` to create demo roles.
- The frontend is served from `index.html` by `server.js`.
- GitHub Pages is not suitable for the live portal because the app depends on backend routes.
