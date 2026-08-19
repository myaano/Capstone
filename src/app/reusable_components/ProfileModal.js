"use client";


import { useState } from "react";




export default function ProfileModal() {

  const [isOpen, setIsOpen] = useState(false);



  return (
    <>
      {/* dropdown container */}
      <div className="relative flex justify-center items-center">
        <div className="absolute min-w-28 bg-transparent text-white font-light  font-urbanist flex flex-col gap-7">
          <button
            className="flex justify-center items-center gap-2 bg-[#071437]"
            onClick={() => setIsOpen((prev) => !prev)}
          >
            {/* {user.name}*/}
            Admin
            <svg
              width="15"
              height="9"
              viewBox="0 0 15 9"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.65691 8.07112C7.04743 8.46164 7.6806 8.46164 8.07112 8.07112L14.4351 1.70716C14.8256 1.31664 14.8256 0.68347 14.4351 0.292946C14.0446 -0.0975785 13.4114 -0.0975785 13.0209 0.292946L7.36401 5.9498L1.70716 0.292946C1.31664 -0.0975785 0.68347 -0.0975785 0.292946 0.292946C-0.0975785 0.68347 -0.0975785 1.31664 0.292946 1.70716L6.65691 8.07112ZM7.36401 5.36401H6.36401V7.36401H7.36401H8.36401V5.36401H7.36401Z"
                fill="white"
              />
            </svg>
          </button>
          {/* dropdown content */}
          <div>
            {isOpen && (
              <div className="flex flex-col bg-[#071437] rounde-md">
                <button>Upload</button>
                <button>Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
