import { LoaderCircle } from "lucide-react";

export default function Loading() {
  return (
    <div className="absolute w-screen h-screen top-0 left-0 flex items-center justify-center bg-slate-950 z-50">
      <LoaderCircle className=" animate-spin h-10 w-10" />
    </div>
);
}
