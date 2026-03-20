import { redirect } from "next/navigation";

/** Redirect to unified create/tailor flow. */
export default function NewResumePage() {
  redirect("/resumes/tailor");
}
