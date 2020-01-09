module.exports = function(robot) {

    var maxNumber = 100
    var players = []
    var isPlaying = 0

    // Start a new round
    robot.respond(/the mind/i, function(res) {
        user = res.message.user.name
        if (!isPlaying) {
            players.push(user)
            isPlaying = 1
            res.send(":game_die::game_die::game_die::game_die::game_die::game_die:")
            robot.messageRoom("#tabletop-tuesdays", "<!channel> THE MIND LEVEL 1: Join by typing `@papi deal` ")
        } else {
            res.send("There's already a game in progress. Reset it by typing `@papi reset game`")
        }
    })

    // Deal cards
    robot.respond(/deal/i, function(res) {
        user = res.message.user
        if (!isPlaying) {
            res.send("There's no on-going game, start a new game by typing `@papi the mind`")   
        } else {
            addPlayer(user, res)
        }
    })

    // Deal cards
    robot.respond(/reset game/i, function(res) {
        if (!isPlaying) {
            res.send("There's no on-going game, start a new game by typing `@papi the mind`")   
        } else {
            resetGame()
        }
    })

    // Add player
    function addPlayer(user, res) {
        userName = user.name.replace("@", "").toLowerCase();
        if (players.indexOf(userName) != -1) {
            res.reply("You're already in!")
        } else {
            res.reply("Yes you're in!")
            players.push(userName)
            card = Math.floor(Math.random() * 100) + 1;
            robot.messageRoom(user.id, "Your card is: " + card);
        }            
    }

    // Run at the end of a round to clear users and update stats
    function resetGame() {
        // update stats

        players = []
        isPlaying = 0
    }


}