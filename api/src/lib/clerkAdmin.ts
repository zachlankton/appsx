import { dataOrThrow } from "./utils.js";

export async function updateClerkUserMetaData(data: any, userId: string) {
  let headersList = {
    Authorization: "Bearer " + process.env.CLERK_SECRET,
    "Content-Type": "application/json",
  };

  let bodyContent = JSON.stringify({
    public_metadata: data,
  });

  let response = await fetch(
    `https://api.clerk.com/v1/users/${userId}/metadata`,
    {
      method: "PATCH",
      body: bodyContent,
      headers: headersList,
    }
  );

  return await dataOrThrow(response, "Could not update clerk metadata");
}

export async function getUser(userId: string) {
  let headersList = {
    Authorization: "Bearer " + process.env.CLERK_SECRET,
  };

  let response = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
    method: "GET",
    headers: headersList,
  });

  return await dataOrThrow(response, "Could not get clerk user");
}
