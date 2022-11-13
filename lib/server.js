const mydb = require("./../db");
const Hapi = require("@hapi/hapi");
const Joi = require("joi");
const { makeid } = require("./functions/makeid");

mydb
  .connect()
  .then((_) => {
    console.log("Seccesful Connect to db");
  })
  .catch((e) => {
    console.log(e);
  });

const server = Hapi.server({
  port: 3001,
  host: "localhost",
  routes: {
    cors: {
      origin: ["*"],
      headers: ["Accept", "Content-Type"],
      additionalHeaders: ["X-Requested-With"],
    },
  },
});
server.route({
  method: "GET",
  path: "/products",
  handler: async (request, h) => {
    const offset = request.query.offset;
    const count = request.query.count;
    const data = await mydb.any(`SELECT *
  FROM 
  (
      SELECT 
        Row_Number() OVER (Order By sku) As RowNum
      , *
      FROM public.products
  ) t2
  WHERE RowNum >= ${offset} LIMIT ${count}`);

    await Promise.all(
      data.map(async (e) => {
        e.images = await mydb.any(`SELECT src
    FROM public.images WHERE prod_id =  ${e["id"]}`);
      })
    );

    return { data: data };
  },
  options: {
    validate: {
      query: Joi.object({
        count: Joi.number().integer().min(1).max(100).default(8),
        offset: Joi.number().integer().min(1).default(1),
      }),
    },
  },
});
server.route({
  method: "POST",
  path: "/product",
  handler: async (request, h) => {
    const sku = makeid(4) + "-" + makeid(4);
    const name = request.payload.name;
    const price = request.payload.price;
    const description = request.payload.description;

    const data =
      await mydb.any(`INSERT INTO public.products (sku, name,  price, description)
  VALUES ('${sku}', '${name}',  ${price}, '${description}');`);

    return { message: "succesful" };
  },
  options: {
    validate: {
      payload: Joi.object({
        name: Joi.string().min(1).max(100),
        price: Joi.number(),
        description: Joi.string().min(1).max(1000),
      }),
    },
  },
});
server.route({
  method: "PUT",
  path: "/product/{id}",
  handler: async (request, h) => {
    const id = request.params.id;
    const name = request.payload.name;
    const price = request.payload.price;
    const description = request.payload.description;

    const data = await mydb.any(`UPDATE public.products
    SET name = '${name}', price = ${price}, description = '${description}'
    WHERE id = ${id};`);
    return { message: "succesful" };
  },
  options: {
    validate: {
      params: Joi.object({ id: Joi.number() }),
      payload: Joi.object({
        name: Joi.string().min(1).max(100),
        description: Joi.string().max(1000),
        price: Joi.number(),
      }),
    },
  },
});
server.route({
  method: "DELETE",
  path: "/product/{id}",
  handler: async (request, h) => {
    await mydb.any(
      `DELETE FROM public.products WHERE id='${request.params.id}'`
    );
    return { message: "succesful" };
  },
  options: {
    validate: {
      params: Joi.object({
        id: Joi.number(),
      }),
    },
  },
});

//for unit testing
exports.init = async () => {
  await server.initialize();
  return server;
};

exports.start = async () => {
  await server.start();
  console.log(`Server running at: ${server.info.uri}`);
  return server;
};
