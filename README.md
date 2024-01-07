# What's this?

A very extremely incredibly extraordinarily LIGHT-WEIGHT backend framework based on Node.JS & Express.

# How Light-weight is it?

As you can see, the whole project (excluding the node modules) has only fewer than 1000 lines of code.
Moreover, you can customize it only by editing four files in the "config" folder.
To make it lighter, we even have no support for databases, while the data are temperarily stored in your memory and will be synced to your disk every interval and before the process exit.

# What about the performance?

I don't know, and I don't care. This is only suitable for tiny projects since it's easy to code and use, for me and for you.

# Sounds great! But how to use it?

1. Download the project, or git clone it.
2. Run "node index"
3. It's done!

Now, you can visit http://localhost:3000 (default port), and these APIs are available:

- GET /api/users
- GET /api/users/1
- POST /api/users
- PUT /api/users/1
- PATCH /api/users/1
- DELETE /api/users/1

A simple Cookie-Based user system is integrated in DYAPI. You can POST /api/users/login with a JSON body which has username and password properties to login. All of the model interfaces of DYAPI can verify user's permission, which will be referred to later.

# To be continued...
