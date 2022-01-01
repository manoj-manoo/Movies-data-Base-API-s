const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "moviesData.db");

const app = express();
app.use(express.json());

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB error: ${error.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

const convertMovieDBObjectToMovieResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const convetDirectorDbObjectToDirectorResponseObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

//Get movies list API

app.get("/movies/", async (request, response) => {
  const moviesList = `
    SELECT 
    movie_name
    FROM 
    movie;`;
  const movies = await db.all(moviesList);
  response.send(
    movies.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

// post movie API

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const addMovieQuery = `
    INSERT INTO 
    movie ( director_id, movie_name, lead_actor)
    VALUES
    (${directorId},${movieName},${leadActor});`;
  await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

// Get movie based on movie_id

app.get("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const getMovie = `
    SELECT * 
    FROM 
    movie
    WHERE
    movie_id = '${movieId}';`;
  const movie = await db.get(getMovie);
  response.send(convertMovieDBObjectToMovieResponseObject(movie));
});

// Put(update) movie API

app.put("/movies/:movieId", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;
  const updateMovie = `
    UPDATE
        movie
    SET
    director_id = '${directorId}',
    movie_name = '${movieName}',
    lead_actor = '${leadActor}',
    
    WHERE 
    movie_id = '${movieId}';`;
  await db.run(updateMovie);
  response.send("Movie Details Updated");
});

// Delete Movie API

app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovie = `
    DELETE FROM 
    movie
    WHERE
    movie_id = '${movieId}';`;
  await db.run(deleteMovie);
  response.send("Movie Removed");
});

// Get directors API

app.get("/directors/", async (request, response) => {
  const directorQuery = `
    SELECT * 
    FROM 
    director;`;
  const directorsArray = await db.all(directorQuery);
  response.send(
    directorsArray.map((eachDirector) =>
      convetDirectorDbObjectToDirectorResponseObject(eachDirector)
    )
  );
});

//Get directors and movies API
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMovies = `
    SELECT movie_name
    FROM 
    movie
    WHERE 
    director_id = '${directorId}';`;
  const directorMovie = await db.all(getDirectorMovies);
  response.send(
    directorMovie.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

module.exports = app;
