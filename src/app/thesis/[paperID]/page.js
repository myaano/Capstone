// component import
import Header from "../../reusable_components/Header";
// component import

//this whole page will be used for each individual paper UI
export default async function PaperDetails({ params }) {
  const { paperID } = await params;
  let data = null;
  //in the fetch get request here, make the fetch know which paper it will be in /thesis

  try {
    //sample url only, put the real url of the api
    const response = await fetch(`http://192.168.1.34:8000/api/papers/thesis/${paperID}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(`Request failed: ${response.status}`);
    return <div>Paper not found.</div>;
    }

    data = await response.json();
  } catch (error) {
    console.error(error);
  }


  //continue the codeblock ^^^ above after the api route is done.

  // retrieve the data from backend using fetch here
  // store it in a variable, and display the data
  return (
    <div>
      <Header></Header>
      <div className="bg-white min-h-screen  py-10 flex flex-col">
        <div className="flex flex-col flex-1 px-4 lg:px-10">
          <p className="font-bona_nova text-3xl text-[#242423]">{data.title}</p>
          <div className=" flex flex-col flex-1 mt-5">
            <div className=" lg:w-[55%]">
              <div className=" pb-10">
                <p className="font-urbanist font-semibold border-b border-black pb-2 text-[#242423] ">
                  {data.researchers}
                </p>
              </div>
            </div>
            <div className=" flex flex-col gap-10 lg:gap-0 lg:flex lg:flex-row ">
              <div className="bg-[#800000] lg:w-[55%] p-10 ">
                <div className="flex flex-col gap-6 text-white">
                  <p className="text-3xl font-bona_nova_sc leading-relaxed">
                    Abstract
                  </p>
                  <p className={`font-urbanist text-[1.1rem] max-w[65ch]  `}>
                    {data.abstract}
                  </p>
                </div>
              </div>
              <div className="flex flex-1 px-5  gap-5 font-urbanist text-[#242423]">
                <div className=" flex flex-col gap-5  flex-1">
                  <div className="">
                    <p className="font-semibold">Document Type :</p>
                    <p className="">{data.paper_type}</p>
                  </div>
                  <div className="">
                    <p className="font-semibold">Department :</p>
                    <p>{data.department}</p>
                  </div>
                  <div className="">
                    <p className="font-semibold">Program :</p>
                    <p>{data.course}</p>
                  </div>
                  <div className="">
                    <p className="font-semibold">Campus Library :</p>
                    <p>{data.campus} Campus</p>
                  </div>
                  <div className="">
                    <p className="font-semibold">Year :</p>
                    <p>{data.year}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
