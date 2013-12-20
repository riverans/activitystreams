activitystreams
===============

NatGeo Activity Streams


Installation
============

# Java JDK 1.7
* Download the [latest 1.7 JDK] (http://www.oracle.com/technetwork/java/javase/downloads/index.html)
  * OSX users should just need to open the DMG and run the installer.

# Node 0.10.22
* OSX with Homebrew
  * brew update
  * brew tap homebrew/versions
  * brew versions node

  * If the latest version is newer, check out 0.10.22: `git checkout 72f61d1 /usr/local/Library/Formula/node.rb`
  * `brew install node --upgrade`

* Debian/Ubuntu (Build from source) - recommended with debian
  ```
  sudo apt-get install python g++ make checkinstall
  mkdir ~/src && cd ~/src
  wget -N http://nodejs.org/dist/node-latest.tar.gz
  tar xzvf node-latest.tar.gz && node-v* #(remove the "v" in front of the version number in the dialog)
  ./configure
  checkinstall
  sudo dpkg -i node_*
  ```

  Note: when you call checkinstall, make sure you edit the version when presented with:

  ```
  "This package will be built according to these values:

  0 - Maintainer: [ root@debian ] 1 - Summary: [ Node.js v0.10.22 ] 2 - Name: [ node ] 3 - Version: [ v0.10.22 ]"
  ```
  Version should be 0.10.22 NOT v0.10.22 otherwise your build will fail.

  From https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager

* Ubuntu (apt-get) More friendly with ubuntu
  * `sudo apt-get install node`

# NOM 1.3.14
* OSX with Homebrew:
  * NPM was recently removed from Homebrew, so manually install `curl https://npmjs.org/install.sh | sh`

# Neo4j 2.0!
* Download the [Neo4j 2.0] (http://www.neo4j.org/download)
* OSX:
  * `brew update`
  * `brew install neo4j`
  * `neo4j install`
  * `neo4j start`
* Debian/Linux
  * `tar xzvf neo4j-communtity.2.0.0-unix.tar.gz`
  * `mv neo4j-communtity.2.0.0-unix /etc/neo4j && cd /etc/neo4j`
  * `bin/neo4j neo4j-installer`
  * `sudo service neo4j start`
  * Note had to uncomment `neo4j-communtity.2.0.0-unix` in /etc/neo4j/conf/neo4j-server.properties for neo4j admin area

# Neo4j-JS
* `npm install -g neo4j-js`

# Socket.io
* `npm install -g socket.io`

# Maven
* `npm install -g maven`

# Sails.JS
* `sudo npm install -g sails`

# Sails-Neo4j
* `git clone git@github.com:natgeo/sails-neo4j.git`
* `cd sails-neo4j`
* `npm link`

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
npm link sails-neo4j
```

To run your server: `sails lift`
To view your server, visit http://localhost:9365

___

Activity Streams Demo
=====================

A simple demo page for the NatGeo Activity Streams project


Install
=======

add as.nationalgeographic.com to your /etc/hosts file

Usage
=====
A local instance of MMDB is also required for signing in and favoriting an image.  Clone the MMDB
repo, run through the installer, and run it on port 8000.  This sails server should be running as well.

Access the demo at http://as.nationalgeographic.com:9365/as-demo.  If you are not
on the .nationalgeographic.com domain, then the header controls will not display.


Sample Demo Script
==================
1. Access the page: http://as.nationalgeographic.com:6935/as-demo.html
2. Click on a heart underneath a page.  You should see an alert that tells you to log in.
3. Log in with a known account.
4. Click on a heart underneath a picture.  It should turn from black to pink.
5. Refresh the page.  The image you favorited should still have a pink heart.
6. Either use another browser or clear your browser cache. (**SEE KNOWN ISSUES**)
7. Refresh the page.  The hearts should be black and you should be logged out.
8. Log in and refresh the page.  The image you favorited should be pink.

KNOWN ISSUES
==================
- Sails.js may act inconsistently when connecting with socket.io.  Running sudo npm install in the base of the app may resolve this.


TODO
====
- Use socket.io to display the activity stream in the large box

