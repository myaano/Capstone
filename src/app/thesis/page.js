"use client";

// component import
import Header from "../reusable_components/Header";
import Filter from "../reusable_components/Filter";
// component import

//next import
import Link from "next/link";
// next import

// in this page the retrieval of data will happen and this will be full of javascript and react components
export default function Thesis() {
  return (
    <>
      <Header></Header>
      <div className="bg-amber-900 h-150 px-10 pt-10">
        <div className="bg-pink-400 h-120 flex flex-col ">
          <div className="bg-[#800000] font-bona_nova_sc text-4xl px-5 py-5">
            Thesis Papers
          </div>
          {/* this div will contain both the divs for filter and the papers for pagination */}
          <div className="flex bg-red-400 flex-1 mt-5">
            <div className="bg-green-200 w-70 pr-5 flex flex-col border-r border-black">
              <Filter></Filter>
            </div>
            <div className="bg-blue-500 flex-1">bgf</div>
          </div>
          {/* this div will contain both the divs for filter and the papers for pagination */}
        </div>
      </div>
    </>
  );
}
