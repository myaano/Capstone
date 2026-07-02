

//react imports
import { useEffect, useState } from "react";
//react imports



export default function Filter() {
  // retrieve data and insert it into FilterOptions
  // useEffect(() => { }, [])
  // retrieve data and insert it into FilterOptions

  const FilterOptions = {};

  return (
    <div className="bg-blue-300 flex-1 gap-2 ">
      <div className="flex justify-between font-urbanist bg-red-400">
        <span className="text-xl bg-amber-400">Filter :</span>
        <button className="bg-blue-900 border border-[#071437] px-4">
          Reset
        </button>
      </div>
      <div className="bg-red-500">wd</div>
    </div>
  );
}
