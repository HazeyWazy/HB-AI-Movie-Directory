# Deployment

## Deployed Application Links

- **Frontend**: [https://group-project-gwdp-monday-12pm-8mrf.onrender.com/](https://group-project-gwdp-monday-12pm-8mrf.onrender.com/)
- **Backend**: [https://group-project-gwdp-monday-12pm.onrender.com/](https://group-project-gwdp-monday-12pm.onrender.com/)

## Project Setup and Running Instructions

### Environment Setup

1. Clone the repository
2. Create `.env` file in the backend directory.

### Frontend Configuration

1. Navigate to `frontend/src/config.js`
2. Modify the API configuration for local development:

```javascript
export const apiUrl = 
"http://localhost:5000/api";
// "https://group-project-gwdp-monday-12pm.onrender.com/api";

export const deployUrl = 
"http://localhost:5000";
// "https://group-project-gwdp-monday-12pm.onrender.com";
```

### Installation and Running

#### Backend Setup
```bash
cd backend
npm install
npm run dev  # Runs on port 5000
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev  # Runs on port 3000
```

## Continuous Integration

The project implements Continuous Integration using GitHub Actions, configured in `.github/workflows/main.yml`. The workflow is designed to automatically test both frontend and backend components on every push or pull request to the main branch.

### CI Workflow Configuration

This CI pipeline:
- Runs on Ubuntu latest
- Uses Node.js 18.x
- Installs dependencies for both frontend and backend
- Executes test suites for both frontend and backend components
- Uses environment variables for backend testing

### Testing Suite

#### Backend Tests (`/backend/tests/`)
- **Authentication Tests**: `auth.test.js`
- **Favorites Tests**: `favourites.test.js`
- **Movie Recommendation Tests**: `movies.test.js`
- **Profile Tests**: `profile.test.js`
- **Watchlist Tests**: `watchlist.test.js`

#### Frontend Tests (`/frontend/src/tests/`)
Component Tests:
1. **Main App component Tests**: `App.test.jsx`
2. **Favourites component Tests**: `Favourites.test.jsx`
3. **MovieDetail component Tests**: `MovieDetail.test.jsx`
4. **Movie List component Tests**: `MovieList.test.jsx`
5. **Profile component Tests**:  `Profile.test.jsx`
6. **Sign In component Tests**: `SignIn.test.jsx`
7. **Sign Up component Tests**: `SignUp.test.jsx`
8. **User Context component Tests**: `UserContext.test.jsx`
9. **Watchlist component Tests**: `Watchlist.test.jsx`
10. **Watchlist Detail component Tests**: `WatchlistDetail.test.jsx`

### Running Tests Locally

```bash
# Backend Tests
cd backend
npm test

# Frontend Tests
cd frontend
npm test
```

## Additional Information

- The application uses MongoDB Atlas for database hosting
- Frontend is built with React and Tailwind CSS
- Backend uses Express.js and Node.js
- API integrations include OpenAI for movie recommendations and TMDB for movie data
- Cloudinary is used for image storage and management

## Troubleshooting

- If you encounter CORS issues, verify the CORS configuration in `server.js`
- For database connection issues, ensure the MongoDB URL is correct and accessible
- Check that all environment variables are properly set before running the application
