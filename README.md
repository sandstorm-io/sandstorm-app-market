# Sandstorm App Market

This is the code that runs at: https://apps.sandstorm.io

## Getting started guide for new developers

## Settings

You will need to supply a `settings.json` file as follows:

```json
{
  "public": {
    "API_URL": "[Sandstorm Apps API endpoint]",
    "INDEX_OVERRIDE_URL": "[OPTIONAL - override the app index endpoint]",
    "APP_OVERRIDE_URL": "[OPTIONAL - override the app detail endpoint]",
    "IMAGE_OVERRIDE_URL": "[OPTIONAL - override the app images endpoint]",
    "PACKAGE_OVERRIDE_URL": "[OPTIONAL - override the app spks endpoint]",
    "FLAG_URL": "[URL to which to POST app flag details]"
  }
}
```

One valid settings.json lives in settings-example.json. You can run this command
to use it:

```bash
cp settings-example.json app/settings.json
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

### Release process: Easy way

```
gce-ss ssh market
sudo su - marketupdater
bash -x update-myself.sh
```

This script:

- Downloads the latest code

- Uses a known-working sandstorm-0.tar.xz to slipstream the market into

- Builds a market bundle

- Tests that it works by launching it on localhost:6082

- Switches the deployment to use it.

### Release process: Details

Our release process for the app market involves taking a Sandstorm bundle, ripping out the Sandstorm front-end, and inserting the App Market code in its place. It turns out the Sandstorm bundle-runner is an excellent way to run arbitrary Meteor apps for the same reasons that it is an excellent way to run Sandstorm itself:

- It takes care of Mongo, including setting up authentication intelligently, configuring oplog tailing (hard!), and recovering from crashes.
- It auto-restarts Node and Mongo when they crash.
- It makes updates trivial ("sandstorm update <tarball>").
- We have a lot of experience wrangling the Sandstorm bundle runner, compared to alternatives like Meteor-Up.

To build a release, you must:

1. Check out the Sandstorm code and do `make sandstorm-0-fast.tar.xz`.
2. Copy `sandstorm-0-fast.tar.xz` to the App Market source directory.
3. Run `./make-bundle.sh sandstorm-0-fast.tar.xz market.tar.xz` to build `market.tar.xz`, the App Market release bundle.

Once you have `market.tar.xz`, you can install it over an existing Sandstorm install, or even use it as input to Sandstorm's `install.sh`. For example:

* `sandstorm update market.tar.xz`: "Update" an existing Sandstorm (or App Market) install to the new App Market bundle.
* `sandstorm/install.sh market.tar.xz`: Use the Sandstorm installer to install the App Market. Note that most of the installer prompts don't make sense. You should do a custom install with no Sandcats and no HTTPS.

The file `release.sh` is a script which automates updating Sandstorm's official App Market server. To use this script, your `PATH` must contain a command `gce-ss` which expands to `gcloud compute "$@"` with Google Cloud zone and project ID set accordingly.
