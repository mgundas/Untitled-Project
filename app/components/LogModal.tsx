import { addWin } from "../actions";
import { Timer, Zap } from "lucide-react";

type Props = {
    action: (formData: FormData) => Promise<void>;
};

const LogModal = ({ action }: Props) => {
  return (
    <form action={action} className="flex flex-col flex-wrap gap-5">
      <div className="space-y-4 flex flex-col">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] px-1">
          Type
        </label>
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="radio"
              id="release"
              name="type"
              value="release"
              className="peer hidden"
              defaultChecked
            />
            <label
              htmlFor="release"
              className="flex-1 py-5 text-slate-500 rounded-[2.5rem] text-sm font-black flex items-center justify-center gap-3 transition-all peer-checked:bg-fuchsia-600 peer-checked:text-white peer-checked:shadow-2xl peer-checked:shadow-fuchsia-900/40"
            >
              <Zap size={20} fill="currentColor" />
              Release
            </label>
          </div>
          <div className="flex-1">
            <input
              type="radio"
              id="edging"
              name="type"
              value="edging"
              className="peer hidden"
            />
            <label
              htmlFor="edging"
              className="flex-1 py-5 text-slate-500 rounded-[2.5rem] text-sm font-black flex items-center justify-center gap-3 transition-all peer-checked:bg-fuchsia-600 peer-checked:text-white peer-checked:shadow-2xl peer-checked:shadow-fuchsia-900/40"
            >
              <Timer size={20} />
              Edging
            </label>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] px-1">
          Satisfaction Peak (1-10)
        </label>
        <input
          type="range"
          name="sessionIntensity"
          id=""
          min={1}
          max={10}
          className="w-full accent-fuchsia-600 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-[10px] font-black text-slate-600 mt-4 uppercase">
          <span>Warm</span>
          <span>Peak</span>
        </div>
      </div>
      <div className="flex gap-4">
        <input
          type="date"
          defaultValue={new Date().toISOString().split("T")[0]}
          name="date"
          id=""
          className="bg-slate-800/50 rounded-4xl text-sm p-5 outline-none focus:ring-1 focus:ring-fuchsia-500 text-white font-bold w-full"
        />
        <input
          type="time"
          defaultValue={new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })}
          name="time"
          id=""
          className="bg-slate-800/50 rounded-4xl text-sm p-5 outline-none focus:ring-1 focus:ring-fuchsia-500 text-white font-bold w-full"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] px-1">
          Duration
        </label>
        <input
          type="number"
          defaultValue={15}
          name="duration"
          id=""
          className="w-full bg-slate-800/50 rounded-[2.5rem] p-5 text-sm outline-none focus:ring-1 focus:ring-fuchsia-500 text-white font-black"
          min={1}
        />
      </div>
      <button className="hover:scale-103 py-5 rounded-[2.5rem] text-sm font-bold flex items-center justify-center gap-3 transition-all bg-fuchsia-600 text-white shadow-2xl shadow-fuchsia-900/40">
        Confirm Session
      </button>
    </form>
  );
};

export default LogModal;
