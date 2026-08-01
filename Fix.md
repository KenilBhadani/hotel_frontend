# Fixing the "Connection failed" Error

The "Connection failed" error you are seeing is most likely due to an issue with the MongoDB database connection. The application uses a connection string defined in an environment variable `MONGO_URI` to connect to the database.

Here's how you can fix this:

### 1. Locate the `.env` file

The configuration for the `MONGO_URI` is stored in a file named `.env` located in the `backend` directory of your project:

`c:\Running\hotel\hotel-management\Customer\backend\.env`

### 2. Check the `MONGO_URI`

Open the `.env` file and find the line that starts with `MONGO_URI`. It will look something like this:

`MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority`

### 3. Verify the Connection String

Please check the following in your `MONGO_URI`:

*   **Username and Password:** Ensure that `<username>` and `<password>` are correct for your MongoDB user.
*   **Cluster URL:** Make sure that `<cluster-url>` is the correct address for your MongoDB cluster.
*   **Database Name:** The `<database-name>` should be the name of the database you want to connect to.
*   **Local MongoDB:** If you are running MongoDB locally, your `MONGO_URI` might look simpler, for example: `MONGO_URI=mongodb://localhost:27017/hotel-management`

### 4. Ensure Your Database is Running

*   **If you are using MongoDB Atlas**, make sure your cluster is active and that your current IP address is whitelisted to allow connections.
*   **If you are running MongoDB locally**, ensure that the MongoDB server is running on your machine.

### 5. Restart the Application

After you have verified and saved the correct `MONGO_URI` in the `.env` file, please restart your backend server for the changes to take effect. You can do this by stopping the `node server.js` or `nodemon server.js` process and starting it again.

This should resolve the "Connection failed" error.
