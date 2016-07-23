A digital sign-in sheet to encourage more collisions at an event. Based on the real-time chat app written using [Pakyow](https://pakyow.org/)!.

Wireframe found here:
http://framebox.org/XZSi

PURPOSE:
* Provide Name, Email (or authenticate with existing social media account) and Objective for attending the event. The app finds profile information based on that email address, grabs a picture and a name from an API response (ex. Facebook, LinkedIn, etc.) and posts the Profile info (pic and name) and the Objective to a wall for attendees to see.  This allows everyone at the event to see a name to a face, along with why that person is there in an effort to encourage more dialog and so everyone can help that person get the best experience for the event.

FEATURES:
* Uses existing social account(s) to fetch profile info (picture, name)
* If no profile found, option to manually enter info (name, email); need option for visual/picture
	* If pic not found, use funny pic as placeholder
* Downloadable list of attendees to spreadsheet
* Big-board display will auto scroll attendees
* Objectives allow for identification of complementary attendees
* [Future] Auto suggest first person to talk to; facilitate connection


## Reason for using Pakyow:

PakyowUI brings live updating views to Pakyow apps without moving logic to the
client. Instead, PakyowUI apps are written in a traditional backend-driven
style. 
* No JavaScript was required to build this app (beyond the
pakyow.js library bundled with PakyowUI).

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
