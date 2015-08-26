# HI HACKER NEWS!

## THIS CODE IS NOT READY YET!

Feel free to poke around but note that we weren't actually planning to show this off until next week. :)

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

## How to deploy the app to Google Cloud

Sandstorm App Store can be deployed to any VM or dedicated Meteor hosting service, but comes configured for deployment to Google Cloud Compute VMs via [Meteor Up](https://github.com/arunoda/meteor-up).

To deploy to Google Cloud Compute Engine:

1. From the Google Cloud console, select Compute > Compute Engine > VM Instances, and click "Create Instance".
2. Name and configure the instance-type.  It is suggested that you use the same location as chosen for data storage.
3. Change the *Boot disk* setting to "Ubuntu 14.04 LTS".
4. Check "Allow HTTP traffic" and "Allow HTTPS traffic".
5. Click "Create".
6. Whilst it's provisioning your VM, create a new SSH key (if required; you may already have a suitable one) by following the instructions [here](https://help.ubuntu.com/community/SSH/OpenSSH/Keys) under "Generating RSA Keys".
7. Once your instance has been provisioned, click on it and select "New Static IP" from the dropdown beneath "External IP Address". Give your new IP a name and hit create. Then hit "Save" below "External IP Address".  Note down the IP (up to 12 digits).
8. Under "SSH Keys" click "Edit", and copy the *entire* body of the .pub file that your created in step 6 into the space provided.  Your username should appear on the left. Hit "Save".
9. Copy the app's `settings.json` template from the project root into the `/mup` directory, and enter all the project details as above.
10. Now edit the `/mup/mup.json` file with your project's details. The fields that will need to be changed are as follows:

  * *servers.host* - this is the IP address you noted down above.
  * *servers.username* - the username that appeared on the Google Cloud console associated with your SSH key.
  * *servers.pem* - this is the *local* location of the private SSH key you just generated in step 6. **Note that this needs to be the full path to your *private* SSH key as opposed to the public key you posted into the Google Cloud console in step 8**.
  * *servers.env.DDP_DEFAULT_CONNECTION_URL* (ADVANCED) - if you want to specify a different subdomain for your DDP data, add it here, otherwise remove the field entirely.  The main reason you would want to do so is if you want your main app to sit behind a CDN which does not support websockets and have a separate subdomain which bypasses the CDN available for DDP.
  * *appName* - add your app's name *without spaces* here.
  * *env.ROOT_URL* - the root url of your app.  This will be the IP address you noted down until you register a domain name for your app store.

11. Once the `mup.json` file has been correctly populated, you're ready to setup your server.  From the `/mup` directory, run the command `mup setup`.  The install script will connect to your privisioned VM and install the necessary scaffolding to run the App Store; it will take several minutes, with each step being marked "SUCCESS".
12. As a final step before deploying, you need to change some permissions in the server filesystem.  In the Google Cloud console page for your VM, click on "SSH" at the top of the page.  A new window should open with a shell prompt once connection has taken place.
13. Enter the following command in the new window: `sudo chown -R meteoruser /opt/APPNAME`, where `APPNAME` is as you entered into the `mup.json` in step 10.  If that completes without an error, you can close the window.
14. You can now deploy the app from your local shell, with the command `mup deploy` from the `/mup` directory.  If the script completes with the message "Invoking deployment process: SUCCESS" you should be able to access your app at the IP address you noted down earlier.
