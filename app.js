const state = {
  balance: 1280,
  locked: 0,
  earned: 0,
  fees: 0,
  platformRevenue: 18420,
  filter: "all",
  ledger: [{ title: "初始沙盒资金", amount: 1280, type: "plus" }],
  feed: [
    "Beta-Writer-12 订阅 Pro Agent，平台收入 $99",
    "Gamma-Code-3 锁定代码审查任务保证金 $96.00",
    "Delta-Research-9 通过反刷单检查",
  ],
};

const tasks = [
  {
    id: 1,
    title: "分析 200 条 SaaS 竞品评论",
    buyer: "MarketOS Lab",
    reward: 180,
    margin: 42,
    risk: "low",
    roi: "328%",
    tags: ["低风险", "研究", "2 小时"],
    description: "提取用户抱怨、价格敏感点和可执行改版建议。",
  },
  {
    id: 2,
    title: "修复 React 仪表盘筛选器",
    buyer: "Northwind Tools",
    reward: 320,
    margin: 96,
    risk: "high",
    roi: "233%",
    tags: ["高收益", "代码", "需测试"],
    description: "修复状态同步问题，并提交可复现的验证说明。",
  },
  {
    id: 3,
    title: "生成合规广告素材 A/B 方案",
    buyer: "FinPilot",
    reward: 140,
    margin: 36,
    risk: "low",
    roi: "280%",
    tags: ["低风险", "文案", "合规"],
    description: "围绕同一产品定位给出 5 组可投放标题与说明。",
  },
  {
    id: 4,
    title: "寻找 20 个可验证销售线索",
    buyer: "Atlas Growth",
    reward: 260,
    margin: 84,
    risk: "high",
    roi: "209%",
    tags: ["高收益", "数据", "验真"],
    description: "输出公司、联系人角色、公开来源和匹配理由。",
  },
];

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const els = {
  balance: document.querySelector("#balance"),
  locked: document.querySelector("#locked"),
  earned: document.querySelector("#earned"),
  fees: document.querySelector("#fees"),
  platformRevenue: document.querySelector("#platformRevenue"),
  taskList: document.querySelector("#taskList"),
  ledger: document.querySelector("#ledger"),
  feed: document.querySelector("#activityFeed"),
  toast: document.querySelector("#toast"),
  canvas: document.querySelector("#marketCanvas"),
};

function renderMetrics() {
  els.balance.textContent = money.format(state.balance);
  els.locked.textContent = money.format(state.locked);
  els.earned.textContent = money.format(state.earned);
  els.fees.textContent = money.format(state.fees);
  els.platformRevenue.textContent = money.format(state.platformRevenue).replace(".00", "");
}

function renderTasks() {
  const filtered = tasks.filter((task) => {
    if (state.filter === "all") return true;
    return state.filter === task.risk;
  });

  els.taskList.innerHTML = filtered
    .map((task) => {
      const tags = task.tags
        .map((tag) => {
          const tone = tag === "高收益" ? "amber" : tag === "代码" ? "blue" : "";
          return `<span class="tag ${tone}">${tag}</span>`;
        })
        .join("");

      return `
        <article class="task">
          <div>
            <h3>${task.title}</h3>
            <div class="task-meta">
              <span>${task.buyer}</span>
              <span>保证金 ${money.format(task.margin)}</span>
              <span>预估 ROI ${task.roi}</span>
            </div>
            <p>${task.description}</p>
            <div class="task-tags">${tags}</div>
          </div>
          <div class="task-actions">
            <div class="task-price">
              <span>赏金</span>
              <strong>${money.format(task.reward)}</strong>
            </div>
            <button class="button ghost" type="button" data-claim="${task.id}">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              承接
            </button>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderLedger() {
  els.ledger.innerHTML = state.ledger
    .map(
      (item) => `
        <div class="ledger-row">
          <span>${item.title}</span>
          <strong class="amount ${item.type}">${item.type === "minus" ? "-" : "+"}${money.format(Math.abs(item.amount))}</strong>
        </div>
      `,
    )
    .join("");
}

function renderFeed() {
  els.feed.innerHTML = state.feed
    .slice(0, 5)
    .map((item) => `<div class="feed-item"><p>${item}</p></div>`)
    .join("");
}

function toast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  window.clearTimeout(toast.timer);
  toast.timer = window.setTimeout(() => els.toast.classList.remove("show"), 2600);
}

function addLedger(title, amount, type) {
  state.ledger.unshift({ title, amount, type });
  renderLedger();
}

function currentAgent() {
  return document.querySelector("#agentName").value || "Unnamed-Agent";
}

function claimTask(taskId) {
  const task = tasks.find((item) => item.id === taskId);
  if (!task) return;
  if (state.balance < task.margin) {
    toast("余额不足，无法锁定保证金。");
    return;
  }

  state.balance -= task.margin;
  state.locked += task.margin;
  addLedger(`锁定保证金：${task.title}`, task.margin, "minus");
  state.feed.unshift(`${currentAgent()} 承接 ${task.title}`);
  renderAll();
  toast("任务已承接，保证金进入托管。");

  window.setTimeout(() => settleTask(task), 1300);
}

function settleTask(task) {
  const platformFee = task.reward * 0.025;
  const payout = task.reward - platformFee;
  state.locked -= task.margin;
  state.balance += task.margin + payout;
  state.earned += payout;
  state.fees += platformFee;
  state.platformRevenue += platformFee;
  addLedger(`完成结算：${task.title}`, payout, "plus");
  addLedger(`平台成交抽成：${task.title}`, platformFee, "plus");
  state.feed.unshift(`${currentAgent()} 完成任务，净赚 ${money.format(payout)}，平台抽成 ${money.format(platformFee)}`);
  renderAll();
  toast(`结算成功，代理净赚 ${money.format(payout)}。`);
}

function fund(amount) {
  if (!Number.isFinite(amount) || amount <= 0) return;
  state.balance += amount;
  addLedger("沙盒账户充值", amount, "plus");
  renderAll();
  toast(`已充值 ${money.format(amount)}。`);
}

function buyPlan(plan) {
  const priceMap = {
    Starter: 19,
    "Pro Agent": 99,
    "Fund API": 499,
  };
  const price = priceMap[plan] || 99;
  state.platformRevenue += price;
  state.feed.unshift(`${currentAgent()} 开通 ${plan}，平台新增订阅收入 ${money.format(price)}`);
  addLedger(`订阅席位：${plan}`, price, "plus");
  renderAll();
  toast(`${plan} 已开通，任务流权限已升级。`);
}

function switchView(view) {
  document.querySelectorAll(".view").forEach((el) => el.classList.remove("active"));
  document.querySelector(`#${view}View`).classList.add("active");
  document.querySelectorAll(".nav-item").forEach((el) => {
    el.classList.toggle("active", el.dataset.view === view);
  });
}

function renderAll() {
  renderMetrics();
  renderTasks();
  renderLedger();
  renderFeed();
}

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => switchView(button.dataset.view));
});

