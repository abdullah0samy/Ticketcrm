import axios from "axios";
// API host is configurable so the app can run against a local backend.
// Set REACT_APP_API_BASE in .env / .env.local; the original host stays the default.
export const baseUrl =
  process.env.REACT_APP_API_BASE || "https://support.csch-svu.com:8000/api";

export async function fetchApi(endPond, quary) {
  try {
    const { data } = await axios.get(`${baseUrl}/${endPond}`, {
      headers: {
        Authorization: `Token ${localStorage.getItem("Token")}`,
        "Accept-Language": `${localStorage.getItem("i18nextLng")}`,
      },
      params: quary,
    });
    return data;
  } catch (error) {
    console.log(error);
    if (error.response.data.message) {
      throw error.response.data.message;
    } else if (error.request) {
      throw error.message;
    } else {
      throw error.message;
    }
  }
}

export async function fetchApiUrl(url) {
  console.log(url);
  try {
    const { data } = await axios.get(url, {
      headers: {
        Authorization: `Token ${localStorage.getItem("Token")}`,
        "Accept-Language": `${localStorage.getItem("i18nextLng")}`,
      },
    });
    return data;
  } catch (error) {
    if (error.response.data.message) {
      throw error.response.data.message;
    } else {
      throw error.message;
    }
  }
}

export async function deleteApi(endPond, bodyRow = {}) {
  console.log(bodyRow);
  try {
    const { data } = await axios.delete(`${baseUrl}/${endPond}`, {
      headers: {
        Authorization: `Token ${localStorage.getItem("Token")}`,
        "Accept-Language": `${localStorage.getItem("i18nextLng")}`,
      },
      data: bodyRow,
    });
    return data;
  } catch (error) {
    if (error.response.data.message) {
      throw error.response.data.message;
    } else {
      throw error.message;
    }
  }
}

export async function postApi(endPond, bodyRow) {
  try {
    const { data } = await axios.post(`${baseUrl}/${endPond}`, bodyRow, {
      headers: {
        Authorization: `Token ${localStorage.getItem("Token")}`,
        "Accept-Language": `${localStorage.getItem("i18nextLng")}`,
      },
    });
    return data;
  } catch (error) {
    if (error.response.data.message) {
      throw error.response.data.message;
    } else {
      throw error.message;
    }
  }
}

export async function putApi(endPond, bodyRow) {
  try {
    const res = await axios.put(`${baseUrl}/${endPond}`, bodyRow);
    return res.data;
  } catch (error) {
    throw error.message;
  }
}

export async function patchApi(endPond, sendData) {
  try {
    const { data } = await axios.patch(`${baseUrl}/${endPond}`, sendData, {
      headers: {
        Authorization: `Token ${localStorage.getItem("Token")}`,
        "Accept-Language": `${localStorage.getItem("i18nextLng")}`,
      },
    });
    return data;
  } catch (error) {
    if (error.response.data.message) {
      throw error.response.data.message;
    } else {
      throw error.message;
    }
  }
}
