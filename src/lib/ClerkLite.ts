let domain = "";
let prod = true;
let clerkDbJwt = "";
let active_session_id = "";
let changeHooks: any = [];
export let user: any = {};
export let session: any = null;

export function addClerkChangeHook(fn) {
  changeHooks.push(fn);
}

function runChangeHooks(event: string) {
  changeHooks.forEach((fn) => fn(event, user, session));
}

getClerkDbJwt();

export function setClerkDev() {
  prod = false;
}

export function setClerkDomain(d) {
  domain = d;
  getClerkDbJwt();
}

async function dataOrError(resp) {
  const textData = await resp.text().catch((error) => {
    error;
  });

  if (textData === undefined || textData === null || textData.error)
    return { error: { textData } };

  try {
    const jsonData = JSON.parse(textData);
    return jsonData;
  } catch (err) {
    return { textData };
  }
}

export async function getClerkDbJwt() {
  if (prod) return "";
  const localJwt = localStorage.getItem("clerk-db-jwt");
  if (localJwt) return (clerkDbJwt = `&__dev_session=${localJwt}`);
  if (!domain) return "";
  if (clerkDbJwt) return clerkDbJwt;

  const resp = await fetch(
    `https://${domain}/v1/dev_browser?_clerk_js_version=4.68.1`,
    {
      method: "POST",
    }
  );

  const data = await dataOrError(resp);
  localStorage.setItem("clerk-db-jwt", data.token);
  clerkDbJwt = `&__dev_session=${data.token}`;
  runChangeHooks("clerkDbJwt");
}

export async function signOut() {
  const resp = await fetch(
    `https://${domain}/v1/client?_clerk_js_version=4.68.1&_method=DELETE${clerkDbJwt}`,
    {
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      method: "POST",
      credentials: "include",
    }
  );

  const respData = await dataOrError(resp);
  return respData;
}

export async function signIn() {
  if (!prod && !clerkDbJwt) return null;

  const data = {
    strategy: "oauth_github",
    redirect_url: location.origin,
    action_complete_redirect_url: "/",
  };
  const formData = Object.keys(data)
    .map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
    .join("&");

  const resp = await fetch(
    `https://${domain}/v1/client/sign_ins?_clerk_js_version=4.68.1${clerkDbJwt}`,
    {
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      referrer: "http://localhost:5173/",
      referrerPolicy: "strict-origin-when-cross-origin",
      body: formData,
      method: "POST",
    }
  );

  const respData = await dataOrError(resp);
  location.assign(
    respData.response.first_factor_verification
      .external_verification_redirect_url
  );
  runChangeHooks("signIn");
  return respData;
}

export async function getClient() {
  if (!prod && !clerkDbJwt) return null;

  const resp = await fetch(
    `https://${domain}/v1/client?_clerk_js_version=4.68.1${clerkDbJwt}`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  const respData = await dataOrError(resp);

  active_session_id = respData.response?.last_active_session_id;
  if (!active_session_id) return respData;

  session = respData.response.sessions.find(
    (sess) => sess.id === active_session_id
  );

  if (!session) return respData;
  user = session.user;
  runChangeHooks("getClient");
  return respData;
}

export function getUser() {
  return user;
}

export async function getSession() {
  if (!prod && !clerkDbJwt) return null;
  if (!active_session_id) return null;

  const resp = await fetch(
    `https://${domain}/v1/client/sessions/${active_session_id}/tokens?_clerk_js_version=4.68.1${clerkDbJwt}`,
    {
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      body: "",
      method: "POST",
      credentials: "include",
    }
  );

  const respData = await dataOrError(resp);
  runChangeHooks("getSession");
  return respData;
}
