const express = require("express");

const { open } = require("sqlite");

const sqlite3 = require("sqlite3");

const app = express();

app.use(express.json());

const path = require("path");

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const AnitilizeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,

      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("server running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB.error ${error.message}`);

    process.exit(1);
  }
};

AnitilizeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,

    playerName: dbObject.player_name,

    jerseyNumber: dbObject.jersey_number,

    role: dbObject.role,
  };
};

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `

 SELECT

 *

 FROM

 cricket_team;`;

  const playersArray = await db.all(getPlayersQuery);

  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;

  const { playerName, jerseyNumber, role } = playerDetails;

  const addPlayerDetails = `

    INSERT INTO

    cricket_team(player_name,jersey_number,role)

    VALUES

    ("${playerName}",${jerseyNumber},"${role}");`;

  const addPlayerD = await db.run(addPlayerDetails);

  const playerId = addPlayerD.lastId;

  response.send("Player Added to Team");
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getAllPlayers = `

    SELECT

        *

    FROM

    cricket_team

    WHERE  player_id = ${playerId};`;

  const PlayerTable = await db.get(getAllPlayers);
  response.send(convertDbObjectToResponseObject(PlayerTable));
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const playerDetails = request.body;

  const { playerName, jerseyNumber, role } = playerDetails;

  const updatePlayerDetails = `
  UPDATE
    cricket_team
  SET
    player_name = '${playerName}',
    jersey_number = ${jerseyNumber},
    role = '${role}'
  WHERE
    player_id = ${playerId};`;

  await db.run(updatePlayerDetails);

  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const deletePlayerDetails = `

    DELETE FROM

    cricket_team

    WHERE

    player_id = ${playerId};`;

  await db.run(deletePlayerDetails);

  response.send("Player Removed");
});

module.exports = app;
