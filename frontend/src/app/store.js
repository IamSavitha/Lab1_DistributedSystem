// src/app/store.js
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // localStorage
import { combineReducers } from 'redux';
import travelerReducer from '../features/traveler/travelerSlice';
import ownerReducer from '../features/owner/OwnerSlice';

// Redux Persist 配置
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['traveler', 'owner'], // 只持久化 traveler 和 owner 状态
};

// 合并所有 reducers
const rootReducer = combineReducers({
  traveler: travelerReducer,
  owner: ownerReducer,
});

// 创建持久化的 reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// 配置 store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // 忽略 redux-persist 的 action
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

// 创建 persistor
export const persistor = persistStore(store);
