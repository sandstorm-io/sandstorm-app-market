# Sandstorm App Store

App Store application for the [Sandstorm.io](https://sandstorm.io/) platform for personal servers.

## Getting started guide for new developers

Sandstorm App Store runs on [Meteor](meteor.com).  To install Meteor locally:

```
curl https://install.meteor.com/ | sh
```

Meteor comes with an integrated CLI which will build and serve the app locally, and also deploy the application to Meteor's own servers (useful for testing).

To clone and run the app locally:

```
git clone git@github.com:tableflip/sandstorm-appstore.git
cd sandstorm-appstore/app
meteor run
```

The app will be served at `localhost:3000`.

## Project dependencies to install

  - Meteor
  - pkg-config
  - giflib

if `meteor run` throws errors you may need to install `pkg-config` if you don't already have it on your system. Install with these [instructions](https://github.com/Automattic/node-canvas/wiki/installation---osx). You will have to add two paths to a shell ENV so add this to your .bashrc or .zshrc file

```
export PKG_CONFIG_PATH="/usr/local/bin/pkg-config:/opt/X11/lib/pkgconfig"
``` 
Finally make sure you have `giflib` installed with a simple

```
brew install giflib
```

## How to deploy the app

TODO

## How to configure the app

TODO

## How to test the app

TODO
