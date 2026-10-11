"""
Palestinian Names Archive — AI Agent built with LangChain & OpenRouter
Utilizes LangChain ChatOpenAI and tool calling for dataset search and sort algorithms.
"""
import os
import json
import time
from pathlib import Path
from contextvars import ContextVar
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException
from dotenv import load_dotenv

from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
from langchain_core.messages import SystemMessage, HumanMessage, ToolMessage

from data.loader import get_records
from routers.records import compute_statistics
from algorithms.search import linear_search_by_name, binary_search_by_age, linear_search_by_date
from algorithms.sort import merge_sort_by_name, quick_sort_by_age

# Load environment variables from backend/.env or root .env
load_dotenv(Path(__file__).resolve().parent.parent / ".env")
load_dotenv()

router = APIRouter(prefix="/agent", tags=["LangChain AI Agent"])

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")

FREE_MODELS = [
    "inclusionai/ling-3.0-flash-vl:free",
    "nex-agi/nex-n2.5-mini:free",
    "google/gemma-4-31b-it:free",
    "nvidia/nemotron-3.5-lightning:free",
    "openrouter/auto"
]

SYSTEM_PROMPT = """أنت «حارس الأرشيف» في مشروع توثيقي تذكاري يحفظ أسماء الضحايا الفلسطينيين.
مهمتك: الإجابة بوقار، دقة، وتوثيق إنساني حقيقي مستند للأرشيف.
قواعد صارمة:
1. أنت لا تؤلف ولا تخترع أسماء أو أرقاماً أبداً.
2. استخدم الأدوات البرمجية المتاحة (search_by_name, search_by_age, sort_by_age, sort_by_name, get_archive_statistics) لاسترجاع البيانات الفعلية قبل الإجابة.
3. اكتب بأسلوب عربي فصيح، إنساني ودافئ، تذكّر دائماً: «لم يكونوا أرقاماً، بل كانوا أشخاصاً، ولكل شخص اسم وحياة».
4. عند ذكر الأشخاص، اذكر أسماءهم وأعمارهم بوضوح، مع احترام كامل لكرامة الذاكرة.
"""

# Each async request owns its tool results, including across model awaits.
_request_tracking = ContextVar('archive_request_tracking', default=None)


def _tracking():
    state = _request_tracking.get()
    if state is None:
        state = ([], [])
        _request_tracking.set(state)
    return state


# ─── LangChain Tools ───────────────────────────────────────────────────────────

@tool
def search_by_name(query: str, limit: int = 8) -> str:
    """بحث عن اسم أو عائلة في أرشيف الأسماء الفلسطينية باستخدام البحث الخطي Linear Search O(n)."""
    records = get_records()
    started = time.perf_counter()
    res = linear_search_by_name(records, query)
    items = res["results"][:limit]
    elapsed = round((time.perf_counter() - started) * 1000, 2)

    sample = [
        {"id": r["id"], "ar_name": r.get("ar_name"), "en_name": r.get("en_name"), "age": r.get("age"), "dob": r.get("dob")}
        for r in items
    ]
    _tracking()[0].extend(sample)
    _tracking()[1].append({
        "tool": "search_by_name",
        "algorithm": "Linear Search",
        "complexity": "O(n)",
        "execution_time_ms": elapsed,
        "arguments": {"query": query, "limit": limit}
    })

    return json.dumps({
        "total_found": res.get("count", len(res["results"])),
        "algorithm": "Linear Search · O(n)",
        "comparisons": res.get("comparisons", 0),
        "execution_time_ms": elapsed,
        "sample_records": sample
    }, ensure_ascii=False)


@tool
def search_by_age(age: int, tolerance: int = 0, limit: int = 8) -> str:
    """بحث ثنائي Binary Search O(log n) عن سجلات بعمر محدد أو نطاق عمر."""
    records = get_records()
    started = time.perf_counter()
    res = binary_search_by_age(records, age, tolerance)
    items = res["results"][:limit]
    elapsed = round((time.perf_counter() - started) * 1000, 2)

    sample = [
        {"id": r["id"], "ar_name": r.get("ar_name"), "en_name": r.get("en_name"), "age": r.get("age")}
        for r in items
    ]
    _tracking()[0].extend(sample)
    _tracking()[1].append({
        "tool": "search_by_age",
        "algorithm": "Binary Search",
        "complexity": "O(log n)",
        "execution_time_ms": elapsed,
        "arguments": {"age": age, "tolerance": tolerance}
    })

    return json.dumps({
        "total_found": res.get("count", len(res["results"])),
        "algorithm": "Binary Search · O(log n)",
        "comparisons": res.get("comparisons", 0),
        "execution_time_ms": elapsed,
        "sample_records": sample
    }, ensure_ascii=False)


