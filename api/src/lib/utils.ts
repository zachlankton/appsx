import crypto from "crypto";

const BASE62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const bigInt62 = BigInt(62);

export function generateID() {
  // Generate a 128-bit number (16 bytes)
  const buffer = crypto.randomBytes(16);

  // Convert the buffer to a BigInt
  let number = BigInt("0x" + buffer.toString("hex"));

  // Convert the BigInt to a Base62 string
  let base62 = "";
  while (number > 0) {
    base62 = BASE62[Number(number % bigInt62)] + base62;
    number = number / bigInt62;
  }

  // Pad the string to ensure a length of 22 characters
  base62 = base62.padStart(22, "0");

  return base62;
}

export function uuidToBase62(uuid: string) {
  // Remove hyphens from UUID
  let noHyphensUUID = uuid.replace(/-/g, "");

  // Convert UUID (hexadecimal) to BigInt
  let num = BigInt("0x" + noHyphensUUID);

  // Convert the BigInt to a Base62 string
  let base62 = "";
  while (num > 0) {
    base62 = BASE62[Number(num % bigInt62)] + base62;
    num = num / bigInt62;
  }
  return base62;
}

export function base62ToUUID(base62: string) {
  let num = BigInt(0);

  // Convert from Base62 to BigInt
  for (let char of base62) {
    num = num * BigInt(62) + BigInt(BASE62.indexOf(char));
  }

  // Convert BigInt to a hexadecimal string
  let hex = num.toString(16).padStart(32, "0");

  // Format the hexadecimal string as a UUID
  return (
    hex.substring(0, 8) +
    "-" +
    hex.substring(8, 12) +
    "-" +
    hex.substring(12, 16) +
    "-" +
    hex.substring(16, 20) +
    "-" +
    hex.substring(20)
  );
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

function logAndThrow(error: any, errorMsg: any, customErrorStatusCode = 500) {
  console.log(error);
  console.trace();
  throwHttpError(customErrorStatusCode, errorMsg);
}

async function logAndThrowWithData(
  error: any,
  errorMsg: any,
  customErrorStatusCode = 500
) {
  let data = await dataOrError(error);
  console.log(error, data);
  console.trace();
  throwHttpError(customErrorStatusCode, errorMsg);
}

export function throwHttpError(code: number, message: string) {
  const error = new Error() as any;
  error.message = message;
  error.statusCode = code;
  throw error;
}

export async function dataOrThrow(
  response: any,
  errorMsg: string,
  customErrorStatusCode = 500
) {
  if (!response) logAndThrow(response, errorMsg, customErrorStatusCode);
  if (!response.ok)
    await logAndThrowWithData(response, errorMsg, customErrorStatusCode);
  if (response.error) logAndThrow(response, errorMsg, customErrorStatusCode);

  let data = await dataOrError(response);

  if (!data || data.error)
    logAndThrow(response, errorMsg, customErrorStatusCode);
  return data;
}
