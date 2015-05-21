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

Sandstorm app needs an environment like this.

![sandstorm](https://cloud.githubusercontent.com/assets/4499581/7590433/71ef49f6-f8c0-11e4-9665-0b3d82279eae.jpg)

#AWS
Create a AWS S3 bucket and grab your keys. Careful with this keep them out of the repo. Create an `/app/settings.json` file with this content:

```
{
  "AWSAccessKeyId":"your access key id",
  "AWSSecretAccessKey":"your secret access key",
  "AWSRegion":"your bucket has this on it i.e 'us-west-2'",
  "spkBucket":"some bucket name for the .spk files",
  "imageBucket":"some bucket name for images"
}
```
and now run the app with this command

`meteor run --settings settings.json`

You need to set permissions on your AWS buckets which you do by adding:
```
<?xml version="1.0" encoding="UTF-8"?>
<CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
    <CORSRule>
        <AllowedOrigin>*</AllowedOrigin>
        <AllowedMethod>PUT</AllowedMethod>
        <AllowedMethod>POST</AllowedMethod>
        <AllowedMethod>GET</AllowedMethod>
        <AllowedMethod>HEAD</AllowedMethod>
        <MaxAgeSeconds>3000</MaxAgeSeconds>
        <AllowedHeader>*</AllowedHeader>
    </CORSRule>
</CORSConfiguration>
```
into
#####[your bucket] / properties / permissions / Edit CORS Configuration
#OAUTH
Create a project in the [google developers console](https://console.developers.google.com/project). To obtain a __Client ID__ with secret goto

#####[newly created project] / APIs & auth / credentials / Create new Client ID

you need a __Web Application__ with the redirect URIs set like this:

![screen shot 2015-05-12 at 16 34 34](https://cloud.githubusercontent.com/assets/4499581/7591331/31a451ca-f8c5-11e4-9cc7-6ac5de43fcc6.jpg)

Visit `http://localhost:3000/serviceConfigure` and click *Sign in with Google*.

![screen shot 2015-05-12 at 16 16 20](https://cloud.githubusercontent.com/assets/4499581/7590831/4bbb1d9e-f8c2-11e4-8cfa-d54c39885715.jpg)

yer, nice styling.

Then add your __Client ID__ and __secret__ into the fields on the form and save. Breath.


## How to test the app

TODO