@tool
def sort_by_age(ascending: bool = True, limit: int = 8) -> str:
    """ترتيب السجلات بحسب العمر باستخدام خوارزمية الترتيب السريع Quick Sort O(n log n). True لأصغر الأعمار، False لأكبر الأعمار."""
    records = get_records()
    started = time.perf_counter()
    res = quick_sort_by_age(records, ascending)
    items = res["sorted"][:limit]
    elapsed = round((time.perf_counter() - started) * 1000, 2)

    sample = [
        {"id": r["id"], "ar_name": r.get("ar_name"), "en_name": r.get("en_name"), "age": r.get("age")}
        for r in items
    ]
    _tracking()[0].extend(sample)
    _tracking()[1].append({
        "tool": "sort_by_age",
        "algorithm": "Quick Sort",
        "complexity": "O(n log n) avg",
        "execution_time_ms": elapsed,
        "arguments": {"ascending": ascending}
    })

    return json.dumps({
        "algorithm": "Quick Sort · O(n log n)",
        "order": "تصاعدي (الأصغر أولاً)" if ascending else "تنازلي (الأكبر أولاً)",
        "comparisons": res.get("comparisons", 0),
        "swaps": res.get("swaps", 0),
        "execution_time_ms": elapsed,
        "sample_records": sample
    }, ensure_ascii=False)


@tool
def sort_by_name(ascending: bool = True, limit: int = 8) -> str:
    """ترتيب السجلات أبجدياً حسب الاسم العربي باستخدام خوارزمية الترتيب بالدمج Merge Sort O(n log n)."""
    records = get_records()
    started = time.perf_counter()
    res = merge_sort_by_name(records, ascending)
    items = res["sorted"][:limit]
    elapsed = round((time.perf_counter() - started) * 1000, 2)

    sample = [
        {"id": r["id"], "ar_name": r.get("ar_name"), "en_name": r.get("en_name"), "age": r.get("age")}
        for r in items
    ]
    _tracking()[0].extend(sample)
    _tracking()[1].append({
        "tool": "sort_by_name",
        "algorithm": "Merge Sort",
        "complexity": "O(n log n)",
        "execution_time_ms": elapsed,
        "arguments": {"ascending": ascending}
    })

    return json.dumps({
        "algorithm": "Merge Sort · O(n log n)",
        "order": "أبجدي أ-ي" if ascending else "أبجدي ي-أ",
        "comparisons": res.get("comparisons", 0),
        "execution_time_ms": elapsed,
        "sample_records": sample
    }, ensure_ascii=False)


@tool
def get_archive_statistics() -> str:
    """الحصول على الإحصاءات العامة الشاملة للأرشيف: إجمالي السجلات، الأطفال دون 18 عاماً ونسبتهم، متوسط العمر، والعمر الوسيط."""
    records = get_records()
    started = time.perf_counter()
    total = len(records)
    ages = [r["age"] for r in records if r.get("age") is not None]
    ages.sort()
    n_ages = len(ages)
    avg = round(sum(ages) / n_ages, 1) if n_ages else None
    median = compute_statistics(records)['median_age']
    children = sum(1 for a in ages if a < 18)
    elapsed = round((time.perf_counter() - started) * 1000, 2)

    _tracking()[1].append({
        "tool": "get_archive_statistics",
        "algorithm": "Demographic Aggregate Scan",
        "complexity": "O(n)",
        "execution_time_ms": elapsed,
        "arguments": {}
    })

    return json.dumps({
        "total_records": total,
        "total_with_age": n_ages,
        "children_under_18": children,
        "children_percentage": round((children / max(1, total)) * 100, 1),
        "average_age": avg,
        "median_age": median,
        "min_age": ages[0] if ages else None,
        "max_age": ages[-1] if ages else None,
        "execution_time_ms": elapsed
    }, ensure_ascii=False)


LANGCHAIN_TOOLS = [
    search_by_name,
    search_by_age,
    sort_by_age,
    sort_by_name,
    get_archive_statistics
]

TOOL_MAP = {t.name: t for t in LANGCHAIN_TOOLS}


# ─── API Schema ────────────────────────────────────────────────────────────────

class AgentQuery(BaseModel):
    message: str
    model: Optional[str] = None

class ToolExecutionLog(BaseModel):
    tool: str
    algorithm: Optional[str] = None
    complexity: Optional[str] = None
    execution_time_ms: Optional[float] = None
    arguments: Dict[str, Any]

