/**
 * Update intermediate tutorial articles with full content.
 *
 * Usage: npx tsx scripts/update-intermediate-tutorials.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface TutorialContent {
  slug: string;
  content: string;
}

const tutorials: TutorialContent[] = [
  // ── 1: api-quickstart ─────────────────────────────────────────────────────
  {
    slug: "api-quickstart",
    content: `从这篇文章开始，我们进入 Claude 的开发者世界。通过 API，你可以把 Claude 的能力集成到任何应用中——聊天机器人、内容生成工具、数据分析平台、自动化工作流。本文带你完成第一次 API 调用，从零到能跑通。

## 你将学到什么

- 注册 Anthropic 开发者账号并获取 API Key
- 用 Python 和 TypeScript 两种语言调用 Claude API
- 理解 Messages API 的基本结构
- 处理 API 响应和常见错误

## 获取 API Key

1. 访问 **console.anthropic.com** 并注册账号
2. 进入 **API Keys** 页面
3. 点击 **Create Key**，给它一个名字（如 "my-first-key"）
4. 复制生成的 Key（以 sk-ant- 开头），保存到安全的地方

> **Warning:** API Key 是你的密钥，不要提交到 Git 仓库或分享给他人。使用环境变量来管理。

## Python 快速开始

### 安装 SDK

\`\`\`bash
pip install anthropic
\`\`\`

### 第一次调用

\`\`\`python
import anthropic

client = anthropic.Anthropic(
    api_key="your-api-key-here"  # 或设置 ANTHROPIC_API_KEY 环境变量
)

message = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "用一句话介绍你自己"}
    ]
)

print(message.content[0].text)
\`\`\`

### 使用环境变量（推荐）

\`\`\`bash
export ANTHROPIC_API_KEY="sk-ant-your-key-here"
\`\`\`

\`\`\`python
# SDK 自动读取 ANTHROPIC_API_KEY 环境变量
client = anthropic.Anthropic()
\`\`\`

## TypeScript 快速开始

### 安装 SDK

\`\`\`bash
npm install @anthropic-ai/sdk
\`\`\`

### 第一次调用

\`\`\`typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function main() {
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [
      { role: "user", content: "用一句话介绍你自己" }
    ],
  });

  console.log(message.content[0].text);
}

main();
\`\`\`

## 理解 API 请求结构

每次调用 Messages API，你需要提供：

**必填参数：**
- **model**：选择模型（claude-opus-4-6、claude-sonnet-4-6、claude-haiku-4-5）
- **max_tokens**：最大输出 token 数
- **messages**：对话消息数组

**常用可选参数：**
- **system**：系统提示词，设定 Claude 的行为规则
- **temperature**：控制随机性（0-1，默认 1）
- **stop_sequences**：自定义停止标记

\`\`\`python
message = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=2048,
    system="你是一位专业的技术文档编写者，回答简洁准确。",
    temperature=0.3,
    messages=[
        {"role": "user", "content": "解释什么是 REST API"}
    ]
)
\`\`\`

## 理解 API 响应结构

API 返回的响应包含：

\`\`\`python
# message 对象的关键字段
message.id          # 消息唯一 ID
message.model       # 使用的模型
message.role        # "assistant"
message.content     # 内容数组
message.stop_reason # 停止原因：end_turn / max_tokens / stop_sequence
message.usage       # Token 用量统计

# 获取文本内容
text = message.content[0].text

# 查看 token 用量
print(f"输入: {message.usage.input_tokens} tokens")
print(f"输出: {message.usage.output_tokens} tokens")
\`\`\`

**stop_reason 含义：**
- **end_turn**：Claude 正常完成回答
- **max_tokens**：达到 max_tokens 限制，回答被截断
- **stop_sequence**：遇到你设置的停止标记

> **Tip:** 如果 stop_reason 是 max_tokens，说明回答被截断了。增大 max_tokens 或让 Claude 更简洁。

## 不用 SDK 的直接调用（cURL）

\`\`\`bash
curl https://api.anthropic.com/v1/messages \\
  -H "content-type: application/json" \\
  -H "x-api-key: $ANTHROPIC_API_KEY" \\
  -H "anthropic-version: 2023-06-01" \\
  -d '{
    "model": "claude-sonnet-4-6",
    "max_tokens": 1024,
    "messages": [
      {"role": "user", "content": "Hello, Claude!"}
    ]
  }'
\`\`\`

## 常见错误处理

\`\`\`python
import anthropic

try:
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        messages=[{"role": "user", "content": "Hello"}]
    )
except anthropic.AuthenticationError:
    print("API Key 无效，请检查")
except anthropic.RateLimitError:
    print("请求太频繁，请稍后重试")
except anthropic.APIError as e:
    print(f"API 错误: {e.message}")
\`\`\`

## 实战练习

> **Tip:** 动手写出你的第一个 API 调用。

1. 注册 Anthropic 账号，获取 API Key
2. 用 Python 或 TypeScript 调用 Claude，让它翻译一段文字
3. 尝试修改 system prompt 和 temperature，观察回答的变化
4. 查看响应中的 token 用量，计算一次调用的大概费用

## 关键要点

> **Note:** 本文核心总结

- API Key 通过 console.anthropic.com 获取，用环境变量管理
- Messages API 的核心参数：model、max_tokens、messages
- Python 和 TypeScript SDK 都支持，用法几乎相同
- 关注 stop_reason 和 usage 来监控调用质量和成本

## 延伸阅读

- [下一篇：Messages API 深入：多轮对话](/articles/messages-api-multi-turn)`,
  },

  // ── 2: messages-api-multi-turn ─────────────────────────────────────────────
  {
    slug: "messages-api-multi-turn",
    content: `上一篇你学会了单次 API 调用。但实际应用中，用户和 Claude 之间通常需要多轮对话——就像聊天一样，你一句我一句。Messages API 通过 messages 数组来实现多轮对话，理解它的工作原理是构建任何 AI 应用的基础。

## 你将学到什么

- messages 数组的 role 机制（user / assistant / system）
- 如何构建多轮对话
- 上下文管理：何时保留、何时清理
- stop_reason 的实际应用

## Messages 数组结构

Claude API 是**无状态的**——每次请求都是独立的。要实现多轮对话，你需要在每次请求中带上所有历史消息。

\`\`\`python
messages = [
    {"role": "user", "content": "我叫张三"},
    {"role": "assistant", "content": "你好张三！有什么我可以帮你的？"},
    {"role": "user", "content": "你还记得我叫什么吗？"},
]

# Claude 能看到完整历史，所以知道你叫张三
response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    messages=messages,
)
\`\`\`

**三种角色：**
- **user**：用户的消息
- **assistant**：Claude 的回复
- **system**：系统指令（通过单独的 system 参数传入，不在 messages 中）

> **Note:** messages 数组必须以 user 消息开头，且 user/assistant 交替出现。不能连续出现两条相同角色的消息。

## 构建多轮对话应用

### Python 版完整示例

\`\`\`python
import anthropic

client = anthropic.Anthropic()

def chat():
    messages = []
    system = "你是一位友好的中文助手。回答简洁有用。"

    print("开始对话（输入 'quit' 退出）\\n")

    while True:
        user_input = input("你: ")
        if user_input.lower() == "quit":
            break

        messages.append({"role": "user", "content": user_input})

        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=2048,
            system=system,
            messages=messages,
        )

        assistant_text = response.content[0].text
        messages.append({"role": "assistant", "content": assistant_text})

        print(f"Claude: {assistant_text}\\n")

chat()
\`\`\`

### TypeScript 版

\`\`\`typescript
import Anthropic from "@anthropic-ai/sdk";
import * as readline from "readline";

const client = new Anthropic();

async function chat() {
  const messages: Anthropic.MessageParam[] = [];
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const ask = (q: string) =>
    new Promise<string>((resolve) => rl.question(q, resolve));

  console.log("开始对话（输入 quit 退出）\\n");

  while (true) {
    const input = await ask("你: ");
    if (input === "quit") break;

    messages.push({ role: "user", content: input });

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: "你是一位友好的中文助手。回答简洁有用。",
      messages,
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    messages.push({ role: "assistant", content: text });
    console.log("Claude:", text, "\\n");
  }

  rl.close();
}

chat();
\`\`\`

## System Prompt 的作用

system 参数在每次请求中都会发送，但不计入 messages 数组。它设定了 Claude 在整个对话中的行为规则。

\`\`\`python
response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    system="你是一位资深的 Python 导师。用简洁的中文回答问题，代码示例使用 Python 3.12+。",
    messages=messages,
)
\`\`\`

> **Tip:** system prompt 对 Claude 的影响很大。在多轮对话中，它始终有效，不会被后续消息覆盖。

## 上下文管理策略

每条消息都消耗 token。随着对话变长，token 消耗会增加，成本也会上升。你需要管理上下文。

### 策略一：滑动窗口

只保留最近 N 轮对话。

\`\`\`python
MAX_TURNS = 20  # 保留最近 20 条消息

if len(messages) > MAX_TURNS:
    messages = messages[-MAX_TURNS:]
\`\`\`

### 策略二：总结压缩

当对话过长时，用 Claude 自己总结历史对话，替换详细记录。

\`\`\`python
if len(messages) > 30:
    summary_response = client.messages.create(
        model="claude-haiku-4-5",
        max_tokens=500,
        messages=[{
            "role": "user",
            "content": "请用 200 字总结以下对话的关键信息：\\n" +
                       "\\n".join(m["content"] for m in messages)
        }]
    )
    summary = summary_response.content[0].text
    messages = [
        {"role": "user", "content": f"以下是之前对话的总结：{summary}"},
        {"role": "assistant", "content": "好的，我已了解之前的对话内容。请继续。"},
    ]
\`\`\`

### 策略三：新建对话

某些场景下，话题切换时直接清空历史，开始新对话。

## 多内容块消息

一条消息可以包含多个内容块（文字 + 图片）：

\`\`\`python
message = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "描述这张图片"},
            {
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": "image/png",
                    "data": base64_image_data,
                }
            }
        ]
    }]
)
\`\`\`

## 实战练习

> **Tip:** 构建你的第一个多轮对话应用。

1. 用上面的代码模板，创建一个终端聊天程序
2. 加入上下文管理：当消息超过 20 条时自动截断
3. 在对话中测试 Claude 是否记得之前提到的信息

## 关键要点

> **Note:** 本文核心总结

- Claude API 无状态，多轮对话需要在每次请求中带上完整历史
- messages 数组以 user 开头，user/assistant 交替
- system prompt 独立于 messages，始终有效
- 注意管理上下文长度以控制成本

## 延伸阅读

- [下一篇：System Prompt 设计：给 Claude 定规矩](/articles/system-prompt-design)`,
  },

  // ── 3: system-prompt-design ────────────────────────────────────────────────
  {
    slug: "system-prompt-design",
    content: `System Prompt 是你给 Claude 下达的「工作守则」。它决定了 Claude 在整个对话中的行为模式——用什么语气说话、遵循什么规则、拒绝什么请求。写好 System Prompt 是构建高质量 AI 应用的关键。

## 你将学到什么

- System Prompt 的作用和最佳放置方式
- 5 种常用的 System Prompt 设计模式
- 防护栏：限制 Claude 的行为边界
- 实际项目中的 System Prompt 示例

## System Prompt 的基础

\`\`\`python
response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    system="你是一位专业的法律顾问，专注于中国合同法。用通俗的语言回答问题，在回答末尾附上免责声明。",
    messages=[
        {"role": "user", "content": "如果合同没有约定违约金，违约方要赔偿多少？"}
    ]
)
\`\`\`

**System Prompt vs 普通消息：**
- System Prompt 优先级更高，Claude 会更严格地遵守
- 不计入 messages 数组的角色交替规则
- 在多轮对话中始终有效

## 5 种设计模式

### 模式一：角色 + 规则

最基础也最常用的模式。定义 Claude 是谁、做什么、怎么做。

\`\`\`
你是「智能客服小助手」，为一家在线教育平台服务。

你的职责：
- 回答用户关于课程内容、价格、退款的问题
- 帮助用户选择合适的课程
- 引导复杂问题转接人工客服

你的规则：
- 始终使用友好、专业的语气
- 不讨论竞品
- 无法确定的信息说「我帮您确认一下」，不要编造
- 退款相关问题必须转人工
\`\`\`

### 模式二：输出格式约束

当你的应用需要解析 Claude 的输出时，严格的格式约束很重要。

\`\`\`
你是一个情感分析引擎。用户会发送一段文字，你需要分析情感。

必须严格按以下 JSON 格式回复，不要包含任何其他文字：
{"sentiment": "positive" | "negative" | "neutral", "confidence": 0.0-1.0, "keywords": ["关键词1", "关键词2"]}
\`\`\`

### 模式三：分步骤指令

适合需要 Claude 执行复杂工作流的场景。

\`\`\`
你是一个代码审查助手。当用户提交代码时，请按以下步骤审查：

第一步：检查代码是否有语法错误
第二步：检查是否有安全漏洞（SQL 注入、XSS 等）
第三步：检查代码风格是否符合规范
第四步：给出改进建议

每个步骤用标题标注，格式为「## 步骤 N：标题」。
如果某个步骤没有发现问题，写「✅ 未发现问题」。
\`\`\`

### 模式四：知识注入

把 Claude 不知道的业务知识写进 System Prompt。

\`\`\`
你是「AI 健康助手」。以下是你需要遵循的知识库：

<product_info>
产品名：维生素 D3 软胶囊
规格：每粒 400IU
建议用量：成人每日 1-2 粒，随餐服用
注意事项：不宜与钙片同时大量服用
</product_info>

<policy>
退货政策：未开封可在 7 天内退货
会员折扣：金卡会员 9 折，钻石会员 8.5 折
</policy>

基于以上信息回答用户问题。如果问题超出知识范围，回复「这个问题我需要帮您转接专业人员」。
\`\`\`

### 模式五：防护栏

明确告诉 Claude 什么不能做。

\`\`\`
你是一个儿童教育助手，面向 6-12 岁的小学生。

绝对禁止：
- 讨论暴力、恐怖、性相关内容
- 给出任何医疗建议
- 提供个人联系方式或社交账号
- 协助完成作业（可以解释思路，但不能直接给出答案）

如果用户提出以上请求，温和地拒绝并引导到合适的话题。
\`\`\`

## 组合多种模式

实际项目中通常会组合多种模式：

\`\`\`
<role>
你是一个 SQL 查询生成助手。用户描述需求，你生成对应的 SQL 查询。
</role>

<database_schema>
users(id INT, name VARCHAR, email VARCHAR, created_at TIMESTAMP)
orders(id INT, user_id INT, amount DECIMAL, status VARCHAR, created_at TIMESTAMP)
products(id INT, name VARCHAR, price DECIMAL, category VARCHAR)
</database_schema>

<rules>
1. 只生成 SELECT 查询，不生成 INSERT/UPDATE/DELETE
2. 使用 PostgreSQL 语法
3. 返回格式为 SQL 代码块 + 一句话解释
4. 如果用户需求不明确，先提问确认
</rules>

<safety>
- 不生成可能造成数据泄露的查询
- 不返回包含密码或敏感字段的数据
</safety>
\`\`\`

> **Tip:** 使用 XML 标签组织 System Prompt 的不同部分。Claude 对 XML 标签有特殊的理解能力，能更准确地区分不同类型的指令。

## System Prompt 优化技巧

**1. 正面描述，而非否定**

\`\`\`
❌ 不要用长句子回答
✅ 用 1-2 个短句回答每个问题
\`\`\`

**2. 给出具体示例**

\`\`\`
回答格式示例：
用户问：这款耳机防水吗？
你答：是的，这款耳机支持 IPX5 级防水，可以在运动出汗和小雨环境中使用，但不建议游泳时佩戴。
\`\`\`

**3. 测试边界情况**

写完 System Prompt 后，故意用各种「刁钻」的问题测试：
- 完全无关的问题
- 试图绕过规则的请求
- 模糊不清的需求

## 实战练习

> **Tip:** 为你自己的应用场景写一个 System Prompt。

1. 选一个场景（客服、写作助手、代码工具），写出完整的 System Prompt
2. 用 API 测试你的 System Prompt，发送 10 条不同的消息
3. 找出 Claude 不遵守规则的情况，优化 System Prompt

## 关键要点

> **Note:** 本文核心总结

- System Prompt 定义 Claude 在对话中的角色和规则
- 5 种设计模式：角色+规则、格式约束、分步指令、知识注入、防护栏
- 使用 XML 标签组织复杂的 System Prompt
- 写完后要用边界情况测试，持续优化

## 延伸阅读

- [下一篇：结构化输出：让 API 返回 JSON](/articles/structured-output-json)`,
  },

  // ── 4: structured-output-json ──────────────────────────────────────────────
  {
    slug: "structured-output-json",
    content: `构建 AI 应用时，最常见的需求之一是让 Claude 返回结构化的 JSON 数据——而不是自由文本。Claude API 提供了「结构化输出」功能，可以 100% 保证返回的 JSON 符合你定义的 Schema。这个功能已正式发布（GA），无需 beta header。

## 你将学到什么

- 结构化输出的两种模式
- 如何定义 JSON Schema 约束输出
- Python（Pydantic）和 TypeScript（Zod）的 SDK 集成
- 实际应用场景和最佳实践

## 模式一：JSON 输出（output_config）

通过 output_config.format 直接控制 Claude 的回复格式：

\`\`\`python
import anthropic

client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    messages=[{
        "role": "user",
        "content": "从这段文字中提取联系人信息：我是张三，在北京工作，邮箱 zhangsan@example.com，手机 13800138000"
    }],
    output_config={
        "format": {
            "type": "json_schema",
            "schema": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "city": {"type": "string"},
                    "email": {"type": "string"},
                    "phone": {"type": "string"}
                },
                "required": ["name", "city", "email", "phone"],
                "additionalProperties": False
            }
        }
    }
)

import json
data = json.loads(response.content[0].text)
print(data)
# {"name": "张三", "city": "北京", "email": "zhangsan@example.com", "phone": "13800138000"}
\`\`\`

**关键点：**
- 返回的 JSON 100% 符合 Schema
- 响应在 response.content[0].text 中，是字符串格式的 JSON
- 需要自己 json.loads() 解析

## 模式二：严格工具调用（strict: true）

通过工具定义来约束输出结构，Claude 返回 tool_use 块：

\`\`\`python
response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    tools=[{
        "name": "extract_contact",
        "description": "提取联系人信息",
        "strict": True,
        "input_schema": {
            "type": "object",
            "properties": {
                "name": {"type": "string", "description": "姓名"},
                "city": {"type": "string", "description": "城市"},
                "email": {"type": "string", "description": "邮箱"},
                "phone": {"type": "string", "description": "手机号"}
            },
            "required": ["name", "city", "email", "phone"],
            "additionalProperties": False
        }
    }],
    tool_choice={"type": "tool", "name": "extract_contact"},
    messages=[{
        "role": "user",
        "content": "我是张三，在北京工作，邮箱 zhangsan@example.com"
    }]
)

# 结果在 tool_use block 中
tool_use = response.content[0]
print(tool_use.input)  # {"name": "张三", "city": "北京", ...}
\`\`\`

## Python + Pydantic 集成

SDK 支持直接用 Pydantic 模型定义 Schema：

\`\`\`python
from pydantic import BaseModel
from typing import Optional

class ContactInfo(BaseModel):
    name: str
    city: str
    email: str
    phone: Optional[str] = None
    company: Optional[str] = None

response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    messages=[{"role": "user", "content": "提取：李四，上海，lisi@test.com，阿里巴巴"}],
    output_config={
        "format": {
            "type": "json_schema",
            "schema": ContactInfo.model_json_schema()
        }
    }
)

contact = ContactInfo.model_validate_json(response.content[0].text)
print(contact.name)     # 李四
print(contact.company)  # 阿里巴巴
\`\`\`

## TypeScript + Zod 集成

\`\`\`typescript
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const ContactSchema = z.object({
  name: z.string(),
  city: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
});

const client = new Anthropic();

const response = await client.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 1024,
  messages: [{ role: "user", content: "提取：王五，深圳，wangwu@test.com" }],
  output_config: {
    format: {
      type: "json_schema",
      schema: zodToJsonSchema(ContactSchema),
    },
  },
});

const data = ContactSchema.parse(
  JSON.parse(response.content[0].text)
);
\`\`\`

## 实际应用场景

### 场景一：内容分类

\`\`\`python
schema = {
    "type": "object",
    "properties": {
        "category": {"type": "string", "enum": ["技术", "商业", "生活", "娱乐"]},
        "tags": {"type": "array", "items": {"type": "string"}, "maxItems": 5},
        "summary": {"type": "string"},
        "sentiment": {"type": "string", "enum": ["positive", "negative", "neutral"]}
    },
    "required": ["category", "tags", "summary", "sentiment"],
    "additionalProperties": False
}
\`\`\`

### 场景二：数据提取

从非结构化文本中提取结构化数据——简历解析、发票识别、日志分析等。

### 场景三：API 中间层

Claude 分析用户意图，输出结构化指令，下游系统执行。

> **Note:** 结构化输出保证格式正确，但不保证数据的准确性。Claude 可能在理解原文时出错，只是输出格式一定是对的。

## 两种模式如何选择

- **output_config**：当你只需要 JSON 数据，不需要 Claude 的文字解释
- **strict 工具**：当你需要 Claude 同时给出文字回答和结构化数据

## 实战练习

> **Tip:** 用结构化输出处理你实际工作中的数据。

1. 定义一个 Schema，让 Claude 从一段产品描述中提取价格、功能、目标用户
2. 用 Pydantic/Zod 验证返回的数据
3. 尝试一个批量场景：循环处理 10 段文本，提取结构化数据

## 关键要点

> **Note:** 本文核心总结

- 结构化输出已 GA，100% 保证 JSON 符合 Schema
- 两种模式：output_config（纯 JSON）和 strict 工具（tool_use）
- Python 用 Pydantic、TypeScript 用 Zod 定义 Schema
- 格式保证正确，但数据准确性取决于 Claude 的理解能力

## 延伸阅读

- [下一篇：引用与 RAG：让 Claude 引用原文](/articles/citations-rag)`,
  },

  // ── 5: citations-rag ───────────────────────────────────────────────────────
  {
    slug: "citations-rag",
    content: `当你让 Claude 基于文档回答问题时，你希望它不仅给出答案，还能指出「这个答案来自哪里」。Citations（引用）功能让 Claude 自动标注回答中每个论点的出处——精确到段落、页码甚至字符位置。这是构建 RAG（检索增强生成）应用的核心能力。

## 你将学到什么

- 什么是 RAG，为什么需要引用
- 如何开启 Citations 功能
- 不同文档类型的引用格式
- 构建一个简单的 RAG 问答系统

## RAG 简介

**RAG（Retrieval-Augmented Generation）** 的工作流程：

1. **检索**：从你的知识库中找到与问题相关的文档段落
2. **增强**：把检索到的内容作为上下文传给 Claude
3. **生成**：Claude 基于这些内容回答问题，并标注引用

RAG 解决的核心问题：让 Claude 基于你的私有数据回答，而不是凭自己的训练知识。

## 开启 Citations

在 messages 内容中使用 document 类型的内容块：

\`\`\`python
response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    messages=[{
        "role": "user",
        "content": [
            {
                "type": "document",
                "source": {
                    "type": "text",
                    "media_type": "text/plain",
                    "data": "公司年假政策：入职满1年享有5天年假，满3年10天，满5年15天。年假必须在当年使用完毕，不可跨年累积。"
                },
                "title": "公司年假政策",
                "citations": {"enabled": True}
            },
            {
                "type": "text",
                "text": "入职 4 年能有几天年假？"
            }
        ]
    }]
)
\`\`\`

Claude 的回答会包含引用标记，指向原文的具体位置。

## 引用在响应中的格式

开启 Citations 后，响应的 content 数组中会包含 cite 类型的块：

\`\`\`python
for block in response.content:
    if block.type == "text":
        print("回答:", block.text)
    elif block.type == "cite":
        print(f"引用: [{block.cited_text}] (来源: {block.document_title})")
\`\`\`

## 多文档引用

可以同时传入多个文档，Claude 会交叉引用：

\`\`\`python
messages=[{
    "role": "user",
    "content": [
        {
            "type": "document",
            "source": {"type": "text", "media_type": "text/plain",
                       "data": "产品A: 价格100元，功能：数据分析、报表生成"},
            "title": "产品A说明",
            "citations": {"enabled": True}
        },
        {
            "type": "document",
            "source": {"type": "text", "media_type": "text/plain",
                       "data": "产品B: 价格200元，功能：数据分析、报表生成、AI预测"},
            "title": "产品B说明",
            "citations": {"enabled": True}
        },
        {"type": "text", "text": "两款产品的价格和功能有什么区别？"}
    ]
}]
\`\`\`

## 构建简单的 RAG 系统

一个最小化的 RAG 问答系统：

\`\`\`python
import anthropic

client = anthropic.Anthropic()

# 你的知识库（实际项目中用向量数据库）
knowledge_base = {
    "退款政策": "用户在购买后7天内可申请全额退款。超过7天不超过30天可申请50%退款。超过30天不予退款。",
    "配送说明": "标准配送3-5个工作日，加急配送1-2个工作日（额外收费20元）。偏远地区加收10元。",
    "会员权益": "普通会员9折，银卡会员85折，金卡会员8折。金卡会员享有专属客服和优先发货。",
}

def answer_with_citations(question: str):
    # 构建文档内容块
    content = []
    for title, text in knowledge_base.items():
        content.append({
            "type": "document",
            "source": {"type": "text", "media_type": "text/plain", "data": text},
            "title": title,
            "citations": {"enabled": True},
        })
    content.append({"type": "text", "text": question})

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system="你是客服助手。基于提供的文档回答问题，必须引用原文。如果文档中没有相关信息，说明无法回答。",
        messages=[{"role": "user", "content": content}],
    )

    return response.content

result = answer_with_citations("金卡会员买东西打几折？加急配送多少钱？")
for block in result:
    if hasattr(block, "text"):
        print(block.text, end="")
\`\`\`

## RAG 的核心挑战

### 检索质量

RAG 的效果取决于你检索到的文档是否相关。常用方案：

- **向量搜索**：将文档转为向量，用余弦相似度匹配（推荐 OpenAI Embeddings 或 Cohere）
- **关键词搜索**：BM25 算法，适合精确匹配
- **混合搜索**：向量 + 关键词结合

### 分块策略

长文档需要分割成小段落。常见策略：

- 按段落分割（保持语义完整）
- 按固定字数分割（如每 500 字一块）
- 按章节/标题分割

> **Tip:** 分块太小会丢失上下文，太大会引入噪音。一般 300-800 字一块效果较好。

## 实战练习

> **Tip:** 用你公司的文档构建一个简单的 RAG。

1. 准备 3 份文档（FAQ、政策、说明书），用上面的代码让 Claude 回答问题
2. 检查 Claude 的引用是否准确指向原文
3. 试着问一个文档中没有的问题，验证 Claude 是否会坦诚告知

## 关键要点

> **Note:** 本文核心总结

- Citations 让 Claude 自动标注回答的出处
- 通过 document 内容块传入文档，设置 citations.enabled = true
- 支持多文档交叉引用
- RAG 的核心是检索质量，分块策略很重要

## 延伸阅读

- [下一篇：工具调用入门：让 Claude 调用函数](/articles/tool-use-basics)`,
  },

  // ── 6: tool-use-basics ─────────────────────────────────────────────────────
  {
    slug: "tool-use-basics",
    content: `Tool Use（工具调用）是 Claude 最强大的能力之一。它让 Claude 不再只能生成文字——而是可以调用你定义的函数来执行实际操作：查询数据库、调用外部 API、执行计算、操作文件系统。这是构建 AI Agent 的基石。

## 你将学到什么

- Tool Use 的工作原理（请求-响应循环）
- 如何定义工具的 JSON Schema
- 完整的工具调用流程代码
- 多工具场景和最佳实践

## 工作原理

Tool Use 是一个**多步交互**过程：

1. 你定义可用的工具（名称、描述、参数 Schema）
2. 用户提问，Claude 分析后决定是否需要调用工具
3. Claude 返回 tool_use 内容块（包含工具名和参数）
4. **你的代码**执行实际操作，获得结果
5. 你把结果以 tool_result 传回 Claude
6. Claude 基于结果生成最终回答

> **Note:** Claude 自己不能执行函数——它只是决定「调用什么函数、传什么参数」。实际执行在你的代码中完成。

## 定义工具

\`\`\`python
tools = [
    {
        "name": "get_weather",
        "description": "获取指定城市的当前天气信息",
        "input_schema": {
            "type": "object",
            "properties": {
                "city": {
                    "type": "string",
                    "description": "城市名称，如：北京、上海"
                },
                "unit": {
                    "type": "string",
                    "enum": ["celsius", "fahrenheit"],
                    "description": "温度单位，默认摄氏度"
                }
            },
            "required": ["city"]
        }
    }
]
\`\`\`

**描述的重要性：** Claude 根据 description 判断什么时候使用这个工具。描述越清晰，Claude 的判断越准确。

## 完整的调用流程

\`\`\`python
import anthropic
import json

client = anthropic.Anthropic()

# 1. 定义工具
tools = [{
    "name": "get_weather",
    "description": "获取指定城市的当前天气",
    "input_schema": {
        "type": "object",
        "properties": {
            "city": {"type": "string", "description": "城市名称"}
        },
        "required": ["city"]
    }
}]

# 2. 模拟天气查询函数
def get_weather(city: str) -> str:
    # 实际项目中调用天气 API
    weather_data = {"北京": "晴天 25°C", "上海": "多云 22°C", "广州": "小雨 28°C"}
    return weather_data.get(city, f"{city}：暂无数据")

# 3. 发送请求
response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    tools=tools,
    messages=[{"role": "user", "content": "北京和上海今天天气怎么样？"}]
)

# 4. 处理工具调用
messages = [{"role": "user", "content": "北京和上海今天天气怎么样？"}]
messages.append({"role": "assistant", "content": response.content})

# 收集所有 tool_use 块的结果
tool_results = []
for block in response.content:
    if block.type == "tool_use":
        # 执行工具
        result = get_weather(**block.input)
        tool_results.append({
            "type": "tool_result",
            "tool_use_id": block.id,
            "content": result
        })

# 5. 把结果传回 Claude
messages.append({"role": "user", "content": tool_results})

final_response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    tools=tools,
    messages=messages,
)

print(final_response.content[0].text)
\`\`\`

## 工具调用循环

实际应用中，Claude 可能需要多次调用工具。用一个循环处理：

\`\`\`python
def run_agent(user_message: str, tools: list, tool_handlers: dict):
    messages = [{"role": "user", "content": user_message}]

    while True:
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=4096,
            tools=tools,
            messages=messages,
        )

        # 如果没有工具调用，返回文本回答
        if response.stop_reason == "end_turn":
            return response.content[0].text

        # 处理工具调用
        messages.append({"role": "assistant", "content": response.content})

        tool_results = []
        for block in response.content:
            if block.type == "tool_use":
                handler = tool_handlers[block.name]
                result = handler(**block.input)
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": str(result),
                })

        messages.append({"role": "user", "content": tool_results})
\`\`\`

## tool_choice 控制

\`\`\`python
# 自动选择（默认）：Claude 自己决定是否调用工具
tool_choice={"type": "auto"}

# 强制使用某个工具
tool_choice={"type": "tool", "name": "get_weather"}

# 强制使用任意一个工具
tool_choice={"type": "any"}

# 禁止使用工具
tool_choice={"type": "none"}
\`\`\`

## 多工具示例

定义多个工具，让 Claude 自主选择：

\`\`\`python
tools = [
    {
        "name": "search_products",
        "description": "搜索商品，返回名称和价格",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "搜索关键词"},
                "max_results": {"type": "integer", "description": "最大结果数", "default": 5}
            },
            "required": ["query"]
        }
    },
    {
        "name": "get_order_status",
        "description": "查询订单状态",
        "input_schema": {
            "type": "object",
            "properties": {
                "order_id": {"type": "string", "description": "订单编号"}
            },
            "required": ["order_id"]
        }
    },
    {
        "name": "calculate_discount",
        "description": "计算折扣后的价格",
        "input_schema": {
            "type": "object",
            "properties": {
                "price": {"type": "number"},
                "discount_percent": {"type": "number"}
            },
            "required": ["price", "discount_percent"]
        }
    }
]
\`\`\`

Claude 会根据用户的问题自动选择合适的工具：
- 「搜索一下无线耳机」→ search_products
- 「我的订单 ORD-123 到哪了」→ get_order_status
- 「500 块打 8 折多少钱」→ calculate_discount

## 最佳实践

- **工具描述要清晰**：Claude 根据描述选择工具，描述不清会导致选错
- **参数要有 description**：帮助 Claude 填入正确的参数值
- **错误处理**：tool_result 可以返回错误信息，Claude 会据此调整
- **限制工具数量**：同时提供太多工具（>20）可能降低选择准确率

## 实战练习

> **Tip:** 构建你的第一个工具调用应用。

1. 定义 2-3 个工具（如天气查询、汇率换算、翻译），实现完整调用循环
2. 测试 Claude 是否能正确选择工具
3. 尝试一个需要连续调用两个工具才能回答的问题

## 关键要点

> **Note:** 本文核心总结

- Tool Use 让 Claude 调用你定义的函数，实现真正的「行动」能力
- 核心流程：定义工具 → Claude 选择 → 你执行 → 返回结果 → Claude 总结
- 用 tool_choice 控制 Claude 的工具使用行为
- 工具描述的质量直接决定调用准确率

## 延伸阅读

- [下一篇：Web 搜索 & 抓取：构建联网 AI](/articles/web-search-scraping)`,
  },

  // ── 7: web-search-scraping ─────────────────────────────────────────────────
  {
    slug: "web-search-scraping",
    content: `Claude API 提供了两个内置的服务端工具：Web Search（搜索互联网）和 Web Fetch（抓取网页内容）。通过它们，你的应用可以让 Claude 实时搜索信息并提取结构化数据，无需自己集成搜索引擎 API。

## 你将学到什么

- Web Search 和 Web Fetch 工具的使用方式
- 如何在 API 中启用和配置
- 搜索 + 分析的自动化工作流
- 费用和限制

## Web Search 工具

\`\`\`python
response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=4096,
    tools=[{"type": "web_search_20260209"}],
    messages=[{"role": "user", "content": "搜索 React 19 的最新特性"}]
)
\`\`\`

Claude 会自动构造搜索查询，获取结果后整合回答。

**费用：** $10 / 1000 次搜索 + 正常的 token 费用

## Web Fetch 工具

\`\`\`python
response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=4096,
    tools=[{"type": "web_fetch_20260209"}],
    messages=[{
        "role": "user",
        "content": "请抓取 https://example.com/api-docs 的内容，提取所有 API 端点"
    }]
)
\`\`\`

**费用：** 无额外费用，只计 token 成本

## 搜索 + 抓取组合

同时启用两个工���，Claude 可以先搜索再深入阅读：

\`\`\`python
response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=8192,
    tools=[
        {"type": "web_search_20260209"},
        {"type": "web_fetch_20260209"},
    ],
    messages=[{
        "role": "user",
        "content": "搜索 2026 年最好的 Python Web 框架，找到对比文章后提取各框架的优缺点"
    }]
)
\`\`\`

## 实际应用：竞品监控

\`\`\`python
def monitor_competitor(competitor_name: str):
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=4096,
        tools=[{"type": "web_search_20260209"}],
        system="你是竞品分析师。搜索竞品最新动态，用结构化格式报告。",
        messages=[{
            "role": "user",
            "content": f"搜索 {competitor_name} 最近一个月的产品更新、融资新闻和市场动态"
        }],
        output_config={
            "format": {
                "type": "json_schema",
                "schema": {
                    "type": "object",
                    "properties": {
                        "product_updates": {"type": "array", "items": {"type": "string"}},
                        "funding_news": {"type": "array", "items": {"type": "string"}},
                        "market_moves": {"type": "array", "items": {"type": "string"}}
                    },
                    "required": ["product_updates", "funding_news", "market_moves"],
                    "additionalProperties": False
                }
            }
        }
    )
    return response.content[0].text
\`\`\`

> **Tip:** 结合结构化输出，可以把搜索结果直接转换为 JSON 存入数据库。

## 限制和注意事项

- Web Search 每次可能执行多次搜索查询
- 某些网站可能屏蔽爬虫
- 搜索结果的时效性取决于搜索引擎索引
- 大量使用时注意成本控制

## 实战练习

> **Tip:** 构建一个简单的搜索分析工具。

1. 用 Web Search 搜索你所在行业的最新新闻，用结构化输出提取
2. 用 Web Fetch 抓取一个技术文档页面，让 Claude 整理为中文摘要
3. 结合两者构建一个「每日行业简报」自动生成器

## 关键要点

> **Note:** 本文核心总结

- Web Search（$10/千次）和 Web Fetch（免费）是 Claude 内置服务端工具
- 直接在 tools 数组中声明即可使用，无需自己实现
- 搜索 + 抓取 + 结构化输出 = 强大的信息采集管道

## 延伸阅读

- [下一篇：代码执行工具：让 Claude 写代码并运行](/articles/code-execution-tool)`,
  },

  // ── 8: code-execution-tool ─────────────────────────────────────────────────
  {
    slug: "code-execution-tool",
    content: `Claude 不仅能写代码，还能在安全的沙箱环境中**运行代码**。Code Execution Tool 让 Claude 编写 Python 代码并立即执行——进行数据分析、生成图表、验证数学计算、处理文件。这把 Claude 从「代码建议者」变成了「代码执行者」。

## 你将学到什么

- Code Execution Tool 的工作原理
- 如何在 API 中启用
- 数据分析和可视化的实战用法
- 安全模型和限制

## 启用代码执行

\`\`\`python
response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=4096,
    tools=[{"type": "code_execution_20250522"}],
    messages=[{
        "role": "user",
        "content": "计算斐波那契数列的前 20 项，并画一个增长趋势图"
    }]
)
\`\`\`

Claude 会自动编写 Python 代码、在沙箱中执行、返回结果（包括图表图片）。

## 执行环境

- **语言**：Python（预装 numpy、pandas、matplotlib、scipy 等常用库）
- **安全**：隔离的沙箱环境，无网络访问，无文件系统持久化
- **超时**：单次执行有时间限制
- **输出**：支持文本输出和图片输出（matplotlib 图表）

## 实际应用：数据分析

\`\`\`python
response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=8192,
    tools=[{"type": "code_execution_20250522"}],
    messages=[{
        "role": "user",
        "content": """以下是我们上半年的月度销售数据（万元）：
1月: 120, 2月: 95, 3月: 145, 4月: 160, 5月: 180, 6月: 210

请用 Python：
1. 计算平均值、中位数、标准差
2. 计算环比增长率
3. 画一个折线图（带数据标签）
4. 用线性回归预测 7月的销售额"""
    }]
)
\`\`\`

## 费用

- 与 Web Search/Fetch 搭配使用时免费
- 单独使用时按执行时间计费：$0.05/小时（每月有 1550 小时免费额度）

> **Tip:** 大多数数据分析任务执行时间不超过几秒，费用几乎可以忽略。

## 实战练习

> **Tip:** 让 Claude 帮你做一次数据分析。

1. 提供一组销售/用户数据，让 Claude 执行统计分析并生成图表
2. 给一道数学题，让 Claude 用代码验证答案
3. 让 Claude 写一个数据清洗脚本并立即执行

## 关键要点

> **Note:** 本文核心总结

- Code Execution 让 Claude 在沙箱中运行 Python 代码
- 适合数据分析、可视化、数学验证等场景
- 安全隔离，无网络访问
- 费用极低，大部分场景免费

## 延伸阅读

- [下一篇：文件上传：批量处理文档](/articles/files-api)`,
  },

  // ── 9: files-api ───────────────────────────────────────────────────────────
  {
    slug: "files-api",
    content: `Files API 让你上传文件到 Anthropic 平台，然后在多次对话中重复引用——不需要每次都重新上传。这对于批量处理文档、构建知识库、反复分析同一份数据等场景非常实用。

## 你将学到什么

- Files API 的上传和引用方式
- 支持的文件类型和大小限制
- 批量文档处理工作流
- 与 Citations 的结合使用

## 上传文件

\`\`\`python
# 上传文件
file = client.files.create(
    file=open("report.pdf", "rb"),
    purpose="user_message",
)

print(file.id)  # file_abc123
\`\`\`

## 在对话中引用

\`\`\`python
response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=4096,
    messages=[{
        "role": "user",
        "content": [
            {
                "type": "document",
                "source": {
                    "type": "file",
                    "file_id": "file_abc123"
                },
                "citations": {"enabled": True}
            },
            {"type": "text", "text": "总结这份报告的核心要点"}
        ]
    }]
)
\`\`\`

> **Note:** 使用 Files API 需要 beta header：files-api-2025-04-14

## 支持的文件类型

- **文档**：PDF、TXT、Markdown、HTML
- **图片**：JPEG、PNG、GIF、WebP
- **数据**：CSV、JSON
- **大小限制**：单文件最大 32MB

## 批量处理示例

\`\`\`python
import os

# 上传所有 PDF
file_ids = []
for filename in os.listdir("documents/"):
    if filename.endswith(".pdf"):
        f = client.files.create(
            file=open(f"documents/{filename}", "rb"),
            purpose="user_message",
        )
        file_ids.append((filename, f.id))

# 批量分析
for filename, fid in file_ids:
    response = client.messages.create(
        model="claude-haiku-4-5",  # 用 Haiku 节省成本
        max_tokens=2048,
        messages=[{
            "role": "user",
            "content": [
                {"type": "document", "source": {"type": "file", "file_id": fid}},
                {"type": "text", "text": "提取文档的标题、作者、摘要，用 JSON 格式返回"}
            ]
        }],
    )
    print(f"{filename}: {response.content[0].text}")
\`\`\`

## 文件管理

\`\`\`python
# 列出所有文件
files = client.files.list()

# 获取文件信息
file_info = client.files.retrieve("file_abc123")

# 删除文件
client.files.delete("file_abc123")
\`\`\`

## 实战练习

> **Tip:** 用 Files API 处理你的文档。

1. 上传 3 份 PDF，让 Claude 分别生成摘要
2. 构建一个多文档问答：上传多个文件，让 Claude 跨文档回答问题

## 关键要点

> **Note:** 本文核心总结

- Files API 让你上传一次、多次引用，省去重复传输
- 支持 PDF、图片、数据文件等多种格式
- 配合 Haiku 模型进行批量处理，成本极低
- 需要 beta header 启用

## 延伸阅读

- [下一篇：Prompt 缓存：降低成本的技巧](/articles/prompt-caching)`,
  },

  // ── 10: prompt-caching ─────────────────────────────────────────────────────
  {
    slug: "prompt-caching",
    content: `每次 API 请求，Claude 都要处理你发送的全部 token——包括 system prompt、工具定义、历史消息。如果你的 system prompt 有 5000 token，每次请求都重复处理这 5000 token，浪费且昂贵。Prompt Caching 解决了这个问题：缓存不变的前缀，后续请求只需处理新增内容，**节省高达 90% 的输入 token 费用**。

## 你将学到什么

- Prompt Caching 的工作原理
- 两种缓存方式（自动和手动）
- 实际的节省效果和计费方式
- 最佳实践和常见陷阱

## 工作原理

Prompt Caching 缓存请求的**前缀**（prefix）。当多次请求共享相同的前缀时：

1. **首次请求**：完整处理，写入缓存（多付 25% 写入费）
2. **后续请求**：读取缓存（只付 10% 的费用）
3. **缓存有效期**：5 分钟（每次命中刷新），可选 1 小时

## 自动缓存（最简单）

\`\`\`python
response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    cache_control={"type": "ephemeral"},  # 一行启用
    system="你是一位专业的法律顾问..." ,  # 长 system prompt
    messages=[{"role": "user", "content": "合同违约怎么赔偿？"}]
)
\`\`\`

## 手动缓存断点（精确控制）

\`\`\`python
response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    system=[{
        "type": "text",
        "text": "你是法律顾问，以下是参考法条...（5000字）",
        "cache_control": {"type": "ephemeral"}  # 在这里设置缓存断点
    }],
    messages=[
        {"role": "user", "content": "违约金怎么计算？"}
    ]
)
\`\`\`

## 费用对比

以 Sonnet 4.6 为例（每百万 token）：

- **无缓存**：输入 $3.00
- **缓存写入**：$3.75（1.25 倍）
- **缓存读取**：$0.30（0.1 倍）

**实际场景**：5000 token 的 system prompt，进行 100 次对话

- 无缓存：5000 × 100 × $3/M = $1.50
- 有缓存：5000 × $3.75/M（写入 1 次）+ 5000 × 99 × $0.30/M（读取 99 次）= $0.17

**节省 89%！**

## 查看缓存命中情况

\`\`\`python
print(response.usage)
# input_tokens: 50
# cache_creation_input_tokens: 5000  ← 首次：写入缓存
# cache_read_input_tokens: 0

# 第二次请求
# input_tokens: 50
# cache_creation_input_tokens: 0
# cache_read_input_tokens: 5000     ← 命中缓存！
\`\`\`

## 可缓存的内容

按处理顺序，前缀匹配：

1. **tools**（工具定义）
2. **system**（系统提示词）
3. **messages**（对话消息）

> **Tip:** 把最长且最不变的内容放在最前面（tools → system → 静态消息），效果最好。

## 最佳实践

- **长 system prompt 一定要缓存**：超过 1000 token 就值得
- **多轮对话天然受益**：历史消息作为前缀自动缓存
- **批量调用同一 prompt**：第一次写入，后续全部命中
- **工具定义也可以缓存**：如果你的 tools 数组很大

## 常见陷阱

- 缓存只匹配**完全相同的前缀**，改一个字就失效
- 最小缓存内容因模型而异（通常 1024+ token）
- 5 分钟不访问就过期

## 实战练习

> **Tip:** 在你的应用中启用缓存。

1. 给你的 API 调用加上 cache_control，观察 usage 中的缓存指标
2. 计算你的应用在有缓存和无缓存下的月度成本差异
3. 优化请求结构，把静态内容放在前缀位置

## 关键要点

> **Note:** 本文核心总结

- Prompt Caching 缓存请求前缀，后续只付 10% 费用
- 一行代码启用：cache_control={"type": "ephemeral"}
- 长 system prompt + 多轮对话 + 批量调用场景收益最大
- 通过 usage 字段监控缓存命中率

## 延伸阅读

- [下一篇：批量处理：大规模任务省 50%](/articles/batch-processing)`,
  },

  // ── 11: batch-processing ───────────────────────────────────────────────────
  {
    slug: "batch-processing",
    content: `如果你需要用 Claude 处理成百上千条数据——翻译 1000 篇文章、分类 10000 条评论、从 500 份简历中提取信息——逐条调用 API 太慢也太贵。Message Batches API 提供异步批量处理，**所有模型直接打五折**。

## 你将学到什么

- Batch API 的工作流程
- 如何创建和管理批量任务
- 费用节省的实际数据
- 适用场景和限制

## 工作流程

1. **创建批量任务**：提交一组请求（最多 10000 条）
2. **异步处理**：Anthropic 后台处理，24 小时内完成
3. **查询状态**：定期检查任务进度
4. **获取结果**：任务完成后下载结果

## 创建批量任务

\`\`\`python
batch = client.messages.batches.create(
    requests=[
        {
            "custom_id": "review-001",
            "params": {
                "model": "claude-haiku-4-5",
                "max_tokens": 512,
                "messages": [{"role": "user", "content": "分析这条评论的情感：太好用了！强烈推荐"}]
            }
        },
        {
            "custom_id": "review-002",
            "params": {
                "model": "claude-haiku-4-5",
                "max_tokens": 512,
                "messages": [{"role": "user", "content": "分析这条评论的情感：快递太慢了，等了一周"}]
            }
        },
        # ... 更多请求
    ]
)

print(batch.id)  # batch_abc123
\`\`\`

## 查询状态

\`\`\`python
batch_status = client.messages.batches.retrieve(batch.id)
print(batch_status.processing_status)  # in_progress / ended
print(batch_status.request_counts)
# {"processing": 50, "succeeded": 150, "errored": 0, "canceled": 0, "expired": 0}
\`\`\`

## 获取结果

\`\`\`python
# 任务完成后
for result in client.messages.batches.results(batch.id):
    print(f"ID: {result.custom_id}")
    if result.result.type == "succeeded":
        print(f"回答: {result.result.message.content[0].text}")
    else:
        print(f"错误: {result.result.error}")
\`\`\`

## 费用对比

所有模型批量处理一律五折：

- Opus 4.6：$2.50/$12.50（原 $5/$25）
- Sonnet 4.6：$1.50/$7.50（原 $3/$15）
- Haiku 4.5：$0.50/$2.50（原 $1/$5）

**实际例子**：用 Haiku 分析 10000 条评论，每条约 200 输入 + 100 输出 token

- 同步 API：200 × 10000 × $1/M + 100 × 10000 × $5/M = $7.00
- 批量 API：$3.50（直接五折）

## 适用场景

- **内容分类**：大量文本的情感分析、标签标注
- **数据提取**：从文档中批量提取结构化信息
- **翻译**：大批量文本翻译
- **摘要**：批量生成文章摘要
- **评估**：大量 prompt 的质量评估

## 限制

- 最多 10000 条请求每批
- 24 小时内处理完成（通常更快）
- 不支持流式输出
- 不保证处理顺序

> **Tip:** 批量 API + Haiku 模型是成本最低的组合。对于不需要实时响应的任务，这是最佳选择。

## 实战练习

> **Tip:** 用批量 API 处理一批数据。

1. 准备 100 条文本数据，创建一个批量分类任务
2. 监控任务进度，获取结果
3. 对比同步 API 和批量 API 的费用差异

## 关键要点

> **Note:** 本文核心总结

- Message Batches API 提供异步批量处理，所有模型五折
- 最多 10000 条请求，24 小时内完成
- 适合不需要实时响应的大规模数据处理
- Haiku + Batch 是成本效率最高的组合

## 延伸阅读

- [下一篇：Token 管理：计数、优化、控制成本](/articles/token-management)`,
  },

  // ── 12: token-management ───────────────────────────────────────────────────
  {
    slug: "token-management",
    content: `使用 Claude API 的费用完全取决于 token 消耗。理解 token 是什么、如何计算、如何优化，是控制 AI 应用成本的关键。本文教你精确管理 token 用量。

## 你将学到什么

- 什么是 token，中文和英文的 token 差异
- 如何预估和计算 token 用量
- 用 Effort 参数控制思考深度
- 5 个降低 token 消耗的实用技巧

## Token 基础

Token 是语言模型处理文本的基本单位。粗略来说：

- **英文**：1 个 token ≈ 4 个字符 ≈ 0.75 个单词
- **中文**：1 个 token ≈ 1.5 个汉字

也就是说，同样的内容用中文表达比英文消耗更多 token。

## Token 计数 API

\`\`\`python
# 精确计算 token 数量
count = client.messages.count_tokens(
    model="claude-sonnet-4-6",
    messages=[{"role": "user", "content": "你好，请帮我分析一下这段代码"}],
    system="你是一位代码审查专家。",
)

print(count.input_tokens)  # 精确的输入 token 数
\`\`\`

## 输入和输出分开计费

**输入 token**：你发送给 Claude 的内容（system + messages + tools）
**输出 token**：Claude 生成的回答

输出价格通常是输入的 3-5 倍，所以控制输出长度比控制输入更能省钱。

## Effort 参数

控制 Claude 在回答前的思考深度：

\`\`\`python
# 低 effort：快速回答，少思考
response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    thinking={"type": "adaptive", "effort": "low"},
    messages=[{"role": "user", "content": "1+1等于多少？"}]
)

# 高 effort：深度思考，消耗更多 token
response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=8192,
    thinking={"type": "adaptive", "effort": "high"},
    messages=[{"role": "user", "content": "证明费马大定理"}]
)
\`\`\`

> **Tip:** 简单问题用 low effort，复杂推理用 high effort。默认是 medium。

## 5 个降低 token 消耗的技巧

### 技巧一：精简 System Prompt

\`\`\`
❌ 冗长：你是一位经验丰富的、在行业内享有盛誉的高级软件工程师...（200字）
✅ 精简：你是高级软件工程师。回答简洁，附代码示例。
\`\`\`

### 技巧二：限制输出长度

\`\`\`python
# 在 prompt 中要求简洁
messages=[{"role": "user", "content": "用 3 句话总结这篇文章"}]

# 同时设置合理的 max_tokens
max_tokens=500  # 而不是 4096
\`\`\`

### 技巧三：选择合适的模型

简单任务用 Haiku（$1/$5），复杂任务才用 Opus（$5/$25）。

### 技巧四：管理对话历史

多轮对话中，每次请求都带上所有历史。定期清理或总结历史消息。

### 技巧五：使用缓存

Prompt Caching 节省 90% 的重复输入 token 费用。

## 成本监控

\`\`\`python
# 每次请求后记录用量
usage = response.usage
cost = (
    usage.input_tokens * 3 / 1_000_000 +  # Sonnet 输入 $3/M
    usage.output_tokens * 15 / 1_000_000   # Sonnet 输出 $15/M
)
print(f"本次费用: \${cost:.6f}")
\`\`\`

## 实战练习

> **Tip:** 开始监控你的 API 使用成本。

1. 用 count_tokens API 预估你一个典型请求的 token 用量
2. 记录 10 次请求的实际 token 消耗，计算平均成本
3. 尝试用 Effort 参数优化一个任务的成本

## 关键要点

> **Note:** 本文核心总结

- 中文约 1.5 字 = 1 token，输出比输入贵 3-5 倍
- 用 count_tokens API 精确预估费用
- Effort 参数控制思考深度和成本
- 5 个省钱技巧：精简 prompt、限制输出、选对模型、管理历史、启用缓存

## 延伸阅读

- [下一篇：Python SDK 实战项目](/articles/python-sdk-project)`,
  },

  // ── 13: python-sdk-project ─────────────────────────────────────────────────
  {
    slug: "python-sdk-project",
    content: `理论学够了，现在来一个完整项目。我们将用 Python + Claude SDK 构建一个「智能文档问答助手」——用户上传文档，AI 回答问题并引用原文。这个项目综合运用了多轮对话、工具调用、结构化输出等你之前学到的技能。

## 你将学到什么

- 从零搭建一个完整的 Claude Python 项目
- 项目结构和依赖管理
- 实现文档问答的核心功能
- 对话历史管理和成本优化

## 项目概述

**功能：**
- 用户加载本地文档（TXT/Markdown）
- 提出问题，Claude 基于文档内容回答
- 回答附带引用标记
- 支持多轮追问
- 显示每次的 token 用量和费用

## 项目结构

\`\`\`
doc-qa-assistant/
  main.py          # 入口
  assistant.py     # 核心逻辑
  requirements.txt
  .env             # API Key
\`\`\`

## requirements.txt

\`\`\`
anthropic>=0.40.0
python-dotenv>=1.0.0
\`\`\`

## assistant.py — 核心代码

\`\`\`python
import anthropic
from pathlib import Path

class DocQAAssistant:
    def __init__(self):
        self.client = anthropic.Anthropic()
        self.messages = []
        self.documents = []
        self.total_input_tokens = 0
        self.total_output_tokens = 0

    def load_document(self, path: str):
        text = Path(path).read_text(encoding="utf-8")
        self.documents.append({
            "title": Path(path).name,
            "content": text
        })
        print(f"已加载: {Path(path).name} ({len(text)} 字)")

    def ask(self, question: str) -> str:
        # 构建消息内容
        content = []
        for doc in self.documents:
            content.append({
                "type": "document",
                "source": {
                    "type": "text",
                    "media_type": "text/plain",
                    "data": doc["content"],
                },
                "title": doc["title"],
                "citations": {"enabled": True},
            })
        content.append({"type": "text", "text": question})

        self.messages.append({"role": "user", "content": content})

        response = self.client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=2048,
            system="你是文档问答助手。基于提供的文档回答问题，引用原文。如果文档中没有相关信息，坦诚告知。",
            messages=self.messages,
        )

        # 更新统计
        self.total_input_tokens += response.usage.input_tokens
        self.total_output_tokens += response.usage.output_tokens

        # 提取回答文本
        answer_parts = []
        for block in response.content:
            if hasattr(block, "text"):
                answer_parts.append(block.text)

        answer = "".join(answer_parts)
        self.messages.append({"role": "assistant", "content": response.content})

        return answer

    def get_cost(self) -> float:
        return (
            self.total_input_tokens * 3 / 1_000_000 +
            self.total_output_tokens * 15 / 1_000_000
        )
\`\`\`

## main.py — 入口

\`\`\`python
from dotenv import load_dotenv
from assistant import DocQAAssistant

load_dotenv()

def main():
    assistant = DocQAAssistant()

    # 加载文档
    print("请输入文档路径（输入空行结束）：")
    while True:
        path = input("> ").strip()
        if not path:
            break
        assistant.load_document(path)

    if not assistant.documents:
        print("未加载任何文档，退出。")
        return

    # 对话循环
    print("\\n文档已就绪。开始提问（输入 quit 退出）：\\n")
    while True:
        question = input("你: ").strip()
        if question.lower() == "quit":
            break

        answer = assistant.ask(question)
        print(f"\\nAssistant: {answer}")
        print(f"  [累计费用: \${assistant.get_cost():.4f}]\\n")

    print(f"\\n总费用: \${assistant.get_cost():.4f}")

if __name__ == "__main__":
    main()
\`\`\`

## 运行

\`\`\`bash
# 安装依赖
pip install -r requirements.txt

# 设置 API Key
echo "ANTHROPIC_API_KEY=sk-ant-your-key" > .env

# 运行
python main.py
\`\`\`

## 扩展方向

- **添加 PDF 支持**：用 PyPDF2 提取 PDF 文本
- **向量检索**：文档太长时先做向量搜索，只传相关段落
- **Web 界面**：用 Streamlit 或 Gradio 添加 UI
- **缓存优化**：文档内容用 Prompt Caching 缓存

## 实战练习

> **Tip:** 把这个项目跑起来。

1. 复制上面的代码，创建项目并运行
2. 加载一份你的文档，测试问答效果
3. 添加一个新功能：让 Claude 生成文档的摘要

## 关键要点

> **Note:** 本文核心总结

- 完整项目包含：文档加载、多轮问答、引用标注、成本追踪
- 核心是 messages 数组的管理和 Citations 的使用
- 实际项目中要加入向量检索处理长文档
- 监控 token 消耗是必须的

## 延伸阅读

- [下一篇：TypeScript SDK 实战项目](/articles/typescript-sdk-project)`,
  },

  // ── 14: typescript-sdk-project ─────────────────────────────────────────────
  {
    slug: "typescript-sdk-project",
    content: `上一篇用 Python 做了文档问答，这篇用 TypeScript + Next.js 构建一个完整的 Web 聊天应用——包含流式响应、会话管理和前端渲染。这是最接近生产级 AI 应用的入门项目。

## 你将学到什么

- Next.js API Route 集成 Claude SDK
- 流式响应（SSE）的实现
- 前端实时渲染流式文本
- 会话管理和错误处理

## 项目结构

\`\`\`
chat-app/
  app/
    api/chat/route.ts     # API 端点
    page.tsx              # 前端页面
  lib/
    claude.ts             # Claude 客户端封装
  package.json
\`\`\`

## 安装依赖

\`\`\`bash
npx create-next-app@latest chat-app --typescript --tailwind
cd chat-app
npm install @anthropic-ai/sdk
\`\`\`

## lib/claude.ts — SDK 封装

\`\`\`typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function* streamChat(
  messages: Anthropic.MessageParam[],
  system?: string
) {
  const stream = client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: system || "你是一位友好的中文助手。",
    messages,
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      yield event.delta.text;
    }
  }
}
\`\`\`

## app/api/chat/route.ts — API 端点

\`\`\`typescript
import { streamChat } from "@/lib/claude";

export async function POST(req: Request) {
  const { messages, system } = await req.json();

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamChat(messages, system)) {
          controller.enqueue(encoder.encode(chunk));
        }
      } catch (error) {
        controller.enqueue(
          encoder.encode("[ERROR] 请求失败，请重试")
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
\`\`\`

## 前端核心逻辑

\`\`\`typescript
// 发送消息并流式接收
async function sendMessage(input: string) {
  const newMessages = [
    ...messages,
    { role: "user" as const, content: input },
  ];

  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: newMessages }),
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let assistantText = "";

  while (reader) {
    const { done, value } = await reader.read();
    if (done) break;
    assistantText += decoder.decode(value);
    // 实时更新 UI
    setCurrentResponse(assistantText);
  }

  // 完成后保存到消息历史
  setMessages([
    ...newMessages,
    { role: "assistant", content: assistantText },
  ]);
}
\`\`\`

## 流式响应的优势

- **即时反馈**：用户不用等 Claude 生成完整回答
- **更好的体验**：逐字出现，像真人在打字
- **节省等待**：长回答可能需要 10-20 秒，流式让用户立刻看到内容

## 错误处理

\`\`\`typescript
// 在 API 端点中添加错误处理
try {
  for await (const chunk of streamChat(messages)) {
    controller.enqueue(encoder.encode(chunk));
  }
} catch (error) {
  if (error instanceof Anthropic.RateLimitError) {
    controller.enqueue(encoder.encode("请求太频繁，请稍后重试"));
  } else if (error instanceof Anthropic.AuthenticationError) {
    controller.enqueue(encoder.encode("API Key 配置错误"));
  }
}
\`\`\`

## 扩展方向

- **添加对话历史持久化**：保存到数据库
- **支持多模型切换**：前端选择 Opus/Sonnet/Haiku
- **添加工具调用**：集成搜索、计算等工具
- **部署到 Vercel**：一键部署上线

## 实战练习

> **Tip:** 搭建你的第一个 AI Web 应用。

1. 用上面的代码创建项目并运行
2. 添加一个「清空对话」按钮
3. 在前端显示每次请求的 token 用量

## 关键要点

> **Note:** 本文核心总结

- Next.js API Route + Claude SDK 是构建 AI Web 应用的黄金组合
- 流式响应通过 ReadableStream + SSE 实现
- 前端用 reader.read() 循环实时渲染
- 错误处理和会话管理是生产级应用的必要组件

## 延伸阅读

- [下一篇：错误处理与速率限制](/articles/error-handling-rate-limits)`,
  },

  // ── 15: error-handling-rate-limits ─────────────────────────────────────────
  {
    slug: "error-handling-rate-limits",
    content: `当你的 AI 应用从开发阶段走向生产，错误处理和速率限制就成了必须面对的问题。API 会返回各种错误码，请求可能被限速，网络可能中断。本文教你构建健壮的错误处理体系，让你的应用在生产环境中稳定运行。

## 你将学到什么

- Claude API 的错误码体系
- 速率限制的机制和应对策略
- 指数退避重试的实现
- 生产级错误处理的最佳实践

## API 错误码

Claude API 使用标准 HTTP 状态码：

**400 Bad Request** — 请求参数有误

\`\`\`python
# 常见原因：messages 格式错误、model 名称拼写错误
# 解决：检查请求参数
\`\`\`

**401 Unauthorized** — API Key 无效

**403 Forbidden** — 没有权限访问该资源

**429 Too Many Requests** — 速率限制

**500 Internal Server Error** — Anthropic 服务端错误

**529 Overloaded** — 服务过载，稍后重试

## 速率限制机制

Anthropic 按**使用量等级**（Usage Tier）设定速率限制：

**限制维度：**
- **RPM**（Requests Per Minute）：每分钟请求数
- **TPM**（Tokens Per Minute）：每分钟 token 数
- **TPD**（Tokens Per Day）：每天总 token 数

**响应头信息：**

\`\`\`
anthropic-ratelimit-requests-limit: 60
anthropic-ratelimit-requests-remaining: 55
anthropic-ratelimit-requests-reset: 2026-03-04T12:00:30Z
anthropic-ratelimit-tokens-limit: 100000
anthropic-ratelimit-tokens-remaining: 95000
\`\`\`

## 指数退避重试

遇到 429 或 529 错误时，不要立刻重试——使用指数退避：

\`\`\`python
import anthropic
import time
import random

client = anthropic.Anthropic()

def call_with_retry(messages, max_retries=5):
    for attempt in range(max_retries):
        try:
            return client.messages.create(
                model="claude-sonnet-4-6",
                max_tokens=1024,
                messages=messages,
            )
        except anthropic.RateLimitError:
            if attempt == max_retries - 1:
                raise
            # 指数退避 + 随机抖动
            wait = (2 ** attempt) + random.random()
            print(f"速率限制，{wait:.1f}秒后重试...")
            time.sleep(wait)
        except anthropic.InternalServerError:
            if attempt == max_retries - 1:
                raise
            wait = (2 ** attempt) + random.random()
            print(f"服务器错误，{wait:.1f}秒后重试...")
            time.sleep(wait)
\`\`\`

## SDK 内置重试

Python 和 TypeScript SDK 都内置了自动重试：

\`\`\`python
# Python SDK 默认对 429/500/529 自动重试 2 次
client = anthropic.Anthropic(
    max_retries=3,  # 自定义重试次数
    timeout=60.0,   # 超时时间（秒）
)
\`\`\`

\`\`\`typescript
// TypeScript SDK
const client = new Anthropic({
  maxRetries: 3,
  timeout: 60000,
});
\`\`\`

## 生产级错误处理

\`\`\`python
import anthropic
import logging

logger = logging.getLogger(__name__)

def safe_call(messages, system=None):
    try:
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=4096,
            system=system,
            messages=messages,
        )
        return {
            "success": True,
            "text": response.content[0].text,
            "usage": {
                "input": response.usage.input_tokens,
                "output": response.usage.output_tokens,
            }
        }
    except anthropic.AuthenticationError:
        logger.error("API Key 无效")
        return {"success": False, "error": "认证失败，请检查 API Key"}
    except anthropic.RateLimitError as e:
        logger.warning(f"速率限制: {e}")
        return {"success": False, "error": "请求太频繁，请稍后重试"}
    except anthropic.BadRequestError as e:
        logger.error(f"请求参数错误: {e}")
        return {"success": False, "error": "请求参数有误"}
    except anthropic.APIError as e:
        logger.error(f"API 错误: {e}")
        return {"success": False, "error": "服务暂时不可用，请稍后重试"}
    except Exception as e:
        logger.exception(f"未知错误: {e}")
        return {"success": False, "error": "发生未知错误"}
\`\`\`

## 监控和告警

生产环境中要监控：

- **错误率**：429 和 500 错误的频率
- **延迟**：API 响应时间的 P50/P95/P99
- **token 消耗**：日/周/月的 token 用量趋势
- **成本**：实际花费 vs 预算

> **Tip:** 将每次请求的 usage 数据写入日志或数据库，定期分析成本趋势。

## 提升使用量等级

如果你经常遇到速率限制，可以通过增加充值金额来提升 Usage Tier，获得更高的限制额度。在 console.anthropic.com 查看你当前的等级和限额。

## 实战练习

> **Tip:** 让你的应用更健壮。

1. 给你的 API 调用添加完整的错误处理（参考上面的 safe_call）
2. 实现指数退避重试逻辑
3. 添加日志记录，追踪每次请求的 token 用量和延迟

## 关键要点

> **Note:** 本文核心总结

- 关键错误码：429（限速）、500（服务错误）、529（过载）
- 速率限制按 RPM/TPM/TPD 三个维度
- 指数退避 + 随机抖动是标准的重试策略
- SDK 内置了自动重试，生产中还需要自定义错误处理
- 监控错误率、延迟和成本是生产运维的必要工作

## 延伸阅读

- 恭喜你完成了「Claude API 开发」系列全部 15 篇课程！
- [进入下一阶段：Agent 架构设计](/articles/agent-architecture)`,
  },
];

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Updating " + tutorials.length + " intermediate tutorials...");

  let updated = 0;
  for (const t of tutorials) {
    const result = await prisma.article.updateMany({
      where: { slug: t.slug },
      data: {
        content: t.content,
        readingTime: Math.ceil(t.content.length / 500),
      },
    });

    if (result.count > 0) {
      const chars = t.content.length;
      const mins = Math.ceil(chars / 500);
      console.log("  UPDATE: " + t.slug + " (" + chars + " chars, ~" + mins + " min read)");
      updated++;
    } else {
      console.log("  SKIP: " + t.slug + " (not found in database)");
    }
  }

  console.log("\nDone: " + updated + " articles updated.");

  // Publish all intermediate tutorials
  const published = await prisma.article.updateMany({
    where: { series: "Claude API 开发", publishedAt: null },
    data: { publishedAt: new Date() },
  });
  console.log("Published: " + published.count + " intermediate articles.");
}

main()
  .catch((err) => {
    console.error("Update failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
