# HB-AI Movie Directory

## Project Overview

With the overwhelming number of movies and streaming platforms available today, users often find it difficult to find content that matches their specific interests. Current recommendation systems on platforms like Netflix are limited to their own content libraries, which limits user discovery. Additionally, gathering movie information from various sources such as IMDb or Rotten Tomatoes can be time-consuming.

HB-AI Movie Directory aims to streamline this process by creating a unified platform where users can search for movies, get detailed information, and receive AI movie recommendations based on their prompt. The HB-AI Movie Directory is an online platform designed to help users discover movies and receive personalised recommendations. It combines data from IMDb and Rotten Tomatoes and uses AI (ChatGPT API) to offer movie suggestions. Users can search for movies, view detailed information, get personalised recommendations, and manage their favourite movies – all in one place.

The key features include search functionality, AI-powered recommendations, user profiles, and mobile-friendly design. Users can search for movies by giving any prompt they like, and access detailed information. They can receive personalised movie suggestions based on their searches and preferences through the ChatGPT API. The platform also offers secure login so that users can save and manage their favourite movies. Additionally, it has a responsive design built with React that ensures a smooth experience across various devices.

The HB-AI Movie Directory is designed for movie enthusiasts who want an easy and personalised way to discover films. It's ideal for users who value having consolidated movie information from IMDb and Rotten Tomatoes, as well as tailored recommendations based on their preferences. The platform also appeals to those who enjoy managing and keeping track of their favourite movies in one place, accessible across devices.

## Project Milestones

At the start of this project we set out with 5 main milestones that defined success in this project. These were outlined in the project proposal and are what constituted the end of our MVP. These 5 milestones were;

| Milestone                                               | Completed? |
| ------------------------------------------------------- | ---------- |
| Movie API Integration                                   | Yes        |
| ChatGPT Integration                                     | Yes        |
| User Accounts with proper authentication and encryption | Yes        |
| Front-end to handle GPT requests and display movies     | Yes        |
| Individual movie pages & descriptions including ratings | Yes        |

We also defined several stretch goals that we would also try and accomplish. These were sorted in our project board by "should have", "could have" and "would like to have". These stretch goals included;

| Milestone                                | Completed? |
| ---------------------------------------- | ---------- |
| Favourites Page                          | Yes        |
| Watchlists                               | Yes        |
| Fluent Navigation                        | Yes        |
| Trending Movies Tab                      | No         |
| Update User Info                         | Yes        |
| User Reviews                             | No         |
| Cast Profile Page                        | No         |
| Profile Pictures for Users               | Yes        |
| Movie Trailers                           | Yes        |
| Differentiating Admin Accounts and Users | No         |
| Admins Banning Problematic Accounts      | No         |

As you can see, we successfully accomplished many of our key goals, particularly those outlined in the MVP. While we didn't expect to achieve all of the stretch goals, they were more of a broad set of "nice-to-haves" rather than firm targets. For more information about our achievements and milestones have a look at both our Gantt Chart, and our Burndown Chart here.

## Project Planning

