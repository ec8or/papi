module.exports = function(robot) {

    var maxCups = 6
    var drinkers = []
    var isBrewing = 0
    var brewer, countdown
    var timeout = 7

    var pricePerCup = 0.20

    var totalStarts

    var beans = 1

    // Initialise a new round of coffee
    robot.respond(/coffee time|covfefe time/i, function(res) {
        if (beans) {
            if (!isBrewing) {
                user = res.message.user.name
                brewer = user
                drinkers.push(user)
                isBrewing = 1
                res.send(":coffee::coffee::coffee::coffee::coffee::coffee:")
                robot.messageRoom("#coffee-club", "<!channel> yes " + res.message.user.name + ", coffee coming up! Who wants a cup? You got " + timeout + " minutes to join by typing `@papi me`")
                countdown = setInterval(function() {
                    checkCups(res)
                }, 60000)
            } else {
                res.send(brewer + " is already making coffee, get in by typing `@papi me`")
            }
        } else {
            res.send(":scream_cat: NO BEANS! :sob:")
        }
    })

    // Toggle beans
    robot.respond(/no beans/i, function(res) {
        res.send("ok... :anguished:")
        beans = 0
    })    

    // Add current user to the round
    robot.respond(/me/i, function(res) {
        if (!isBrewing) {
            res.send("noone is making coffee, start a new round by typing `@papi coffee`")   
        } else {
            user = res.message.user.name
            addDrinker(user, res)
        }
    })

    // Add another user to the round
    // TODO: Parse out @ and remove case-sensitivity
    robot.respond(/add (.*)/i, function(res) {
        if (!isBrewing) {
            res.send("noone is making coffee, start a new round by typing `@papi coffee`")   
        } else {
            user = res.match[1]
            addDrinker(user, res)
        }
    })

    // Add user
    // TODO: Check if adding a different person and change the message
    function addDrinker(user, res) {
        if (drinkers.length >= maxCups) {
            res.reply("No more room!")
        } else if (drinkers.indexOf(user) != -1) {
            res.reply("you're already in!")
        } else {
            res.reply("yes you're in!")
            drinkers.push(user)
            cups = maxCups - drinkers.length
            if (cups <= 0) {
                clearInterval(countdown)
                setTimeout(function() {
                    timeout = 0
                    checkCups(res)
                }, 2000)
            } else {
                setTimeout(function() {
                    res.send("" + drinkers.toString() + " are in, " + cups + " cups remaining...")
                }, 1000)                    
            }
        }            
    }

    // Run every minute to check if time is up
    function checkCups(res) {
        timeout = timeout - 1
        cupsRemaining = maxCups - drinkers.length
        if (timeout <= 0) {
            water = drinkers.length * 2
            coffee = drinkers.length * 1
            if (drinkers.length <= 4) {
                coffee = coffee + 0.5;
            } else {
                coffee = coffee
            }
            res.send("Time's up! " + drinkers.length + " cups of coffee: " + drinkers.toString() + ". Who will be the lucky brewer? :coffee: :man-woman-girl-boy: ")
            setTimeout(function() {
                var rand = Math.floor(Math.random()*drinkers.length)
                console.log(drinkers)
                console.log("length: " + drinkers.length)
                console.log(rand)
                var brewer = drinkers[rand]
                res.send("It's @" + brewer + "!!! :star2: :kissing_closed_eyes: :+1::+1::+1:")
            },3500)
            setTimeout(function() {
                res.send("(water level at: " + water + ", set grinder to: " + coffee + " cups)")
                resetBrew()
            },4500)
        } else {
            res.send("" + timeout + " minutes to go... " + cupsRemaining + " cups remaining...")
        }
    }

    // Skip the countdown, i.e. MAKE COFFEE NOW
    robot.respond(/skip/i, function(res) {
        if (!isBrewing) {
            res.send("noone is making coffee, start a new round by typing `@papi coffee`")   
        } else {
            clearInterval(countdown)
            setTimeout(function() {
                timeout = 0
                checkCups(res)
            }, 2000)
        }
    })

    // Run at the end of a round to clear users and update stats
    function resetBrew() {
        // update stats
        var totalBrews =  robot.brain.get('totalBrews')
        totalBrews = totalBrews + 1
        robot.brain.set('totalBrews', totalBrews)

        var totalCups =  robot.brain.get('totalCups')
        totalCups = totalCups + drinkers.length
        robot.brain.set('totalCups', totalCups)

        // update users
        updateCoffeeStats()

        // run this at start
        clearInterval(countdown)
        maxCups = 6
        drinkers = []
        isBrewing = 0
        brewer = ''
        timeout = 7
    }

    // Update total number of coffees and money owed by drinkers in the round
    // TODO: Total brews is a bit confusing since the refactor
    // TODO: Track who had to make the coffee
    function updateCoffeeStats() {
        if (!robot.brain.get('totalBrewsByUser')) {
            // init MOVE ALL OF THESE
            totalBrewsByUser = {}
        } else {
            // retrieving users brews
            totalBrewsByUser = robot.brain.get('totalBrewsByUser')
            totalBrewsByUser = JSON.parse(totalBrewsByUser)

            totalOwedByUser = robot.brain.get('totalOwedByUser')
            totalOwedByUser = JSON.parse(totalOwedByUser)
        }
        drinkers.forEach(function(drinker) {
            if (totalBrewsByUser[drinker]) {
                totalBrewsByUser[drinker] = totalBrewsByUser[drinker] + 1
            } else {
                totalBrewsByUser[drinker] = 1
            }
            if (totalOwedByUser[drinker]) {
                totalOwedByUser[drinker] = parseFloat(totalOwedByUser[drinker]) + parseFloat(pricePerCup)
            } else {
                totalOwedByUser[drinker] = parseFloat(pricePerCup)
            }

            console.log("" + drinker + ": " + totalBrewsByUser[drinker])
        }) 
        totalBrewsByUserJSON = JSON.stringify(totalBrewsByUser)
        robot.brain.set('totalBrewsByUser', totalBrewsByUserJSON)

        totalOwedByUserJSON = JSON.stringify(totalOwedByUser)
        robot.brain.set('totalOwedByUser', totalOwedByUserJSON)
    }

    // Check balance of user
    robot.respond(/balance/i, function(res) {
        if (robot.brain.get('totalOwedByUser')) {
            user = res.message.user.name

            totalOwedByUser = robot.brain.get('totalOwedByUser')
            totalOwedByUser = JSON.parse(totalOwedByUser)

            if (totalOwedByUser[user]) {
                res.send(":money_mouth_face: £" + totalOwedByUser[user].toFixed(2) + " please...")
            } else {
                res.send("You don't owe me anything! :disappointed: ")
            }
        }
    })

    // Mark balance as paid
    // TODO: Pay any amount and have the balance affected (Should support a credit balance)
    robot.respond(/paid/i, function(res) {
        if (robot.brain.get('totalOwedByUser')) {
            user = res.message.user.name

            totalOwedByUser = robot.brain.get('totalOwedByUser')
            totalOwedByUser = JSON.parse(totalOwedByUser)

            totalOwedByUser[user] = 0

            totalOwedByUserJSON = JSON.stringify(totalOwedByUser)
            robot.brain.set('totalOwedByUser', totalOwedByUserJSON)

            res.send(":money_with_wings: thank you! :money_with_wings:")
        }
    })

    // Inform everyone that there's a new bag of coffee and poke them for payments
    // TODO: Total brews are a bit confusing since the refactor
    robot.respond(/new bag/i, function(msg){
        beans = 1
        if (!robot.brain.get('totalCupsByUser')) {
            // init MOVE ALL OF THESE
            console.log('init total cups')
            totalCupsByUser = {}
        }
        if (!robot.brain.get('totalOwedByUser')) {
            // init MOVE ALL OF THESE
            console.log('init total owed')
            totalOwedByUser = {}
            totalOwedByUserJSON = JSON.stringify(totalOwedByUser)
            robot.brain.set('totalOwedByUser', totalOwedByUserJSON)
        } else {
            // retrieving money owed
            totalOwedByUser = robot.brain.get('totalCupsByUser')
            totalOwedByUser = JSON.parse(totalOwedByUser)
        }
        if (robot.brain.get('totalOwedByUser')) {
           
            totalOwedByUser = robot.brain.get('totalOwedByUser')
            totalOwedByUser = JSON.parse(totalOwedByUser)
            
            msg.send("FRESH COFFEE YES! Time to pay up! :coffee:")
            msg.send(":moneybag::moneybag::moneybag::moneybag::moneybag: ")
            for (var drinker in totalOwedByUser) {
                // Calculate payment
                payment = parseFloat(totalOwedByUser[drinker])
                if (payment > 0) {
                    msg.send("" + drinker + ": £" + payment.toFixed(2))
                }
            }
        } else {
            msg.send("You haven't had any coffee yet!")  
        }
    });

    // Get stats and money owed for all users
    // TODO: Total brews are a bit confusing since the refactor
    robot.respond(/stats/i, function(msg){
        var totalCups =  robot.brain.get('totalCups')
        var totalBrews =  robot.brain.get('totalBrews')
        msg.send("Total brews: " + totalBrews + "\nTotal cups of coffee: " + totalCups)
        setTimeout(function() {
            if (robot.brain.get('totalBrewsByUser') && robot.brain.get('totalCupsByUser') && robot.brain.get('totalOwedByUser')) {
                totalCupsByUser = robot.brain.get('totalCupsByUser')
                totalCupsByUser = JSON.parse(totalCupsByUser)

                totalBrewsByUser = robot.brain.get('totalBrewsByUser')
                totalBrewsByUser = JSON.parse(totalBrewsByUser)

                totalOwedByUser = robot.brain.get('totalOwedByUser')
                totalOwedByUser = JSON.parse(totalOwedByUser)

                for (var drinker in totalCupsByUser) {
                    var totalCups = totalCupsByUser[drinker] + totalBrewsByUser[drinker]
                    msg.send("" + drinker + ": " + totalCups + " cups of coffee consumed, Owes: :moneybag: £" +  parseFloat(totalOwedByUser[drinker]).toFixed(2))
                } 
            }
        }, 500)
    });

    // Hubot test? :/
    robot.respond(/is it (weekend|holiday)\s?\?/i, function(msg){
        var today = new Date();
        msg.reply(today.getDay() === 0 || today.getDay() === 6 ? "YES" : "NO");
    });

}