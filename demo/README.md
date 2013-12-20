Activity Streams Demo
=====================

A simple demo page for the NatGeo Activity Streams project


Usage
=====
There are 2 ways to run the demo -- serve the html file in this dir locally (use MAMP, XAMPP, etc.) or you can view the Sails view (home/as-demo.ejs).

A local instance of MMDB is also required for signing in and favoriting an image.  Clone the MMDB
repo, run through the installer, and run it on port 8000.  This sails server should be running as well.

Access the demo at http://as.nationalgeographic.com:6935/as-demo.  If you do are not
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
