import Image from "next/image";
import Rizal from "../../../public/Rizal.jpg";

export default function Login() {
  return (
    <div className="h-screen bg-[#800000] px-10 py-12">
      <div className="h-full rounded-2xl flex bg-gray-400">
        <div className="bg-green-500 overflow-hidden rounded-l-2xl w-[60%] hidden lg:block relative">
          <div className="absolute h-full w-full">
            <Image
              src={Rizal}
              alt="BackgroundPhoto"
              fill={true}
              loading="eager"
              sizes="(max-width: 768px) 100vw"
              style={{ filter: "brightness(60%)" }}
            />
          </div>
          <div className="font-urbanist z-10 absolute pl-5 bottom-20 select-none text-white ">
            <p className="text-5xl font-semibold ">
              If Knowledge is the heritage of mankind, only the brave inherit
              it.
            </p>
            <p className="text-2xl font-light">— Jose Rizal, Noli Me Tangere</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl lg:rounded-r-2xl lg:rounded-l-none flex justify-center items-center flex-1 px-2 lg:px-10">
          <div className=" h-[50%] lg:h-[60%] w-[90%] flex flex-col">
            <div className="">
              <div className="bg-white border border-[#363633]  rounded-[10px] w-10 h-10 inline-flex justify-center items-center">
                <svg
                  width="23"
                  height="21"
                  viewBox="0 0 23 21"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14.25 0.5H19.25C20.6308 0.5 21.75 1.61929 21.75 3V18C21.75 19.3807 20.6308 20.5 19.25 20.5H14.25M15.5 10.5H0.5M10.5 5.5L15.5 10.5L10.5 15.5"
                    stroke="#515050"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="font-urbanist text-[14px] my-1  text-[#999595] select-none">
                SORSOGON STATE UNIVERSITY
              </p>
              <div className="inline-flex flex-col gap-1">
                <p className="font-cormorant_infant text-5xl leading-none text-[#363633] select-none">
                  Login
                </p>
                <p className="font-urbanist text-[14px] text-[#363633] select-none">
                  Enter Username and Password to login
                </p>
              </div>
            </div>
            <form
              action=""
              className="font-urbanist flex flex-1 flex-col  pt-7 lg:justify-end gap-7 "
            >
              {/*UsernameCONTAINER */}
              <div className="flex flex-col">
                <p className="leading-none text-[#363633] select-none">
                  Username
                </p>
                <input
                  placeholder="Username"
                  type="text"
                  className="bg-[#fffff6] border border-[#242423] rounded-lg px-2 py-1 placeholder:text-[#999595] text-[#363633]"
                />
              </div>
              {/*UsernameCONTAINER */}
              {/*PasswordContainer */}
              <div className="flex flex-col">
                <p className="leading-none text-[#363633] select-none">
                  Password
                </p>
                <input
                  placeholder="Password"
                  type="password"
                  className="bg-[#fffff6] border border-[#363633] rounded-lg px-2 py-1 outline-[#363633] placeholder:text-[#999595] text-[#363633]"
                />
              </div>
              {/*PasswordContainer */}
              <button className="bg-[#071437] text-xl p-2 rounded-xl ">
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
