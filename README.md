# HI HACKER NEWS!

## THIS CODE IS NOT READY YET!

Feel free to poke around but note that we weren't actually planning to show this off until next week. :)

For now, try our 60-second demo: [https://demo.sandstorm.io](https://demo.sandstorm.io)

Read about security: [https://docs.sandstorm.io/en/latest/developing/security-practices/](https://docs.sandstorm.io/en/latest/developing/security-practices/)

And install Sandstorm on your own machine: [https://sandstorm.io/install/](https://sandstorm.io/install/)

Or preorder managed hosting: [https://sandstorm.io/preorder.html](https://sandstorm.io/preorder.html)

(This note written August 26, 2015.)

# Sandstorm App Market

App Market front-end for the [Sandstorm.io](https://sandstorm.io/) platform for personal servers.

## Getting started guide for new developers

## Settings

You will need to supply a `settings.json` file as follows:

```json
{
  "public": {
    "API": "[Sandstorm Apps API endpoint]",
    "INDEX_OVERRIDE_URL": "[OPTIONAL - override the app index endpoint]",
    "APP_OVERRIDE_URL": "[OPTIONAL - override the app detail endpoint]",
    "IMAGE_OVERRIDE_URL": "[OPTIONAL - override the app images endpoint]",
    "PACKAGE_OVERRIDE_URL": "[OPTIONAL - override the app spks endpoint]",
    "FLAG_URl": "[URL to which to POST app flag details]"
  }
}
```

## Running the app

Sandstorm App Store runs on [Meteor](meteor.com).  To install Meteor locally:

```
curl https://install.meteor.com/ | sh
```

Meteor comes with an integrated CLI which will build and serve the app locally, and also deploy the application to Meteor's own servers (useful for testing).

To clone and run the app locally (once you've configured storage as per above):

```
git clone git@github.com:tableflip/sandstorm-app-market-public.git
cd sandstorm-app-market-public/app
meteor run --settings settings.json
```

The app will be served at `localhost:3000`.

## Configuring service accounts for OAuth

In order to login with social auth providers, you will need to insert the following docs into the mongo  *meteor_accounts_loginServiceConfiguration* collection:

```json
{ "service" : "github", "clientId" : "[YOUR_ID]", "secret" : "[YOUR_SECRET]" }
{ "service" : "google", "clientId" : "[YOUR_ID]", "secret" : "[YOUR_SECRET]", "loginStyle" : "popup" }
```

You can obtain the required credentials as follows:

### Google

* Create a project [here](https://console.developers.google.com), singing up first if required.
* Select *APIs & Auth => Consent screen* from the menu on the left and enter a name for the app (e.g. "Sandstorm App Market").  Save it.
* Then, select *APIs & Auth => Credentials* and click *Create new Client ID* and select *Web Application*.
* Change the homepage to match your site's homepage (or *http://localhost:3000* if running in development). Change the authorized redirect URL to *[HOMEPAGE]/_oauth/google*.
* The Client ID and Secret should appear on the right hand side of the screen presently.

### Github

* Create a project [here](https://github.com/settings/applications/new).
* Change the homepage to match your site's homepage (or *http://localhost:3000* if running in development). Change the authorized redirect URL to *[HOMEPAGE]/_oauth/github*.
* The Client ID and Secret will appear near the top of the page after you submit.

