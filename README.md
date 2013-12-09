activitystreams
===============

NatGeo Activity Streams


Installation
============

# Java JDK 1.7
* Download the [latest 1.7 JDK] (http://www.oracle.com/technetwork/java/javase/downloads/index.html)
..* OSX users should just need to open the DMG and run the installer.

# Node 0.10.22
* OSX with Homebrew:
```
brew update
brew tap homebrew/versions
brew versions node
..* If the latest version is newer, check out 0.10.22: `git checkout 72f61d1 /usr/local/Library/Formula/node.rb`
..* `brew install node --upgrade`

# NOM 1.3.14
* OSX with Homebrew:
..* NPM was recently removed from Homebrew, so manually install `curl https://npmjs.org/install.sh | sh`

# Neo4j 2.0 RC1
* Download the [Neo4j 2.0 RC1 install files] (http://www.neo4j.org/download)
* OSX:
..* Create an /opt directory if you do not already have one `mkdir /opt`
..* Extract Neo4j to /opt directory `sudo tar -xf neo4j-community-2.0.0-RC1-unix.tar.gx -C /opt
..* Add Neo4j's bin directory to your path.
..*..* First, edit your profile `vi ~/.profile`
..*..* Next, add this somewhere in your profile: export PATH=/opt/neo4j-community-2.0.0-RC1/bin:$PATH`
..*..* Save your profile `:wq`
..*..* Reload your settings `source ~/.profile`
..* Install Neo4j as a service with launchctl `sudo neo4j-installer install`
..* Start that service `sudo launchctl start org.neo4j.server`
..* If you want to confirm the serivce is running `neo4j status`

# Neo4j-JS
* `npm install -g neo4j-js`

# Socket.io
* `npm install -g socket.io`

# Maven
* `npm install -g maven`

# Sails.JS
* `sudo npm install -g sails`


Environment Setup
=================
```
mkdir ~/code/activitystreams
cd ~/code/activitystreams
git clone git@github.com:natgeo/activitystreams.git .
mkvirtualenv activitystreams
workon activitystreams
echo 'cd ~/code/activitystreams' >> $WORKON_HOME/activitystreams/bin/postactivate
deactivate
workon activitystreams
```

To run your server: `sails lift`
To view your server, visit http://localhost:9365