import Header from "../../reusable_components/Header";
import Footer from "../../reusable_components/Footer";
import PaperView from "../../reusable_components/PaperView";

export default async function CapstoneID({ params, searchParams }) {
  const { capstoneID } = await params;
  // the listing page puts ?page=N on the link to this paper, so Back can
  // return to the same pagination page instead of resetting to page 1
  const sp = await searchParams;
  const fromPage = sp?.page ?? "1";

  const API_URL = "https://capstone-backend-1yta.onrender.com";

  return (
    <div>
      <Header></Header>
      {/* The paper is fetched inside PaperView, in the browser, so the request
          can carry the login token (this server component can't read it).
          Laravel then knows who is asking and applies the campus policy. */}
      <PaperView
        paperId={capstoneID}
        paperType="capstone"
        apiUrl={API_URL}
        backHref={`/capstone?page=${fromPage}`}
      />
      <Footer />
    </div>
  );
}
