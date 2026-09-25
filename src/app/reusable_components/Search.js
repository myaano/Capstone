"use client";

import { useEffect, useState } from "react";

export default function Search() {
  // search fetch useEffect

  // useEffect(() => {

  // }, []);
  return (
    <>
      <div className="flex flex-col gap-2 text-black">
        <h1 className="font-cormorant_infant text-2xl lg:text-5xl">Search :</h1>
        <input
          type="text"
          className="font-urbanist h-10 w-full rounded border border-black bg-white px-3"
          placeholder="Search in Repository"
        />
      </div>
    </>
  );
}
