# WHY "Wall-Me"?
Events should have more than just a simple sign-in sheet to track attendees, they should give something in return. "Wall-Me" encourages better collisions of ideas for attendees while providing hosts better insight into their audience.

# How Will "Wall-Me" Achieve This?
## Gamification
- Give awards to repeat attendees. 
- Auto suggestions of first people to meet.  

## Data Analytics
- Gain insight into how repeat attendees change their objectives over time.
- Track attendance over time.


# What's in "Wall-Me"?
First, "Wall-Me" is developed using [Pakyow](https://pakyow.org/)!

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

# EXTRA INFO
## Reason for using Pakyow:

PakyowUI brings live updating views to Pakyow apps without moving logic to the
client. Instead, PakyowUI apps are written in a traditional backend-driven
style. 
* No JavaScript was required to build this app (beyond the
pakyow.js library bundled with PakyowUI).

Turn off JavaScript support in your browser and the app still retains its core
functionality (without the live updates of course). You get this progressive
enhancement for free, without thinking about it during development.


# GETTING STARTED

Make sure you have a reasonably recent version of Ruby installed (> 2.0), along
with RubyGems and Bundler. Then, install the dependencies:

		bundle install

Create a .env file in your root directory.  
If you'd like to use something other than Redis as your database,
edit your .env file with the following example, then tailor it to connect to your database:  
DATABASE_URL=postgres://{user}:{password}@localhost/{database}  

Finally, start the app server:

		bundle exec pakyow server

You'll find the app running at [http://localhost:3000](http://localhost:3000)!




# Using Cloud9

https://c9.io/new

Enter a memorable name and description

Clone from Git or Mercurial. Choose the Ruby template. Click create workspace.

In the console:  
Install all sorts of Ruby dependencies  
`bundle install`

Start the database server  
`sudo service postgresql start`  

If using a non-redis database, connect to the database and create a DB.  
`psql`  
CREATE DATABASE "db_name";  
`\password`  
`<ENTER PASSWORD>`  
`<REPEAT PASSWORD>`  
`\q`  
  
Edit .env  
`DATABASE_URL=postgres://ubuntu:<PASSWORD>@localhost/db_name`  
  
Reset the database  
`bundle exec rake db:reset`  
  
Run the server  
`bundle exec pakyow server -p 8080`  
  
Server will be visible at eg:  
`https://<username>.c9users.io/`  
