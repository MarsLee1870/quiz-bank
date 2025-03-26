// predictGrammarTags.js

/**
 * 偵測題目中的語法結構，回傳對應文法標籤（小類）陣列
 * @param {string} text - 題目文字
 * @returns {string[]} - 推測的文法標籤
 */
export function predictGrammarTags(text) {
    const tags = [];
    const lower = text.toLowerCase();
  
    // ✅ 時態
    if (/\b(v|do|does)\b/.test(lower)) tags.push("現在簡單式");
    if (/\bis|am|are\b.*\b\w+ing\b/.test(lower)) tags.push("現在進行式");
    if (/\b(has|have)\b.*\b\w+ed\b/.test(lower)) tags.push("現在完成式");
    if (/\b(has|have) been\b.*\b\w+ing\b/.test(lower)) tags.push("現在完成進行式");
    if (/\b(v2|did|was|were)\b/.test(lower)) tags.push("過去簡單式");
    if (/\b\w+(ed)\b/.test(lower)) tags.push("過去式動詞規則變化");
    if (/\b(went|ate|took|saw|gave|had|ran|wrote|made|spoke)\b/.test(lower)) tags.push("過去式動詞不規則變化");
    if (/\bwas|were\b.*\b\w+ing\b/.test(lower)) tags.push("過去進行式");
    if (/\bhad\b.*\b\w+(ed|v3)\b/.test(lower)) tags.push("過去完成式");
    if (/\bhad been\b.*\b\w+ing\b/.test(lower)) tags.push("過去完成進行式");
    if (/\b(will|shall)\b.*\b\w+\b/.test(lower)) tags.push("未來簡單式");
    if (/\b(be going to|will)\b/.test(lower)) tags.push("be going to 和 willl");
    if (/\b(will be|shall be)\b.*\b\w+ing\b/.test(lower)) tags.push("未來進行式");
    if (/\b(will have|shall have)\b.*\b\w+(ed|v3)\b/.test(lower)) tags.push("未來完成式");
    if (tags.filter(tag => tag.includes("時態")).length > 1) tags.push("混合時態");
  
    // ✅ 不定詞與動名詞
    if (/\bto\s+\w+\b/.test(lower)) tags.push("不定詞用法");
    if (/\b\w+ing\b/.test(lower)) tags.push("動名詞用法");
    if (/\bto\s+\w+\b.*\w+ing|\w+ing.*to\s+\w+\b/.test(lower)) tags.push("不定詞與動名詞比較");
    if (/\b(stop|remember|forget|try)\b.*(to|\w+ing)/.test(lower)) tags.push("stop / remember / forget / try等 + V-ing / to V 差異");
    if (/^(to\s+\w+|\w+ing)\s+is|was|are/.test(lower)) tags.push("作主詞");
    if (/\blike|love|enjoy|prefer|hate|start|finish|want|hope\b.*(to|\w+ing)/.test(lower)) tags.push("作受詞");
    if (/\bmake|find|consider|keep|leave\b.*(to\s+\w+|\w+ing)/.test(lower)) tags.push("作補語");
  
    // ✅ 被動語態
    if (/\bis|are\b.*\b\w+(ed|v3)\b/.test(lower)) tags.push("現在簡單式被動");
    if (/\bwas|were\b.*\b\w+(ed|v3)\b/.test(lower)) tags.push("過去簡單式被動");
    if (/\b(has|have) been\b.*\b\w+(ed|v3)\b/.test(lower)) tags.push("現在完成式被動");
    if (/\b(is|are|was|were) being\b.*\b\w+(ed|v3)\b/.test(lower)) tags.push("進行式被動");
    if (/\b(get|be|being)\b.*\b\w+(ed|v3)\b/.test(lower)) tags.push("被動語態句型變化");
    if (/\b(can|could|may|might|should|must|will|would) be\b.*\b\w+(ed|v3)\b/.test(lower)) tags.push("情態助動詞的被動");
    if (/\bby\s+\w+/.test(lower) === false && /\b(is|are|was|were|been)\b.*\b\w+(ed|v3)\b/.test(lower)) tags.push("省略 by-phrase");
    if (/\bused to\b|be used to\b/.test(lower)) tags.push("used to 和 be used to的用法");

    // ✅ 情態助動詞
    if (/can|could/.test(lower)) tags.push("can / could");
    if (/may|might/.test(lower)) tags.push("may / might");
    if (/shall|should/.test(lower)) tags.push("shall / should");
    if (/will|would/.test(lower)) tags.push("will / would");
    if (/must|have to/.test(lower)) tags.push("must / have to");
    if (/had better/.test(lower)) tags.push("had better");
    if (/ought to/.test(lower)) tags.push("ought to");

// ✅ 功能型情態助動詞判斷
if (/(can|could|may|might|shall|should|will|would|must|have to|had better|ought to)/.test(lower)) {
  if (/(can|may|might|could).*(possible|maybe|probably|perhaps|might happen)/.test(lower)) {
    tags.push("表示可能性");
  }
  if (/(can|could|may|might).*(use|borrow|permission|open|go|leave)/.test(lower)) {
    tags.push("表示允許");
  }
  if (/(must|have to|should|ought to).*(do|finish|complete|pay|follow|obey|study|wear)/.test(lower)) {
    tags.push("表示義務");
  }
  if (/(could|would|can|may).*(please|mind|let me|could you|would you|may I)/.test(lower)) {
    tags.push("表示禮貌提問");
  }
}
    // ✅ 名詞
    if (/\b[a-z]+s\b/.test(lower)) tags.push("單複數變化");
    if (/(a |an |many |few |some |any |much |little )/.test(lower)) tags.push("可數 / 不可數名詞");
    if (/(Tom|Mary|Taiwan|Asia|English|Google)/.test(text)) tags.push("專有名詞與普通名詞");
    if (/(happiness|beauty|freedom|love|anger)/.test(lower)) tags.push("抽象名詞與具體名詞");
    if (/(family|team|group|audience|class)/.test(lower)) tags.push("集合名詞（family, team 等）");
    if (/-/.test(text) && /\b[a-z]+-[a-z]+\b/.test(lower)) tags.push("複合名詞（e.g. toothpaste, son-in-law）");
    if (/'s|of the/.test(lower)) tags.push("所有格名詞（’s / of）");
    if (/it (is|takes)/.test(lower)) tags.push("it 的常見句型（It is + adj. to V / It takes...）");
    if (/there (is|are)/.test(lower)) tags.push("there is / there are 句型");
    if (/(subject|object|complement)/.test(lower)) tags.push("名詞作主詞 / 受詞 / 補語");

    // ✅ 代名詞
    if (/(i|you|he|she|they|we|it|me|him|her|us|them)/.test(lower)) tags.push("主格 / 受格");
    if (/(my|mine|your|yours|his|hers|its|our|ours|their|theirs)/.test(lower)) tags.push("所有格 / 所有格代名詞（my vs mine）");
    if (/(myself|yourself|himself|herself|itself|ourselves|yourselves|themselves)/.test(lower)) tags.push("反身代名詞（myself, themselves）");
    if (/(someone|anyone|everyone|nothing|anything|none)/.test(lower)) tags.push("不定代名詞（someone, anything, none）");
    if (/(this|that|these|those)/.test(lower)) tags.push("指示代名詞（this, that, these, those）");
    if (/(who|whom|whose|what|which)/.test(lower)) tags.push("疑問代名詞（who, whom, whose, what, which）");
    if (/(one|ones|another|the other|others)/.test(lower)) tags.push("one / ones / another / the other / others 的用法");
    if (/(each|every|all|both|either|neither)/.test(lower)) tags.push("each / every / all / both / either / neither 的用法");
    if (/(it|this|that).*(seems|appears|is said|known|clear)/.test(lower)) tags.push("it / this / that 作虛主詞或語境指代");
    
      // ✅ 冠詞
  if (/\bthe\b/.test(lower)) tags.push("定冠詞 the");
  if (/\ba\b|\ban\b/.test(lower)) tags.push("不定冠詞 a / an");
  if (!/\b(the|a|an)\b/.test(lower)) tags.push("零冠詞（no article）");
  if (/(go to school|go to hospital|go to bed|go to prison)/.test(lower)) tags.push("冠詞用法差異（如 the school vs school）");

  // ✅ 主詞與動詞
  if (/\bis\b|\bam\b|\bare\b|\bwas\b|\bwere\b/.test(lower)) tags.push("be動詞的用法");
  if (/\b(he|she|it)\b.*\b(are|have)\b/.test(lower)) tags.push("主動詞一致性");

  // ✅ 形容詞與副詞
  if (/\b(is|looks|seems|becomes)\b\s+\b\w+(y|ful|ous|ive|ic|al)\b/.test(lower)) tags.push("用形容詞作為修飾語");
  if (/\b\w+ly\b/.test(lower)) tags.push("用副詞作為修飾語");
  if (/\b(noun|名詞)\b\s+\b(noun|名詞)\b/.test(lower)) tags.push("名詞修飾名詞");
  if (/\b(hand-made|time-saving|high-speed)\b/.test(lower)) tags.push("複合形容詞(如hand-made, time,saving)");
  if (/\b\w+(y|ful|ous|ive|ic|al)\b\s+\b(noun|名詞)\b/.test(lower)) tags.push("形容詞位置");
  if (/\b\w+ly\b\s+\b(verb|形容詞|副詞)\b/.test(lower)) tags.push("副詞位置");
  if (/\b(be|feel|seem|look)\b\s+\w+(y|ful|ous|ive|ic|al)\b/.test(lower)) tags.push("形容詞與副詞搭配句型");

  // ✅ 同級比較級最高級
  if (/\b(as\s+\w+\s+as)\b/.test(lower)) tags.push("原級比較（as...as）");
  if (/\b\w+(er)\b|\bmore\b/.test(lower)) tags.push("比較級（-er / more）");
  if (/\b\w+(est)\b|\bmost\b/.test(lower)) tags.push("最高級（-est / most）");
  if (/\b(twice|three times|four times)\b\s+as\s+\w+\s+as/.test(lower)) tags.push("倍數比較（twice as...as）");
  if (/\b(比較|比|than)\b/.test(lower)) tags.push("比較級句型");
  if (
    /\b\w+(y|ful|ous|ive|ic|al|er|est|ly)\b/.test(lower)
    && tags.some((t) => t.includes("原級比較") || t.includes("比較級") || t.includes("最高級"))
  ) {
    tags.push("形容詞與副詞的三級");
  }

  // ✅ 介系詞
  if (/\b(in|on|at)\b.*\b(morning|night|evening|noon|week|day|month|year)\b/.test(lower)) tags.push("時間介系詞（in/on/at）");
  if (/\b(in|on|at|by|under|over|behind|between|next to)\b.*\b(place|地點|房間|building|object)\b/.test(lower)) tags.push("地方介系詞（in/on/at/by/under...）");
  if (/\b(look|listen|agree|depend|belong|believe)\b\s+\b(on|to|in|with)\b/.test(lower)) tags.push("動詞搭配介系詞");
  if (/\b(afraid|interested|familiar|tired)\b\s+\b(of|with|in|at)\b/.test(lower)) tags.push("形容詞與分詞搭配介系詞");

  // ✅ 連接詞
  if (/\b(and|but|or|yet|so)\b/.test(lower)) tags.push("對等連接詞（and, but, or）");
  if (/\b(because|although|if|when|before|after|since|unless)\b/.test(lower)) tags.push("從屬連接詞（because, although, if, when）");
  if (/\bno matter (who|what|when|where|how|which)\b/.test(lower)) tags.push("從屬連接詞（no matter）");
  if (/\b(however|therefore|moreover|otherwise|consequently|nevertheless)\b/.test(lower)) tags.push("連接副詞（however, therefore）");
  if (/\bbecause\b.*\bof\b|\bdue to\b|\bin spite of\b/.test(lower)) tags.push("連接詞與介系詞辨識（如 because / because of）");
  if (/\b(not only|either|neither|whether|as soon as|as if|even though|so that)\b/.test(lower)) tags.push("句型連接詞辨析");

   // ✅ 名詞子句
   if (/\bthat\b.*\b(is|was|are|were|means|suggests|shows)\b/.test(lower)) tags.push("that 引導的名詞子句");
   if (/\b(if|whether)\b.*\b(is|will|can|would)\b/.test(lower)) tags.push("if / whether 引導的名詞子句");
   if (/\b(what|where|who|which|how|why|when)\b.*\b(is|was|means|do|did|will)\b/.test(lower)) tags.push("疑問詞引導的名詞子句（what, where, who）");
   if (/\b(what|how|where|which|who) to\b/.test(lower)) tags.push("疑問詞引導的名詞子句搭配不定詞（what to do）");
   if (/^(that|what|whether|if|who)/.test(lower)) tags.push("名詞子句作主詞");
   if (/\bknow|think|believe|wonder|say|tell\b.*\b(that|what|if|whether)\b/.test(lower)) tags.push("名詞子句作受詞");
   if (/\bis|was|means|seems\b.*\b(that|what|who|if)\b/.test(lower)) tags.push("名詞子句作補語");
 
   // ✅ 形容詞子句
   if (/\b(who|whom|which|that)\b.*\b(verb|is|was|are|were)\b/.test(lower)) tags.push("關係代名詞（who, whom, which, that）");
   if (/\bthat\b.*\b(thing|place|person|noun)\b/.test(lower)) tags.push("關係代名詞that使用時機");
   if (/\b(where|when|why)\b.*\b(verb|happened|took place|occurred)\b/.test(lower)) tags.push("關係副詞（where, when, why）");
   if (/\b(who|that|which)\b.*\b\w+\b.*\b\w+\b/.test(lower) && /\b(who|that|which)\b/.test(lower) === false) tags.push("先行詞省略");
   if (/\,.*\bwho|which|whose\b.*\,/.test(lower)) tags.push("限定與非限定");
   if (/\b(who|which|that)\b.*\b\w+ing\b/.test(lower)) tags.push("形容詞子句簡化為分詞片語");
   if (/\b(whoever|whomever|whichever|whatever)\b/.test(lower)) tags.push("複合關係代名詞 (whoever, whatever等)");
 
   // ✅ 分詞
   if (/\b\w+ing\b.*\b(noun|thing|person)\b/.test(lower)) tags.push("分詞作為形容詞");
   if (/\b(make|see|hear|watch|let|have)\b.*\b\w+(ing|ed)\b/.test(lower)) tags.push("分詞作為受詞補語");
   if (/\b\w+(ing|ed)\b.*\b(,|while|when|because|although|if)\b/.test(lower)) tags.push("分詞構句 (分詞作為副詞子句的簡化)");
   if (/\b(who|which|that)\b.*\b\w+(ing|ed)\b/.test(lower)) tags.push("分詞與關係子句轉換");
 
   // ✅ 問句
   if (/\b(do|does|did|is|are|was|were|can|could|will|would)\b.*\?/.test(lower)) tags.push("Yes/No問句");
   if (/\b(who|what|where|when|why|how|which|whose)\b.*\?/.test(lower)) tags.push("疑問詞問句");
   if (/\b(isn't it|don't you|aren't they|didn't he|won't she|hasn't it|doesn't he)\?/.test(lower)) tags.push("附加問句");
   if (/^who\b/.test(lower)) tags.push("Who 開頭問句");
   if (/^whom\b/.test(lower)) tags.push("Whom 開頭問句");
   if (/^whose\b/.test(lower)) tags.push("Whose 開頭問句");
   if (/^what\b/.test(lower)) tags.push("What 開頭問句");
   if (/^which\b/.test(lower)) tags.push("Which 開頭問句");
   if (/^when\b/.test(lower)) tags.push("When 開頭問句");
   if (/^where\b/.test(lower)) tags.push("Where 開頭問句");
   if (/^why\b/.test(lower)) tags.push("Why 開頭問句");
   if (/^how\b/.test(lower)) tags.push("How 開頭問句");
   if (/how much\b/.test(lower)) tags.push("How much 開頭問句");
   if (/how many\b/.test(lower)) tags.push("How many 開頭問句");
   if (/how long\b/.test(lower)) tags.push("How long 開頭問句");
   if (/how often\b/.test(lower)) tags.push("How often 開頭問句");
   if (/how far\b/.test(lower)) tags.push("How far 開頭問句");
   if (/how old\b/.test(lower)) tags.push("How old 開頭問句");
   if (/how come\b/.test(lower)) tags.push("How come 開頭問句");
   if (/\bwho\b.*\bverb\b.*\bobject\b|\bverb\b.*\bwho\b/.test(lower)) tags.push("主詞 vs 受詞問句");

   // ✅ 倒裝句
  if (/^not only|not until/.test(lower)) tags.push("部分否定開頭（Not only...）");
  if (/^only\b.*(did|do|can|should)/.test(lower)) tags.push("Only的倒裝");
  if (/^(so|such)/.test(lower)) tags.push("程度副詞開頭（So, Such）");
  if (/^had\b.*\b(not)?\b.*\b(known|seen|been)/.test(lower)) tags.push("條件省略倒裝（Had I known...）");
  if (/^(here|there|under|in|on|down)\b.*(comes|lies|stood)/.test(lower)) tags.push("地方副詞倒裝");
  if (/^(neither|nor|so)\b.*(do|did|have|am|are|was|were)/.test(lower)) tags.push("neither/nor/so 的倒裝");
  if (/^(rarely|never|seldom|hardly|scarcely|no sooner)/.test(lower)) tags.push("否定副詞倒裝（Rarely / Never）");

  // ✅ 假設語氣
  if (/\bif\b.*\bwill|shall|can\b/.test(lower)) tags.push("可能發生或必然發生的條件句");
  if (/\bif\b.*\b(v2|were)\b/.test(lower)) tags.push("與現在事實相反");
  if (/\bif\b.*\bhad\b.*\b(v3|been)\b/.test(lower)) tags.push("與過去事實相反");
  if (/\bif\b.*\bshould\b.*\b(base verb)\b/.test(lower)) tags.push("與未來事實相反");
  if (/\bif\b.*(had).*(would|could|might).*(now|today)/.test(lower)) tags.push("混合時態假設");
  if (/\bwithout\b|but for/.test(lower)) tags.push("without / but for的用法");
  if (/\bshould\b.*\b(base verb)\b/.test(lower)) tags.push("should的用法");
  if (/\bi wish\b.*\b(v2|could|would)\b/.test(lower)) tags.push("wish的用法");

  // ✅ 其他特殊動詞用法
  if (/\b(make|let|have|get)\b.*\b\w+\b/.test(lower)) tags.push("使役動詞（make, let, have）和get");
  if (/\b(see|hear|feel)\b.*\b\w+\b/.test(lower)) tags.push("感官動詞（see, hear, feel）");
  if (/\b(see|make|let|have)\b.*\b(base verb|v-ing)\b/.test(lower)) tags.push("原形與分詞搭配");
  if (/\bhelp\b.*\b(base verb|to)\b/.test(lower)) tags.push("help 的用法");
  if (/\b(spent|spend|take|took|cost|costs)\b.*(money|time)/.test(lower)) tags.push("spent/take/cost表示花費");
  if (/\b(find|consider)\b.*\b\w+\b.*\b\w+\b/.test(lower)) tags.push("find/consider...+O+OC");
  if (/\bwhat\b.*(a|an)?\b.*(!|\!)/.test(lower)) tags.push("感嘆句");
  if (/\bit\b.*\bis\b.*\bthat\b/.test(lower)) tags.push("強調句");
  if (/(insist|recommend|suggest|demand|propose|important|necessary|essential).*that\b/.test(lower)) tags.push("表命令/建議/強迫/禁止等動詞與形容詞+that子句");

      return tags;
}