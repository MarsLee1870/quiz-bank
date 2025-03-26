import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// 文法分類資料（大類 + 小類）
const rawCategories = `時態	現在簡單式
時態	現在進行式
時態	現在完成式
時態	現在完成進行式
時態	過去簡單式
時態	過去式動詞規則變化
時態	過去式動詞不規則變化
時態	過去進行式
時態	過去完成式
時態	過去完成進行式
時態	未來簡單式
時態	be going to 和 willl
時態	未來進行式
時態	未來完成式
時態	混合時態
不定詞與動名詞	不定詞用法
不定詞與動名詞	動名詞用法
不定詞與動名詞	不定詞與動名詞比較
不定詞與動名詞	stop / remember / forget / try等 + V-ing / to V 差異
不定詞與動名詞	作主詞
不定詞與動名詞	作受詞
不定詞與動名詞	作補語
被動語態	現在簡單式被動
被動語態	過去簡單式被動
被動語態	現在完成式被動
被動語態	進行式被動
被動語態	被動語態句型變化
被動語態	情態助動詞的被動
被動語態	省略 by-phrase
被動語態	used to 和 be used to的用法
情態助動詞	表示可能性
情態助動詞	表示允許
情態助動詞	表示義務
情態助動詞	表示禮貌提問
情態助動詞	can / could
情態助動詞	may / might
情態助動詞	shall / should
情態助動詞	will / would
情態助動詞	must / have to
情態助動詞	had better
情態助動詞	ought to
名詞	可數 / 不可數名詞
名詞	單複數變化
名詞	專有名詞與普通名詞
名詞	抽象名詞與具體名詞
名詞	集合名詞（family, team 等）
名詞	複合名詞（e.g. toothpaste, son-in-law）
名詞	所有格名詞（’s / of）
名詞	it 的常見句型（It is + adj. to V / It takes...）
名詞	there is / there are 句型
名詞	名詞作主詞 / 受詞 / 補語
代名詞	主格 / 受格
代名詞	所有格 / 所有格代名詞（my vs mine）
代名詞	反身代名詞（myself, themselves）
代名詞	不定代名詞（someone, anything, none）
代名詞	指示代名詞（this, that, these, those）
代名詞	疑問代名詞（who, whom, whose, what, which）
代名詞	one / ones / another / the other / others 的用法
代名詞	each / every / all / both / either / neither 的用法
代名詞	it / this / that 作虛主詞或語境指代
冠詞	定冠詞 the
冠詞	不定冠詞 a / an
冠詞	零冠詞（no article）
冠詞	冠詞用法差異（如 the school vs school）
主詞與動詞	be動詞的用法
主詞與動詞	主動詞一致性
形容詞與副詞	用形容詞作為修飾語
形容詞與副詞	用副詞作為修飾語
形容詞與副詞	名詞修飾名詞
形容詞與副詞	複合形容詞(如hand-made, time,saving)
形容詞與副詞	形容詞位置
形容詞與副詞	副詞位置
形容詞與副詞	形容詞與副詞搭配句型
同級比較級最高級	形容詞與副詞的三級
同級比較級最高級	原級比較（as...as）
同級比較級最高級	比較級（-er / more）
同級比較級最高級	最高級（-est / most）
同級比較級最高級	倍數比較（twice as...as）
同級比較級最高級	比較級句型
介系詞	時間介系詞（in/on/at）
介系詞	地方介系詞（in/on/at/by/under...）
介系詞	動詞搭配介系詞
介系詞	形容詞與分詞搭配介系詞
連接詞	對等連接詞（and, but, or）
連接詞	從屬連接詞（because, although, if, when）
連接詞	從屬連接詞（no matter）
連接詞	連接副詞（however, therefore）
連接詞	連接詞與介系詞辨識（如 because / because of）
連接詞	句型連接詞辨析
名詞子句	that 引導的名詞子句
名詞子句	if / whether 引導的名詞子句
名詞子句	疑問詞引導的名詞子句（what, where, who）
名詞子句	疑問詞引導的名詞子句搭配不定詞（what to do）
名詞子句	名詞子句作主詞
名詞子句	名詞子句作受詞
名詞子句	名詞子句作補語
形容詞子句	關係代名詞（who, whom, which, that）
形容詞子句	關係代名詞that使用時機
形容詞子句	關係副詞（where, when, why）
形容詞子句	先行詞省略
形容詞子句	限定與非限定
形容詞子句	形容詞子句簡化為分詞片語
形容詞子句	複合關係代名詞 (whoever, whatever等)
分詞	分詞作為形容詞
分詞	分詞作為受詞補語
分詞	分詞構句 (分詞作為副詞子句的簡化)
分詞	分詞與關係子句轉換
問句	Yes/No問句
問句	疑問詞問句
問句	附加問句
問句	Who 開頭問句
問句	Whom 開頭問句
問句	Whose 開頭問句
問句	What 開頭問句
問句	Which 開頭問句
問句	When 開頭問句
問句	Where 開頭問句
問句	Why 開頭問句
問句	How 開頭問句
問句	How much 開頭問句
問句	How many 開頭問句
問句	How long 開頭問句
問句	How often 開頭問句
問句	How far 開頭問句
問句	How old 開頭問句
問句	How come 開頭問句
問句	主詞 vs 受詞問句
倒裝句	部分否定開頭（Not only...）
倒裝句	Only的倒裝
倒裝句	程度副詞開頭（So, Such）
倒裝句	條件省略倒裝（Had I known...）
倒裝句	地方副詞倒裝
倒裝句	neither/nor/so 的倒裝
倒裝句	否定副詞倒裝（Rarely / Never）
假設語氣	可能發生或必然發生的條件句
假設語氣	與現在事實相反
假設語氣	與過去事實相反
假設語氣	與未來事實相反
假設語氣	混合時態假設
假設語氣	without / but for的用法
假設語氣	should的用法
假設語氣	wish的用法
其他特殊動詞用法	使役動詞（make, let, have）和get
其他特殊動詞用法	感官動詞（see, hear, feel）
其他特殊動詞用法	原形與分詞搭配
其他特殊動詞用法	help 的用法
其他特殊動詞用法	spent/take/cost表示花費
其他特殊動詞用法	find/consider...+O+OC
其他特殊動詞用法	感嘆句
其他特殊動詞用法	強調句
其他特殊動詞用法	表命令/建議/強迫/禁止等動詞與形容詞+that子句`;

