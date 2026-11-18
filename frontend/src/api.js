
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

export const getFeed = async () => {
  const response = await api.get("/feed");
  return response.data;
};

export const swipeProfile = async (profileId, action) => {
  const response = await api.post("/swipe", {
    profileId,
    action,
  });
  return response.data;
};

export const getMatches = async () => {
  const response = await api.get("/matches");
  return response.data;
};
