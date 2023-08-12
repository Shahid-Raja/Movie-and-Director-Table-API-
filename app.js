const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const databasePath = path.join(__dirname, "moviesData.db");

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertMovieNameToCamelCaseObject = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

// API 1

app.get("/movies/", async (request, response) => {
  const getMovieQuery = `
    SELECT *
    FROM movie;`;

  const movieArrays = await database.all(getMovieQuery);
  response.send(
    movieArrays.map((name) => convertMovieNameToCamelCaseObject(name))
  );
});

// API 2 POST  CREATE NEW
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
        INSERT INTO 
        movie(director_id,movie_name,lead_actor)
        VALUES
        ( ${directorId},'${movieName}','${leadActor}');`;

  const addResponse = await database.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

// API 3 GET
const convertDbToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT * 
    FROM movie
    WHERE movie_id=${movieId};
    `;

  const movie = await database.get(getMovieQuery);
  console.log(movieId);
  response.send(convertDbToResponseObject(movie));
});

// API 4 PUT
app.put("/movies/:movieId/", async (request, response) => {
  const movieDetails = request.body;
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = movieDetails;

  const updateQuery = `
    UPDATE movie
    SET director_id=${directorId},
        movie_name='${movieName}',
        lead_Actor='${leadActor}' 
        
    WHERE movie_id=${movieId};`;

  await database.run(updateQuery);
  response.send("Movie Details Updated");
});

// API 5
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `
        DELETE FROM 
        movie
        WHERE movie_id=${movieId};`;

  await database.run(deleteQuery);
  response.send("Movie Removed");
});

// API 6

const convertDbObjectToResponseObject1 = (dbObject1) => {
  return {
    directorId: dbObject1.director_id,
    directorName: dbObject1.director_name,
  };
};

app.get("/directors/", async (request, response) => {
  const getDirectorQuery = `
    SELECT *
    FROM director;`;

  const directorArrays = await database.all(getDirectorQuery);
  response.send(
    directorArrays.map((name) => convertDbObjectToResponseObject1(name))
  );
});

// API 7
const convertMovieNameToCamelCase = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMovieQuery = `
    SELECT movie_name
    FROM  director INNER JOIN movie ON director.director_id=movie.director_id
    WHERE director.director_id=${directorId};`;

  const movies = await database.all(getDirectorMovieQuery);
  console.log(directorId);
  response.send(movies.app((name) => convertMovieNameToCamelCase(name)));
});

module.exports = app;
