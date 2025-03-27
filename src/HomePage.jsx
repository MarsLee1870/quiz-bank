import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function HomePage() {
  // 阻止尚未建置按鈕跳轉
  const handleNotReady = () => {
    // 你也可以加 toast 提示：功能尚未開放
    console.log("此功能尚未開放");
  };

  return (
    <div className="min-h-screen bg-gray-800 text-gray-100 p-8 space-y-16">
  {/* 自建題庫 */}
  <div className="text-center">
    <h2 className="text-5xl font-bold mb-8 tracking-wide">📘自建題庫</h2>
    <div className="flex justify-center flex-wrap gap-4">
      <Link to="/grammar">
        <Button className="w-40 text-xl px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white shadow rounded">
          文法題庫
        </Button>
      </Link>
      <Link to="/vocabulary">
        <Button className="w-40 text-xl px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white shadow rounded">
          單字題庫
        </Button>
      </Link>
      <Button
        onClick={handleNotReady}
        className="w-40 text-xl px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white shadow rounded"
      >
        閱讀題庫
      </Button>
    </div>
  </div>

  {/* AI 出題 */}
  <div className="text-center">
    <h2 className="text-5xl font-bold mb-8 tracking-wide">🤖AI 出題</h2>
    <div className="flex justify-center flex-wrap gap-4">
      <Button
        onClick={handleNotReady}
        className="w-40 text-xl px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white shadow rounded"
      >
        文法題
      </Button>
      <Link to="/vocabulary/ai">
        <Button className="w-40 text-xl px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white shadow rounded">
          單字選擇題
        </Button>
      </Link>
      <Button
        onClick={handleNotReady}
        className="w-40 text-xl px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white shadow rounded"
      >
        閱讀測驗
      </Button>
    </div>
  </div>
</div>

  );
}
