import { APIRequestContext, APIResponse } from "@playwright/test";
import { FactoryOptions } from "../payload/_utils";
import { generatePostClientsBody } from "../payload/clients";
import { PostClientsBody } from "../schema/clients";

export async function postClients(
  request: APIRequestContext,
  opts: FactoryOptions<PostClientsBody> = {},
): Promise<APIResponse> {
  const { override, useRandom = true, sendFullPayload = false } = opts;
  const requestBody = generatePostClientsBody({
    override,
    useRandom,
    sendFullPayload,
  });
  const path = "/clients";

  // Make the API call to create the client
  const res = await request.post(path, { data: requestBody });
  return res;
}
