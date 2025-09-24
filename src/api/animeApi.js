import axios from "axios";

const apiClient = axios.create({
  baseURL: "/sankanime/api", // ⚡ proxy handle → https://www.sankavollerei.com
});

/**
 * Helper untuk menangani request API dan error secara terpusat.
 */
const handleApiRequest = async (apiCall, errorMessage) => {
  try {
    const response = await apiCall();
    return response.data?.results ?? response.data;
  } catch (e) {
    console.error(errorMessage, e);
    throw e; // ✅ perbaikan bug
  }
};

const CACHE_VERSION = "1.0";
const CACHE_KEY = `homeInfoCache_v${CACHE_VERSION}`;
const CACHE_DURATION = 24 * 60 * 60 * 1000;

let requestPromise = null;

/**
 * Mengambil data home (/anime/home)
 */
export const getHomeInfo = () => {
  if (requestPromise) {
    console.log("Permintaan data home sedang berjalan, menunggu hasil...");
    return requestPromise;
  }

  requestPromise = new Promise((resolve, reject) => {
    (async () => {
      try {
        const cachedItem = localStorage.getItem(CACHE_KEY);
        if (cachedItem) {
          const cached = JSON.parse(cachedItem);
          if (
            cached &&
            cached.timestamp &&
            cached.data &&
            Date.now() - cached.timestamp < CACHE_DURATION
          ) {
            console.log("Mengambil data home dari cache localStorage.");
            return cached.data;
          }
        }
      } catch (e) {
        console.warn("Gagal mem-parse cache, mengambil data baru.", e);
        localStorage.removeItem(CACHE_KEY);
      }

      console.log("Mengambil data dari API home.");
      const results = await handleApiRequest(
        () => apiClient.get("/anime/home"), // ✅ endpoint benar
        "Gagal mengambil data home dari API:"
      );

      if (results) {
        const cacheToStore = { data: results, timestamp: Date.now() };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheToStore));
        return results;
      } else {
        throw new Error("Data dari API kosong.");
      }
    })()
      .then(resolve)
      .catch(reject);
  }).finally(() => {
    requestPromise = null;
  });

  return requestPromise;
};

/**
 * Info anime
 */
export const fetchAnimeInfo = async (id, isRandom = false) => {
  if (isRandom) {
    const randomData = await handleApiRequest(
      () => apiClient.get("/anime/random/id"),
      "Gagal mengambil ID anime acak:"
    );
    return handleApiRequest(
      () => apiClient.get("/anime/info", { params: { id: randomData } }),
      `Gagal mengambil info anime untuk ID acak: ${randomData}`
    );
  }
  return handleApiRequest(
    () => apiClient.get("/anime/info", { params: { id } }),
    `Gagal mengambil info anime untuk ID: ${id}`
  );
};

/**
 * Episodes
 */
export const getEpisodes = async (id) => {
  return handleApiRequest(
    () => apiClient.get(`/anime/episodes/${id}`),
    `Gagal mengambil episode untuk ID: ${id}`
  );
};

/**
 * Servers
 */
export const getServers = async (id, episodeId) => {
  return handleApiRequest(
    () => apiClient.get(`/anime/servers/${id}`, { params: { ep: episodeId } }),
    `Gagal mengambil server untuk episode: ${episodeId}`
  );
};

/**
 * Stream info
 */
export const getStreamInfo = async (id, episodeId, server, type) => {
  return handleApiRequest(
    () =>
      apiClient.get("/anime/stream", {
        params: { id, ep: episodeId, server, type },
      }),
    `Gagal mengambil stream info untuk episode: ${episodeId}`
  );
};

/**
 * Qtip
 */
export const getQtip = async (id) => {
  const processedId = id.split("-").pop();
  return handleApiRequest(
    () => apiClient.get(`/anime/qtip/${processedId}`),
    `Gagal mengambil data Qtip untuk ID: ${id}`
  );
};

/**
 * Search suggestion
 */
export const getSearchSuggestion = async (keyword) => {
  return handleApiRequest(
    () => apiClient.get("/anime/search/suggest", { params: { keyword } }),
    "Gagal mengambil saran pencarian:"
  );
};

/**
 * Schedule
 */
export const getSchedInfo = async (date) => {
  return handleApiRequest(
    () => apiClient.get("/anime/schedule", { params: { date } }),
    `Gagal mengambil jadwal untuk tanggal: ${date}`
  );
};

/**
 * Next episode schedule
 */
export const getNextEpisodeSchedule = async (id) => {
  return handleApiRequest(
    () => apiClient.get(`/anime/schedule/${id}`),
    `Gagal mengambil jadwal episode berikutnya untuk ID: ${id}`
  );
};

/**
 * Voice actors
 */
export const fetchVoiceActorInfo = async (id, page) => {
  return handleApiRequest(
    () => apiClient.get(`/anime/character/list/${id}`, { params: { page } }),
    `Gagal mengambil info pengisi suara untuk ID: ${id}`
  );
};

/**
 * Category info
 */
export const getCategoryInfo = async (path, page = 1) => {
  return handleApiRequest(
    () => apiClient.get(`/anime/${path}`, { params: { page } }),
    `Gagal mengambil data kategori untuk path: ${path}`
  );
};

/**
 * Search
 */
export const getSearch = async (keyword, page = 1) => {
  return handleApiRequest(
    () => apiClient.get("/anime/search", { params: { keyword, page } }),
    `Gagal mengambil hasil pencarian untuk: ${keyword}`
  );
};
