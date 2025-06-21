"use client";

import dynamic from "next/dynamic";

const BlogTour = dynamic(() => import("./BlogTour"), { ssr: false });

export default BlogTour;
