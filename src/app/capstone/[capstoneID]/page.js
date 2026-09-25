import Header from "../../reusable_components/Header";
import Footer from "../../reusable_components/Footer";
import Link from "next/link";

export default async function CapstoneID({ params, searchParams }) {
  const { capstoneID } = await params;
  // the listing page puts ?page=N on the link to this paper, so Back can
  // return to the same pagination page instead of resetting to page 1
  const sp = await searchParams;
  const fromPage = sp?.page ?? "1";

  function fieldLabel(value) {
    if (value && typeof value === "object") return value.name ?? "";
    return value ?? "";
  }

  //this damn variable is for the damn link of a singular paper alone so that the user can view it
  const API_URL = "https://application-production-cfb3.up.railway.app";

  let data = null;
  //in the fetch get request here, make the fetch know which paper it will be in /thesis

  try {
    //sample url only, put the real url of the api
    const response = await fetch(
      `${API_URL}/api/papers/${capstoneID}?paper_type=capstone`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      console.error(`Request failed: ${response.status}`);
      return <div>Paper not found.</div>;
    }

    data = await response.json();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
  return (
    <div>
      <Header></Header>
      <div className="bg-white py-10">
        <div className="font-urbanist px-5 lg:px-10">
          <Link
            href={`/capstone?page=${fromPage}`}
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
                      Summary
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
                    <div>
                      <p className="font-semibold">File:</p>
                      <p>
                        <a
                          href={`${API_URL}/storage/${data.file_url}`}
                          className="text-[#0000EE] underline"
                        >
                          View
                        </a>
                      </p>
                    </div>
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