const parsedCategories = rawCategories.split("\n").reduce((acc, line) => {
  const [main, sub] = line.split("\t");
  if (!acc[main]) acc[main] = [];
  acc[main].push(sub);
  return acc;
}, {});

const GrammarFilterPage = () => {
  const navigate = useNavigate();
  const [selectedSubs, setSelectedSubs] = useState([]); // 這段暫時保留
  const [selectedDifficulty, setSelectedDifficulty] = useState("中");

  const handleSubmit = () => {
    const query = new URLSearchParams({
      subs: JSON.stringify(selectedSubs),
      difficulty: selectedDifficulty,
    }).toString();
    navigate(`/grammar/questions?${query}`);
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* 🔙 固定左上角返回按鈕 */}
<div className="fixed top-4 left-4 z-50">
  <Button variant="outline" onClick={() => navigate("/")}>
    返回首頁
  </Button>
</div>
      <h1 className="text-2xl font-bold">文法題庫篩選</h1>
      {Object.entries(parsedCategories).map(([main, subs]) => (
  <div key={main} className="border rounded-lg shadow-sm p-4">
    <h2 className="font-semibold text-lg mb-2">{main}</h2>
    <div className="flex flex-wrap gap-4">
      {subs.map((sub) => (
        <label key={sub} className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={selectedSubs.includes(sub)}
            onChange={() =>
              setSelectedSubs((prev) =>
                prev.includes(sub)
                  ? prev.filter((s) => s !== sub)
                  : [...prev, sub]
              )
            }
          />
          <span>{sub}</span>
        </label>
      ))}
    </div>
  </div>
))}
      {/* ✅ 難易度區塊 */}
      <div className="space-y-4">
        <h2 className="font-semibold text-lg">選擇難易度</h2>
        <div className="flex gap-4">
          {["低", "中", "高"].map((level) => (
            <Button
              key={level}
              variant="outline"
              onClick={() => setSelectedDifficulty(level)}
              className={cn(
                "px-6 py-2 text-base",
                selectedDifficulty === level && "bg-blue-600 text-white"
              )}
            >
              {level}
            </Button>
          ))}
        </div>
      </div>

      {/* ✅ 出題按鈕 */}
      <div className="mt-8">
        <Button
          className="w-full text-lg py-6 bg-green-600 hover:bg-green-700 text-white"
          onClick={handleSubmit}
        >
          開始出題
        </Button>
      </div>
    </div>
  );
};

export default GrammarFilterPage;

