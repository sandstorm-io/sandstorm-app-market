# Sandstorm App Store

App Store application for the [Sandstorm.io](https://sandstorm.io/) platform for personal servers.

## Getting started guide for new developers

**AT PRESENT, SANDSTORM APP STORE ONLY RUNS ON LINUX**

### Setting up storage

Sandstorm App Store is configured to store all assets (.spk files and images) in Google Cloud Storage, so you need to set this up even if you're running the application locally. **Note that you will also use this Google Cloud project for login service configuration and VM provisioning (if you deploy the app store)**.

1. Visit https://console.developers.google.com/project and, after setting up a new account if required, click "Create Project".
2. Enter a project name and click "Create", then wait for Google to provision your new project.
3. Select APIs & auth > Consent screen and give your app a Product name, then hit "Save".
4. Select Storage > Cloud Storage > Storage browser and click "Create a bucket".
5. Give your bucket a unique name, choose an appropriate location, and hit "Create".
6. Install `gsutil` by following [these instructions](https://cloud.google.com/storage/docs/gsutil_install).
7. Pull down the required CORS settings for your new bucket by executing `wget https://raw.githubusercontent.com/CulturalMe/meteor-slingshot/master/docs/gs-cors.json`.
8. Apply these settings to your new bucket by executing `gsutil cors set gs-cors.json gs://MYBUCKETNAME`.
9. Back at the Google Cloud web console, select APIs & auth > Credentials and click "Create new Client ID".
10. Select "Service Account" and hit "Create Client ID"; you actually need both a JSON and a P12 key, so it doesn't matter which you select first.
11. Once the id has been created, your chosen key will automatically download.  Download the other key type by clicking on "Generate new #### key" under the newly created service account (so, "Generate new P12 key" assuming you left "JSON key" selected in the previous step).
12. Convert your P12 Key to a PEM key with the shell command `openssl pkcs12 -in YOURKEYNAME.p12 -nodes -nocerts > YOURKEYNAME.pem`. When you are prompted for a password, enter `notasecret`.
13. Copy *both* the JSON and newly-created PEM keys to the `/app/private` directory. **Note that these should *not* be uploaded to Github under any circumstances**. The default .gitignore should prevent this, but caution is advised.
14. Now copy the template `settings.json` file in the project root to `/app` and begin to populate it.  **You should also avoid uploading this file to Github once it's populated**.
15. The required information is as follows:

  * *GCSProjectId* - the name of your project, shown in the dropdown at the top of the Google Cloud console.  This is the name you originally chose.
  * *GCSKeyFilename* - the filename of the `.json` key file you copied to your `/app/private` directory; **note that the full path is not required**.
  * *GCSPemFilename* - the filename of the `.pem` key file you copied to your `/app/private` directory.
  * *GCSAccessId* - this is the entry given as "Email address" under the Service Account you created in the Credentials page of the Google Cloud console.  It should end *@developer.gserviceaccount.com*.
  * *spkBucket, imageBucket* - the name of the bucket you created in step 5, which will be shown within Storage > Cloud storage > Storage browser in the Google Cloud console.  Note that these would normally use the same bucket as a folder structure will already be specified by the app, but you can store your files in separate buckets if required.


## Running the app

Sandstorm App Store runs on [Meteor](meteor.com).  To install Meteor locally:

```
curl https://install.meteor.com/ | sh
```

Meteor comes with an integrated CLI which will build and serve the app locally, and also deploy the application to Meteor's own servers (useful for testing).

To clone and run the app locally (once you've configured storage as per above):

```
git clone git@github.com:tableflip/sandstorm-appstore.git
cd sandstorm-appstore/app
meteor run --settings settings.json
```

The app will be served at `localhost:3000`.

## Configuring service accounts for OAuth

Sandstorm App Store allows users to authenticate with Github and Google (for login) and Facebook and Twitter (to attach social links to apps).  In order to facilitate this, each of the services must be configured.

1. Navigate to `/service-configure`.
2. Click "Sign In" and the config/login form will expand.
3. Go through each of the four account types as required, following the instructions for setting up a new project and copying the required details back to the configuration page.
4. Note that the Google project has already been created above, you just need to create a new Client ID for a web application rather than a new project.
5. Popup-style login (default) should be fine for most use cases.
6. Navigate back to `/`.

You should now be able to log in with Github and/or Google, if these have had their configurations updated.

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
9. Copy the app's `settings.json` template from the project root into the `/mup` directory, and enter all the project details as above.  **Note that using the same bucket and credentials for two versions of the app (e.g. local and production) will cause conflicts and is not recommended**. Instead, set up a new bucket by following the same instructions, and enter its name in your `settings.json`.
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

### Adding admin users

Currently, upgrading users to admin status needs to be done via the mongo shell.

1. Open an SSH shell into your VM as you did in step 12 above.
2. Open a mongo shell with the command `mongo APPNAME`, where `APPNAME` is the name you entered in your `mup.json`.
3. To make a given user admin, execute the following command: `db.users.update({username: 'USERNAME'}, {$set: {roles: ['admin']}})`, where `USERNAME` is the name that appears on the `/login` page in your deployed app.  You should see a response of the form `WriteResult({ "nMatched" : 1, "nUpserted" : 0, "nModified" : 1 })`.
4. Note that you cannot pre-provision admin users; they have to be registered on the site before you can give them admin privileges. 
