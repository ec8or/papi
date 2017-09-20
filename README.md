# Requirements

Papi runs on the Hubot framework and needs a Slack adapter and a Redis brain to function properly. Easiest way to get started it to use Yeoman generator-hubot:

https://github.com/hubotio/generator-hubot

Once set up you connect to Slack using:

```
HUBOT_SLACK_TOKEN=<your token> ./bin/hubot --adapter slack
```
