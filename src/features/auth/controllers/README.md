`signup.ts`

This file handles the `sign-up` process by validating the user's data, checking for existing usernames or emails, generating
unique identifiers, uploading the user's avatar image, saving the user's data to a Redis cache, and adding jobs to queues
for storing the data in the database.

# Importing required dependencies:

- `ObjectId` from the mongodb library: It is used to generate unique identifiers for MongoDB documents.
- `Request `and `Response` from the express library: These are used to handle HTTP requests and responses.
- `signupSchema` from @auth/schemas/signup: It represents the schema for validating sign-up data.
- `IAuthDocument` and ISignUpData from @auth/interfaces/auth.interface: These are interfaces representing the structure of --- authentication-related documents and sign-up data.

- `BadRequestError` from 'src/shared/globals/helpers/error-handler': It is a custom error class for handling bad request errors.
- `getUserByUsernameOrEmail` from @service/db/auth.service: A function that retrieves user data based on the provided username or email.
- `generateRandomIntegers` from @global/helpers/helpers: It is a function used to generate random integers.
- `Helpers` from @global/helpers/helpers: It is a class with various helper methods.
- `UploadApiResponse` from 'cloudinary': It represents the response object when uploading a file to Cloudinary.
- `uploads` from @global/helpers/cloudinary-uploads: It is a function that handles file uploads to Cloudinary.
- `HTTP_STATUS` from 'http-status-codes': It is an object containing HTTP status codes.
- `IUserDocument` from @user/interfaces/user.interface: It is an interface representing the structure of user documents.
- `UserCache` from @service/redis/user.cache: It is a class for interacting with a Redis cache.

- Creating an instance of UserCache.

- Defining an asynchronous function `createSignUp` that takes in a request (req) and a response (res) as
  parameters and returns a promise that resolves to void. This function handles the sign-up process.

- Extracting the relevant data from the request body `(username, email, password, avatarColor, avatarImage)`.

- Validating the extracted data against the `signupSchema`. If there is a validation error, a `BadRequestError`
  is thrown with the error message.

- Checking if a user with the provided username or email already exists by calling the `getUserByUsernameOrEmail` function.
  If a user is found, a `BadRequestError` is thrown with an appropriate error message.

- Generating `ObjectIds` for the authentication document and user document.

- Generating a `unique uId` for the user.

- Creating an `authentication document` (authData) using the `signupData` function, which formats the data according
  to the `IAuthDocument interface`.

- Uploading the `avatarImage` to `Cloudinary` using the `uploads` function and receiving the upload result (result). If the
  upload fails or the public_id is missing in the result, a `BadRequestError` is thrown.

- Creating a `user data object` (userDataForCache) by calling the `userData` function, which formats the data according
  to the `IUserDocument interface`.

- Setting the `profilePicture` property of `userDataForCache` to the `Cloudinary URL` of the uploaded image.

- Saving the user data to the `Redis cache` using the `saveUserToCache` method of the `userCache` instance.

- Omitting certain fields from `userDataForCache` using the `omit` function from the `lodash library`.

- Adding a `job` to the authentication queue `(addAuthUserJob)` to add the auth user data to the database.

- Adding a `job` to the user queue `(addUserJob)` to add the user data to the database.

- Sending a `JSON response` with the status code `HTTP_STATUS.CREATED` and a success message along with the
  authentication data.

- Defining the `signupData` function, which takes in the sign-up data `(data`) and returns a formatted authentication
  document (IAuthDocument).

- Defining the `userData` function, which takes in the `authentication document` (data) and the user document ID
  (userObjectId) and returns a formatted user document (IUserDocument).
