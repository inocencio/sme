# Social Media Events

## Introduction

SME - Social Media Events is a sample application that runs under a Node.JS instance with Express.JS as web framework and MongoDB as database repository. There is no separation between logical base code (back-end) and presentation tier (front-end). All visual javascript files are coded using simple tools and frameworks that access DOM directly.

You can download the full code and try to run it on your own. This code, however, is kinda old. I've started to implement it on late 2013 and finished it in middle 2014. Some files are still useful to understand how a web application works and some solution used here like Socket.IO file transfer was coded only by me.

## Features

This web application is a social media site to expose and register user's events. Anyone can sign in unless you have a Google, Facebook or Twitter account.

- Create your account using your Facebook, Google or Twitter account;
- Fetch for registered events from any city you are logged in (geolocation);
- Register new events like a party or reunion, or any other social event;
- Invite friends or just let it open for everyone else to join your event;
- Make comments about other user's events;
- Send private message to anyone;
- Chat with others and meet new friends;
- Achievement System - Gamification.

## Technologies

SME uses Node.JS as back-end solution. Only JavaScript is used in both sides, back and front-end. MongoDB is required to store the events and any users informations.

In order to make it happen, you will need:

* [Node.JS 9.0+](http://nodejs.org)
* [Express.JS 3.0](http://expressjs.com)
* [MongoDB any version](https://www.mongodb.com/download-center)

Please, read `package.json` for more information.

## Screenshots

Some screenshots.

![Looking for events](screens/001.png?raw=true "001")
![New Event](screens/002.png?raw=true "002")
![Achievement](screens/003.png?raw=true "003")

## F.A.Q

### Should I use a modern Node.js version?

I guess you won't face any problem using modern Node.JS builds.

### Should I use a modern Express.JS version?

No, you can't. After Express.JS 4, the compatibility with any older version got broken. Unfortunately you must use the old Express.JS 3 to make this application run.

### I'm looking for Jade Node.JS package, but I can't find it at all. Where's it?

Jade is an old Node Template Engine that can be used with Express.JS. You can find more information [here](http://jade-lang.com). They replace it to [Pug](https://pugjs.org). I don't recommend it anymore.

### This is cool, I liked it. So, can I use it in my own project?

Yeah, you can. Feel free to download and make any changes in the code. If you do that, please, let me know.

### Are you up for new projects in the same line or completely new stuff?

Actually I'm focusing on new stuff. Maybe I can stick around with Node.JS for a new web project or not. I'm not quite sure about that. However, I'm still open for any commercial proposal.

### I'm seeing something like "Espiando" logo and labels. What does it mean?

SME was actually aimed for a real application. I just modified the source code to make it more reliable and rather for any social media application, specially for events.

### Where can I find more about you?

You can contact me over my social media links.

[Linkedin](https://www.linkedin.com/in/inocencio/)
[Stack Overflow](https://stackoverflow.com/users/621883/ito?tab=profile)
[GitHub](https://github.com/inocencio)
[Twitter](https://twitter.com/itosrtk) - Personal Account