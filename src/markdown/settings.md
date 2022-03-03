# Xano Auth

In order to setup Xano authentication in your WeWeb project, there are three pre-requisites:

✅ 1- you already have an account with Xano, it’s free for up to 10,000 records

✅ 2- you have a user table in your Xano database with at least two fields: login and password

✅ 3- you have the three authentication API endpoints in Xano


Let’s walk you through step 2 and 3 before we dive into the actual WeWeb setup 🙂

## Setup a User Table in Your Xano Database

Your user table should include at least two fields:

* one field where you store the **login**, for example, a string field with a name or an email field with an email address, and
* one field of field type “**password**” where you store the encrypted password.

![table with password field in xano|690x251, 75%](https://aws1.discourse-cdn.com/business6/uploads/weweb/original/1X/77cba7670dee1fd6da408afd930d67b74945106f.jpeg)

> ⚠️ It’s important that you choose the field type “password” when creating your user table in Xano. ⚠️

This will ensure that:

* you can use Xano’s authentication API points, and that
* the user input is encrypted when the user first creates an account with your web-app.

![](https://aws1.discourse-cdn.com/business6/uploads/weweb/original/1X/b28d9312d484899870d783a29621c59408e348e2.gif)

⚡️ Pro tip: if you’re starting from scratch in Xano, you can use the “Starter” template in their Marketplace.

![starter template in xano|690x340, 75%](https://aws1.discourse-cdn.com/business6/uploads/weweb/optimized/1X/3a70d4ec4734973c0240450f5d81d0316385e799_2_1034x510.jpeg)



## Create Authentication API Endpoints in Xano

For Xano authentication to work, you need three API endpoints:

1. signup
2. login
3. me

![three auth endpoints in xano-api view|690x227](https://aws1.discourse-cdn.com/business6/uploads/weweb/original/1X/bd1e99c86874c04ac77dc2ab1335e92597f44f86.jpeg)


If you’re using a Xano template that includes authentication, you’ll find these endpoints in the API sub-menu.

Otherwise, you’ll need to create these three endpoints yourself by going to “API” > “Add API Endpoint” > “Authentication”

![create-auth-endpoints-xano|690x388](https://aws1.discourse-cdn.com/business6/uploads/weweb/original/1X/55e0416fdab2958a0aa0f2dcf4fc8f3d6ef4c2c9.gif)


## Copy Xano Authentication Endpoints Into WeWeb

In WeWeb, you’ll need to copy/paste the URL of each Xano API endpoint:

![three auth endpoints in weweb|690x477, 75%](https://aws1.discourse-cdn.com/business6/uploads/weweb/original/1X/19b211517d4f0c2a0038d7cd5c998c38547dc35e.png)

> ⚠️ Warning: the order in which endpoints are displayed in Xano may vary. Make sure to copy the correct URL in each WeWeb ⚠️

## Create Roles and Permissions

### Adding Roles to Xano API Endpoint
In order to gate content in WeWeb based on user roles and permissions, you first need to create a `role` column in your Xano user base.


If you have a column with user roles in your Xano user base, you will be able to add it to the output of your `me` endpoint:
![add role ro me output in xano auth|690x388](https://aws1.discourse-cdn.com/business6/uploads/weweb/original/1X/401d03fed7da12c6ea2b31c9605e9cb79028ad57.gif)

Once you've added roles to the output of the `me` endpoint of your Xano auth, you can add them to WeWeb.

### Telling WeWeb Where to Find the User Role Info in Xano

Here, it's in the `role` column so that's what we type in:
![role in user info|615x500, 75%](https://aws1.discourse-cdn.com/business6/uploads/weweb/original/1X/9e727ae39671e9c272f2d1beb2f099048ba476f4.png)

Then, you can add user groups where user roles match the data in Xano.

### Adding User Groups in WeWeb

![define-user-groups|690x388](https://aws1.discourse-cdn.com/business6/uploads/weweb/original/1X/3eada74256d1189d0fa52e38b583688963094551.gif)

Note that user role categories in Xano match the user roles in WeWeb:

#### User roles in Xano
![user roles in xano|690x180](https://aws1.discourse-cdn.com/business6/uploads/weweb/original/1X/ea79895e32e0d6aff5930256b1dcd6cd9c33f7b8.jpeg)

#### User roles in WeWeb
![define user groups in weweb|389x499](https://aws1.discourse-cdn.com/business6/uploads/weweb/original/1X/0ddbb2b6add86fd973161e5d4d3c446ee506deab.png)


## Gate Content Based on User Roles
Once you've setup user roles in WeWeb, you can `Manage access to pages`
 and define rules for `Private access`:

![gate-content-with-xano-roles|690x388](https://aws1.discourse-cdn.com/business6/uploads/weweb/original/1X/dbcfb4476752877603ebd795a2f127cfc4fcb0b0.gif)
