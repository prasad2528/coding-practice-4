const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;
const intializeDBAndServer = async () => {
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
intializeDBAndServer();
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};
//GET PLAYERS
app.get("/players/", async (request, response) => {
  const getAllPlayers = `
        SELECT 
           *
        FROM 
           cricket_team;`;
  const player = await db.all(getAllPlayers);
  response.send(
    player.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});
module.exports = app;
//put players
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const createNewPlayer = `
        INSERT INTO
            cricket_team (player_name, jersey_number, role)
        VALUES
            ('${playerName}',${jerseyNumber},'${role}');`;
  const dbResponse = await db.run(createNewPlayer);
  response.send("Player Added to Team");
});
app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerById = `
    SELECT
       *
    FROM
       cricket_team
    WHERE
       player_id = ${playerId};`;
  const deResponse = await db.get(getPlayerById);
  response.send(deResponse);
});
//update
app.put("/players/:playerId/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const { playerId } = request.params;
  const updatePlayerDetails = `
  UPDATE 
     cricket_team
  SET
     player_name = '${playerName}',
     jersey_number = ${jerseyNumber},
     role = '${role}'
  WHERE
     player_id = ${playerId};`;
  const dbResponse = await db.run(updatePlayerDetails);
  response.send("Players Details Updated");
});
//delete
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayer = `
    DELETE FROM
       cricket_team
    WHERE
       player_id = ${playerId};`;
  const dbResponse = await db.run(deletePlayer);
  response.send("Player Removed");
});
