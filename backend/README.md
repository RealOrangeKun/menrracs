# MENRRACS API

## Introduction

   ### Overview
   - MENRRACS is a REST API used to store files on Google cloud storage.
   - The API is used to make requests like POST/PUT/DELETE/GET to make CRUD operations on the user's Google cloud storage.
   - The tech stack used to make this API possible is:
      - [MongoDB](https://mongodb.com/) <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNyOe4xJhJFvDUbm1OSFnnEc4plFTvdYrBmOfNf-YUNA&s" width="10" height="10"> for the database
      - [ExpressJS](https://expressjs.com/) <img src="https://adware-technologies.s3.amazonaws.com/uploads/technology/thumbnail/20/express-js.png" width="14" height="14">  for the creation of the API
      - [Redis](https://redis.io/) <img src="https://www.stackery.io/assets/images/posts/redis-cache-cluster-support/featured.svg" width="10" height="10">  for server-side caching
      - [Google cloud storage](https://cloud.google.com/gcp?hl=en) <img src="https://static-00.iconduck.com/assets.00/google-cloud-icon-2048x1646-7admxejz.png" width="10" height="10">  for storing the files

   ### Features
   - A user can make an account and verify their email through a link send to their email.
   - Preforming CRUD operations on the user's cloud storage.
   - User will stay logged in for 2 weeks and their account will be marked as inactive after 6 months.
   - User's account gets deleted after 6 months but the user gets notified through their email after 5 months and 2 weeks.

## API Documentation
   ### Endpoints
   - Authentication endpoints
     - `/api/v1/auth/login` **POST**
     - `/api/v1/auth/register` **POST**
     - `/api/v1/auth/logout` **POST**
   - `/api/v1/profile`
     - **GET** to get the profile of the user
     - **PUT** to update the user's profile
   - `/api/v1/files`
     - **GET** to get a file or names of the files on the cloud
     - **PUT** to update a certain file
     - **DELETE** to delete a file
     - **POST** upload a new file
   ### Request Parameters
   - Authentication Routes
    - `/api/v1/auth/register`
        This route takes a json object in it's body with the following properties:
        1. `username` The username the user wants to have (3 Character min length).
        2. `password` The password the user wants (8 characters min with one lowercase and one uppercase).
        3. `email` The email the user wants to have.
   - `api/v1/auth/login`
        This route takes a json object in it's body with the propeties:
          1. `username` The user's username.
          2. `password` The user's password.
   - `api/v1/auth/logout`
        This route doesn't take any params.
   - `/api/v1/files`
      - **POST** Form data with the key's name as `files` and the value as the file/files itself.
      - **GET** `file` query with the file name the user wants to download.
      - **DELETE** `files` query with the file/files name/names.
      - **PUT** Form data with the key's name as `file` and the value as the new version of the file you want to update (file uploaded needs to have the same name as one of the files in the cloud storage).
   - `api/v1/profile`
     - **GET** No params.
     - **PUT** A json body with the value the user wants to change (`username` or `password` or `email`) **Changing the email will require the user to verify the new email and log in again**.
   ### Response Examples
   - `/api/v1/files`
     - **GET** 
       - With no `file` query:
        ```json
        {
            "success" : true,
            "message" : "No name query provided",
            "files" : ["file1.png",     "file2.pdf"]
        }
        ```
       - With `file` query as `file.png` will send the file itself from the cloud storage.
   - `/api/v1/profile`
     - **GET** : 
     ```json
     {
        "success" : true,
        "data" : {
            "username" : "testuser",
            "email" : "example@test.com",
            "files" : [
                {
                    "fileName" : "file1.png",
                    "fileType" : "png",
                    "createdAt" : "2024-04-13T21:08:21.833Z",
                    "updatedAt" : "2024-04-13T21:08:21.833Z"
                }
            ]
        }
     }
     ```

## Authentication
   The API uses `passport.js` [local-strategy](https://www.passportjs.org/packages/passport-local/) to verify the user with their username and password.

## License
  This project uses the [Apache License Version 2.0, January 2004](LICENSE)
