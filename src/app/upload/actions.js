"use server";

export async function submitUpload(prevState, formData) {
  //retrieve data//retrieve data//retrieve data//retrieve data
  const file = formData.get("file");
  const abstract = formData.get("abstract/summary")?.toString().trim() || "";
  const title = formData.get("title")?.toString().trim() || "";
  const researchers = formData.get("researchers")?.toString().trim() || "";
  const campus = formData.get("campus")?.toString().trim() || "";
  const department = formData.get("department")?.toString().trim() || "";
  const course = formData.get("course")?.toString().trim() || "";
  const year = formData.get("year")?.toString().trim() || "";
  const fileType = formData.get("paperType")?.toString().trim() || "";
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
  if (!campus) errors.campus = "Campus is required.";
  if (!department) errors.department = "Department is required.";
  if (!course) errors.course = "Course is required.";
  if (!year) errors.year = "Year is required.";
  if (!fileType) errors.fileType = "Paper type is required.";

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: "Please complete the required fields before uploading.",
      errors,
    };
  }
  //error validations //error validations //error validations //error validations

  //puts data into a submittion body
  const uploadData = new FormData();
  uploadData.append("file", file);
  uploadData.append("abstract", abstract);
  uploadData.append("title", title);
  uploadData.append("researchers", researchers);
  uploadData.append("campus", campus);
  uploadData.append("department", department);
  uploadData.append("course", course);
  uploadData.append("year", year);
  uploadData.append("paperType", fileType);

  // fix this variable next time and attach link it to a true env file variable
  const uploadUrl = process.env.NEXT_PUBLIC_API_URL;
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
