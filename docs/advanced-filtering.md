## 1. Query Filtering

For filtering with specific field using ops such as gte(greater than or equal),gt(greater than), lte, or lt,
the query should look something like the below one.

```js
Model.find({ price: { $gte: 400 } });
```

which will find objects whose price is greater than or equal to 400. Similarly use gt,lt, or lte.

For Example,

- Using Postman or Browser hit a get request on following url.

```
https://www.example.com/api/v1/tours?difficulty=easy&price[gte]=5
```

Once it gets parsed you'll see something like below in the req.query in the get route,

```js
{ difficulty: "easy", price: { gte: "5" } }

// Comparing this object with above one which we we need for querying,

// we just have to prefix the gte with $ symbol

// we can easily write simple piece of code to do this operation
```

## 2. Sorting

For sorting with specific field ascending or descending we can chain sort method to the returned query.
[Link to mongoose's Query.prototype.sort() docs](<https://mongoosejs.com/docs/api/query.html#Query.prototype.sort()>)

```js
// sort by "field" ascending and "test" descending
query.sort({ field: "asc", test: -1 });

// equivalent, we will be using this one in our example
query.sort("field -test");

// also possible is to use a array with array key-value pairs
query.sort([["field", "asc"]]);
```

An example for how to add sorting params

```
https://www.example.com/api/v1/tours?price[gte]=1000&sort=price,ratingsAverage

or

here we will sort based on ratings average and in descending order

https://www.example.com/api/v1/tours?price[gte]=1000&sort=price,-ratingsAverage
```

## 3. Projection

Basically selecting/removing the properties that we need or do not need

```js
// include a and b, exclude other fields
query.select("a b");
// Equivalent syntaxes:
query.select(["a", "b"]);
query.select({ a: 1, b: 1 });

// exclude c and d, include other fields
query.select("-c -d");
```

An example for how to add projection params

```
https://www.example.com/api/v1/tours?projection=name,difficulty,price

just exclude name property

https://www.example.com/api/v1/tours?projection=-name

Invalid query

https://www.example.com/api/v1/tours?projection=-name,difficulty

will result in an error: Cannot do exclusion on field name in inclusion projection

```

## 4. Pagination

`page` and `limit` are the two parameters that can be used for pagination, `page` is the current page number and `limit` is the maximum number of docs to receive. default: page=1,limit=100

An example for how to add pagination params

```
http://localhost:3000/api/v1/tours?page=3&limit=3
```