- [Gantt Chart](https://docs.google.com/spreadsheets/d/1vJx0YK2yUZrf-g0ogDmnljTYU-Vnt6CeJsr_G7OjEp0/edit?usp=sharing)
- [Burndown Chart](https://docs.google.com/spreadsheets/d/1saig79bapC6bHZL1T5wm8FyNCuLitagBwc7JN8htuao/edit?usp=sharing)

## Project Structure

The file structure for our project has been cleaned as much as possible to make it easy to navigate.  
Here is where to find the important stuff!

### Backend

```
backend/
├── server.js              # Backend server connecting to MongoDB and all available routes
├── controllers/           # Controllers for authentication, favourites, movies, profiles, trailer, and watchlists
├── config/                # Cloudinary services
├── middleware/            # JWT authentication
├── models/                # Schemas for users, watchlists, and favourites
├── routes/                # Details all the routes used across the website
├── services/              # Includes fetching from the TMDB API in movieService.js
└── tests/                 # Testing authentication and fetching of movies
```

### Frontend

```
frontend/
└── src/
    ├── App.jsx           # Main app file
    ├── config.js         # For switching between production and development
    ├── index.css         # Custom CSS for Tailwind
    ├── components/       # All main app components
    ├── context/          # Contains user context
    ├── imgs/             # Images used in project
    ├── App.test.jsx      # Test for main app
    ├── test/             # Testing setup
    └── tests/            # Test suites for all components
```

## Next Steps for the Project

In terms of "next steps" for the project if we were to continue, with all of the main functionality of the web app developed, we would just be continuing through our list of stretch goals. The next goals we would like to tackle would be the Trending Movies Tab, showing a list of what's new and what people have enjoyed, as well as being able to write and view user reviews. This would complement the already visible IMDB ratings by giving users more detailed information about what others thought of the movie they're looking at. We would also like to continue with further optimization of the backend including how we're handling the API's, as well as further polishing of the front end using Tailwind CSS.

## Roles, Contributions and Communication

As a group, we communicated effectively through discord, discussing plans for sprints and organising reviews together. In terms of roles, we set out at the start of the project just picking a goal and going for it, but the roles became more defined as the project progressed.

- **Int**: Did most of the work on the front end, as well as integrating the movie API - first being OMDB, then transitioning into TMDB. He implemented the main functionality of fetching the movie data based on the prompt and displaying it to the users on the front end. He also implemented all of our testing pipeline, writing hundreds of tests that are run on every merge and push to test various parts of the project.

- **Htet**: Focused on styling using Tailwind CSS. She made the front end look stunning, implementing a light and dark theme as well as the styling for movie details and watchlists. She also implemented the way that movie posters are displayed on a watchlist in a checkerboard fashion.

- **Budhil**: Focused on the AI integration for the project. He was able to engineer user inputs in a way that ChatGPT could understand, and reliably return a consistent response. He then took that response and parsed it in a way that could be fed into the movie API to get the movie details. He also implemented the MongoDB database as well as user accounts, schemas and authentication using JWT.

- **Aidan**: Took on a project management role, organising the documentation, sprint reviews and project board. He kept track of milestones and created gantt charts and burndown charts to track progress and understand the state of the project at any given time. He was also responsible for encouraging communication and discussion between the team, allowing for us to work together collaboratively and coherently.

## Documentation

[API Contract](https://docs.google.com/document/d/1t3Xw_ztyrG6TcWzXHeGf9huGQaYNu3ytEPjuqeYHCeg/edit?usp=sharing)

## Test Account

```
Email: tester@testing.com.au
Password: test
```

You can also sign up and create your own if you like.

## References

| Resource Type       | Source                                                                                                                                                                                                                                                                                                                                                                                                                                           | Description                                       |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| **APIs & Services** |                                                                                                                                                                                                                                                                                                                                                                                                                                                  |                                                   |
| TMDB                | [API Documentation](https://developer.themoviedb.org/v4/reference/intro/getting-started)                                                                                                                                                                                                                                                                                                                                                         | Movie database API for fetching movie information |
| Cloudinary          | [Documentation](https://cloudinary.com/documentation/image_upload_api_reference)                                                                                                                                                                                                                                                                                                                                                                 | Image upload and management service               |
| OpenAI              | [API Reference](https://platform.openai.com/docs/api-reference/introduction)                                                                                                                                                                                                                                                                                                                                                                     | AI integration for movie recommendations          |
| **Icons & Images**  |                                                                                                                                                                                                                                                                                                                                                                                                                                                  |                                                   |
| Theme Toggle        | [Moon Stars Icon](https://www.flaticon.com/free-icon-font/moon-stars_17511562)<br>[Brightness Icon](https://www.flaticon.com/free-icon-font/brightness_9247322)                                                                                                                                                                                                                                                                                  | Dark/Light mode toggle icons                      |
| Logo                | [Film Roll](https://www.flaticon.com/free-icon/film-roll_11434863)                                                                                                                                                                                                                                                                                                                                                                               | HB-AI Movie Directory logo                        |
| Authentication      | [Movie Poster Collection](https://www.filmmakersacademy.com/the-10-types-of-movie-a-poster-analysis/)                                                                                                                                                                                                                                                                                                                                            | Image used in sign in/sign up forms               |
| User Interface      | [User Profile](https://www.flaticon.com/free-icon/user_3177440)<br>[Watchlist Placeholder](https://www.flaticon.com/free-icon/add-to-playlist_7513150)<br>[Delete Icon](https://www.flaticon.com/free-icon-font/trash_17767845)<br>[Heart Icon](https://www.flaticon.com/free-icon-font/heart_3916769)<br>[Plus Icon](https://www.flaticon.com/free-icon-font/plus_3917163)<br>[Checkbox](https://www.flaticon.com/free-icon-font/check_3917084) | Various UI icons used throughout the application  |
