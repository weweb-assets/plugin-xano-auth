# Xano Auth

## Pre-requisites in Xano

In order to setup Xano authentication in your WeWeb project, there are three pre-requisites:
1. you already have an account with Xano, it’s free for up to 10,000 records
2. you have a user table in your Xano database with at least two fields: login and password
3. you have three basic authentication API endpoints in Xano (me, login, and signup)


## Steps in WeWeb

Assuming you have all of the above, you can start working with the Xano Auth plugin in WeWeb. 

The mandatory steps are to:
1. add your Xano Metadata API key,
2. select the Xano instance and workspace you want to work with,
3. paste your Xano authentication endpoints,
4. define where unauthenticated users are redirected, 

In addition, you can setup authentication with third-party providers via Xano, configure user roles and private pages, or different versions of Xano data sources and branches.

Learn more about setting up [Xano user authentication in a WeWeb project](https://docs.weweb.io/plugins/auth-systems/xano-auth.html).
