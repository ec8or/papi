module.exports = (robot) ->

  oldPriceBTC = 0
  oldPriceETH = 0
  oldPriceXMR = 0

  robot.respond /bitcoin|btc/i, (res) ->
    btc()

  btc = ->
    robot.http("https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC,ETH,XMR&tsyms=USD&e=Kraken&extraParams=papi")
      .header('Accept', 'application/json')
      .get() (err, response, body) ->
        # error checking code here
        data = JSON.parse body
        if oldPriceBTC
          changeBTC = parseFloat(data.BTC.USD) - parseFloat(oldPriceBTC)
          changeETH = parseFloat(data.ETH.USD) - parseFloat(oldPriceETH)
          changeXMR = parseFloat(data.XMR.USD) - parseFloat(oldPriceXMR)
          if changeBTC > 100
            robot.messageRoom "#cryptochaining", "XMR: $#{data.XMR.USD} (#{changeXMR.toFixed(2)})\n ETH: $#{data.ETH.USD} (#{changeETH.toFixed(2)})\n BTC: $#{data.BTC.USD} (#{changeBTC.toFixed(2)}) :D :moneybag:"
          else if changeBTC < -100
            robot.messageRoom "#cryptochaining", "XMR: $#{data.XMR.USD} (#{changeXMR.toFixed(2)})\n ETH: $#{data.ETH.USD} (#{changeETH.toFixed(2)})\n BTC: $#{data.BTC.USD} (#{changeBTC.toFixed(2)}) :disappointed: :gun:"
          else
            robot.messageRoom "#cryptochaining", "XMR: $#{data.XMR.USD} (#{changeXMR.toFixed(2)})\n ETH: $#{data.ETH.USD} (#{changeETH.toFixed(2)})\n BTC: $#{data.BTC.USD} (#{changeBTC.toFixed(2)}) :thinking_face: :boat:"
        else
          robot.messageRoom "#cryptochaining", "$#{data.XMR.USD}\n $#{data.ETH.USD}\n $#{data.BTC.USD}"
        oldPriceBTC = data.BTC.USD      
        oldPriceETH = data.ETH.USD      
        oldPriceXMR = data.XMR.USD      
