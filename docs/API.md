# API

## User

story:

-   create user
-   user login

### Create User

POST `/api/users`

request body:

-   password
-   userName

response body:

-   userName
-   token

### Login

POST `/api/users/login`

request body:

-   password
-   userName

response body:

-   userName
-   token

## Todo Items

stories:

-   get a user's all todo items
-   create a todo item
-   get one todo item
-   delete one todo item
-   update one todo item

### get a user's all todo items

GET `/api/todos`

auth required

Response Body:

```ts
type Todo = {
    id: string
    content: string
    isDone: boolean
}

interface ResponseBody {
    todos: Todo[]
}
```

### create a todo item

POST `/api/todos`

auth required

Request Body:

```ts
interface RequestBody {
    isDone: boolean
    content: string
}
```

Response Body:

```ts
interface ResponseBody {
    todo: Todo
}
```

### get one todo

GET `/api/todos/:id`

auth required

Response Body:

```ts
interface ResponseBody {
    todo: Todo
}
```

### delete one todo

DELETE `/api/todos/:id`

auth required

### update one todo

PATCH `/api/todos/:id`

auth required

Request Body:

```ts
interface RequestBody {
    isDone?: boolean
    content: boolean
}
```
