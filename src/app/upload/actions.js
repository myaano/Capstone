export async function submitUpload(_prevState, formData) {
  //token
  const token = formData.get("token")?.toString().trim() || "";

  if (!token) {
    return {
      success: false,
      message: "You must be logged in as an admin to upload.",
      errors: {},
    };
  }

  //retrieve data//retrieve data//retrieve data//retrieve data
  const file = formData.get("file");
  const abstract = formData.get("abstract/summary")?.toString().trim() || "";
  const title = formData.get("title")?.toString().trim() || "";
  const researchers = formData.get("researchers")?.toString().trim() || "";
  const campus = formData.get("campus")?.toString().trim() || "";
  const department = formData.get("department")?.toString().trim() || "";
  const course = formData.get("course")?.toString().trim() || "";
  const campus_id = formData.get("campus_id")?.toString().trim() || "";
  const college_id = formData.get("college_id")?.toString().trim() || "";
  const program_id = formData.get("program_id")?.toString().trim() || "";
  const year = formData.get("year")?.toString().trim() || "";
  const paper_type =
    formData.get("paper_type")?.toLowerCase().toString().trim() || "";
  const category = formData.get("category")?.toString().trim() || "";
  const category_id = formData.get("category_id")?.toString().trim() || "";
  //retrieve data//retrieve data//retrieve data//retrieve data

  //error validations //error validations //error validations //error validations //error validations
  const errors = {};
  if (!file || typeof file === "string" || file.size === 0) {
    errors.file = "Please select a PDF file.";
  } else {
    const isPdfMimeType = file.type === "application/pdf";
    const isPdfExtension = file.name?.toLowerCase().endsWith(".pdf");

    if (!isPdfMimeType && !isPdfExtension) {
      errors.file = "Please upload a valid PDF file.";
    }
  }

  if (!abstract) errors.abstract = "Abstract/Summary is required.";
  if (!title) errors.title = "Title is required.";
  if (!researchers) errors.researchers = "Researchers are required.";
  if (!campus || !campus_id) errors.campus = "Campus is required.";
  if (!department || !college_id) errors.department = "Department is required.";
  if (!course || !program_id) errors.course = "Course is required.";
  if (!year) errors.year = "Year is required.";
  if (!paper_type) errors.paper_type = "Paper type is required.";
  if (!category || !category_id) errors.category = "Paper must be categorized.";

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: "Please complete the required fields before uploading.",
      errors,
    };
  }
  //error validations //error validations //error validations //error validations

  //who is uploading? Ask Laravel using the token: the campus fields in the form
  //can be edited in the browser, so a campus admin is checked against the
  //campus on their own account (the super admin may upload to any campus)
  let me = null;
  try {
    const meRes = await fetch(
      "https://capstone-backend-1yta.onrender.com/api/users",
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      },
    );
    if (meRes.ok) {
      const json = await meRes.json();
      me = json?.data ?? json?.user ?? json;
    }
  } catch {
    // handled just below
  }

  if (!me?.role) {
    return {
      success: false,
      message: "Could not confirm who is logged in. Please log in again.",
      errors: {},
    };
  }

  const isSuperAdmin = me.role === "super_admin";
  const isCampusAdmin = me.role === "campus_admin" || me.role === "admin";

  if (!isSuperAdmin && !isCampusAdmin) {
    return {
      success: false,
      message: "Only admins can upload papers.",
      errors: {},
    };
  }

  if (!isSuperAdmin) {
    const myCampusId = me.campus_id ?? me.campus?.id;
    if (myCampusId == null || String(myCampusId) !== campus_id) {
      return {
        success: false,
        message: "You can only upload papers to your own campus.",
        errors: { campus: "You can only upload to your own campus." },
      };
    }
  }

  //puts data into a submittion body
  const uploadData = new FormData();
  uploadData.append("file", file);
  uploadData.append("abstract", abstract);
  uploadData.append("title", title);
  uploadData.append("researchers", researchers);
  uploadData.append("campus_id", campus_id);
  uploadData.append("college_id", college_id);
  uploadData.append("program_id", program_id);
  uploadData.append("year", year);
  uploadData.append("paper_type", paper_type);
  uploadData.append("category_id", category_id);

  // fix this variable next time and attach link it to a true env file variable
  const uploadUrl = "https://capstone-backend-1yta.onrender.com/api/papers";
  // fix this variable next time and attach link it to a true env file variable

  //error val
  if (!uploadUrl) {
    return {
      success: false,
      message: "Upload endpoint is not configured.",
      errors: {},
    };
  }
  //error val

  //submits data using fetch//submits data using fetch//submits data using fetch//submits data using fetch
  try {
    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: uploadData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        message: errorText || "Failed to submit file.",
        errors: {},
      };
    }

    const result = await response.json().catch(() => null);

    return {
      success: true,
      message: "Upload Success",
      data: result,
      errors: {},
    };
  } catch (error) {
    return {
      success: false,
      message: "Network error while uploading file.",
      errors: {},
    };
  }
}
