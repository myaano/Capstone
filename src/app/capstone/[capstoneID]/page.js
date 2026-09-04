import Header from "../../reusable_components/Header";
export default async function CapstoneID({ params }) {
  const { paperID } = await params;

  let data = null;
  //in the fetch get request here, make the fetch know which paper it will be in /thesis

  try {
    //sample url only, put the real url of the api
    const response = await fetch(
      `https://application-production-cfb3.up.railway.app/api/papers/capstone/${paperID}`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      console.error(`Request failed: ${response.status}`);
      return <div>Paper not found.</div>;
    }

    data = await response.json();
  } catch (error) {
    console.error(error);
  }
  return (
    <div>
      <Header></Header>
      <div className="flex flex-col bg-white py-10">
        <div className="flex flex-1 flex-col px-4 lg:px-10">
          <p className="font-bona_nova text-3xl text-[#242423]">
            Level of technology implementation in the classroom as a predictor
            of students' achievement in English, Math, and Science{" "}
          </p>
          <div className="mt-5 flex flex-1 flex-col">
            <div className="lg:w-[55%]">
              <div className="pb-10">
                <p className="font-urbanist border-b border-black pb-2 font-semibold text-[#242423]">
                  Ronald U. Mendoza, Jurel K. Yap, Gabrielle Ann S. Mendoza,
                  Leonardo M. Jaminola III, and Erica Celine Yu
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-10 lg:flex lg:flex-row lg:gap-0">
              <div className="bg-[#800000] p-10 lg:w-[55%]">
                <div className="flex flex-col gap-6 text-white">
                  <p className="font-bona_nova_sc text-3xl leading-relaxed">
                    Summary
                  </p>
                  <p className={`font-urbanist max-w[65ch] text-[1.1rem]`}>
                    This study used implicit leadership theory (ILT) as a lens
                    for understanding corruption from the perspective of
                    followers and in developing a model that describes the
                    relationship among followers’ schema congruence with corrupt
                    leadership, corruption tolerance, and subsequent work
                    outcomes. Factors that describe characteristics of corrupt
                    leadership were identified through interviews with eight
                    employees and middle managers from different government and
                    business sectors. A survey questionnaire was developed from
                    the qualitative data and administered to 114 Filipino
                    employees. Structural equation modeling (SEM) was used to
                    confirm the hypothesized relationships among the variables.
                    Qualitative results suggest that followers characterize
                    corrupt leadership as selfish, unethical, and discreetly
                    manipulative, but tolerate this for various reasons such as
                    the fear of retaliation and personally benefiting from
                    corruption. Quantitative findings indicate that followers’
                    corruption tolerance mediates the relationship between
                    experiences of corrupt leadership and workplace outcomes.
                    Followers who perceive greater corruption in their leaders
                    and are more tolerant of corruption have negative attitudes
                    toward their jobs and teams. The study highlights the need
                    for organizations to monitor corruption among their
                    leadership, establish feedback processes, and implement
                    organizational mechanisms to address corrupt practices and
                    attitudes. Leadership training and employee development
                    programs that consider the influence of cultural norms on
                    corruption tolerance and reporting as well as clearly
                    describe ethical behavior may aid in reducing corruption
                    tolerance and enhancing integrity in the workplace.
                  </p>
                </div>
              </div>
              <div className="font-urbanist flex flex-1 gap-5 px-5 text-[#242423]">
                <div className="flex flex-1 flex-col gap-5">
                  <div className="">
                    <p className="font-semibold">Document Type :</p>
                    <p className="">Thesis</p>
                  </div>
                  <div className="">
                    <p className="font-semibold">Department :</p>
                    <p>College of Information and Communications Technology</p>
                  </div>
                  <div className="">
                    <p className="font-semibold">Program :</p>
                    <p>Bachelor of Science in Information Technology</p>
                  </div>
                  <div className="">
                    <p className="font-semibold">Campus Library :</p>
                    <p>Bulan Campus</p>
                  </div>
                  <div className="">
                    <p className="font-semibold">Year :</p>
                    <p>2023</p>
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
