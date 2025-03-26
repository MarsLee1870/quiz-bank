import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="p-8 space-y-10 text-center">
      {/* 自建題庫區塊 */}
      <div>
        <h2 className="text-2xl font-bold mb-4">自建題庫</h2>
        <div className="flex justify-center flex-wrap gap-4">
          <Link to="/grammar">
            <Button className="text-lg px-6 py-3">文法題庫</Button>
          </Link>
          <Link to="/vocabulary">
            <Button className="text-lg px-6 py-3">單字題庫</Button>
          </Link>
          <Button disabled className="text-lg px-6 py-3">
            閱讀題庫
          </Button>
        </div>
      </div>

      {/* AI 出題區塊 */}
      <div>
        <h2 className="text-2xl font-bold mb-4">AI 出題</h2>
        <div className="flex justify-center flex-wrap gap-4">
          <Link to="/vocabulary/ai">
            <Button className="text-lg px-6 py-3">單字選擇題</Button>
          </Link>
          <Button disabled className="text-lg px-6 py-3">
            閱讀測驗
          </Button>
        </div>
      </div>
    </div>
  );
}
