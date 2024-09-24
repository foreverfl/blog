import { useDispatch, useSelector, useStore } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";
import type { RootState, AppDispatch, AppStore } from "./store";

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch; // 액션을 디스패치할 때 타입 안전성을 보장받을 수 있음
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector; // 선택된 상태의 타입이 RootState와 일치하도록 함
export const useAppStore: () => AppStore = useStore;
