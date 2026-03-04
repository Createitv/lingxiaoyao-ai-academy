/**
 * Update advanced tutorial articles with full content.
 *
 * Usage: npx tsx scripts/update-advanced-tutorials.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface TutorialContent {
  slug: string;
  content: string;
}

const tutorials: TutorialContent[] = [
  // ── 1: agent-architecture ───────────────────────────────────────────────────
  {
    slug: "agent-architecture",
    content: `AI Agent 不是简单的"多轮对话"。它是一个自主决策的循环系统——感知环境、选择行动、执行工具、观察结果、决定下一步。本文深入讲解 Agent 的核心架构，从最简单的 ReAct 模式到 Claude 的四层架构。

## 你将学到什么

- Agent 与 Chatbot 的本质区别
- ReAct（Reasoning + Acting）架构模式
- Claude Agent 的四层架构设计
- 从零实现一个自主决策的 Agent Loop

## Agent 与 Chatbot 的区别

Chatbot 是**被动的**——用户发消息，AI 回复，一问一答。Agent 是**主动的**——它会自主决定"接下来该做什么"，直到任务完成。

| 对比项 | Chatbot | Agent |
|--------|---------|-------|
| 交互方式 | 一问一答 | 自主循环 |
| 工具使用 | 无或固定 | 动态选择 |
| 任务范围 | 单轮回答 | 多步骤复杂任务 |
| 终止条件 | 用户停止 | 任务完成 |

## ReAct 架构模式

ReAct 是 Agent 最经典的设计模式。核心思想：**先推理（Reason），再行动（Act）**。

\`\`\`
用户: "帮我查一下北京今天的天气，然后发给张三"

Agent 思考: 用户要查天气并发送，我需要：
  1. 先调用天气 API 查北京天气
  2. 再调用消息 API 发送给张三

Agent 行动 1: 调用 get_weather(city="北京")
观察结果: 晴，25°C，东风3级

Agent 思考: 已获取天气信息，现在发送给张三
Agent 行动 2: 调用 send_message(to="张三", content="北京今天晴，25°C")
观察结果: 发送成功

Agent 思考: 两步都完成了，任务结束
Agent 回复: "已查到北京今天晴，25°C，东风3级，已发送给张三。"
\`\`\`

## Claude Agent 四层架构

Claude 的 Agent 系统采用四层设计：

**第一层：Agent Loop（决策循环）**
核心循环——接收输入 → 推理 → 选择工具 → 执行 → 观察结果 → 继续或停止。

**第二层：Runtime（运行时）**
管理 Agent 的执行环境：对话历史、token 计数、上下文压缩、权限控制。

**第三层：MCP（模型上下文协议）**
标准化的工具接口层。Agent 通过 MCP 连接各种外部服务，无需为每个工具写专门的集成代码。

**第四层：Skills（能力模块）**
高级能力包——PDF 处理、代码执行、网页抓取等。每个 Skill 可以包含多个工具和专门的 prompt。

## 实现一个 Agent Loop

\`\`\`python
import anthropic

client = anthropic.Anthropic()

tools = [
    {
        "name": "search_web",
        "description": "搜索互联网获取最新信息",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "搜索关键词"}
            },
            "required": ["query"]
        }
    },
    {
        "name": "calculate",
        "description": "执行数学计算",
        "input_schema": {
            "type": "object",
            "properties": {
                "expression": {"type": "string", "description": "数学表达式"}
            },
            "required": ["expression"]
        }
    }
]

def execute_tool(name, input_data):
    """模拟工具执行"""
    if name == "search_web":
        return f"搜索结果: 关于'{input_data['query']}'的信息..."
    elif name == "calculate":
        return str(eval(input_data["expression"]))
    return "未知工具"

def agent_loop(user_message, max_iterations=10):
    messages = [{"role": "user", "content": user_message}]

    for i in range(max_iterations):
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=4096,
            tools=tools,
            messages=messages,
        )

        # 检查是否需要调用工具
        if response.stop_reason == "tool_use":
            # 收集所有工具调用
            tool_results = []
            for block in response.content:
                if block.type == "tool_use":
                    result = execute_tool(block.name, block.input)
                    print(f"  工具调用: {block.name} → {result[:50]}")
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": result
                    })

            messages.append({"role": "assistant", "content": response.content})
            messages.append({"role": "user", "content": tool_results})
        else:
            # Agent 决定停止，返回最终回复
            final_text = ""
            for block in response.content:
                if hasattr(block, "text"):
                    final_text += block.text
            return final_text

    return "达到最大迭代次数"

# 运行
result = agent_loop("搜索一下 Claude 4.6 的最新定价，然后帮我算一下处理 100 万个 token 的输入输出总费用")
print(result)
\`\`\`

## 关键设计决策

**何时停止循环？**
- Claude 返回 \`stop_reason: "end_turn"\` 时自然停止
- 设置最大迭代次数（防止无限循环）
- 检测重复行为（Agent 在做同样的事情）

**错误处理策略：**
- 工具失败时，将错误信息返回给 Agent，让它决定是否重试或换方案
- 设置超时机制
- 记录每一步的日志

## 实战练习

> **Tip:** 动手构建你的第一个 Agent。

1. 复制上面的 Agent Loop 代码，添加一个新工具（如 \`get_time\`）
2. 让 Agent 处理一个需要多步推理的任务
3. 添加日志记录，观察 Agent 的决策过程

## 关键要点

> **Note:** 本文核心总结

- Agent = 自主决策循环，不是简单的多轮对话
- ReAct 模式：先推理再行动，循环执行直到任务完成
- Claude 四层架构：Agent Loop → Runtime → MCP → Skills
- \`stop_reason\` 是判断 Agent 是否继续循环的关键

## 延伸阅读

- 下一篇：多工具编排——当 Agent 有很多工具时如何管理
- Anthropic 官方 Agent 设计指南`,
  },
  // ── 2: multi-tool-orchestration ─────────────────────────────────────────────
  {
    slug: "multi-tool-orchestration",
    content: `当 Agent 只有 2-3 个工具时，选择很简单。但当工具数量达到 10+，甚至 50+，Agent 如何可靠地选择正确的工具？本文讲解工具描述优化、智能路由和并行调用策略。

## 你将学到什么

- 工具描述的编写技巧（决定 Agent 能否选对工具）
- Tool Search：大量工具时的动态发现机制
- 工具组合策略与并行调用
- 处理工具之间的依赖关系

## 工具描述是关键

Claude 选择工具的依据是 \`description\` 字段。好的描述 = 高准确率。

\`\`\`python
# 差的描述——模糊，Claude 不知道什么时候用
bad_tool = {
    "name": "process_data",
    "description": "处理数据",
    "input_schema": {"type": "object", "properties": {}}
}

# 好的描述——明确场景、输入、输出
good_tool = {
    "name": "analyze_csv_sales",
    "description": "分析 CSV 格式的销售数据。输入：CSV 文件路径。输出：销售总额、TOP 产品、月度趋势。适用于需要从销售报表中提取关键指标的场景。",
    "input_schema": {
        "type": "object",
        "properties": {
            "file_path": {
                "type": "string",
                "description": "CSV 文件的完整路径"
            },
            "date_range": {
                "type": "string",
                "description": "可选，日期范围如 '2024-01 to 2024-06'"
            }
        },
        "required": ["file_path"]
    }
}
\`\`\`

**描述优化原则：**
1. 说明**什么场景**使用这个工具
2. 明确**输入什么**、**输出什么**
3. 与其他类似工具**区分边界**
4. 用具体例子而非抽象概念

## 工具数量多时的策略

当工具超过 20 个，把所有工具都放在 \`tools\` 数组里会导致两个问题：
1. 占用大量 token（每个工具描述 ~200 token）
2. Claude 可能选错工具

**方案一：工具分组**

按功能领域将工具分组，根据用户意图只加载相关组：

\`\`\`python
tool_groups = {
    "文件操作": [read_file, write_file, list_dir],
    "数据分析": [query_db, analyze_csv, plot_chart],
    "通信": [send_email, send_slack, create_ticket],
    "搜索": [web_search, doc_search, code_search],
}

def select_tools(user_message):
    """根据用户意图选择工具组"""
    # 用一次轻量 Claude 调用来分类意图
    intent = client.messages.create(
        model="claude-haiku-4-5",
        max_tokens=50,
        messages=[{"role": "user", "content": f"将以下请求分类到这些类别之一: {list(tool_groups.keys())}\\n请求: {user_message}"}]
    )
    category = intent.content[0].text.strip()
    return tool_groups.get(category, [])
\`\`\`

**方案二：Tool Search（语义搜索）**

将工具描述做成向量索引，根据用户查询动态检索最相关的工具：

\`\`\`python
# 伪代码 — 实际实现需要向量数据库
def tool_search(query, all_tools, top_k=5):
    """语义搜索最相关的工具"""
    query_embedding = embed(query)
    scored = []
    for tool in all_tools:
        tool_embedding = embed(tool["description"])
        score = cosine_similarity(query_embedding, tool_embedding)
        scored.append((score, tool))
    scored.sort(reverse=True)
    return [t for _, t in scored[:top_k]]
\`\`\`

## 并行工具调用

Claude 可以在一次回复中调用多个工具。当多个操作之间没有依赖关系时，Claude 会自动并行调用：

\`\`\`python
# Claude 可能返回多个 tool_use block
response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=4096,
    tools=tools,
    messages=[{"role": "user", "content": "同时查一下北京和上海的天气"}]
)

# response.content 可能包含两个 tool_use block:
# [tool_use: get_weather(city="北京"), tool_use: get_weather(city="上海")]

# 你可以并行执行这些工具调用
import asyncio

async def execute_parallel(tool_calls):
    tasks = [execute_tool_async(tc.name, tc.input) for tc in tool_calls]
    return await asyncio.gather(*tasks)
\`\`\`

## 处理工具依赖

有些场景工具之间有顺序依赖（如先搜索再总结）。Claude 会自然地处理这种依赖——在第一次工具调用返回结果后，它会决定下一步调用什么工具。

关键是在 system prompt 中说明依赖关系：

\`\`\`
你有以下工具可用：
- search_docs: 搜索文档库
- summarize: 总结搜索到的内容
- send_report: 发送报告

工作流程建议：先搜索相关文档，然后总结，最后发送报告。
\`\`\`

## 实战练习

> **Tip:** 设计一个多工具 Agent。

1. 创建 5 个以上工具（搜索、计算、文件、通信等）
2. 优化每个工具的 description，确保 Claude 能准确选择
3. 测试一个需要多个工具配合完成的复杂任务

## 关键要点

> **Note:** 本文核心总结

- 工具描述质量直接决定 Agent 的工具选择准确率
- 工具数量多时，使用分组或语义搜索来缩小范围
- Claude 原生支持并行工具调用，利用 asyncio 并行执行
- 通过 system prompt 引导工具之间的调用顺序`,
  },
  // ── 3: computer-use-agent ───────────────────────────────────────────────────
  {
    slug: "computer-use-agent",
    content: `Claude 的 Computer Use 功能可以"看到"你的电脑屏幕并操作它——截图识别、鼠标移动、键盘输入。这相当于给 AI 配了一双眼睛和一双手，可以执行任何人类能在电脑上完成的操作。

## 你将学到什么

- Computer Use 的工作原理和支持的操作
- 三大内置工具：computer、text_editor、bash
- 构建桌面自动化 Agent 的完整流程
- 安全注意事项和最佳实践

## Computer Use 工作原理

Computer Use 的核心流程：

1. **截屏** → Claude 看到当前屏幕内容
2. **识别** → Claude 理解屏幕上的 UI 元素
3. **操作** → Claude 发出鼠标/键盘指令
4. **验证** → 再次截屏，确认操作结果

这是一个持续的"观察-行动"循环，与人类操作电脑的方式相同。

## 三大内置工具

### computer 工具

控制鼠标和键盘：

\`\`\`python
import anthropic

client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=4096,
    tools=[
        {
            "type": "computer_20250124",
            "name": "computer",
            "display_width_px": 1920,
            "display_height_px": 1080,
            "display_number": 0,
        }
    ],
    messages=[
        {"role": "user", "content": "打开浏览器，搜索'Claude API 文档'"}
    ]
)
\`\`\`

支持的操作类型：
- \`screenshot\` — 截取当前屏幕
- \`mouse_move\` — 移动鼠标到指定坐标
- \`left_click\` / \`right_click\` / \`double_click\` — 鼠标点击
- \`type\` — 键盘输入文字
- \`key\` — 按下特定按键（Enter、Tab、快捷键等）
- \`scroll\` — 滚动页面

### text_editor 工具

直接操作文件内容（比通过 UI 编辑更高效）：

\`\`\`python
{
    "type": "text_editor_20250124",
    "name": "str_replace_editor"
}
\`\`\`

支持 view、create、str_replace、insert 四种操作。

### bash 工具

在终端中执行命令：

\`\`\`python
{
    "type": "bash_20250124",
    "name": "bash"
}
\`\`\`

## 构建桌面自动化 Agent

\`\`\`python
import anthropic
import base64
import subprocess

client = anthropic.Anthropic()

TOOLS = [
    {
        "type": "computer_20250124",
        "name": "computer",
        "display_width_px": 1920,
        "display_height_px": 1080,
        "display_number": 0,
    },
    {
        "type": "bash_20250124",
        "name": "bash",
    },
    {
        "type": "text_editor_20250124",
        "name": "str_replace_editor",
    }
]

def take_screenshot():
    """截取屏幕并返回 base64"""
    subprocess.run(["screencapture", "-x", "/tmp/screen.png"])
    with open("/tmp/screen.png", "rb") as f:
        return base64.standard_b64encode(f.read()).decode()

def execute_computer_action(action):
    """执行 computer 工具的操作"""
    action_type = action.get("action")
    if action_type == "screenshot":
        return take_screenshot()
    elif action_type == "type":
        # 使用 xdotool 或 AppleScript 输入文字
        text = action.get("text", "")
        subprocess.run(["osascript", "-e",
            f'tell application "System Events" to keystroke "{text}"'])
    elif action_type == "left_click":
        x, y = action["coordinate"]
        subprocess.run(["cliclick", f"c:{x},{y}"])
    # ... 其他操作类型
    return take_screenshot()

def computer_use_agent(task, max_steps=20):
    """Computer Use Agent 主循环"""
    messages = [{"role": "user", "content": task}]

    for step in range(max_steps):
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=4096,
            tools=TOOLS,
            messages=messages,
        )

        if response.stop_reason != "tool_use":
            # 任务完成
            for block in response.content:
                if hasattr(block, "text"):
                    return block.text
            return "任务完成"

        # 处理工具调用
        tool_results = []
        for block in response.content:
            if block.type == "tool_use":
                print(f"  Step {step + 1}: {block.name}")
                if block.name == "computer":
                    result = execute_computer_action(block.input)
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": [{"type": "image", "source": {
                            "type": "base64",
                            "media_type": "image/png",
                            "data": result,
                        }}]
                    })
                elif block.name == "bash":
                    output = subprocess.run(
                        block.input["command"],
                        shell=True, capture_output=True, text=True
                    )
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": output.stdout + output.stderr,
                    })

        messages.append({"role": "assistant", "content": response.content})
        messages.append({"role": "user", "content": tool_results})

    return "达到最大步数限制"
\`\`\`

## 安全注意事项

> **Warning:** Computer Use 给予 AI 直接操作电脑的能力，必须谨慎使用。

**必须遵循的安全原则：**

1. **隔离环境**：在虚拟机或 Docker 容器中运行，而非你的主系统
2. **最小权限**：不要用管理员账号运行
3. **人工确认**：关键操作（如删除文件、发送邮件）前要求用户确认
4. **网络限制**：限制 Agent 可访问的网站和服务
5. **操作日志**：记录每一步操作，便于审计和回溯

## 实战练习

> **Tip:** 在安全环境中体验 Computer Use。

1. 使用 Docker 容器搭建一个隔离的桌面环境
2. 让 Claude 完成一个简单的桌面任务（如打开记事本写一段文字）
3. 观察 Agent 的截屏-识别-操作循环

## 关键要点

> **Note:** 本文核心总结

- Computer Use = 截屏识别 + 鼠标键盘操作的循环
- 三大工具：computer（UI操作）、bash（终端）、text_editor（文件）
- 一定要在隔离环境中使用，安全第一
- 适合 RPA 自动化、UI 测试、桌面操作等场景`,
  },
  // ── 4: mcp-protocol ─────────────────────────────────────────────────────────
  {
    slug: "mcp-protocol",
    content: `Model Context Protocol（MCP）是 Anthropic 推出的开放标准，让 AI 模型能够连接任何外部服务。可以把它理解为 AI 世界的 USB 接口——一个标准协议连接所有工具。

## 你将学到什么

- MCP 的架构设计和核心概念
- 开发一个 MCP Server
- 在 Claude Code / Claude Desktop 中使用 MCP
- MCP 的三大能力：Tools、Resources、Prompts

## MCP 架构

MCP 采用 Client-Server 架构：

\`\`\`
┌──────────────┐     stdio/SSE     ┌──────────────┐
│  MCP Client  │ ◄───────────────► │  MCP Server  │
│ (Claude Code │                   │  (你开发的)   │
│  / Desktop)  │                   │              │
└──────────────┘                   └──────────────┘
                                          │
                                   ┌──────┴──────┐
                                   │  外部服务    │
                                   │ (数据库/API) │
                                   └─────────────┘
\`\`\`

**传输方式：**
- **stdio**：进程间通信，适合本地使用（Claude Code 默认）
- **SSE（Server-Sent Events）**：HTTP 长连接，适合远程服务

## MCP 三大能力

| 能力 | 说明 | 示例 |
|------|------|------|
| Tools | 可执行的函数 | 查询数据库、发送邮件 |
| Resources | 可读取的数据源 | 文件列表、配置信息 |
| Prompts | 预定义的 prompt 模板 | 代码审查模板、翻译模板 |

## 开发一个 MCP Server

以一个"待办事项管理"MCP Server 为例：

\`\`\`typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "todo-server",
  version: "1.0.0",
});

// 内存中的 todo 列表
const todos: { id: number; text: string; done: boolean }[] = [];
let nextId = 1;

// Tool: 添加待办
server.tool(
  "add_todo",
  "添加一个新的待办事项",
  { text: z.string().describe("待办事项内容") },
  async ({ text }) => {
    const todo = { id: nextId++, text, done: false };
    todos.push(todo);
    return { content: [{ type: "text", text: "已添加: " + text }] };
  }
);

// Tool: 列出待办
server.tool(
  "list_todos",
  "列出所有待办事项",
  {},
  async () => {
    if (todos.length === 0) {
      return { content: [{ type: "text", text: "没有待办事项" }] };
    }
    const list = todos.map(t =>
      (t.done ? "[x]" : "[ ]") + " #" + t.id + " " + t.text
    ).join("\\n");
    return { content: [{ type: "text", text: list }] };
  }
);

// Tool: 完成待办
server.tool(
  "complete_todo",
  "标记一个待办事项为已完成",
  { id: z.number().describe("待办事项 ID") },
  async ({ id }) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) {
      return { content: [{ type: "text", text: "未找到 ID: " + id }] };
    }
    todo.done = true;
    return { content: [{ type: "text", text: "已完成: " + todo.text }] };
  }
);

// Resource: 待办统计
server.resource(
  "todo://stats",
  "待办事项统计信息",
  async () => {
    const total = todos.length;
    const done = todos.filter(t => t.done).length;
    return {
      contents: [{
        uri: "todo://stats",
        mimeType: "text/plain",
        text: "总计: " + total + ", 已完成: " + done + ", 待完成: " + (total - done),
      }]
    };
  }
);

// 启动
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main();
\`\`\`

## 在 Claude Code 中配置

在项目的 \`.mcp.json\` 或全局 \`~/.claude/mcp.json\` 中添加：

\`\`\`json
{
  "mcpServers": {
    "todo": {
      "command": "npx",
      "args": ["tsx", "path/to/todo-server.ts"]
    }
  }
}
\`\`\`

配置完成后，Claude Code 会自动发现并使用这些工具。

## 在 Claude Desktop 中配置

编辑 \`claude_desktop_config.json\`：

\`\`\`json
{
  "mcpServers": {
    "todo": {
      "command": "node",
      "args": ["path/to/todo-server.js"]
    }
  }
}
\`\`\`

## 实战练习

> **Tip:** 开发你的第一个 MCP Server。

1. 使用 \`@modelcontextprotocol/sdk\` 创建一个 MCP Server
2. 实现至少 2 个 Tool 和 1 个 Resource
3. 在 Claude Code 中配置并测试

## 关键要点

> **Note:** 本文核心总结

- MCP = AI 的标准化工具接口（USB for AI）
- Client-Server 架构，支持 stdio 和 SSE 传输
- 三大能力：Tools（执行操作）、Resources（读取数据）、Prompts（模板）
- 一个 MCP Server 可以被任何兼容的 Client 使用

## 延伸阅读

- MCP 官网：modelcontextprotocol.io
- 下一篇：Agent Skills——基于 MCP 的高级能力模块`,
  },
  // ── 5: agent-skills ─────────────────────────────────────────────────────────
  {
    slug: "agent-skills",
    content: `Agent Skills 是 Claude 的专业能力模块——在 MCP 工具的基础上封装了专门的 prompt 和工作流。一个 Skill 可以让 Claude 生成 PPT、分析 Excel、处理复杂的 PDF 提取任务。

## 你将学到什么

- Skill 与普通 Tool 的区别
- Claude Code 中 Skills 的工作方式
- 自定义 Skill 开发
- 常见的内置 Skills

## Skill vs Tool

| 对比项 | Tool | Skill |
|--------|------|-------|
| 粒度 | 单个函数 | 一组工具 + prompt + 工作流 |
| 上下文 | 无 | 自带专业知识和指令 |
| 使用方式 | Claude 自动选择 | 用户用 /skill 触发或 Claude 自动匹配 |
| 示例 | \`read_file()\` | "PDF 分析"（包含读取、解析、总结多步骤） |

简单说，Tool 是一个函数，Skill 是一套完整的能力包。

## Claude Code 的 Skill 机制

在 Claude Code 中，Skills 通过斜杠命令触发：

\`\`\`
/skill-name [参数]
\`\`\`

Skill 的本质是一段预定义的 prompt，加载后会注入到对话上下文中，指导 Claude 按特定工作流执行任务。

## 自定义 Skill 开发

你可以为 Claude Code 开发自定义 Skill。一个 Skill 由以下部分组成：

\`\`\`
my-skill/
├── skill.json        # Skill 元数据
├── prompt.md         # Skill 的核心 prompt
└── tools/            # 可选：MCP 工具
    └── server.ts
\`\`\`

**skill.json 示例：**

\`\`\`json
{
  "name": "code-review",
  "description": "执行深度代码审查",
  "trigger": "/review",
  "prompt_file": "prompt.md"
}
\`\`\`

**prompt.md 示例：**

\`\`\`markdown
你是一个资深代码审查专家。请按以下流程审查代码：

1. **结构分析**：检查文件组织和模块划分
2. **安全审查**：检查常见安全漏洞（注入、XSS 等）
3. **性能分析**：识别性能瓶颈和优化机会
4. **代码风格**：检查命名规范和代码一致性

输出格式：
- 严重问题（必须修复）
- 建议改进（推荐修复）
- 优秀实践（值得保持）
\`\`\`

## 常见 Skill 应用场景

**1. PDF 分析 Skill**

\`\`\`python
# Skill prompt 指导 Claude：
# 1. 读取 PDF 文件
# 2. 提取文字和表格
# 3. 按用户需求整理和总结

# 内部可能调用多个 Tool：
# - read_pdf(path) → 提取文字
# - extract_tables(path) → 提取表格
# - summarize(text, focus) → 总结
\`\`\`

**2. 数据分析 Skill**

\`\`\`python
# Skill prompt 指导 Claude：
# 1. 读取数据文件（CSV/Excel）
# 2. 进行探索性分析
# 3. 生成可视化图表
# 4. 输出分析报告
\`\`\`

**3. 代��迁移 Skill**

\`\`\`python
# Skill prompt 指导 Claude：
# 1. 分析源代码结构
# 2. 识别需要迁移的模式
# 3. 自动转换代码
# 4. 验证转换结果
\`\`\`

## Skill 与 MCP 的关系

Skill 可以理解为 MCP 之上的一层抽象：

\`\`\`
Skill = 专业 Prompt + MCP Tools + 工作流定义
\`\`\`

一个 Skill 可以使用多个 MCP Server 提供的工具，同时注入专业知识来指导 Claude 如何组合使用这些工具。

## 实战练习

> **Tip:** 为你的日常工作创建一个自定义 Skill。

1. 选择一个你经常重复的工作流（如代码审查、日报生成）
2. 编写一个详细的 prompt，描述完成这个工作流的步骤
3. 如果需要外部工具，配合 MCP Server 一起使用

## 关键要点

> **Note:** 本文核心总结

- Skill = Tool + Prompt + 工作流，是一套完整的能力包
- 通过斜杠命令触发，自带专业知识上下文
- 可以基于 MCP 工具开发自定义 Skill
- 适合封装重复性的复杂工作流`,
  },
  // ── 6: memory-system ────────────────────────────────────────────────────────
  {
    slug: "memory-system",
    content: `默认情况下，每次对话都是独立的——Claude 不记得上次聊了什么。Memory 系统改变了这一点，让 Claude 可以跨对话保存和检索信息，构建个性化的长期记忆。

## 你将学到什么

- Claude 记忆系统的工作原理
- Memory Tool 的使用方式
- 记忆管理策略
- 构建具有记忆能力的应用

## 为什么需要记忆

没有记忆的 AI 助手每次对话都是"初次见面"。用户需要反复说明自己的偏好、项目上下文、工作习惯。

有了记忆，AI 可以：
- 记住用户偏好（"我喜欢用 TypeScript"）
- 积累项目知识（"这个项目用 Prisma 做 ORM"）
- 追踪长期任务（"上周讨论的重构方案"）

## Claude Code 的记忆机制

Claude Code 使用文件系统实现记忆：

\`\`\`
~/.claude/
├── CLAUDE.md              # 全局指令和记忆
└── projects/
    └── <project-hash>/
        └── memory/
            ├── MEMORY.md          # 项目记忆主文件
            ├── architecture.md    # 架构相关记忆
            └── debugging.md       # 调试经验
\`\`\`

**MEMORY.md** 会自动加载到每次对话的上下文中。Claude 在工作过程中会自动更新这些文件。

## 记忆的类型

**1. 事实记忆（Facts）**
\`\`\`
- 项目使用 pnpm monorepo
- 数据库是 PostgreSQL + Prisma
- 部署在 Vercel
\`\`\`

**2. 偏好记忆（Preferences）**
\`\`\`
- 用户偏好简洁的代码风格
- commit message 不需要 Co-Authored-By
- 优先使用 TypeScript
\`\`\`

**3. 经验记忆（Lessons）**
\`\`\`
- 这个项目的 ESLint 配置严格，提交前要 lint
- API 路由需要在 middleware 中鉴权
- 模板字面量中的 $ 需要转义
\`\`\`

## API 层面的记忆实现

如果你在构建自己的 AI 应用，可以这样实现记忆：

\`\`\`python
import anthropic
import json

client = anthropic.Anthropic()

class MemoryStore:
    def __init__(self, filepath="memory.json"):
        self.filepath = filepath
        self.memories = self._load()

    def _load(self):
        try:
            with open(self.filepath) as f:
                return json.load(f)
        except FileNotFoundError:
            return []

    def save(self, key, value, category="general"):
        self.memories.append({
            "key": key,
            "value": value,
            "category": category,
        })
        with open(self.filepath, "w") as f:
            json.dump(self.memories, f, ensure_ascii=False, indent=2)

    def search(self, query, limit=5):
        """简单的关键词搜索"""
        results = []
        for m in self.memories:
            if query.lower() in m["key"].lower() or query.lower() in m["value"].lower():
                results.append(m)
        return results[:limit]

    def get_context(self):
        """将记忆格式化为 system prompt"""
        if not self.memories:
            return ""
        lines = ["以下是关于用户的记忆信息："]
        for m in self.memories:
            lines.append(f"- [{m['category']}] {m['key']}: {m['value']}")
        return "\\n".join(lines)

# 使用
memory = MemoryStore()
memory.save("技术栈", "TypeScript + Next.js + Prisma", "project")
memory.save("偏好", "简洁代码风格，少注释", "preference")

# 在对话中使用记忆
response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=2048,
    system=memory.get_context(),
    messages=[{"role": "user", "content": "帮我创建一个新的 API 路由"}]
)
\`\`\`

## 记忆管理策略

**写入策略：** 不要什么都记。只保存稳定的、跨对话有价值的信息。

**更新策略：** 信息可能变化。记忆应该可以覆盖更新，而不是无限追加。

**清理策略：** 定期清理过时的记忆。设置有效期或手动审查。

## 实战练习

> **Tip:** 为你的 AI 应用添加记忆能力。

1. 实现一个简单的 MemoryStore（如上面的示例）
2. 在 system prompt 中注入记忆上下文
3. 测试 AI 是否能利用记忆信息给出更好的回答

## 关键要点

> **Note:** 本文核心总结

- 记忆让 AI 从"每次初次见面"变成"了解你的助手"
- Claude Code 用文件系统（MEMORY.md）实现持久记忆
- API 层面可以通过 system prompt 注入记忆上下文
- 记忆要有策略地写入、更新和清理`,
  },
  // ── 7: long-context-window ──────────────────────────────────────────────────
  {
    slug: "long-context-window",
    content: `Claude 的标准上下文窗口是 200K token。通过 Beta 扩展，Sonnet 和 Opus 支持高达 1M token 的超长上下文——可以一次性处理一整本书、一个完整的代码库、或数百页的文档。

## 你将学到什么

- 200K vs 1M 上下文窗口的区别和使用方式
- 超长上下文的实际应用场景
- 性能和成本考量
- 最佳使用策略

## 上下文窗口基础

| 模型 | 标准上下文 | 扩展上下文（Beta） | 最大输出 |
|------|-----------|-------------------|---------|
| Opus 4.6 | 200K | 1M | 128K |
| Sonnet 4.6 | 200K | 1M | 64K |
| Haiku 4.5 | 200K | — | 64K |

**启用 1M 上下文：**

\`\`\`python
response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=8192,
    betas=["long-context-2025-01-01"],
    messages=[
        {"role": "user", "content": very_long_text + "\\n\\n请总结以上内容"}
    ]
)
\`\`\`

## 1M Token 能装多少内容？

| 内容类型 | 大约容量 |
|----------|---------|
| 英文文本 | ~75 万词（约 3 本长篇小说） |
| 中文文本 | ~50 万字 |
| 代码 | ~25 万行 |
| PDF 文档 | ~500 页 |

## 应用场景

### 场景一：整本书分析

\`\`\`python
# 一次性加载整本书
with open("book.txt") as f:
    book_content = f.read()

response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=4096,
    betas=["long-context-2025-01-01"],
    messages=[{
        "role": "user",
        "content": f"""以下是一本完整的书籍：

{book_content}

请分析：
1. 本书的核心论点
2. 各章节的主要内容摘要
3. 作者的写作风格特点
4. 书中引用的关键数据和案例"""
    }]
)
\`\`\`

### 场景二：大型代码库理解

\`\`\`python
import os

def collect_codebase(root_dir, extensions=[".ts", ".tsx", ".py"]):
    """收集整个代码库的源文件"""
    files = []
    for dirpath, _, filenames in os.walk(root_dir):
        for fname in filenames:
            if any(fname.endswith(ext) for ext in extensions):
                fpath = os.path.join(dirpath, fname)
                with open(fpath) as f:
                    content = f.read()
                files.append(f"// === {fpath} ===\\n{content}")
    return "\\n\\n".join(files)

codebase = collect_codebase("./src")
# 可以将整个代码库放入上下文，让 Claude 全局理解架构
\`\`\`

### 场景三：多文档对比分析

一次性加载多份合同、报告或论文，让 Claude 做横向对比分析。

## 性能和成本考量

**延迟：** 超长上下文的首次响应时间会增加（"首 token 时间"与输入长度正相关）。

**成本：** 按 token 计费，100 万输入 token：
- Sonnet: 100 万 × $3/M = $3
- Opus: 100 万 × $5/M = $5

> **Tip:** 使用 Prompt Caching 可以大幅降低重复使用同一长上下文的费用。缓存命中只需 0.1x 价格。

**准确性：** Claude 在超长上下文中仍然保持较高的检索准确率（"大海捞针"测试表现优异），但极端长度下可能对中间部分的关注度略低。

## 最佳实践

1. **把问题放在末尾**：Claude 对上下文末尾的内容关注度最高
2. **使用结构化标记**：用 XML 标签或分隔符组织长文档
3. **分块 vs 整体**：简单问题用分块检索（RAG），复杂分析用整体上下文
4. **配合 Prompt Caching**：长上下文 + 缓存 = 降低后续调用成本 90%

\`\`\`python
# 结构化组织长上下文
context = """
<document title="合同A">
{contract_a}
</document>

<document title="合同B">
{contract_b}
</document>

请对比以上两份合同的关键差异。
"""
\`\`\`

## 实战练习

> **Tip:** 体验超长上下文的能力。

1. 找一个你熟悉的项目，收集所有源文件
2. 一次性送入 Claude，让它分析整体架构
3. 对比分块检索和整体上下文的回答质量

## 关键要点

> **Note:** 本文核心总结

- 标准 200K，Beta 扩展至 1M token（Sonnet/Opus）
- 适合整书分析、代码库理解、多文档对比
- 长上下文有延迟和成本代价，配合缓存使用
- 问题放末尾，用结构化标记组织内容`,
  },
  // ── 8: context-management ───────────────────────────────────────────────────
  {
    slug: "context-management",
    content: `上下文窗口再大也有上限。在生产级 AI 应用中，上下文管理决定了应用的质量和成本。本文讲解三大核心策略：Compaction（压缩摘要）、Context Editing（自动裁剪）、Prompt Caching（缓存复用）。

## 你将学到什么

- 上下文溢出的问题和解决方案
- Compaction：自动压缩对话历史
- Context Editing：选择性裁剪上下文
- Prompt Caching：缓存重复内容降本 90%
- 三大策略的最优组合

## 上下文溢出的问题

当对话越来越长，最终会超出上下文窗口。简单的截断方式会导致 Claude 丢失早期的重要信息。

**常见溢出场景：**
- 长时间多轮对话（客服、编程助手）
- 大量参考文档 + 对话历史
- Agent 多次工具调用的历史记录

## 策略一：Compaction（压缩摘要）

用 Claude 自己来压缩历史对话——保留关键信息，丢弃冗余内容。

\`\`\`python
def compact_history(messages, max_tokens=50000):
    """当历史超过阈值时，压缩早期消息"""
    # 估算当前 token 数
    total_chars = sum(len(str(m["content"])) for m in messages)
    estimated_tokens = total_chars // 2  # 粗略估算

    if estimated_tokens < max_tokens:
        return messages  # 不需要压缩

    # 将早期消息压缩为摘要
    early_messages = messages[:-6]  # 保留最近 6 条
    recent_messages = messages[-6:]

    summary_response = client.messages.create(
        model="claude-haiku-4-5",  # 用便宜的模型做压缩
        max_tokens=2000,
        messages=[{
            "role": "user",
            "content": "请将以下对话历史压缩为简洁摘要，保留所有重要信息和决定：\\n\\n"
                + format_messages(early_messages)
        }]
    )

    summary = summary_response.content[0].text

    return [
        {"role": "user", "content": f"[之前对话摘要]\\n{summary}"},
        {"role": "assistant", "content": "好的，我已了解之前的对话内容。"},
        *recent_messages
    ]
\`\`\`

**要点：**
- 用 Haiku 做压缩（成本低、速度快）
- 保留最近几轮原始对话（最新上下文不能丢）
- 压缩摘要要包含关键决策和信息

## 策略二：Context Editing（选择性裁剪）

不是压缩所有内容，而是**选择性删除**不再需要的部分。

\`\`\`python
def edit_context(messages):
    """删除不再需要的上下文"""
    edited = []
    for msg in messages:
        content = str(msg["content"])

        # 删除已完成的工具调用详情（只保留结果）
        if "tool_result" in content and len(content) > 1000:
            # 只保留工具调用结果的摘要
            msg = simplify_tool_result(msg)

        # 删除大块代码（如果后续已经修改过）
        # 删除冗余的解释性文字

        edited.append(msg)
    return edited
\`\`\`

**适合裁剪的内容：**
- 已完成的工具调用的详细输入/输出
- 被后续修改覆盖的旧代码
- 重复的解释性内容
- 临时的中间结果

## 策略三：Prompt Caching

缓存不变的内容（system prompt、参考文档），后续请求只需 0.1x 的价格。

\`\`\`python
# 第一次请求：写入缓存
response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=2048,
    system=[
        {
            "type": "text",
            "text": long_system_prompt,  # 比如 10K token 的指令
            "cache_control": {"type": "ephemeral"}
        },
        {
            "type": "text",
            "text": reference_docs,  # 比如 50K token 的参考文档
            "cache_control": {"type": "ephemeral"}
        }
    ],
    messages=[{"role": "user", "content": "基于以上文档回答问题"}]
)

# 第二次请求：自动命中缓存
# 只要 system prompt 相同的前缀部分匹配，就会命中
# 节省 90% 的输入 token 费用
\`\`\`

**缓存规则：**
- 缓存存活 5 分钟（TTL）
- 前缀匹配——只要前面部分相同就能命中
- 最小缓存 1024 token（Sonnet/Opus）、2048 token（Haiku）

## 最优组合策略

\`\`\`
┌─────────────────────────────────────────────────┐
│              Prompt Caching                      │
│  ┌──────────────────────────────────────┐       │
│  │ System Prompt + 参考文档（缓存）      │       │
│  └──────────────────────────────────────┘       │
│  ┌──────────────────────────────────────┐       │
│  │ 压缩后的历史摘要（Compaction）        │       │
│  └──────────────────────────────────────┘       │
│  ┌──────────────────────────────────────┐       │
│  │ 裁剪后的最近对话（Context Editing）   │       │
│  └──────────────────────────────────────┘       │
│  ┌──────────────────────────────────────┐       │
│  │ 最新用户消息                          │       │
│  └──────────────────────────────────────┘       │
└─────────────────────────────────────────────────┘
\`\`\`

## 实战练习

> **Tip:** 为你的 AI 应用实现上下文管理。

1. 实现 Compaction 函数，在对话超过 20 轮时自动压缩
2. 在 system prompt 上启用 Prompt Caching
3. 对比有/无上下文管理时的成本和响应质量

## 关键要点

> **Note:** 本文核心总结

- Compaction：用便宜模型压缩历史，保留关键信息
- Context Editing：选择性删除冗余内容
- Prompt Caching：缓存不变的内容，节省 90% 费用
- 三者组合使用效果最佳`,
  },
  // ── 9: streaming-tool-streaming ─────────────────────────────────────────────
  {
    slug: "streaming-tool-streaming",
    content: `用户不喜欢等待。流式输出让 AI 的回复像打字一样逐字出现，大幅提升用户体验。本文讲解 Claude API 的 SSE 流式输出、工具调用的流式传输，以及前端渐进式渲染的完整方案。

## 你将学到什么

- Claude 流式输出的工作原理（SSE）
- Python 和 TypeScript 中的流式实现
- 工具调用的细粒度流式传输
- 前端渐进式渲染方案

## 基础流式输出

### Python 实现

\`\`\`python
import anthropic

client = anthropic.Anthropic()

# 流式输出
with client.messages.stream(
    model="claude-sonnet-4-6",
    max_tokens=2048,
    messages=[{"role": "user", "content": "讲一个关于 AI 的故事"}]
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)

print()  # 换行
\`\`\`

### TypeScript 实现

\`\`\`typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

async function streamResponse() {
  const stream = client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    messages: [{ role: "user", content: "讲一个关于 AI 的故事" }],
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      process.stdout.write(event.delta.text);
    }
  }

  const finalMessage = await stream.finalMessage();
  console.log("\\nTokens used:", finalMessage.usage);
}
\`\`\`

## SSE 事件类型

Claude 流式输出基于 Server-Sent Events（SSE），包含以下事件：

| 事件 | 说明 |
|------|------|
| \`message_start\` | 消息开始，包含 metadata |
| \`content_block_start\` | 内容块开始（text 或 tool_use） |
| \`content_block_delta\` | 内容增量（逐字输出） |
| \`content_block_stop\` | 内容块结束 |
| \`message_delta\` | 消息级别更新（stop_reason、usage） |
| \`message_stop\` | 消息结束 |

## 工具调用的流式传输

当 Claude 调用工具时，工具的参数也会流式传输。这意味着你可以：
1. 在参数还没完全生成时就开始准备执行
2. 向用户展示 "正在调用 xxx 工具..."

\`\`\`python
with client.messages.stream(
    model="claude-sonnet-4-6",
    max_tokens=4096,
    tools=tools,
    messages=[{"role": "user", "content": "搜索最新的 AI 新闻"}]
) as stream:
    for event in stream:
        if event.type == "content_block_start":
            if event.content_block.type == "tool_use":
                print(f"\\n正在调用工具: {event.content_block.name}")

        elif event.type == "content_block_delta":
            if event.delta.type == "text_delta":
                print(event.delta.text, end="", flush=True)
            elif event.delta.type == "input_json_delta":
                # 工具参数的增量 JSON
                print(f"  参数片段: {event.delta.partial_json}")

        elif event.type == "message_stop":
            print("\\n流结束")
\`\`\`

## 前端渐进式渲染

### Next.js + AI SDK

\`\`\`typescript
// app/api/chat/route.ts
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(req: Request) {
  const { messages } = await req.json();

  const stream = client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    messages,
  });

  // 将 SDK stream 转为 ReadableStream
  const readableStream = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          controller.enqueue(
            new TextEncoder().encode(event.delta.text)
          );
        }
      }
      controller.close();
    },
  });

  return new Response(readableStream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
\`\`\`

### 前端消费

\`\`\`typescript
async function chat(message: string) {
  const response = await fetch("/api/chat", {
    method: "POST",
    body: JSON.stringify({ messages: [{ role: "user", content: message }] }),
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  while (reader) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    // 将 chunk 追加到 UI 中
    appendToChat(chunk);
  }
}
\`\`\`

## 实战练习

> **Tip:** 实现一个流式聊天界面。

1. 用 Python 实现基础流式输出
2. 在 Next.js 中实现 SSE 接口
3. 前端实现打字机效果的渐进式渲染

## 关键要点

> **Note:** 本文核心总结

- 流式输出基于 SSE，逐字/逐块传输
- \`client.messages.stream()\` 是最简单的流式 API
- 工具调用参数也支持细粒度流式传输
- 前端用 ReadableStream 消费，实现打字机效果`,
  },
  // ── 10: programmatic-tool-calling ───────────────────────────────────────────
  {
    slug: "programmatic-tool-calling",
    content: `标准的 Tool Use 需要 API 往返——Claude 说"我要调用工具"，你执行工具，把结果返回给 Claude。Programmatic Tool Calling 允许在容器化环境中直接执行代码，减少往返延迟。

## 你将学到什么

- 标准 Tool Use 的延迟问题
- Code Execution Tool 的工作方式
- 容器化代码执行的安全模型
- 适用场景和最佳实践

## 标准 Tool Use 的痛点

每次工具调用需要 3 步：

\`\`\`
Client → API: "调用 calculate(2+3)"
API → Client: tool_use block
Client: 执行计算，得到结果 5
Client → API: tool_result = 5
API → Client: "结果是 5"
\`\`\`

每次往返增加网络延迟。如果一个任务需要 5 次工具调用，延迟会叠加。

## Code Execution Tool

Claude 的 Code Execution Tool 让 Claude 在沙箱中直接写代码并执行，无需外部往返。

\`\`\`python
import anthropic

client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=4096,
    tools=[{
        "type": "code_execution_20250522",
        "name": "code_execution",
    }],
    messages=[{
        "role": "user",
        "content": "计算斐波那契数列前 20 项，并画一个增长趋势图"
    }]
)

# Claude 会自动写 Python 代码并在沙箱中执行
# 返回结果包含代码、输出和生成的图片
for block in response.content:
    if block.type == "code_execution_result":
        print("执行结果:", block.output)
    elif block.type == "image":
        # 保存生成的图片
        print("生成了图表")
\`\`\`

## 沙箱安全模型

Code Execution 在安全沙箱中运行：

- **隔离环境**：每次执行在独立容器中
- **无网络**：代码不能访问外部网络
- **时间限制**：执行时间有上限
- **资源限制**：内存和 CPU 受控
- **预装库**：常见的数据分析库（pandas、matplotlib、numpy 等）

## 实际应用场景

### 数据分析

\`\`\`python
response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=8192,
    tools=[{"type": "code_execution_20250522", "name": "code_execution"}],
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "分析这个 CSV 数据，找出销售趋势"},
            {"type": "document", "source": {
                "type": "base64",
                "media_type": "text/csv",
                "data": csv_base64
            }}
        ]
    }]
)
\`\`\`

### 数学计算和可视化

Claude 可以编写 matplotlib 代码生成图表，并直接返回图片。这比让 Claude 口头描述数据趋势要直观得多。

### 代码验证

让 Claude 写代码后立即执行验证，确保代码正确。

## 与标准 Tool Use 的对比

| 对比项 | 标准 Tool Use | Code Execution |
|--------|-------------|----------------|
| 延迟 | 每次工具调用需要 API 往返 | 在容器内直接执行 |
| 灵活性 | 预定义工具 | 任意 Python 代码 |
| 网络访问 | 取决于你的实现 | 无网络（沙箱） |
| 安全性 | 你负责安全 | 平台负责隔离 |
| 适用场景 | 调用外部 API/数据库 | 计算、分析、可视化 |

## 组合使用

最强大的模式是组合使用两者：

\`\`\`python
tools = [
    # Code Execution：计算和可视化
    {"type": "code_execution_20250522", "name": "code_execution"},
    # 标准 Tool：外部 API
    {
        "name": "query_database",
        "description": "查询数据库获取数据",
        "input_schema": {
            "type": "object",
            "properties": {
                "sql": {"type": "string"}
            }
        }
    }
]

# Claude 会先调用 query_database 获取数据
# 然后用 code_execution 分析和可视化
\`\`\`

## 实战练习

> **Tip:** 体验 Code Execution 的即时执行能力。

1. 让 Claude 用 Code Execution 做一个数学计算任务
2. 上传一个 CSV 文件，让 Claude 分析并生成图表
3. 对比标准 Tool Use 和 Code Execution 的延迟差异

## 关键要点

> **Note:** 本文核心总结

- Code Execution 在沙箱中直接执行 Python，无需 API 往返
- 沙箱是安全的：无网络、有资源限制、独立容器
- 最适合计算、数据分析和可视化场景
- 与标准 Tool Use 组合使用效果最佳`,
  },
  // ── 11: cloud-deployment ────────────────────────────────────────────────────
  {
    slug: "cloud-deployment",
    content: `除了直接使用 Anthropic API，你还可以通过三大云平台访问 Claude：AWS Bedrock、Google Vertex AI、Azure AI Foundry。这些平台提供企业级的安全合规、统一计费和与云基础设施的深度集成。

## 你将学到什么

- 三大云平台的 Claude 接入方式
- 各平台的 API 差异和特有功能
- 如何选择最适合你的平台
- 代码示例（Python）

## AWS Bedrock

AWS Bedrock 是最成熟的 Claude 托管平台。特点是与 AWS 生态深度集成。

### 配置和调用

\`\`\`python
import boto3
import json

client = boto3.client(
    "bedrock-runtime",
    region_name="us-east-1"
)

# Bedrock 使用 Converse API
response = client.converse(
    modelId="anthropic.claude-sonnet-4-6-20250514-v1:0",
    messages=[
        {
            "role": "user",
            "content": [{"text": "你好，Claude！"}]
        }
    ],
    inferenceConfig={
        "maxTokens": 2048,
        "temperature": 0.7
    }
)

print(response["output"]["message"]["content"][0]["text"])
\`\`\`

### Bedrock 特有优势

- **跨区域推理（Cross-region Inference）**：自动路由到可用区域
- **Guardrails**：内置内容安全防护
- **Model Invocation Logging**：详细的调用日志
- **与 S3、Lambda 等服务无缝集成**

## Google Vertex AI

Vertex AI 提供 Claude 的全功能访问，与 Google Cloud 生态集成。

### 配置和调用

\`\`\`python
import anthropic

# Vertex AI 使用 Anthropic SDK 的 Vertex 变体
client = anthropic.AnthropicVertex(
    region="us-east5",
    project_id="your-gcp-project-id",
)

response = client.messages.create(
    model="claude-sonnet-4-6@20250514",
    max_tokens=2048,
    messages=[
        {"role": "user", "content": "你好，Claude！"}
    ]
)

print(response.content[0].text)
\`\`\`

### Vertex AI 特有优势

- **与 BigQuery、GCS 集成**
- **VPC Service Controls**：网络隔离
- **Anthropic SDK 兼容**：代码迁移成本低

## Azure AI Foundry

Azure 通过 AI Foundry（原 Azure AI Studio）提供 Claude。

### 配置和调用

\`\`\`python
import anthropic

client = anthropic.AnthropicAzure(
    azure_endpoint="https://your-endpoint.services.ai.azure.com",
    azure_api_version="2025-01-01",
    azure_api_key="your-azure-api-key",
)

response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=2048,
    messages=[
        {"role": "user", "content": "你好，Claude！"}
    ]
)
\`\`\`

## 平台对比

| 对比项 | Anthropic API | AWS Bedrock | Vertex AI | Azure |
|--------|-------------|-------------|-----------|-------|
| 最新模型 | 最先 | 略滞后 | 略滞后 | 略滞后 |
| 计费 | 按 token | AWS 统一账单 | GCP 统一账单 | Azure 统一账单 |
| 合规 | SOC 2 | HIPAA/FedRAMP | ISO 27001 | 多项 |
| 延迟 | 最低 | 略高 | 略高 | 略高 |

## 如何选择

- **已有 AWS 基础设施** → Bedrock
- **已有 GCP 基础设施** → Vertex AI
- **已有 Azure 基础设施** → Azure AI Foundry
- **需要最新功能和最低延迟** → Anthropic API 直连
- **企业合规要求** → 选择对应云平台

## 实战练习

> **Tip:** 如果你有云平台账号，尝试通过云平台调用 Claude。

1. 选择你常用的云平台
2. 配置 Claude 模型访问权限
3. 将上面的代码示例改为使用你的凭证运行

## 关键要点

> **Note:** 本文核心总结

- Bedrock/Vertex/Azure 三大平台都支持 Claude
- 各平台 API 略有差异，但 Vertex 和 Azure 兼容 Anthropic SDK
- 选择标准：已有基础设施 > 合规要求 > 功能需求
- 直连 API 功能最全、延迟最低`,
  },
  // ── 12: cost-optimization ───────────────────────────────────────────────────
  {
    slug: "cost-optimization",
    content: `Claude API 按 token 计费。在生产环境中，成本优化直接影响业务可行性。本文是全方位的成本优化指南：从模型选择到 Prompt 工程，从缓存到批量处理，帮你把每一分钱花在刀刃上。

## 你将学到什么

- Claude 各模型的定价和适用场景
- 6 种成本优化技巧
- 成本监控和预算控制方案
- 真实场景的成本计算

## 定价速查

| 模型 | 输入 (/M token) | 输出 (/M token) | 适合场景 |
|------|:---------------:|:---------------:|---------|
| Opus 4.6 | $5 | $25 | 最复杂的推理和分析 |
| Sonnet 4.6 | $3 | $15 | 大多数开发任务（最佳平衡） |
| Haiku 4.5 | $1 | $5 | 分类、摘要、简单任务 |

**关键认知：输出比输入贵 3-5 倍。** 控制输出长度是最有效的省钱手段。

## 优化技巧一：选对模型

不是所有任务都需要最强的模型。

\`\`\`python
def choose_model(task_complexity):
    """根据任务复杂度选择模型"""
    if task_complexity == "simple":
        return "claude-haiku-4-5"    # 分类、摘要
    elif task_complexity == "moderate":
        return "claude-sonnet-4-6"   # 代码、分析
    else:
        return "claude-opus-4-6"     # 复杂推理

# 示例：意图分类用 Haiku，内容生成用 Sonnet
intent = client.messages.create(
    model="claude-haiku-4-5",    # $1/M 输入
    max_tokens=50,
    messages=[{"role": "user", "content": "用户消息：" + user_msg}]
)
\`\`\`

## 优化技巧二：Prompt Caching（省 90%）

重复的 system prompt 和参考文档，用缓存只需 0.1x 价格。

\`\`\`python
# 假设 system prompt 是 10K token
# 不用缓存：每次 10K × $3/M = $0.03
# 用缓存：  首次 $0.03，后续 10K × $0.3/M = $0.003（省 90%）

response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    system=[{
        "type": "text",
        "text": "你的很长的 system prompt...",
        "cache_control": {"type": "ephemeral"}
    }],
    messages=[{"role": "user", "content": "用户问题"}]
)

# 检查缓存命中
print(f"缓存命中: {response.usage.cache_read_input_tokens}")
print(f"缓存未命中: {response.usage.cache_creation_input_tokens}")
\`\`\`

## 优化技巧三：Batch API（省 50%）

不需要实时响应的任务，用 Batch API 享受 50% 折扣。

\`\`\`python
# 创建批量请求
batch = client.messages.batches.create(
    requests=[
        {
            "custom_id": "task-001",
            "params": {
                "model": "claude-sonnet-4-6",
                "max_tokens": 1024,
                "messages": [{"role": "user", "content": "翻译任务1"}]
            }
        },
        {
            "custom_id": "task-002",
            "params": {
                "model": "claude-sonnet-4-6",
                "max_tokens": 1024,
                "messages": [{"role": "user", "content": "翻译任务2"}]
            }
        }
    ]
)

# Batch 处理在 24 小时内完成，价格是实时 API 的 50%
\`\`\`

## 优化技巧四：控制输出长度

\`\`\`python
# 在 prompt 中明确限制输出
response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=200,  # 硬限制
    messages=[{
        "role": "user",
        "content": "用 3 句话总结这篇文章：..."  # 软限制
    }]
)
\`\`\`

## 优化技巧五：Effort 参数

通过减少推理"努力程度"来降低输出 token 消耗。

\`\`\`python
# 简单任务用低 effort
response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=256,
    thinking={
        "type": "enabled",
        "budget_tokens": 1024,
        "effort": "low"  # 减少思考量
    },
    messages=[{"role": "user", "content": "1+1等于几"}]
)
\`\`\`

## 优化技巧六：精简 Prompt

每多一个 token 的输入都有成本。

\`\`\`python
# 差：冗长的 prompt（200 tokens）
bad_prompt = """
我想请你帮我做一件事情，就是把下面这段英文文字翻译成中文。
请你尽量保持原文的意思和语气，翻译要通顺自然。
下面是需要翻译的内容：
Hello World
"""

# 好：精简的 prompt（20 tokens）
good_prompt = "翻译成中文：Hello World"
\`\`\`

## 成本计算示例

| 场景 | 模型 | 输入 | 输出 | 单次成本 | 1万次/月 |
|------|------|------|------|---------|---------|
| 意图分类 | Haiku | 500 | 20 | $0.0006 | $6 |
| 内容摘要 | Sonnet | 5K | 500 | $0.0225 | $225 |
| 代码审查 | Sonnet | 10K | 2K | $0.06 | $600 |
| 深度分析 | Opus | 20K | 5K | $0.225 | $2,250 |

## 实战练习

> **Tip:** 审计你当前的 API 使用并优化。

1. 记录你最近 10 次 API 调用的 token 用量和成本
2. 识别哪些调用可以用更便宜的模型
3. 对高频调用启用 Prompt Caching，对比前后成本

## 关键要点

> **Note:** 本文核心总结

- 输出 token 比输入贵 3-5 倍，控制输出是第一优先级
- Prompt Caching 省 90%，Batch API 省 50%
- 按任务复杂度选择模型：Haiku → Sonnet → Opus
- 精简 prompt、限制输出长度是基本功`,
  },
  // ── 13: claude-code-deep-dive ───────────────────────────────────────────────
  {
    slug: "claude-code-deep-dive",
    content: `Claude Code 是 Anthropic 官方的 AI 编程助手——一个在终端中运行的 Agent，可以读写文件、执行命令、搜索代码。本文深入讲解 Claude Code 的高级功能：MCP 配置、Sub-Agent、Hooks、Skills 和最佳工作流。

## 你将学到什么

- Claude Code 的架构和核心机制
- MCP Server 配置
- Sub-Agent 多智能体协作
- Hooks 自动化
- 高效使用 Claude Code 的技巧

## Claude Code 架构

Claude Code 本质是一个运行在终端中的 Agent Loop：

\`\`\`
用户输入 → Claude 思考 → 选择工具 → 执行（读/写/运行） → 观察结果 → 继续或回复
\`\`\`

**内置工具：**
- \`Read\` / \`Write\` / \`Edit\` — 文件操作
- \`Bash\` — 执行 shell 命令
- \`Glob\` / \`Grep\` — 文件搜索
- \`Agent\` — 启动子智能体

## MCP Server 配置

通过 MCP 扩展 Claude Code 的能力。

**项目级配置（.mcp.json）：**

\`\`\`json
{
  "mcpServers": {
    "database": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-postgres", "postgresql://localhost/mydb"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "your-token"
      }
    }
  }
}
\`\`\`

**全局配置（~/.claude/mcp.json）：** 对所有项目生效。

## Sub-Agent 多智能体

Claude Code 可以启动子智能体（Sub-Agent）并行处理任务：

\`\`\`
主 Agent: "我需要同时做三件事"
  ├── Sub-Agent 1: 搜索相关代码
  ├── Sub-Agent 2: 读取文档
  └── Sub-Agent 3: 检查测试
各 Sub-Agent 返回结果 → 主 Agent 综合决策
\`\`\`

**特点：**
- Sub-Agent 运行在独立上下文中，不会污染主对话
- 可以并行执行多个 Sub-Agent
- 适合大范围代码搜索、多文件分析

## Hooks 自动化

Hooks 是在特定事件时自动执行的 shell 命令。

**配置（~/.claude/settings.json）：**

\`\`\`json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "command": "npx prettier --write $CLAUDE_FILE_PATH"
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Bash",
        "command": "echo 'About to run: $CLAUDE_TOOL_INPUT'"
      }
    ]
  }
}
\`\`\`

**可用的 Hook 事件：**
- \`PreToolUse\` — 工具调用前
- \`PostToolUse\` — 工具调用后
- \`Notification\` — 通知事件

**常见用途：**
- 每次写文件后自动格式化（prettier、black）
- 每次提交前自动 lint
- 文件变更后自动运行相关测试

## CLAUDE.md 项目指令

每个项目可以有一个 \`CLAUDE.md\` 文件，定义项目级指令：

\`\`\`markdown
# 项目指令

## 代码风格
- 使用 TypeScript，不用 JavaScript
- 函数名用 camelCase
- 文件名用 kebab-case

## 架构规则
- API 路由放在 app/api/ 下
- 组件放在 components/ 下
- 数据库操作用 Prisma

## 测试
- 每个新功能必须有测试
- 运行 pnpm test 验证
\`\`\`

Claude Code 会自动读取并遵循这些指令。

## 高效使用技巧

**1. 用 /compact 管理上下文**

对话太长时，用 \`/compact\` 压缩历史，释放上下文空间。

**2. 用 Agent 做大范围搜索**

不确定代码在哪个文件时，让 Claude Code 启动 Explore Agent 搜索整个代码库。

**3. 用 Worktree 隔离实验**

在 git worktree 中进行实验性修改，不影响主分支。

**4. 善用 /plan 模式**

复杂任务先进入 plan 模式，让 Claude 分析代码库后再制定方案。

## 实战练习

> **Tip:** 优化你的 Claude Code 工作流。

1. 为你的项目创建 \`CLAUDE.md\`，写明编码规范
2. 配置一个 MCP Server（如 GitHub 或数据库）
3. 设置一个 Hook，每次写文件后自动格式化

## 关键要点

> **Note:** 本文核心总结

- Claude Code = 终端中的 Agent Loop + 丰富的内置工具
- MCP 扩展外部能力，Sub-Agent 并行处理
- Hooks 自动化文件格式化、lint 等重复操作
- CLAUDE.md 定义项目级指令，确保一致性`,
  },
  // ── 14: production-agent-project ────────────────────────────────────────────
  {
    slug: "production-agent-project",
    content: `前面 13 篇文章学习了各种技术。现在把它们组合起来，从零构建一个生产级 AI Agent。本文是完整的实战项目指南——需求分析、架构设计、核心代码、错误恢复、日志监控、安全防护。

## 你将学到什么

- 生产级 Agent 的完整架构设计
- 核心组件的实现（Agent Loop、工具管理、记忆）
- 错误恢复和重试策略
- 日志、监控和安全防护

## 项目概述：智能客服 Agent

我们构建一个**智能客服 Agent**，它能够：
- 回答产品相关问题（基于知识库）
- 查询订单状态（调用内部 API）
- 处理退款请求（多步骤工作流）
- 升级到人工客服（兜底方案）

## 架构设计

\`\`\`
┌─────────────────────────────────────────────┐
│                   Gateway                    │
│              (认证/限流/日志)                  │
├─────────────────────────────────────────────┤
│                Agent Loop                    │
│  ┌─────────┐  ┌──────────┐  ┌────────────┐ │
│  │ 推理引擎 │  │ 工具管理  │  │ 记忆系统   │ │
│  │(Claude)  │  │          │  │            │ │
│  └─────────┘  └──────────┘  └────────────┘ │
├─────────────────────────────────────────────┤
│                  Tools                       │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌───────────┐ │
│  │知识库 │ │订单API│ │退款API│ │升级人工   │ │
│  └──────┘ └──────┘ └──────┘ └───────────┘ │
└─────────────────────────────────────────────┘
\`\`\`

## 核心实现

### Agent 类

\`\`\`python
import anthropic
import logging
from datetime import datetime

logger = logging.getLogger("agent")

class CustomerServiceAgent:
    def __init__(self):
        self.client = anthropic.Anthropic()
        self.tools = self._define_tools()
        self.conversation_history = []
        self.max_iterations = 10

    def _define_tools(self):
        return [
            {
                "name": "search_knowledge_base",
                "description": "搜索产品知识库回答用户问题。输入关键词，返回相关文档片段。",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "query": {"type": "string", "description": "搜索关键词"}
                    },
                    "required": ["query"]
                }
            },
            {
                "name": "query_order",
                "description": "查询订单状态。输入订单号，返回订单详情。",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "order_id": {"type": "string", "description": "订单号"}
                    },
                    "required": ["order_id"]
                }
            },
            {
                "name": "process_refund",
                "description": "处理退款请求。需要订单号和退款原因。",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "order_id": {"type": "string"},
                        "reason": {"type": "string"}
                    },
                    "required": ["order_id", "reason"]
                }
            },
            {
                "name": "escalate_to_human",
                "description": "升级到人工客服。当问题超出 AI 能力范围时使用。",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "summary": {"type": "string", "description": "问题摘要"}
                    },
                    "required": ["summary"]
                }
            }
        ]

    def _execute_tool(self, name, inputs):
        """执行工具并处理错误"""
        try:
            if name == "search_knowledge_base":
                return self._search_kb(inputs["query"])
            elif name == "query_order":
                return self._query_order(inputs["order_id"])
            elif name == "process_refund":
                return self._process_refund(inputs["order_id"], inputs["reason"])
            elif name == "escalate_to_human":
                return self._escalate(inputs["summary"])
            return "未知工具"
        except Exception as e:
            logger.error(f"工具执行失败: {name}, 错误: {e}")
            return f"工具执行出错: {str(e)}"

    def handle_message(self, user_message):
        """处理用户消息的主循环"""
        self.conversation_history.append({
            "role": "user", "content": user_message
        })

        system_prompt = """你是一个专业的客服助手。请遵循以下原则：
1. 友好、专业地回答用户问题
2. 需要查询信息时主动使用工具
3. 不确定的信息不要猜测，使用知识库搜索
4. 复杂问题无法解决时，升级到人工客服
5. 回复要简洁明了"""

        for iteration in range(self.max_iterations):
            try:
                response = self.client.messages.create(
                    model="claude-sonnet-4-6",
                    max_tokens=2048,
                    system=system_prompt,
                    tools=self.tools,
                    messages=self.conversation_history,
                )
            except anthropic.RateLimitError:
                logger.warning("触发速率限制，等待重试")
                import time
                time.sleep(2)
                continue
            except anthropic.APIError as e:
                logger.error(f"API 错误: {e}")
                return "抱歉，系统暂时出现问题，请稍后再试。"

            if response.stop_reason == "tool_use":
                tool_results = []
                for block in response.content:
                    if block.type == "tool_use":
                        logger.info(f"调用工具: {block.name}")
                        result = self._execute_tool(block.name, block.input)
                        tool_results.append({
                            "type": "tool_result",
                            "tool_use_id": block.id,
                            "content": str(result),
                        })

                self.conversation_history.append({
                    "role": "assistant", "content": response.content
                })
                self.conversation_history.append({
                    "role": "user", "content": tool_results
                })
            else:
                # 生成最终回复
                reply = ""
                for block in response.content:
                    if hasattr(block, "text"):
                        reply += block.text

                self.conversation_history.append({
                    "role": "assistant", "content": reply
                })
                return reply

        return "抱歉，处理超时，请联系人工客服。"

    # 工具实现（示意）
    def _search_kb(self, query):
        return f"知识库搜索结果：关于'{query}'的信息..."

    def _query_order(self, order_id):
        return f"订单 {order_id}：已发货，预计明天送达"

    def _process_refund(self, order_id, reason):
        return f"退款已提交，订单 {order_id}，预计 3-5 个工作日到账"

    def _escalate(self, summary):
        return f"已升级到人工客服，摘要: {summary}"
\`\`\`

### 日志和监控

\`\`\`python
import logging

# 配置结构化日志
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

# 记录关键指标
class AgentMetrics:
    def __init__(self):
        self.total_requests = 0
        self.tool_calls = 0
        self.errors = 0
        self.total_tokens = 0

    def record_request(self, response):
        self.total_requests += 1
        self.total_tokens += response.usage.input_tokens
        self.total_tokens += response.usage.output_tokens

    def report(self):
        return {
            "total_requests": self.total_requests,
            "tool_calls": self.tool_calls,
            "errors": self.errors,
            "total_tokens": self.total_tokens,
        }
\`\`\`

## 安全防护

**1. 输入验证：** 对用户输入做基本的清洗和长度限制。

**2. 输出过滤：** 确保 Agent 不泄露内部系统信息。

**3. 权限控制：** 敏感操作（如退款）需要额外验证。

**4. 速率限制：** 防止单用户滥用。

## 部署清单

> **Warning:** 上线前确认以下事项。

- [ ] API Key 安全存储（环境变量，不是代码中）
- [ ] 错误处理和重试机制完备
- [ ] 日志和监控已配置
- [ ] 速率限制已设置
- [ ] 敏感操作有权限控制
- [ ] 有人工兜底方案
- [ ] 测试覆盖了常见场景和边界情况

## 实战练习

> **Tip:** 基于本文框架构建你自己的 Agent。

1. 选择一个你熟悉的业务场景（客服、数据分析、运维）
2. 定义 3-5 个核心工具
3. 实现 Agent Loop + 错误处理
4. 添加日志和监控

## 关键要点

> **Note:** 本文核心总结

- 生产级 Agent = Agent Loop + 工具管理 + 错误恢复 + 监控
- 每个工具调用都需要 try/catch 和日志
- API 错误用指数退避重试
- 一定要有人工兜底方案
- 安全防护（输入验证、权限控制、速率限制）不可少

## 延伸阅读

恭喜你完成了全部高级教程！你现在已经掌握了构建生产级 AI 应用的核心技能。继续实践，持续学习！`,
  },
];

async function main() {
  console.log("Updating " + tutorials.length + " advanced tutorials...");

  for (const t of tutorials) {
    const chars = t.content.length;
    const mins = Math.ceil(chars / 500);

    await prisma.article.updateMany({
      where: { slug: t.slug },
      data: {
        content: t.content,
        readingTime: mins,
      },
    });

    console.log("  UPDATE: " + t.slug + " (" + chars + " chars, ~" + mins + " min read)");
  }

  console.log("\nDone: " + tutorials.length + " articles updated.");

  // Publish all advanced tutorials
  const published = await prisma.article.updateMany({
    where: {
      series: "Claude 高级开发",
      publishedAt: null,
    },
    data: {
      publishedAt: new Date(),
    },
  });

  console.log("Published: " + published.count + " advanced articles.");

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
