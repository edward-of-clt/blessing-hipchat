# Blessing #
A global HipChat add-on for adding or removing blessing to people and things.

![blessing.png](https://bitbucket.org/repo/AnBKL4/images/3241948271-blessing.png)

## [Install Me](https://hipchat.com/addons/install?url=https%3A%2F%2Fac-koa-hipchat-blessing.herokuapp.com%2Faddon%2Fcapabilities) ##

# Commands #
```
#!html
Usage:
  /blessing                 print this help message
  /blessing :enable         enable blessing matching in the current room
  /blessing :disable        disable blessing matching in the current room
  /blessing :top things     show the top 10 things
  /blessing :bottom things  show the bottom 10 things
  /blessing :top users      show the top 10 users
  /blessing :bottom users   show the bottom 10 users
  /blessing thing           lookup thing's current blessing
  /blessing @MentionName    lookup a user's current blessing by @MentionName
  thing++                add 1 blessing to thing
  thing++++              add 3 blessing to thing (count(+) - 1, max 5)
  thing--                remove 1 blessing from thing
  thing----              remove 3 blessing from thing (count(-) - 1, max 5)
  "subject phrase"++     add 1 blessing to a subject phrase
  @MentionName++         add 1 blessing to a user by @MentionName
```


# Run Blessing yourself with Docker #
This is an experimental way for you to run Blessing yourself using Docker (i.e. "Behind the Firewall" with HipChat Server)

### Prerequisites ###
1. git clone https://bitbucket.org/atlassianlabs/ac-koa-hipchat-blessing.git

### Build ###
1. cd ac-koa-hipchat-blessing
2. sudo docker build -t atlassian_labs/blessing:latest .

### Run ###
1. sudo docker run --name blessing-mongo --detach mongo:2.6
2. sudo docker logs blessing-mongo
3. sudo docker run --name blessing --detach --link blessing-mongo:mongo --publish 3020:3020 -e NODE_ENV="production"
   -e LOCAL_BASE_URL="http://your-docker-host-fqdn:3020" -e PORT=3020 atlassian_labs/blessing:latest
4. sudo docker logs blessing
5. Verify you see a valid capabilities.json returned from http://your-docker-host-fqdn:3020/addon/capabilities

### Install ###
1. Integrate your Docker-Blessing with your HipChat account with https://hipchat.example.com/admin/addons (or www.hipchat.com) -> Manage (tab) -> Install an integration from a descriptor URL: http://your-docker-host-fqdn:3020/addon/capabilities
