import React from "react";
import Layout from "../components/Layout";
import Main from "../components/Main";
import Script from "next/script";

export default function Index() {
  return (
    <Layout postIdx={""}>
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4751026650729929"
        crossOrigin="anonymous"
      />
      <Main />
    </Layout>
  );
}
