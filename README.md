# What's this?

A very extremely incredibly extraordinarily LIGHT-WEIGHT backend framework based on Node.JS & Express.

# How Light-weight is it?

As you can see, the whole project (excluding the node modules) has only fewer than 1000 lines of code.
Moreover, you can customize it by just editing four files in the `config` folder.
To make it lighter, we even have no support for databases, while the data are temperarily stored in your memory and will be synced to your disk every interval and before the process exit.

# What about the performance?

I don't know, and I don't care. This is only suitable for tiny projects since it's easy to code and use, for me and for you.

# Sounds great! But how to use it?

1. Download the project, or git clone it.
2. Run `node index`
3. It's done!

Now, you can visit http://localhost:3000 (default port), and these APIs are available:

- GET /api/users
- GET /api/users/1
- POST /api/users
- PUT /api/users/1
- PATCH /api/users/1
- DELETE /api/users/1

A simple JWT-Based user system is integrated in DYAPI. You can POST /api/login with a JSON body which has username and password properties to login. All of the model interfaces of DYAPI can verify user's permission, which will be referred to later.

# General Usage

The DYAPI is composed by 4 parts: **Routes, Middlewares, Controllers, Models, and Services.**

## Routes

Routes are the entry points of your application. They are the first thing that your users will see. They are written by me in the `index.js`, and normally you won't need to edit them.

## Middlewares

Middlewares are the functions that are executed before and after the controller. They can be configured in the `config/middlewares.js`.

Each middleware has three arguments: the request, the response and the next function. The next function is used to call the next middleware in the chain. Like this.

```javascript
module.exports = {
  //...
  middlewares: {
    //...
    myMiddleware: (req, res, next) => {
      //Woo!
      next();
      //Ha!
    }
  }
}
```
The data to be send will be stored in the `res.tosend` object, and you can change it after calling the `next()` function. 

I wrote 2 middlewares in `config/middlewares.js`, one for authentication and one for setting the X-Powered-By header. They are examples of how to create a middleware, and are also important functions of DYAPI.

Moreover, a Antispider middleware is also included. If there are too many requests, which is more than the **SOFT** threshold, the server will randomly replace the response body, making the data useless. Haha!

## Controllers

When a user requests `/api/XXX`, these will happen to the router:

- If XXX ends with an `s`, it will be treated as a model, then it is routed to Models.
- If XXX does not end with an `s`, it will be treated as a controller, then it is routed to Controllers, which are configured in the `config/controllers.js`.

You can do anything in controllers. However, DYAPI won't verify user's permissions.

I also wrote 2 controllers in the file, which is used to log in and register users.

## Models

Models are the data that are used by your application. They are configured in the `config/models.js` file. Each model is binded to a `tablename` in `container`. (However,currently, we have only one type of container which is `FileContainer`)

Then you can use `SetField()` to set fields.

The field is a dyapi.DataField object, whose constructor is
```javascript
new DataField(name, type, required, defaultValue)
```
The `name` is the name of the field, `type` is the type of the field, and `defaultValue` is the default value of the field.

The `required` is a boolean value, which indicates whether the field is required.

You can use members of dyapi.DataTypes as `type`. 

I also provide a model called `user`.

## Services

You can Create, Read, Update, Delete a model datum by visiting these URLs (detailed descriptions are in `# Accessing Data` section):

- GET /api/users
- GET /api/users/1
- POST /api/users
- PUT /api/users/1 (Overwrite)
- PATCH /api/users/1 (Merge)
- DELETE /api/users/1

If you want some extra operations, you have to create a service, by appending `.registerService(permission, operation, service)` to your model.

Then you can use your service in your model by visiting 
- Any /api/users/YourServiceName

Obviously, your service name **CANNOT** be a number.

# Permissions

A simple JWT-Based user system is integrated in DYAPI. You can POST /api/login with a JSON body which has username and password properties to login. All of the model interfaces of DYAPI can verify user's permission.

## Model Permission

You can set a model's permission by appending `.setPermission(UserRole, Permission)` to the model. Permission is seperated by comma(`,`).

