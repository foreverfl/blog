import React from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";

const MainContent: React.FC = () => {
  const { userName, userId, email, photo, isLoggedOut } = useAppSelector(
    (state) => state.user
  );

  function formatDate(date: string | number | Date) {
    const d = new Date(date);
    let month = "" + (d.getMonth() + 1);
    let day = "" + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-");
  }

  const todayDate = formatDate(new Date());

  return (
    <>
      <div className="my-56"></div>

      <div className="text-center mt-10">
        {/* Popular Posts */}
        <div className="mb-10">
          <h2 className="text-5xl font-semibold my-10">Popular Posts</h2>
          <div className="grid grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="bg-white shadow rounded overflow-hidden aspect-square"
              >
                <div className="h-3/4 bg-cover bg-center"></div>
                <div className="bg-gray-200 p-4">
                  <p className="text-sm">{todayDate}</p>
                  <h3 className="font-semibold">{`Post ${index + 1}`}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="my-56"></div>

        {/* Recent Posts */}
        <div>
          <h2 className="text-5xl font-semibold my-10">Recent Posts</h2>
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="bg-white shadow rounded overflow-hidden aspect-square"
              >
                <div className="h-3/4 bg-cover bg-center"></div>
                <div className="bg-gray-200 p-4">
                  <p className="text-sm">{todayDate}</p>
                  <h3 className="font-semibold">{`Post ${index + 1}`}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="my-56"></div>
    </>
  );
};

export default MainContent;