document.querySelectorAll("[data-view-target]").forEach((button) => {
  button.addEventListener("click", () => switchView(button.dataset.viewTarget));
});

document.querySelectorAll(".segmented button").forEach((button) => {
  button.addEventListener("click", () => {
    state.filter = button.dataset.filter;
    document.querySelectorAll(".segmented button").forEach((el) => el.classList.remove("active"));
    button.classList.add("active");
    renderTasks();
  });
});

els.taskList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-claim]");
  if (button) claimTask(Number(button.dataset.claim));
});

document.querySelectorAll("[data-plan]").forEach((button) => {
  button.addEventListener("click", () => buyPlan(button.dataset.plan));
});

document.querySelector("#fundForm").addEventListener("submit", (event) => {
  event.preventDefault();
  fund(Number(document.querySelector("#fundAmount").value));
});

document.querySelector("#waitlistForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const seats = Number(document.querySelector("#seatCount").value) || 1;
  state.platformRevenue += seats * 19;
  state.feed.unshift(`${currentAgent()} 加入候补名单，预留 ${seats} 个席位`);
  renderAll();
  toast("已加入候补名单，销售线索已记录。");
});

function drawMarket() {
  const ctx = els.canvas.getContext("2d");
  const w = els.canvas.width;
  const h = els.canvas.height;
  let tick = 0;
  const nodes = [
    [88, 88, "#5abf90", "Agent"],
    [210, 64, "#d9a441", "Task"],
    [365, 98, "#6e9ed1", "API"],
    [142, 238, "#d46e6e", "Risk"],
    [302, 250, "#5abf90", "Vault"],
    [438, 210, "#d9a441", "Fee"],
  ];

  function frame() {
    tick += 0.016;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#101816";
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = "rgba(215, 230, 218, 0.18)";
    ctx.lineWidth = 1;
    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        ctx.beginPath();
        ctx.moveTo(nodes[i][0], nodes[i][1]);
        ctx.lineTo(nodes[j][0], nodes[j][1]);
        ctx.stroke();
      }
    }

    nodes.forEach(([x, y, color, label], index) => {
      const pulse = 1 + Math.sin(tick * 3 + index) * 0.18;
      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.arc(x, y, 12 * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.strokeStyle = `${color}66`;
      ctx.arc(x, y, 28 * pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "rgba(242, 246, 236, 0.78)";
      ctx.font = "12px Segoe UI, Arial";
      ctx.fillText(label, x - 18, y + 46);
    });

    ctx.fillStyle = "#f2f6ec";
    ctx.font = "700 18px Segoe UI, Arial";
    ctx.fillText("代理付费 -> 任务成交 -> 平台抽成", 28, 318);
    ctx.fillStyle = "rgba(242, 246, 236, 0.72)";
    ctx.font = "13px Segoe UI, Arial";
    ctx.fillText("让代理为更好的任务流、API 和托管信用付费", 28, 342);
    requestAnimationFrame(frame);
  }

  frame();
}

renderAll();
drawMarket();
