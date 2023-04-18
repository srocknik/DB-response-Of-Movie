const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

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
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

const convertSnakeCaseIntoCamelCase = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
    directorName: dbObject.director_name,
  };
};

//Get movies API
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT
      movie_name
    FROM
      movie
    ORDER BY
      movie_id;`;
  const movieArray = await db.all(getMoviesQuery);
  response.send(
    movieArray.map((eachItem) => convertSnakeCaseIntoCamelCase(eachItem))
  );
});

//GET Directors API
app.get("/directors/", async (request, response) => {
  const getDirectorQuery = `
    SELECT
      *
    FROM
      director
    ORDER BY
      director_id;`;
  const directorArray = await db.all(getDirectorQuery);
  response.send(
    directorArray.map((eachItem) => convertSnakeCaseIntoCamelCase(eachItem))
  );
});

//Get movie API
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const bookIdQuery = `
    SELECT * FROM
    movie 
    WHERE movie_id = ${movieId}
    `;
  const movie = await db.get(bookIdQuery);
  response.send(convertSnakeCaseIntoCamelCase(movie));
});

//GET Director API
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorQuery = `
    SELECT 
        movie_name 
    FROM
        movie 
    WHERE director_id = ${directorId}
    `;
  const director = await db.get(getDirectorQuery);
  response.send(convertSnakeCaseIntoCamelCase(director));
});

//Add movie API
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const addMovieQuery = `
    INSERT INTO
      movie (director_id,movie_name,lead_actor)
    VALUES
      (
        ${directorId},
        '${movieName}',
        '${leadActor}'
      );`;

  await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

//Update Movie API
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieQuery = `
    UPDATE
      movie
    SET
      director_id= ${directorId},
      movie_name= '${movieName}',
      lead_actor= '${leadActor}'
    WHERE
      movie_id = ${movieId};`;

  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//Delete Book API
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteBookQuery = `
        DELETE FROM 
            movie
            WHERE movie_id = ${movieId}
    `;
  db.run(deleteBookQuery);
  response.send("Movie Removed");
});

//Get Book By Author API
app.get("/authors/:authorId/books/", async (request, response) => {
  const { authorId } = request.params;
  const getBookQuery = `
    SELECT *
    FROM book 
    WHERE author_id = ${authorId}
    `;
  const bookArray = await db.all(getBookQuery);
  response.send(bookArray);
});

module.exports = app;
