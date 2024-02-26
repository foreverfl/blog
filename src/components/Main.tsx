"use client";

import React, { useEffect, useState } from "react";

interface DataItem {
  name: string;
  // 다른 필드들...
}

const Main: React.FC = () => {
  const [data, setData] = useState<DataItem[]>([]);

  useEffect(() => {
    async function fetchData() {
      const response = await fetch("/api/data");
      const { data } = await response.json();
      setData(data);
    }

    fetchData();
  }, []);

  return (
    <div className="min-h-screen">
      <p>This is the main content area.</p>
      {/* 데이터 렌더링 */}
      {data.map((item, index) => (
        <div key={index}>
          <p>{item.name}</p>
        </div>
      ))}
    </div>
  );
};

export default Main;
