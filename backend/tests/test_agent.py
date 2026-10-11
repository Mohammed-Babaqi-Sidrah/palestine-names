import asyncio
import json
import unittest
from unittest.mock import patch

from langchain_core.messages import AIMessage
from routers import agent

RECORDS = [
    {'id': '1', 'ar_name': 'أمل', 'en_name': 'Amal', 'age': 0, 'dob': None},
    {'id': '2', 'ar_name': 'علي', 'en_name': 'Ali', 'age': 24, 'dob': None},
]


class AgentTests(unittest.IsolatedAsyncioTestCase):
    async def test_overlapping_queries_keep_their_own_records_and_logs(self):
        barrier = asyncio.Barrier(2)

        class FakeModel:
            def __init__(self, **kwargs):
                pass

            def bind_tools(self, tools):
                return self

            async def ainvoke(self, messages):
                if len(messages) == 2:
                    await asyncio.sleep(0)
                    return AIMessage(content='', tool_calls=[{
                        'name': 'search_by_name', 'args': {'query': messages[1].content}, 'id': 'call1',
                    }])
                await barrier.wait()
                return AIMessage(content='نتائج البحث')

        with patch.object(agent, 'ChatOpenAI', FakeModel), patch.object(agent, 'get_records', return_value=RECORDS), patch.dict('os.environ', {'OPENROUTER_API_KEY': 'test'}):
            answers = await asyncio.gather(*[
                agent.chat_with_archivist_langchain(agent.AgentQuery(message=name, model='test'))
                for name in ['أمل', 'علي']
            ])
        for response, expected in zip(answers, ['1', '2']):
            self.assertEqual([r['id'] for r in response.records], [expected])
            self.assertEqual(len(response.tools_used), 1)

    async def test_agent_statistics_match_even_sample_median(self):
        with patch.object(agent, 'get_records', return_value=RECORDS):
            stats = json.loads(agent.get_archive_statistics.invoke({}))
        self.assertEqual(stats['median_age'], 12)
