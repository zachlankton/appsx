import { getSession } from "./ClerkLite";
const apiUrl = import.meta.env.VITE_API_URL;

export async function createAccountWithInvite(inviteCode: string) {
  const { jwt } = await getSession();

  let headersList = {
    Authorization: "Bearer " + jwt,
  };

  let response = await fetch(`${apiUrl}/create_new_account/${inviteCode}`, {
    method: "POST",
    headers: headersList,
  });

  return await response.json();
}
