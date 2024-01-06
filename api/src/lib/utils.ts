import crypto from "crypto";

export function shortID(length: number) {
  return crypto.randomUUID().replaceAll("-", "").slice(0, length);
}

export async function dataOrError(resp: Response) {
  const textData = (await resp.text().catch((error) => {
    error;
  })) as any;

  if (textData === undefined || textData === null || textData.error)
    return { error: { textData } };

  try {
    const jsonData = JSON.parse(textData);
    return jsonData;
  } catch (error) {
    return textData;
  }
}

function logAndThrow(error: any, errorMsg: any) {
  console.log(error);
  console.trace();
  throw errorMsg;
}

export async function dataOrThrow(response: any, errorMsg: string) {
  if (!response) logAndThrow(response, errorMsg);
  if (!response.ok) logAndThrow(response, errorMsg);
  if (response.error) logAndThrow(response, errorMsg);

  let data = await dataOrError(response);

  if (!data || data.error) logAndThrow(response, errorMsg);
  return data;
}
