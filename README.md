[![Build Status](https://travis-ci.org/natgeo/activitystreams.png)](https://travis-ci.org/natgeo/activitystreams) [![Stories in Ready](https://badge.waffle.io/natgeo/activitystreams.png?label=ready&title=Ready)](http://waffle.io/natgeo/activitystreams)


#### Horizon - an Activity Stream Service

ActivityStreams is a REST service in order to create, serve and store all the social activities performed by the users.

The ecosystem of ActivityStreams is also composed by the following repos:
- [modules-activitysnippet](https://github.com/natgeo/modules-activitysnippet): In order to facilitate the creation of new activities in a website.
- [modules-activitystream](https://github.com/natgeo/modules-activitystream): In order to integrate the visualization of the activities in a website.

##### Table of Contents

1. Introduction
2. What's an Activity Stream
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
- Node
- Neo4j
- Redis


## Activity Stream Spec
Our activity stream model conforms to the Activity Streams specification found here: http://activitystrea.ms/, where:


**ACTOR -> VERB -> OBJECT -> TARGET**

Might be implemented, for sake of example, as:

- your_user -> FAVORITED -> youtube_video



## Graph Structure

Nodes have labels, and the naming convention for these labels represents the types of nodes we have

	{app_name}_{model}

For example, a LinkedIn user would be

	linkedin_user
	
A YouTube video would be
	
	youtube_video
	
A National Geographic Magazine article would be
	
	ngm_article



### Node properties (Graph Nodes)

Nodes currently have the folowing properties

	aid : {stirng}
	api : {url}
	type: {app_name}_{model}
	created: {unix timestamp
	updated: {unix timestamp}
	
For example a LinkedIn user node will have the following:

	aid : 1
	api: http://linkedin.com/api/user/1/
	created: 1388767442091
	updated: 1389039127283
	
A YouTube video

	aid: W73m0imS2bc
	api: http://youtube.com/api/v?W73m0imS2bc
	created: 1388767442091
	updated: 1389039127283



### Edges

Edges represent verbs in the case of activities. They are named in all caps and also have created and updated timestamps; There isn't a limit on what the name can be. At National Geographic, we use FAVORITED, FOLLOWED, UPLOADED and more...

### Activity Service REST API

The API is abstract, and allows for any node in the graph to take the assumed role of actor, object, target, context etc. - This means that the direction in which an activity occured matters. For instance, supposing a youtube video could favorite something, the activity would then be (actor:youtube_video)-FAVORITED->(object:special_something). Asking the API about activities that the youtube video has done means placing the youtube video in the context of an actor. Whereas asking about activities that have been done on the youtube video means placing the youtube video in the context of an object.

#### Actor Context

Get all nodes of type

	'get /api/v1/actor/:actor' --> /api/v1/actor/youtube_user
  
Get node of specfic id

	'get /api/v1/actor/:actor/:actor_id' --> /api/v1/actor/youtube_user/1
  
Get all activites of specifc actor

	'get /api/v1/actor/:actor/:actor_id/activities' -> /api/v1/actor/youtube_user/1/activities
 
Get all specific verbed activites of user 

	'get /api/v1/actor/:actor/:actor_id/:verb' -> /api/v1/actor/youtube_user/1/FAVORITED
	
Getall activies verb by type of object by user

	'get /api/v1/actor/:actor/:actor_id/:verb/:object' -> api/v1/actor/youtube_user/1/FAVORITED/flickr_photo
	
Get specific activity with user verbed object

	'get /api/v1/actor/:actor/:actor_id/:verb/:object/:object_id' -> api/v1/actor/youtube_user/FAVORITED/flickr_photo/1212

#### Activity Context

Post an Activity

 	'post /api/v1/activity':
 		{
 			actor: {
 				aid: <string>,
 				type: <appname_model>,
 				api: <api url>
 			},
 			verb: <string>,
 			object: {
				aid: <string>,
				type: <appname_model>,
				api: <api url>
 			}
 		}
 
Delete an Activity
	
	'delete /api/v1/activity/:actor/:actor_id/:verb/:object/:object_id' -> 
	api/v1/youtube_user/1/FAVORITED/flickr_photo/14442



### Gate Keeping

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

We also have cypher sanitization, an authentication policy and more...


Installation
============

Make sure you have Neo4j, Redis, Ruby, Bundler, Node, and npm installed.

	npm install activitystreams
	node ./node_modules/activitystreams/app.js


That's about it. There are many configuration options you can override and build out, but that's the basic requirement for installation.



Dependencies
============

If you need help installing the dependencies for Neo4j and Redis, go to [JDK, Neo4j, Redis] (https://github.com/natgeo/activitystreams/wiki/JDK,-Neo4j-and-Redis-install)

These files are part of the package.json file, so NPM is able to install them all with one command. `npm install`

* [Neo4j-JS](https://github.com/natgeo/neo4j-js)
* [Sails.JS](http://sailsjs.org/#!documentation)
* [Sails-Neo4j](https://github.com/natgeo/sails-neo4j)

# Maven
* `brew install maven`

# Bundle
*This takes care of ruby/sass dependencies*
* `gem install bundler && bundle install`
* `gem install sass compass`

# Ruby
```
sudo apt-get install ruby ruby-dev gcc build-essential
```

Environment Setup
=================
```
mkdir ~/code/activitystreams
cd ~/code/activitystreams
git clone git@github.com:natgeo/activitystreams.git .
cd activitystreams
npm install
```

Also clone git@github.com:natgeo/modules-activitystream.git, git@github.com:natgeo/modules-activitysnippet.git and https://github.com/natgeo/sails-neo4j.git
run npm install in all repos:

```
cd ~/code/
git clone git@github.com:natgeo/modules-activitystream.git
cd modules-activitystream
npm install
```

```
cd ~/code/
git clone git@github.com:natgeo/modules-activitysnippet.git
cd modules-activitysnippet
npm install
```

```
cd ~/code/
git clone git@github.com:natgeo/sails-neo4j.git
cd sails-neo4j 
npm install
```

For each one of the mentioned Repos you must run:
```
npm install
bower install
gem install
```

To run your server: `neo4j-server start` then `sails lift`
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


/etc/hosts file
=======

add as.dev.yourhostnamehere.com to your /etc/hosts file


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
