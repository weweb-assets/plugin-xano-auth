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

![table with password field in xano|690x251, 75%](https://lh5.googleusercontent.com/mjeyNx6-LIgJEeqGkHncBGpOU88AYGWsiCybheQv0yM7Olj11ZHGJyUJLh8vOMB_-8wktAwmzrCBAc8pA4JtzK8Ob8iOSP22g7TwySxDY5iP2fM7KCSBX-2iXBAV9vsiFOkzLxA-)

> ⚠️ It’s important that you choose the field type “password” when creating your user table in Xano. ⚠️

This will ensure that:

* you can use Xano’s authentication API points, and that
* the user input is encrypted when the user first creates an account with your web-app.

![](https://lh5.googleusercontent.com/VEcPtIjObVaae9iaUQ7a98kF2a-Nw4ilxTPlw2mSXwahc0-Xl4g9afH_21NcRAVJjzv2HbNag5WUFtm9k1_Ob0nqivK7C5SYfVrdNzCTFfRPqONhIBYCqrU7y5ZtWIDSrvSWyrVv)

⚡️ Pro tip: if you’re starting from scratch in Xano, you can use the “Starter” template in their Marketplace.

![starter template in xano|690x340, 75%](https://lh3.googleusercontent.com/6DR--YYYtdzSgu7N3cR07yqg4XxUBMtgU2RYAQGPZ7MmcnYCJsEivQ2kWVhvh-eY0jw7p8REuym9yzqci-cjtJQ2FR_v1m6rmYwl8eI9FnWbe-34MwN-_41pcegQmlQSgNm5-mis)



## Create Authentication API Endpoints in Xano

For Xano authentication to work, you need three API endpoints:

1. signup
2. login
3. me

![three auth endpoints in xano-api view|690x227](https://lh6.googleusercontent.com/fah1ReqRqduRliFOqVpPX7MTiN3UxWLJvhgai_INLqzQEmNJGzcfTK-s2PQetFVMCYSzPTRuHu_hgxEFf7TsL0dTuAH-x1Aoks43HuoKhqmadG_aRlU9jyH6-DNXGkw7dJjWDd20)


If you’re using a Xano template that includes authentication, you’ll find these endpoints in the API sub-menu.

Otherwise, you’ll need to create these three endpoints yourself by going to “API” > “Add API Endpoint” > “Authentication”

![create-auth-endpoints-xano|690x388](https://lh6.googleusercontent.com/i16itYkCX6EHLx1gzfCkEunmrrWFNJR2pPSfjLgq6Yj9-DmHbe6zCuRiYYdB8eOW6t-fUt4KOr_B1rLNI7LFS2oO89ylkEW01-_b3uCwd0Yv2w1rizh7QvBx_OFYZQ_RJcFg-20U)


## Copy Xano Authentication Endpoints Into WeWeb

In WeWeb, you’ll need to copy/paste the URL of each Xano API endpoint:

![three auth endpoints in weweb|690x477, 75%](https://lh3.googleusercontent.com/z3VvtBzl9K5i4hQkCFV03c-u6JThs-PSNojvAUBP08rL2L4VwTDjv1eUNP66T8MSvS8OybmAthSRCmomNfSy_g5UZzYobsz9NdcVdMQK6xP9xzJZ2CCBJdTIK1sKSVULFd6wO9V2)

> ⚠️ Warning: the order in which endpoints are displayed in Xano may vary. Make sure to copy the correct URL in each WeWeb ⚠️

## Create Roles and Permissions

### Adding Roles to Xano API Endpoint
In order to gate content in WeWeb based on user roles and permissions, you first need to create a `role` column in your Xano user base.


If you have a column with user roles in your Xano user base, you will be able to add it to the output of your `me` endpoint:
![add role ro me output in xano auth|690x388](https://lh6.googleusercontent.com/Iv1UmFN9QqSs08opWmgTyMNN3I1VtIcEdvP3UXzyNMwR0zVlmVQisuFPAadWe0car13S1Ki_7OJcG-vcnaT6zULhs2ERspu0eUS7LDRGrsMegpnGbCfy8OAbf_-w5udoYQFcXo8V)

Once you've added roles to the output of the `me` endpoint of your Xano auth, you can add them to WeWeb.

### Telling WeWeb Where to Find the User Role Info in Xano

Here, it's in the `role` column so that's what we type in:
![role in user info|615x500, 75%](https://lh6.googleusercontent.com/0F1wT0q271-U13NoVLa8saNHm6FlOyFmNLg5T7t6n749atqpRXcfwmI5I_ucKO_keo9Nqy-QbngNCBnbEI8BSEFAwq35ty9iumJY_38vlIgNjJ_Cm_l9bNjYaO_RvDvEAiX5eqHa)

Then, you can add user groups where user roles match the data in Xano.

### Adding User Groups in WeWeb

![define-user-groups|690x388](https://lh5.googleusercontent.com/KXe5g6w7nJTLRUrCmySYhDgDglC4e9eeVfePXlyyO56hyQguqgAkq5EdI39EzIc9yq2uwkODb1eb3m25aT5jBmm0W1x5Y9xqy6K0wScl7--_J2kIL9KJkEGtTSoFsk74Q1mv0xh1)

Note that user role categories in Xano match the user roles in WeWeb:

#### User roles in Xano
![user roles in xano|690x180](https://lh6.googleusercontent.com/hyETJdJ2D-z6TRit5Ye-iKnsmaBSXaSorLiAlLDVpNXNN-NECT5I6mQH9UjqcZbD7a3DK8zjv-OowMObAOIH11B7Utb1Q0duO_YZoFwGqYIKrCV8SyNw3THvyUKfkqo4C_uHxoSO)

#### User roles in WeWeb
![define user groups in weweb|389x499](https://lh3.googleusercontent.com/gS0dO8z3WOTE9BzsMZVkDIZmDPxDNljxosT3Umb8WgUCzgmLoAaqAfceeWpjLwTWZgkdxABVbg9NTAyoLEDOah_NGtzHKVincOadp2TLdj53j6ah-0MQ_WKr-qGgeXhC_ZjYNp2B)


## Gate Content Based on User Roles
Once you've setup user roles in WeWeb, you can `Manage access to pages`
 and define rules for `Private access`:

![gate-content-with-xano-roles|690x388](https://lh6.googleusercontent.com/PUkuRZybbSeyAH9he9gWcUq3gHkdx3f3SMPAHCjjSFlBxirQePekmlm9G9iGEOYkRnrSjgKBHn2iCbNxm1NHF6iUrLsASm9v9NzBOt-DQGfmD9QSsyn9TK-gcWzMNU6MhT2V4gkM)
