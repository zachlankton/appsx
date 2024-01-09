import { getSession } from "./ClerkLite";
const apiUrl = import.meta.env.VITE_API_URL;

export async function createAccountWithInvite(inviteCode: string) {
  const { jwt } = await getSession();

  let headersList = {
    Authorization: "Bearer " + jwt,
  };

  let response: any = await fetch(
    `${apiUrl}/create_new_account/${inviteCode}`,
    {
      method: "POST",
      headers: headersList,
    },
  ).catch((err) => ({ err }));

  if (response.err) {
    return response;
  } else {
    return await response.json();
  }
}

export async function getInviteCode() {
  const { jwt } = await getSession();

  let headersList = {
    Authorization: "Bearer " + jwt,
  };

  let response: any = await fetch(`${apiUrl}/invite`, {
    method: "POST",
    headers: headersList,
  }).catch((err) => ({ err }));

  if (response.err) {
    return response;
  } else {
    return await response.json();
  }
}
