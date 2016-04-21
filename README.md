A web-based, local event check-in app to make it easier to mingle at an event. Based on the real-time chat app written using Pakyow.

Wireframe found here:
http://framebox.org/xUFd

PURPOSE:
* Enter email and objective for attending the event. The app finds profile information based on that email address, grabs a picture and a name from an API response (from Gravatar) and posts the Profile info (pic and name) and the Objective.  This allows everyone at the event to see a name to a face, along with an objective, so everyone can help that person get the best experience for the event.

FEATURES:
* Uses Gravatar to fetch profile info
* If no profile found, option to upload info to Gravatar
* Export list to spreadsheet
* If pic not found, use funny pic as placeholder
* If not mobile/notebook, auto scroll people on page.
* [Future] Select category as Giver, Needer, Observer
* [Future] Select subcategory in something like hardware, language, industry, etc (needs further thought)
* [Future] Auto suggest first person to talk to; facilitate connection


TODO's:
* Front End:
	* HTML styling: better gridding of displayed profiles; mobile friendly (responsive) layout. 
* Back-end:
	* Better error handling on JSON response (when email doesn't find contact info; either 202: Accepted or 404: Not Found).


From Pakyow:
PakyowUI brings live updating views to Pakyow apps without moving logic to the
client. Instead, PakyowUI apps are written in a traditional backend-driven
style. *No JavaScript was required to build this example app (beyond the
pakyow.js library bundled with PakyowUI).*

Turn off JavaScript support in your browser and the app still retains its core
functionality (without the live updates of course). You get this progressive
enhancement for free, without thinking about it during development.


# Getting Started

Make sure you have a reasonably recent version of Ruby installed (> 2.0), along
with RubyGems and Bundler. Then, install the dependencies:

		bundle install

Finally, start the app server:

		bundle exec pakyow server

You'll find the app running at [http://localhost:3000](http://localhost:3000)!
