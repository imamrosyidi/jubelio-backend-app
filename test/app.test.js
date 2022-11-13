// "use strict";

const Lab = require("@hapi/lab");
const { expect } = require("@hapi/code");
const { afterEach, beforeEach, describe, it } = (exports.lab = Lab.script());
const { init } = require("../lib/server");

describe("GET /", () => {
  let server;

  beforeEach(async () => {
    server = await init();
  });

  afterEach(async () => {
    await server.stop();
  });

  it("get product", async () => {
    const res = await server.inject({
      method: "get",
      url: "/products?offset=10&count=1",
    });
    expect(res.statusCode).to.equal(200);
  });

  it("upload new product", async () => {
    const res = await server.inject({
      method: "post",
      url: "/product",
      payload: {
        name: "unit testing product",
        price: 200,
        description: "just for testing",
      },
    });
    expect(res.statusCode).to.equal(200);
  });

  it("update new product", async () => {
    const res = await server.inject({
      method: "put",
      url: "/product/1",
      payload: {
        name: "unit testing product",
        price: 200,
        description: "just for testing",
      },
    });
    expect(res.statusCode).to.equal(200);
  });

  it("delete product", async () => {
    const res = await server.inject({
      method: "delete",
      url: "/product/90",
    });
    expect(res.statusCode).to.equal(200);
  });
});
