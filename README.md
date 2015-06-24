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

  * *GCSProjectId*: the name of your project, shown in the dropdown at the top of the Google Cloud console.  This is the name you originally chose.
  * *GCSKeyFilename*: the filename of the `.json` key file you copied to your `/app/private` directory; **note that the full path is not required**.
  * *GCSPemFilename*: the filename of the `.pem` key file you copied to your `/app/private` directory.
  * *GCSAccessId*: this is the entry given as "Email address" under the Service Account you created in the Credentials page of the Google Cloud console.  It should end *@developer.gserviceaccount.com*.
  * *spkBucket, imageBucket*: the name of the bucket you created in step 5, which will be shown within Storage > Cloud storage > Storage browser in the Google Cloud console.  Note that these would normally use the same bucket as a folder structure will already be specified by the app, but you can store your files in separate buckets if required.


## Running the app

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

## How to deploy the app to Google Cloud

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
