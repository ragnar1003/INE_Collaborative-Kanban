// d:\INE Project\backend\utils\presence.js
import Redis from "ioredis";

const redis = new Redis(process.env.UPSTASH_REDIS_URL); // Add this to your .env

export const setUserOnline = async (boardId, userId) => {
  await redis.sadd(`board:${boardId}:online`, userId);
};

export const setUserOffline = async (boardId, userId) => {
  await redis.srem(`board:${boardId}:online`, userId);
};

export const getOnlineUsers = async (boardId) => {
  return await redis.smembers(`board:${boardId}:online`);
};

export const setTyping = async (boardId, userId) => {
  await redis.sadd(`board:${boardId}:typing`, userId);
};

export const clearTyping = async (boardId, userId) => {
  await redis.srem(`board:${boardId}:typing`, userId);
};

export const getTypingUsers = async (boardId) => {
  return await redis.smembers(`board:${boardId}:typing`);
};

export default redis;