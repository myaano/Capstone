//next imports
import Image from "next/image";
import Link from "next/link";
//next improts

export default function Header() {
  return (
    <div className=" bg-white flex justify-between">
      <div className="bg-[#800000] w-[55%] flex pl-10 py-4 items-center gap-4 font-bona_nova_sc">
        <div className="bg-green-200 w-13 h-13 rounded-full"></div>
        <p className="flex flex-col sm:flex-row sm:gap-2 lg:text-4xl">
          <span>Sorsogon</span>
          <span>State</span>
          <span>University</span>
        </p>
      </div>

      <div className=" lg:w-[25%] font-urbanist">
        <div className="bg-[#071437]  flex p-4 justify-center items-center">
          <button className=" inline-flex justify-center items-center  border-r border-white pr-4 gap-2 lg:text-2xl cursor-pointer">
            <svg
              width="26"
              height="26"
              viewBox="0 0 26 26"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10.7879 20.2424C16.0095 20.2424 20.2424 16.0095 20.2424 10.7879C20.2424 5.56626 16.0095 1.33331 10.7879 1.33331C5.56626 1.33331 1.33331 5.56626 1.33331 10.7879C1.33331 16.0095 5.56626 20.2424 10.7879 20.2424Z"
                stroke="white"
                strokeWidth="2.66667"
                strokeLinejoin="round"
              />
              <path
                d="M24.0917 25.1204C24.3758 25.4043 24.8363 25.4043 25.1204 25.1204C25.4043 24.8363 25.4043 24.3758 25.1204 24.0917L24.0917 25.1204ZM25.1204 24.0917L17.8476 16.819L16.819 17.8476L24.0917 25.1204L25.1204 24.0917Z"
                fill="white"
              />
            </svg>
            Search
          </button>
          <button className="px-4 lg:text-2xl  cursor-pointer">Login</button>
        </div>
      </div>
      
    </div>
  );
}
