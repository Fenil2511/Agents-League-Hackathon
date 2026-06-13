function encodeODataString(value) {
  return String(value).replace(/'/g, "''");
}

async function getGraphAccessToken(graphConfig) {
  const { tenantId, clientId, clientSecret } = graphConfig;

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error("GRAPH_TENANT_ID, GRAPH_CLIENT_ID, and GRAPH_CLIENT_SECRET are required for Graph access.");
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "client_credentials",
    scope: "https://graph.microsoft.com/.default",
  });

  const response = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Failed to get Graph token: ${response.status} ${details}`);
  }

  const payload = await response.json();
  return payload.access_token;
}

async function graphRequest(graphConfig, path, options = {}) {
  const token = await getGraphAccessToken(graphConfig);
  const response = await fetch(`https://graph.microsoft.com/v1.0${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Graph request failed: ${response.status} ${details}`);
  }

  return response.json();
}

async function searchMailMessages(graphConfig, query, maxResults = 5) {
  if (!graphConfig.userId) {
    return [];
  }

  const path = `/users/${encodeURIComponent(graphConfig.userId)}/messages?$search="${encodeODataString(query)}"&$top=${maxResults}&$select=subject,bodyPreview,from,receivedDateTime,webLink`;
  const payload = await graphRequest(graphConfig, path, {
    headers: {
      ConsistencyLevel: "eventual",
    },
  });

  return (payload.value || []).map((item) => ({
    source: "mail",
    title: item.subject || "Untitled message",
    preview: item.bodyPreview || "",
    link: item.webLink || "",
    author: item.from?.emailAddress?.address || "unknown",
    receivedDateTime: item.receivedDateTime || "",
  }));
}

async function searchDriveItems(graphConfig, query, maxResults = 5) {
  if (!graphConfig.driveId) {
    return [];
  }

  const path = `/drives/${encodeURIComponent(graphConfig.driveId)}/root/search(q='${encodeODataString(query)}')?$top=${maxResults}&$select=name,webUrl,file`;
  const payload = await graphRequest(graphConfig, path);

  return (payload.value || []).map((item) => ({
    source: "drive",
    title: item.name || "Untitled file",
    preview: item.file ? "File matched by search" : "",
    link: item.webUrl || "",
  }));
}

function buildEmailRecipients(recipients) {
  return recipients
    .map((address) => String(address || "").trim())
    .filter(Boolean)
    .map((address) => ({
      emailAddress: { address },
    }));
}

async function sendMailNotifications(graphConfig, senderUserId, recipients, subject, bodyText) {
  const toRecipients = buildEmailRecipients(recipients);
  if (!senderUserId || !toRecipients.length) {
    return { sent: false, reason: "senderUserId and recipients are required" };
  }

  await graphRequest(graphConfig, `/users/${encodeURIComponent(senderUserId)}/sendMail`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: {
        subject,
        body: {
          contentType: "Text",
          content: bodyText,
        },
        toRecipients,
      },
      saveToSentItems: true,
    }),
  });

  return { sent: true, recipientCount: toRecipients.length };
}

module.exports = {
  searchDriveItems,
  searchMailMessages,
  sendMailNotifications,
};