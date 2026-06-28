import test, { APIRequestContext, request } from "@playwright/test";
import { postClients } from "../framework/api/api/clients";

test.describe("Clients API", () => {
  let context: APIRequestContext;
  test.beforeEach(async ({}) => {
    context = await request.newContext({
      baseURL: process.env.API_BASE_URL || "http://localhost:3001",
    });
  });
  test("should create a new client", async () => {
    const res = await postClients(context, {sendFullPayload: true});
    test.expect(res.ok()).toBeTruthy();
    const responseBody = await res.json();
    console.log("Response Body:", responseBody);
  });
});
