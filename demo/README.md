Activity Streams Demo
=====================

A simple demo page for the NatGeo Activity Streams project


Usage
=====
This file is meant to be served by a web server, not Sails.js.  Use a program like MAMP/XAMP, move
the file to the htdocs directory and start that server.  The server should be able to serve pages
at http://localhost.nationalgeographic.com.  Use whatever available port you want.

A local instance of MMDB is also required for signing in and favoriting an image.  Clone the MMDB
repo, run through the installer, and run it on port 8000.  This sails server should be running as well.

Access the demo at http://localhost.nationalgeographic.com(:port)/as-demo.html.  If you do are not
on the .nationalgeographic.com domain, then the header controls will not display.

Sample Demo Script
==================
1. Access the page: http://localhost.nationalgeographic.com(:port)/as-demo.html
2. Click on a heart underneath a page.  You should see an alert that tells you to log in.
3. Log in with a known account.
4. Click on a heart underneath a picture.  It should turn from black to pink.
5. Refresh the page.  The image you favorited should still have a pink heart.
6. Either use another browser or clear your browser cache. (**SEE KNOWN ISSUES**)
7. Refresh the page.  The hearts should be black and you should be logged out.
8. Log in and refresh the page.  The image you favorited should be pink.

KNOWN ISSUES
==================
- Logging in does not refresh the page.  Not sure if this is a bug or if we need to listen to a signed in event. (added to TODO list)
- Logout throws errors.
- Sails.js acts VERY inconsistently when attempting to connect via socket.io from an outside client. It either falls over, connects but tells you no socket is available, or connects but doesn't allow any access methods to your controllers (get, post, etc.)

TODO
====
- Fire the login modal to display in place of the alert message
- Refresh the page on login/logout
- Use socket.io to display the activity stream in the large box