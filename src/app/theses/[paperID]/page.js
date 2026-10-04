// component import
import Header from "../../reusable_components/Header";
import Footer from "../../reusable_components/Footer";
import ViewTracker from "../../reusable_components/ViewTracker";
import PdfViewer from "../../reusable_components/PdfViewer";

// component import
import Link from "next/link";
//this whole page will be used for each individual paper UI
export default async function PaperDetails({ params, searchParams }) {
  const { paperID } = await params;
  const sp = await searchParams;
  const fromPage = sp?.page ?? "1";
  let data = null;
  //in the fetch get request here, make the fetch know which paper it will be in /thesis
  function fieldLabel(value) {
    if (value && typeof value === "object") return value.name ?? "";
    return value ?? "";
  }

  //this damn variable is for the damn link of a singular paper alone so that the user can view it
  const API_URL = "https://capstone-backend-1yta.onrender.com";

  try {
    //sample url only, put the real url of the api
    const response = await fetch(
      `${API_URL}/api/papers/${paperID}?paper_type=thesis`,
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

  // retrieve the data from backend using fetch here
  // store it in a variable, and display the data
  return (
    <div>
      <Header></Header>
      {/* client-side ping so this specific paper's view actually gets
          counted (session_id lives in the browser's localStorage) -
          renders nothing visually */}
      <ViewTracker paperId={data.id} />

      <div className="bg-white py-10">
        <div className="font-urbanist px-5 lg:px-10">
          <Link
            href={`/theses?page=${fromPage}`}
            className="flex w-fit cursor-pointer gap-2 border border-[#800000] bg-white p-2 text-[#800000] transition-colors duration-200 hover:bg-[#800000] hover:text-white"
          >
            Back &lt;-
          </Link>
        </div>
        <div className="flex min-h-screen flex-col bg-white py-10">
          <div className="flex flex-1 flex-col px-4 lg:px-10">
            <p className="font-bona_nova text-3xl text-[#242423]">
              {data.title}
            </p>
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
                    <p
                      className={`font-urbanist max-w[65ch] text-[1.1rem] wrap-break-word`}
                    >
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
                      <p className="font-semibold">College :</p>
                      <p>{fieldLabel(data.college)}</p>
                    </div>
                    <div className="">
                      <p className="font-semibold">Program :</p>
                      <p>{fieldLabel(data.program)}</p>
                    </div>
                    <div className="">
                      <p className="font-semibold">Campus Library :</p>
                      <p>{fieldLabel(data.campus)} Campus</p>
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
          <div className="mt-10 w-full px-10 lg:w-[55%]">
            <PdfViewer fileUrl={`${API_URL}/api/papers/${data.id}/file`} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
