// import React from "react";
// import Image from "next/image";

// const Comment = ({}) => {
//   return (
//     <div className="space-y-4">
//       {/* 사용자의 댓글 */}
//       {comments
//         .filter((comment) => comment.lan === lan)
//         .map((comment) => {
//           if (comment._id === editingCommentId) {
//             return <div key={index}>comment._id랑 editingCommentId랑 같음</div>;
//           } else {
//             return <div key={index}>comment._id랑 editingCommentId랑 다름</div>;
//           }
//         })}

//       {/* 댓글 달기 */}
//       <div className="flex items-start mt-4">
//         {isLoggedOut ? (
//           <button className="border border-gray-300 dark:border-transparent rounded-full bg-white dark:bg-black p-2 overflow-hidden">
//             <svg
//               className="h-6 w-6 dark:fill-current dark:text-white"
//               aria-hidden="true"
//               xmlns="http://www.w3.org/2000/svg"
//               width="24"
//               height="24"
//               fill="none"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 stroke="currentColor"
//                 strokeWidth="2"
//                 d="M7 17v1a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1a3 3 0 0 0-3-3h-4a3 3 0 0 0-3 3Zm8-9a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
//               />
//             </svg>
//           </button>
//         ) : (
//           <button className="rounded-full overflow-hidden transition-opacity duration-300">
//             {photo ? (
//               <Image
//                 src={photo}
//                 alt="Profile Image"
//                 width={100}
//                 height={100}
//                 className="w-10 h-10 object-cover"
//               />
//             ) : (
//               <div className="w-7 h-7 flex justify-center items-center"></div>
//             )}
//           </button>
//         )}

//         <div className="flex flex-col w-full">
//           <div className="relative bg-gray-200 dark:bg-neutral-700 rounded-lg p-3 mx-3 flex-grow">
//             <textarea
//               className="w-full h-full bg-gray-200 dark:bg-neutral-700 rounded-md text-lg dark:text-white leading-relaxed mb-14 p-2 resize-none"
//               rows={4}
//               placeholder={
//                 lan === "ja"
//                   ? "ここにコメントを書いてください。"
//                   : "회원님의 댓글을 여기에 작성해 주세요."
//               }
//               value={commentContent}
//               onChange={(e) => setCommentContent(e.target.value)}
//             ></textarea>
//             <div className="absolute right-3 bottom-5">
//               <button
//                 className="bg-transparent hover:bg-transparent py-2 px-4 rounded transition duration-300 ease-in-out"
//                 onClick={handleCreateComment}
//               >
//                 <svg
//                   className="w-6 h-6 text-gray-800 dark:text-white"
//                   aria-hidden="true"
//                   xmlns="http://www.w3.org/2000/svg"
//                   width="24"
//                   height="24"
//                   fill="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     fillRule="evenodd"
//                     d="M12 2a1 1 0 0 1 .932.638l7 18a1 1 0 0 1-1.326 1.281L13 19.517V13a1 1 0 1 0-2 0v6.517l-5.606 2.402a1 1 0 0 1-1.326-1.281l7-18A1 1 0 0 1 12 2Z"
//                     clipRule="evenodd"
//                   />
//                 </svg>
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Comment;
