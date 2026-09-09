// component import
import Header from "../../reusable_components/Header";
import Footer from "../../reusable_components/Footer";
// component import

//this whole page will be used for each individual paper UI
export default async function PaperDetails({ params }) {
  const { paperID } = await params;
  let data = null;
  //in the fetch get request here, make the fetch know which paper it will be in /thesis

  //this damn variable is for the damn link of a singular paper alone so that the user can view it
  const API_URL = "https://application-production-cfb3.up.railway.app";

  try {
    //sample url only, put the real url of the api
    const response = await fetch(
      `https://application-production-cfb3.up.railway.app/api/papers/thesis/${paperID}`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Request failed: ${response.status}  - ${errText}`);
      return <div className="text-black">Paper not found.</div>;
    }

    data = await response.json();
    console.log(data.file_url);
  } catch (error) {
    console.error(error);
  }

  //continue the codeblock ^^^ above after the api route is done.

  // retrieve the data from backend using fetch here
  // store it in a variable, and display the data
  return (
    <div>
      <Header></Header>
      <div className="flex min-h-screen flex-col bg-white py-10">
        <div className="flex flex-1 flex-col px-4 lg:px-10">
          <p className="font-bona_nova text-3xl text-[#242423]">{data.title}</p>
          <div className="mt-5 flex flex-1 flex-col">
            <div className="lg:w-[55%]">
              <div className="pb-10">
                <p className="font-urbanist border-b border-black pb-2 font-semibold text-[#242423]">
                  {data.researchers}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-start gap-10 lg:flex lg:flex-row lg:gap-0">
              <div className="bg-[#800000] p-10 lg:w-[55%]">
                <div className="flex flex-col gap-6 text-white">
                  <p className="font-bona_nova_sc text-3xl leading-relaxed">
                    Abstract
                  </p>
                  <p className={`font-urbanist max-w[65ch] text-[1.1rem]`}>
                    {data.abstract}
                  </p>
                </div>
              </div>
              <div className="font-urbanist flex flex-1 gap-5 px-5 text-[#242423]">
                <div className="grid grid-cols-2 gap-5 text-xl">
                  <div className="">
                    <p className="font-semibold">Document Type :</p>
                    <p className="">
                      {data.paper_type
                        ? data.paper_type.charAt(0).toUpperCase() +
                          data.paper_type.slice(1)
                        : ""}
                    </p>
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
                  <div>
                    <p className="font-semibold">File:</p>
                    <p>
                      <a href={`${API_URL}/storage/${data.file_url}`}>
                        Download?
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
