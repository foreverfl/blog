"use client";
import { useRef } from "react";
import { Provider } from "react-redux";
import { makeStore, AppStore } from "../lib/store";

export default function Storeprovider({
  children,
}: {
  children: React.ReactNode;
}) {
  // <AppStore>는 useRef 훅에 사용된 제네릭 타입
  // useRef는 React 훅 중 하나로, 변경 가능한 참조 객체를 생성
  const storeRef = useRef<AppStore>();
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore();
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}
