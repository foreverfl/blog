import LanguageRedirect from "@/components/main/LanguageRedirect";

export default function Index() {
  return (
    <div>
      <LanguageRedirect /> {/* 리다이렉트 로직 호출 */}
      <p>로딩 중...</p> {/* 혹시 리다이렉트 전에 사용자에게 보여줄 내용 */}
    </div>
  );
}
