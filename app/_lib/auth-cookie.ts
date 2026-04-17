const SESSION_COOKIE_NAME = "riceproject_session";

type CookieAttributes = {
  maxAge?: number;
  expires?: Date;
  secure?: boolean;
};

type ParsedSessionCookie = {
  name: string;
  value: string;
} & CookieAttributes;

export function getSessionCookieName() {
  return SESSION_COOKIE_NAME;
}

export function parseLaravelSessionCookie(
  setCookieHeader: string | string[] | null
): ParsedSessionCookie | null {
  if (!setCookieHeader) {
    return null;
  }

  const cookieHeaders = Array.isArray(setCookieHeader)
    ? setCookieHeader
    : [setCookieHeader];

  const firstCookie = cookieHeaders.find((part) => {
    const [nameValue] = part.split("; ");
    const [name] = nameValue.split("=");
    const normalizedName = name?.trim().toLowerCase();

    if (!normalizedName || normalizedName === "xsrf-token") {
      return false;
    }

    return normalizedName.includes("session");
  });

  if (!firstCookie) {
    return null;
  }

  const [nameValue, ...attributes] = firstCookie.split("; ");
  const [name, ...valueParts] = nameValue.split("=");

  if (!name || !name.toLowerCase().includes("session")) {
    return null;
  }

  const value = valueParts.join("=");

  if (!value) {
    return null;
  }

  const parsedAttributes: CookieAttributes = {};

  for (const attribute of attributes) {
    const [rawKey, rawValue] = attribute.split("=");
    const key = rawKey.toLowerCase();

    if (key === "max-age" && rawValue) {
      const maxAge = Number.parseInt(rawValue, 10);

      if (!Number.isNaN(maxAge)) {
        parsedAttributes.maxAge = maxAge;
      }
    }

    if (key === "expires" && rawValue) {
      const expires = new Date(rawValue);

      if (!Number.isNaN(expires.getTime())) {
        parsedAttributes.expires = expires;
      }
    }

    if (key === "secure") {
      parsedAttributes.secure = true;
    }
  }

  return {
    name,
    value,
    ...parsedAttributes,
  };
}

export function serializeBackendSessionCookie(cookie: ParsedSessionCookie) {
  return encodeURIComponent(`${cookie.name}=${cookie.value}`);
}

export function deserializeBackendSessionCookie(serializedCookie: string) {
  if (!serializedCookie) {
    return null;
  }

  try {
    const decodedCookie = decodeURIComponent(serializedCookie);
    const separatorIndex = decodedCookie.indexOf("=");

    if (separatorIndex === -1) {
      return null;
    }

    const name = decodedCookie.slice(0, separatorIndex).trim();
    const value = decodedCookie.slice(separatorIndex + 1);

    if (!name || !value) {
      return null;
    }

    return {
      name,
      value,
    };
  } catch {
    return null;
  }
}
