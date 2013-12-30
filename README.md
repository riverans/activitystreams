activitystreams
===============

NatGeo Activity Streams


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

# [Node 0.10.22](http://nodejs.org)
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
  * `sudo apt-get install nodejs`

# NPM 1.3.14
* OSX with Homebrew:
  * NPM was recently removed from Homebrew, so manually install `curl https://npmjs.org/install.sh | sh`

# [Neo4j 2.0!](http://www.neo4j.org)
* Download the [Neo4j 2.0](http://www.neo4j.org/download)
* OSX:
  * `brew update`
  * `brew install neo4j`
  * `neo4j install`
  * `neo4j start`
* Debian/Linux
  * `tar xzvf neo4j-communtity.2.0.0-unix.tar.gz`
  * `mv neo4j-communtity.2.0.0-unix /etc/neo4j && cd /etc/neo4j`
  * `bin/neo4j-installer`
  * `sudo service neo4j start`
  * Note had to uncomment "org.neo4j.server.webserver.address=0.0.0.0" in /etc/neo4j/conf/neo4j-server.properties for neo4j admin area


Dependencies
============
These files are part of the package.json file, so NPM is able to install them all with one command. `npm install`

* [https://github.com/bretcope/neo4j-js]()
* [Socket.io](http://socket.io)
* [Sails.JS](http://sailsjs.org/#!documentation)
* [Sails-Neo4j](https://github.com/natgeo/sails-neo4j)

# Maven
* `npm install -g maven`


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
To run your server: `neo4j start` then sails lift`
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