class AgentResponse(BaseModel):
    answer: str
    model: str
    tools_used: List[ToolExecutionLog]
    records: List[Dict[str, Any]]
    fallback_used: bool = False


# ─── Endpoint ──────────────────────────────────────────────────────────────────

@router.post("/chat", response_model=AgentResponse)
async def chat_with_archivist_langchain(body: AgentQuery):
    """
    LangChain AI Agent with OpenRouter and algorithmic tool calling.
    """
    _request_tracking.set(([], []))

    user_msg = body.message.strip()
    if not user_msg:
        raise HTTPException(status_code=400, detail="الرسالة فارغة")

    models_to_try = [body.model] if body.model else FREE_MODELS
    final_answer: Optional[str] = None
    chosen_model = models_to_try[0]
    api_key = os.getenv("OPENROUTER_API_KEY") or OPENROUTER_API_KEY

    for m in models_to_try:
        if not m or not api_key:
            continue
        try:
            # Initialize LangChain ChatOpenAI pointing to OpenRouter
            llm = ChatOpenAI(
                model=m,
                api_key=api_key,
                base_url="https://openrouter.ai/api/v1",
                temperature=0.3,
                timeout=25.0,
                default_headers={
                    "HTTP-Referer": "http://localhost:3000",
                    "X-Title": "Palestine Names Living Archive (LangChain)"
                }
            )

            llm_with_tools = llm.bind_tools(LANGCHAIN_TOOLS)
            messages = [
                SystemMessage(content=SYSTEM_PROMPT),
                HumanMessage(content=user_msg)
            ]

            # Step 1: Model inference
            ai_msg = await llm_with_tools.ainvoke(messages)
            messages.append(ai_msg)

            # Step 2: If model called tools, execute them via LangChain
            if ai_msg.tool_calls:
                for tc in ai_msg.tool_calls:
                    tool_name = tc.get("name")
                    tool_args = tc.get("args", {})
                    call_id = tc.get("id", "call_1")

                    tool_fn = TOOL_MAP.get(tool_name)
                    if tool_fn:
                        tool_output = tool_fn.invoke(tool_args)
                    else:
                        tool_output = json.dumps({"error": f"Tool {tool_name} not found"})

                    messages.append(ToolMessage(
                        content=str(tool_output),
                        tool_call_id=call_id
                    ))

                # Step 3: Second call to generate synthesized response with tool context
                second_response = await llm.ainvoke(messages)
                final_answer = second_response.content
                chosen_model = f"{m} (LangChain)"
                break
            else:
                final_answer = ai_msg.content
                chosen_model = f"{m} (LangChain)"
                break

        except Exception as err:
            continue

    # Fallback heuristic if upstream free models are temporarily rate-limited
    if not final_answer:
        q = user_msg
        if any(w in q for w in ["أطفال", "الأطفال", "طفل", "متوسط", "عمر", "إحصاء", "احصا", "عدد"]):
            st_raw = get_archive_statistics.invoke({})
            st = json.loads(st_raw)
            final_answer = (
                f"في الأرشيف {st['total_records']:,} اسماً موثقاً. "
                f"منهم {st['children_under_18']:,} طفلاً دون الثامنة عشرة ({st['children_percentage']}٪ من السجلات). "
                f"متوسط العمر هو {st['average_age']} عاماً، وأكبر عمر مسجل هو {st['max_age']} عاماً."
            )
        else:
            name_query = q.replace("ابحث عن", "").replace("عائلة", "").replace("اسم", "").strip("؟? ")
            res_raw = search_by_name.invoke({"query": name_query or q, "limit": 6})
            res = json.loads(res_raw)
            if res.get("sample_records"):
                names_text = "\n".join([f"• {r['ar_name']} ({r.get('age', 'غير مسجل')} عاماً)" for r in res["sample_records"]])
                final_answer = f"وجدت {res['total_found']:,} اسماً يطابق بحثك:\n{names_text}"
            else:
                final_answer = f"بحثت في السجلات ولم أعثر على اسم يطابق «{name_query}». يمكنك تجربة جزء أصغر من الاسم."

        chosen_model = "local-algorithmic-fallback (LangChain)"

    # Format tools log
    tool_logs = [
        ToolExecutionLog(
            tool=t["tool"],
            algorithm=t.get("algorithm"),
            complexity=t.get("complexity"),
            execution_time_ms=t.get("execution_time_ms"),
            arguments=t.get("arguments", {})
        )
        for t in _tracking()[1]
    ]

    return AgentResponse(
        answer=str(final_answer),
        model=chosen_model,
        tools_used=tool_logs,
        records=_tracking()[0],
        fallback_used=("fallback" in chosen_model)
    )
