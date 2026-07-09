export const extractArray = (response, keys = []) => {
  const data = response?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
    if (Array.isArray(data?.data?.[key])) return data.data[key];
  }

  return [];
};

export const extractObject = (response, keys = []) => {
  const data = response?.data;

  if (data && typeof data === "object" && !Array.isArray(data)) {
    if (data.data && typeof data.data === "object" && !Array.isArray(data.data)) return data.data;

    for (const key of keys) {
      if (data?.[key]) return data[key];
      if (data?.data?.[key]) return data.data[key];
    }

    return data;
  }

  return null;
};