These four permissions are available:

- `C`: Create model datum.
- `R`: Read model.
- `U`: Update model.
- `D`: Delete model.

Interestingly, the permission `R` is short for the sum of two permissions: `RL` and `RO`. If the data count of result is more than one, `RL` is required.

Other permissions are reserved for Services to use. When registering service, you can bind the permission of the service, or leaving the argument `null` for no permission requirement.

## Field Permission

You can set a field's permission by appending `.setPermission(UserRole, Permission)` to the DataField. Permission is seperated by comma(`,`).

These two permissions are available:

- `r`: Read field.
- `w`: Update field. (Create models are not affected by this permission.)

## Fallback 

If there's no match role, it will fall back to the `DEFAULT` role permission. If `DEFAULT` is not set, it will fall back to `C,R,U,D`.

# Accessing Data

## JS

If you want to access data via javascript in your model or controller or middleware, you can try these ways:

### *Method Q*

```javascript
model.models.YOUR_MODEL_NAME.Q(req.role, method, options)
```
- If you are using the default user middleware, `req.role` will be the user's role
- `method` is one of `"create"`,`"read"`,`"update"`,`"patch"`,`"delete"`.

The *Method Q* is actually a wrapper for the methods below with user permission checking. The `options` argument will be passed to the functions below, so you can read them for more details.

### create
```javascript
model.models.YOUR_MODEL_NAME.create(object)
```

### read
```javascript
model.models.YOUR_MODEL_NAME.read(parameters)
```

The `parameters` is a JSON object with the following properties:

- `filters` is a list of filters to apply to the query. Each filter is a **function**, which receives the current record and returns `true` if the record should be included in the result set.
- `fields` is a list of fields to return.
- `sort` is a list of fields to sort by. Start with `~` to sort in descending order.
- `page` is the current page number.
- `limit` is the maximum number of results to return on this page.
- `pops` is a list of populations to include. When a field is populated, the field will be replaced by the object in another Model whose `id` is the value of the field, and the model name is the name of the field. (*Only accessible by URL or Method Q*)


### update
```javascript
model.models.YOUR_MODEL_NAME.update(object)
```
The object has to have the `id` field to identify the object to be updated.

### patch
```javascript
model.models.YOUR_MODEL_NAME.patch(object)
```
The object has to have the `id` field to identify the object to be updated.

### delete
```javascript
model.models.YOUR_MODEL_NAME.delete(filter)
```
 filter is a **function**, which receives the current record and returns `true` if the record should be deleted.


## URL
If you want to access data via url, you can `GET`,`POST`,`PUT`,`PATCH`,`DELETE`.
You can Create, Read, Update, Delete a model datum by visiting these URLs:

- GET /api/users
- GET /api/users/1
- POST /api/users
- PUT /api/users/1 (Overwrite)
- PATCH /api/users/1 (Merge)
- DELETE /api/users/1

When using `GET /api/users`, you can use query parameters to filter,page,sort,etc.
### Paging & Limiting
Do like this:  page=1&limit=10

### Sorting
- sort=id   *This is ASC*
- sort=~id  *This is DESC*

### Popping
Do like this:  pop=email,phone,address

### Field Selecting
Do like this:  fields=id,username,password

### Filtering
Use `?YOUR_FIELD_NAME=???` to filter data.

If the field is a Number type or Date type, the `???` can be:
- 100 *Equals to 100*
- ~100 *Smaller than 100*
- 100~ *Bigger than 100*
- ~100~ *Not equals to 100*

If the field is a String type, the `???` can be:
- abc *Equals to abc*
- ~abc *Ends with abc*
- abc~ *Starts with abc*
- ~abc~ *Contains abc*

Many conditions can be combined, and the result has to satisfy all of them.

Wow! Amazing!

But if you want more complex conditions, you should register a service to the model.

# Contact, etc

If you have any questions, please contact me by sending issues or PRs on GitHub.

Thank you again for using this library, and don't forget to give me a star if you like it!