import Link from "next/link";

// 首页
export default function Home() {
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-xl font-semibold">易宿酒店</h1>
      <Link
        href={`/hotels?check_in=${today}&check_out=${tomorrow}`}
        className="mt-4 inline-block px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm"
      >
        浏览酒店
      </Link>
    </div>
  );
}
