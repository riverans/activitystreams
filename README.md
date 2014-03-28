[![Build Status](https://travis-ci.org/natgeo/activitystreams.png)](https://travis-ci.org/natgeo/activitystreams) [![Stories in Ready](https://badge.waffle.io/natgeo/activitystreams.png?label=ready&title=Ready)](http://waffle.io/natgeo/activitystreams)

#### Activity Stream Service




##### Table of Contents

1. Introduction
2. What is Activity Stream
3. What problem is it solving?
4. Current Situation at Natgeo
5. Technology and Standared Choices
6. Graph Problems
7. Graph Structure
7. Service Point
8. Rest End Point
9. Road Map
10. Installation










## Introduction

This document provides a high level understanding of how the Activity Stream works with Neo4j and the broad structure we have defined for interacting with the database.





## Technology choices



### Node

### Neo4j

### Redis






## Activity Stream Spec
Our activity stream model conforms to the Activity Streams specification found here: http://activitystrea.ms/, where:


ACTOR -> VERB -> OBJECT -> TARGET

might be implemented, for sake of example, as:

mmdb_user -> FAVORITED -> yourshot_photo


## Graph Structure

Nodes have labels, and the naming convention for these labels represents the types of nodes we have

	{app_name}_{model}

For example, an mmdb User would be

	mmdb_user
	
A Yourshot photo would be
	
	yourshot_photo
	
An ngm article would be
	
	ngm_article



### Node properties

Nodes currently have the folowing properties

	aid : {int} / {slug} … open ended
	api : {url}
	created: {unix timestamp
	updated: {unix timestamp}
	
Nodes contain a 'type' property so that we can return the label for the node. 



For example a USER node will have the following:

	aid : 1
	api: http://exampleapp.com/user/1/
	created: 1388767442091
	updated: 1389039127283
	
A Photo

	aid: 11121
	api: http://example.com/api/v1/photo/14055
	created: 1388767442091
	updated: 1389039127283



### Edges

Edges represent relationships. They are in all caps and also have timestamps

List of Current Verbs:
	
	FAVORITED
	PLEDGES
	FOLLOWS
	
There shall be a master list of verbs that will be used within the graph. Users are not allowed to add new verb that are not in the master list.


### Activity Service REST API

Get all nodes of type

	'get /api/v1/:actor' --> /api/v1/mmdb_user
  
Get node of specfic id

	'get /api/v1/:actor/:actor_id' --> /api/v1/mmdb_user/1
  
Get all activites of specifc actor

	'get /api/v1/:actor/:actor_id/activities' -> /api/v1/mmdb_user/1/activities
 
Get all specific verbed activites of user 

	'get /api/v1/:actor/:actor_id/:verb' -> /api/v1/mmdb_user/1/FAVORITED
	
Getall activies verb by type of object by user

	'get /api/v1/:actor/:actor_id/:verb/:object' -> api/v1/mmdb_user/1/FAVORITED/yourshot_photo
	
Get specific activity with user verbed object

	'get /api/v1/:actor/:actor_id/:verb/:object/:object_id' -> api/v1/mmdb_user/FAVORITED/yourshot_photo/1212

Post an Activity

 	'post /api/v1/activity': 'ActivityController.postSpecificActivity',
 
Delete an Activity
	
	'delete /api/v1/:actor/:actor_id/:verb/:object/:object_id' -> 
	api/v1/mmdb_user/1/Favorited/yourshot_photo/14442



### Gate Keeping


For users:

	Need a valid mmdb session cookie


For batch requests:


	api key

For clients who need to establish a signed auth cookie with this service:
 
  Send a blank JSONP request to / before establishing your socket connection

  Example:
  ```
    $.ajax({
      url: 'as.example.com',
      dataType: 'jsonp',
      timeout: 12000,
      cache: false,
      success: function(data) {
        // Establish socket
      },
      error: function(xhr, textStatus) {
        // Handle error
      }
    });
  ```


Installation
============

# Java JDK 1.7
* Download the [latest 1.7 JDK](http://www.oracle.com/technetwork/java/javase/downloads/index.html)
  * OSX users should just need to open the DMG and run the installer.
  * Debian
    * Download the [linux jdk 7](http://www.oracle.com/technetwork/java/javase/downloads/index.html)
    * `tar -xvf jdk-7u2-linux-x64.tar.gz` (64 bit) or `tar -xvf jdk-7u2-linux-i586.tar.gz` (32 bit)
    * `sudo mkdir -p /usr/lib/jvm`
    * `sudo mv ./jdk1.7.0_02 /usr/lib/jvm/jdk1.7.0`
    * Next run the following:
      ```
        sudo update-alternatives --install "/usr/bin/java" "java" "/usr/lib/jvm/jdk1.7.0/bin/java" 1
        sudo update-alternatives --install "/usr/bin/javac" "javac" "/usr/lib/jvm/jdk1.7.0/bin/javac" 1
        sudo update-alternatives --install "/usr/bin/javaws" "javaws" "/usr/lib/jvm/jdk1.7.0/bin/javaws" 1
      ```

    * Change permissions:
      ```
        sudo chmod a+x /usr/bin/java 
        sudo chmod a+x /usr/bin/javac
        sudo chmod a+x /usr/bin/javaws
        sudo chown -R root:root /usr/lib/jvm/jdk1.7.0
      ```
      
    * `sudo update-alternatives --config java`
    * You will see output similar one below - choose the number of jdk1.7.0 - for example 3 in this list:
      ```
        $sudo update-alternatives --config java
        There are 3 choices for the alternative java (providing /usr/bin/java).

        Selection Path Priority Status
        ————————————————————
        0 /usr/lib/jvm/java-6-openjdk/jre/bin/java 1061 auto mode
        1 /usr/lib/jvm/java-6-openjdk/jre/bin/java 1061 manual mode
        2 /usr/lib/jvm/java-6-sun/jre/bin/java 63 manual mode
        3 /usr/lib/jvm/jdk1.7.0/jre/bin/java 3 manual mode

        Press enter to keep the current choice[*], or type selection number: 3
        update-alternatives: using /usr/lib/jvm/jdk1.7.0/jre/bin/java to provide /usr/bin/java (java) in manual mode.
      ```
    * `java -version` to chech if you are using the correct version
    * Repeat for `sudo update-alternatives --config javac` and `sudo update-alternatives --config javaws`

# [Node](http://nodejs.org) 

(Until any of this goes to production we are not version locked, but if you must, we use 0.10.24 locally)

* OSX with Homebrew
  * `brew update`
  * `brew tap homebrew/versions`
  * `brew versions node`
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

  0 - Maintainer: [ root@debian ] 1 - Summary: [ Node.js v0.10.24 ] 2 - Name: [ node ] 3 - Version: [ v0.10.24 ]"
  ```
  Version should be 0.10.24 NOT v0.10.24 otherwise your build will fail.

  From https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager

* Ubuntu (apt-get) More friendly with ubuntu
  * `sudo apt-get install nodejs`

# NPM 1.3.14
* OSX with Homebrew:
  * NPM was recently removed from Homebrew, so manually install `curl https://npmjs.org/install.sh | sh`

# [Neo4j 2.0.1!](http://www.neo4j.org)
* Download the [Neo4j 2.0](http://www.neo4j.org/download)
* OSX:
  * `brew update`
  * `brew install neo4j`
  * `neo4j install`
  * Add to launchctl to make your life easier
  * `neo4j start`
* Debian/Linux
  * `tar xzvf neo4j-community.2.0.1-unix.tar.gz`
  * `mv neo4j-community.2.0.1-unix /etc/neo4j && cd /etc/neo4j`
  * `bin/neo4j-installer`
  * `sudo service neo4j start`
  * Uncomment "org.neo4j.server.webserver.address=0.0.0.0" in /etc/neo4j/conf/neo4j-server.properties for neo4j admin area

# [Redis](http://redis.io/)
* OSX with Homebrew:
  * `brew install redis`
  * `launchctl load ~/Library/LaunchAgents/homebrew.mxcl.redis.plist`
  * To test that your server is running:  `redis-cli`.  You should be at a prompt "127.0.0.1:6379"
  * `exit`

Dependencies
============
These files are part of the package.json file, so NPM is able to install them all with one command. `npm install`

* [Neo4j-JS](https://github.com/bretcope/neo4j-js) (this dependency might be swapped out soon)
* [Sails.JS](http://sailsjs.org/#!documentation)
* [Sails-Neo4j](https://github.com/natgeo/sails-neo4j)

# Maven
* `brew install maven`

# Bundle
*This takes care of ruby/sass dependencies*
* `gem install bundler && bundle install`


Environment Setup
=================
```
mkdir ~/code/activitystreams
cd ~/code/activitystreams
git clone git@github.com:natgeo/activitystreams.git .
cd activitystreams
npm install
```

To run your server: `neo4j start` then `sails lift`
To view your server, visit http://localhost:9365


Environment Config Overrides
============================

The config/local.js file should include any settings specifically for your
development computer (db passwords, etc.) - See http://sailsjs.org/#!documentation/config.local.  
We take this a step further, so that we can have different 'local' settings
based on the environment (development or production), and the config/local.js
file was updated to reflect this.

The environment-specific settings are found in /config/environments/.  The file
at config/local.js will check the current environment (from process.env.NODE_ENV
or defaults to 'development'), then load settings from config/environments/<environment>.

Also note that, if needed, you can create a file in /config/environments/
called 'myLocal.js'.  This file is included in .gitignore and will not be
committed, and should only be used if your particular local development
environment needs further customizations from what is found in the existing
'development.js' configuration module.

####Important:
In order to create a more secure environment, we are overriding the session secret key in the specific environment confs.
Therefore, you should create a myLocal.js file in the environments folder and add:
```
module.exports.session = {
  secret: 'replace with your secret key'
};

```

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


Testing
=======
We are using the Mocha testing framework and have implemented it using grunt.  All tests live in /tests.
While the Sails service relies on itself and will lift/lower itself, Neo4j can be mimicked so that the
service tests can run independent.  You can set two environment variables in each of your tests:

* process.env.testMode = true
    True: Runs mimicked Neo4j responses
    Undefined:  Runs queries against the live database  (either comment out or delete the setting)

* process.env.testModeDebug = true:false
    True:  Displays cypher queries in the test console when they run for each test
    False:  Does not display cypher queries in the test console

To mimic the Neo4j service, you will need to require Nock and set up a server to intercept the host:port.
All this server needs to do is to capture requests on '/db/data/' and to reply with a 200 response.  Be sure
to clean up after the Nock service by running `nock.cleanAll();` after each test and `nock.restore();` after all
tests are done.  For more info on Nock, visit: https://github.com/pgte/nock

To lift/lower your Sails server, you need to require Sails and then issue the lift command with your config
options (ports, adapters, etc.).  An example to start the server:

```
// Run a sails instance using the Neo4j adapter -- ran in the before() function
require('sails').lift({
    port: 9365,
    adapters: {
        default: 'neo4j' // defined in config/adapters.js
    }
}, done);
```

```
// Lower a sails instance after all tests are done -- ran in the after() function
sails.lower();
```

In the view controller (api/controllers/) is where you would supply the test data you want returned to your
tests.  An example structure that the views support:

```
myView: function(req, res) {
    var q = [
            // Cpyher query
            'MATCH (n)',
            'RETURN n'
        ];
    if (typeof process.env.testMode === undefined) {
        View.adapter.query(q,{}, function(err, results) {
                if (err) { return res.json(err); }
                res.json(results);
            }
        );
    } else {
        if (typeof process.env.testModeDebug !== undefined && process.env.testModeDebug === true) {
            // Display debug query in console
            View.adapter.query(q, {});
        }
        res.json(200, { // return data here in JSON format });
    }
}
```


To run test: `grunt test`
	

KNOWN ISSUES
==================
- Sails.js may act inconsistently when connecting with socket.io.  Running sudo npm install in the base of the app may resolve this.
