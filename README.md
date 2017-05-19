Manageyum
==============


# Quick start
The only development dependency of this project is [Node.js](https://nodejs.org). So just make sure you have it installed.
Then type few commands known to every Node developer...
```
git clone https://github.com/sivaramsi/manageyum.git
cd manageyum
npm install
npm start
```
... and boom! You have a running desktop application on your screen.


## Folders for application code

The application is split between two main folders...

`src` - this folder is intended for files which need to be transpiled or compiled (files which can't be used directly by electron).

`app` - contains all static assets (put here images, css, html etc.) which don't need any pre-processing.

The build process compiles all stuff from the `src` folder and puts it into the `app` folder, so after the build has finished, your `app` folder contains the full, runnable application.

Treat `src` and `app` folders like two halves of one bigger thing.

The drawback of this design is that `app` folder contains some files which should be git-ignored and some which shouldn't (see `.gitignore` file). But thanks to this two-folders split development builds are much (much!) faster.

# Development

### Installation

```
npm install
```
It will also download Electron runtime and install dependencies for the second `package.json` file inside the `app` folder.

### Starting the app

```
npm start
```

### Adding npm modules to your app

Remember to add your dependencies to `app/package.json` file:
```
cd app
npm install name_of_npm_module --save
```

# License

Released under the MIT license.
