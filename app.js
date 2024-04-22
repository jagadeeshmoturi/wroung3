const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const databasePath = path.join(__dirname, 'cricketMatchDetails.db')

const app = express()
app.use(express.json())

let database = null

const initializeDb = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () =>
      console.log('Server Running at http://localhost:3000/'),
    )
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}

initializeDb()

const convertPlayerDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
  }
}

const convertMatchDbObjectToResponseObject = dbObject => {
  return {
    matchId: dbObject.match_id,
    match: dbObject.match,
    year: dbObject.year,
  }
}

// APL 1

app.get('/player/', async (request, response) => {
  const getPlayersQuery = `
  select * from player_details;`
  const playersArray = await database.all(getPlayersQuery)
  response.send(
    playersArray.map((eachPlayer) =>
      convertPlayerDbObjectToResponseObject(eachPlayer),
    ),
  )
})

//APL 2

app.get("/players/:playerId/", async (request,response) =>{
  const { playerId } = request.params
  const getPlayerIdAQuery =`
  select * from player_details where player_id = ${playerId};`;
  const player = await database.get(getPlayerIdAQuery);
  response.send(convertPlayerDbObjectToResponseObject(player))
})

//APL 3

app.put("/players/:playerId/", async (request,response) =>{
  const { player_Id } = request.params;
  const { playerName } = request.body;
  const updateQuery = `
  update player_details set 
  player_name = '${playerName}'
  where player_id = ${playerId};`;

  await database.run(updateQuery);
  response.send("player Details Updated")
})

//APL 4

app.get("/matches/:matchId/", async (request,response) =>{
  const { matchId } = request.params;
  const matchDetailsQuery = `
  select * from match_details where match_id = ${matchId};`;
  const matchDetails = await database.get(matchDetailsQuery);
  response.send(convertMatchDbObjectToResponseObject(matchDetails));
})

//APL 5
 app.get("/players/:playerId/matches/", async (request, response) =>{
  const { playerId } = request.params;
  const getPlayerMatchQuery = `
  select * from player_match_score
  natural join match_details 
  where 
  player_id = ${playerId};`;
  const playerMatches = await database.all(getPlayerMatchQuery);
  response.send(
    playerMatches.map((eachMatch) =>
    convertMatchDbObjectToResponseObject(eachMatch)
    )
  )
 })

 //APL 6

 app.get("/matches/:matchId/players/", async (request,response) =>{
  const { matchId } = request.params;
  const getMatchPlayersQuery = `
  select * from player_match_score
  natural join player_details
  where 
  match_id = ${matchId};`;
  const playerArray = await database.all(getMatchPlayersQuery);
  response.send(
    playerArray.map((eachPlayer) =>
    convertPlayerDbObjectToResponseObject(eachPlayer)
    )
  )
 })

 //APl 7

 app.get("/players/:playerId/playerScores/", async (request,response) =>{
  const { playerId } = request.params;
  const getMatchPlayersQuery = `
  select
  player_id as playerId,
  player_name as playerName,
  sum(score) as totalScore,
  sum(fours) as totalFours,
  sum(sixes) as totalSixes
  from player_match_score
  natural join player_details
  where 
  player_id = ${playerId};`;
  const playerMatchDetails = await database.get(getMatchPlayersQuery);
  resposne.send(playerMatchDetails);
 })

 module.exports = app;