A web-based, local check-in app based on the chat app written using PakyowUI.
PakyowUI brings live updating views to Pakyow apps without moving logic to the
client. Instead, PakyowUI apps are written in a traditional backend-driven
style. *No JavaScript was required to build this example app (beyond the
pakyow.js library bundled with PakyowUI).*

Turn off JavaScript support in your browser and the app still retains its core
functionality (without the live updates of course). You get this progressive
enhancement for free, without thinking about it during development.

Full documentation will be available soon, along with an official release!

# Getting Started

Make sure you have a reasonably recent version of Ruby installed (> 2.0), along
with RubyGems and Bundler. Then, install the dependencies:

		bundle install

Next, you'll need to define your FullContact developer api key in a file named
`.env` in the root directory of the project. You can signup for a free account
at the 
[FullContact Developer API Signup](https://www.fullcontact.com/developer/pricing/) 
page. Once you have your key, you can copy the `.env.template` file to `.env` and
fill in your api key.

Finally, start the app server:

		bundle exec pakyow server

You'll find the app running at [http://localhost:3000](http://localhost:3000)!

# Next Steps

Read more about the two new libraries:

- [PakyowUI](https://github.com/pakyow/pakyow/tree/master/pakyow-ui)
- [Pakyow.js](https://github.com/pakyow/pakyow-js)

Want to keep up with the latest development? Follow along:

- [Gitter](https://gitter.im/pakyow/chat)
- [Mailing List](http://eepurl.com/_NLlD)
- [Twitter](http://twitter.com/pakyow)
