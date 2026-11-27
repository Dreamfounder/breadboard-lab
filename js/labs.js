/* Lab practice levels adapted from WIX1003 Computer Systems & Organization
   Lab 01: Electronics and Lab 02: Combinational Circuit Design. */
(function (BBL) {
  'use strict';

  const TRACKS = [
    {
      id: 'lab01',
      label: 'Lab 01',
      title: 'Electronics',
      cn: '电子基础',
      course: 'WIX1003 Computer Systems & Organization',
      source: 'Lab 01: Electronics',
      color: 'blue',
      intro: '这份 Lab 就是学会用电线、电源、电阻、小灯和几片逻辑芯片做实验。先看每关已经摆好的零件，自己把线接起来；最后给你一块空面包板，从头做一遍。',
      goals: ['分清电源的正极和负极', '看懂芯片的 14 只脚怎么数', '用电阻保护小灯', '自己填出五种芯片的“输入→输出”表', '从空白画布独立完成终验']
    },
    {
      id: 'lab02',
      label: 'Lab 02',
      title: 'Combinational Circuit Design',
      cn: '组合电路设计',
      course: 'WIX1003 Computer Systems & Organization',
      source: 'Lab 02: Combinational Circuit Design',
      color: 'green',
      intro: '这份 Lab 要你用几种逻辑芯片拼出“加法器”：先让两个一位数相加，再让三个一位数相加。先看参考电路自己接线，最后在空白面包板上独立搭出完整全加器。',
      goals: ['明白“个位”和“进位”是什么', '用“不同才通过”和“都同意才通过”拼出半加器', '把两个半加器接成一个全加器', '自己填完输入输出表', '从空白画布独立搭出全加器']
    },
    {
      id: 'co',
      label: '计算机组成',
      title: 'Computer Organization',
      cn: '计算机组成原理',
      course: 'Computer Organization',
      source: 'ALU / Datapath / Control / State',
      color: 'green',
      intro: '这一组只讲计算机组成原理真正会用到的芯片：加法器、数据选择器、译码器、比较器和 D 触发器。不加传感器、电机、NeoPixel 这些无关元件。',
      goals: ['用 74HC283 做 4 位加法', '用 74HC138 做地址译码', '用 74HC74 记住一位状态', '理解 ALU、数据通路和控制信号的基本积木']
    }
  ];

  const LEVELS = [
    {
      id: 'lab01-led',
      track: 'lab01',
      number: '01',
      title: '电源、面包板与 LED',
      en: 'Power, Breadboard and LED',
      minutes: 10,
      difficulty: '基础',
      template: 'lab01-led',
      taskId: 'lab01-led',
      brief: '搭出 5V → 1kΩ → LED → GND，先弄懂电流走哪条路。',
      objective: '完成第一个闭合回路，分清 Vcc、GND、LED 阳极和阴极，并理解限流电阻为什么不能省。',
      parts: ['power-supply', 'resistor', 'led'],
      background: [
        '电源的正极记作 Vcc（本实验为 5V），负极记作 GND（0V）。电流从 Vcc 流出，经过元件回到 GND，才构成完整回路。',
        'LED 是有极性的：长脚是阳极（Anode，接高电位），短脚是阴极（Cathode，接 GND）。接反时 LED 不会亮，但也不会烧坏。',
        '电源不能直接跨接在 LED 两端，也不能把 Vcc 与 GND 直接短接。必须串联限流电阻；本实验使用 1kΩ。'
      ],
      steps: [
        { title: '认识符号', body: '在画布上找到 5V 电源和 GND。电源的 V+ 是正极，GND 是负极；面包板上下两条长轨分别用来分配 Vcc 和 GND。' },
        { title: '插上电阻', body: '把 1kΩ 电阻跨在面包板中间的不同列上。电阻没有极性，方向随意，但两条腿必须在不同列，否则会被短路。' },
        { title: '接上 LED', body: '把 LED 的阳极 A 接电阻的另一端，阴极 K 接 GND。注意 LED 的两条腿也不能插在同一列。' },
        { title: '闭合回路', body: '用红色导线把 V+ 接到电阻，再用黑色导线把 LED 阴极接到 GND。检查没有 V+ 直接连 GND 的路径。' },
        { title: '运行并观察', body: '点击“开始模拟”。LED 应该点亮，电流约 3 mA。如果把 LED 反接，LED 不会亮，但电路仍然安全。' }
      ],
      wiring: [
        { from: '电源 V+', to: '1kΩ 电阻引脚 1', why: '把 5V 送进限流电阻' },
        { from: '电阻引脚 2', to: 'LED 阳极 A', why: '限流后送入 LED' },
        { from: 'LED 阴极 K', to: '电源 GND', why: '让电流回到 0V' }
      ],
      pitfalls: [
        '把 LED 直接接到 5V 和 GND：电流过大，会触发过流警告。',
        'LED 阳极接 GND、阴极接 V+：反向偏置，LED 不亮。',
        '电阻两条腿插在同一列：电阻被短路，限流失效。'
      ],
      checkpoints: ['回路上没有 V+ 与 GND 直连', 'LED 阳极朝电源方向', '电流在安全范围内', 'LED 点亮'],
      submit: '截图保存这个亮灯电路，作为 Lab 01 的第一张结果图。'
    },
    {
      id: 'lab01-nand',
      track: 'lab01',
      number: '02',
      title: '74HC00 · NAND',
      en: 'Dual 4-Input NAND',
      minutes: 15,
      difficulty: '基础',
      template: 'lab01-nand',
      taskId: 'lab01-nand',
      brief: '4 输入 NAND 的 C/D 接高，当作 2 输入 NAND 验证真值表。',
      objective: '看懂 74HC00 的 14 脚排列，给芯片供电，把 4 输入 NAND 变成 2 输入 NAND，并填写输出列。',
      parts: ['ic74hc00', 'slide-switch', 'slide-switch', 'resistor', 'led', 'power-supply'],
      background: [
        '74HC00 内含两个互相独立的 4 输入 NAND 门。NAND 的意思是“先 AND，再 NOT”：只有所有输入都为 1，输出才为 0；其余情况输出 1。',
        '本实验只使用 A、B 两个输入。为了让另外两个输入不影响结果，必须把 1C、1D 接到 Vcc（逻辑 1）。这样 1Y = NOT(A · B · 1 · 1) = NOT(A · B)。',
        'DIP-14 芯片从缺口和圆点开始，逆时针编号：左下角是 1，右下角是 7，右上角是 14。第 14 脚接 Vcc，第 7 脚接 GND，这是所有 74HC 芯片的供电方式。',
        '实验台用滑动开关代替反复插拔跳线：开关一边接 Vcc、一边接 GND，公共端就是逻辑输入。切换开关比拔线更适合反复验证真值表。'
      ],
      steps: [
        { title: '芯片跨槽', body: '把 74HC00 跨在面包板中央凹槽上，让左侧 1–7 脚和右侧 8–14 脚分别落在不同列，避免左右两排短路。' },
        { title: '先接电源', body: '第 14 脚接 V+, 第 7 脚接 GND。上电前再检查一遍，电源绝不能反接。' },
        { title: '把 C/D 接高', body: '用红色跳线把第 4 脚（1C）和第 5 脚（1D）接到 Vcc。若它们悬空，CMOS 输入会不稳定。' },
        { title: '接输入与输出', body: '两个滑动开关分别接第 1 脚（1A）和第 2 脚（1B）。第 6 脚（1Y）经 1kΩ 电阻接 LED 阳极，LED 阴极接 GND。' },
        { title: '验证真值表', body: '运行仿真，依次切换 A/B 的四种组合。先观察 LED，再把结果填进关卡页的真值表，最后用“检查我的真值表”确认。' }
      ],
      wiring: [
        { from: '74HC00 第 14 脚', to: 'V+', why: '芯片供电' },
        { from: '74HC00 第 7 脚', to: 'GND', why: '芯片接地' },
        { from: '第 4 脚 1C + 第 5 脚 1D', to: 'V+', why: '未使用的输入固定为 1' },
        { from: '开关 A → 第 1 脚 1A', to: '开关 B → 第 2 脚 1B', why: '接入两个实验输入' },
        { from: '第 6 脚 1Y', to: '1kΩ → LED 阳极', why: '观察 NAND 输出' },
        { from: 'LED 阴极', to: 'GND', why: '构成完整输出回路' }
      ],
      truth: {
        title: '74HC00 实验真值表',
        headers: ['A', 'B', 'Y = NOT(A·B)'],
        inputs: 2,
        hint: 'NAND 和 AND 相反：只有 A、B 都为 1 时输出才是 0，其余情况都是 1。',
        rows: [['0', '0', '1'], ['0', '1', '1'], ['1', '0', '1'], ['1', '1', '0']],
        note: '先自己填完四行，再用检查功能；检查只会标出哪几行不对。'
      },
      pitfalls: [
        '忘记把 C/D 接高：输入悬空，输出不确定，真值表对不上。',
        '芯片方向插反：第 14 脚实际落在 GND 列，芯片可能损坏。',
        'LED 极性接反：输出为 1 时 LED 仍然不亮。'
      ],
      checkpoints: ['14 脚接 V+、7 脚接 GND', '1C 和 1D 都接到 V+', 'A/B 开关接到 1、2 脚', '四种输入组合都观察并记录'],
      submit: '把 74HC00 的四行输出填入实验报告，并截取 11 输入时的电路图。'
    },
    {
      id: 'lab01-not',
      track: 'lab01',
      number: '03',
      title: '74HC04 · NOT',
      en: 'Hex Inverter',
      minutes: 10,
      difficulty: '基础',
      template: 'lab01-not',
      taskId: 'lab01-not',
      brief: '输入 0 输出 1，输入 1 输出 0，最简单的反相器。',
      objective: '验证 NOT 门的反相关系，并理解为什么 NOT 的输出永远与输入相反。',
      parts: ['ic74hc04', 'slide-switch', 'resistor', 'led', 'power-supply'],
      background: [
        '74HC04 内含 6 个独立的反相器（Inverter）。输入低电平，输出高电平；输入高电平，输出低电平。逻辑式写作 Y = Ā。',
        '本实验使用第一个反相器：第 1 脚 1A 是输入，第 2 脚 1Y 是输出。第 7 脚 GND、第 14 脚 Vcc 仍需供电。',
        'NOT 门常用来把低有效信号变成高有效信号，例如把“按下为 0”的按钮转换为“按下为 1”。'
      ],
      steps: [
        { title: '给芯片供电', body: '74HC04 跨槽，第 14 脚接 V+、第 7 脚接 GND。' },
        { title: '接入输入', body: '滑动开关公共端接第 1 脚 1A；开关两端分别接 V+ 和 GND。' },
        { title: '接入输出', body: '第 2 脚 1Y 经 1kΩ 电阻接 LED 阳极，LED 阴极接 GND。' },
        { title: '切换输入', body: '运行仿真，切换 A 的高低电平，观察 LED 的亮灭变化并把结果记录下来。' }
      ],
      wiring: [
        { from: '74HC04 第 14 脚 / 第 7 脚', to: 'V+ / GND', why: '供电' },
        { from: '开关公共端', to: '第 1 脚 1A', why: '输入信号' },
        { from: '第 2 脚 1Y', to: '1kΩ → LED 阳极', why: '观察输出' },
        { from: 'LED 阴极', to: 'GND', why: '回到电源负极' }
      ],
      truth: {
        title: '74HC04 实验真值表',
        headers: ['Input A', 'Output Y'],
        inputs: 1,
        hint: 'NOT 门把输入反相：输入 0 时输出 1，输入 1 时输出 0。',
        rows: [['0', '1'], ['1', '0']],
        note: '自己观察两行结果，再点检查。'
      },
      pitfalls: [
        '把开关的 V+ 和 GND 两端接反：只改变“按下”方向，不会损坏芯片。',
        '输出直接接 V+ 或 GND：输出短路，可能损坏芯片。',
        '忘记接第 7 脚 GND：芯片没有参考地，输出无效。'
      ],
      checkpoints: ['14 脚 V+、7 脚 GND', '开关接 1A', '输出经电阻接 LED', '两行结果都观察并记录'],
      submit: '截取输入为 0 和 1 时的两张电路图，并附上你填写的真值表。'
    },
    {
      id: 'lab01-and',
      track: 'lab01',
      number: '04',
      title: '74HC08 · AND',
      en: 'Dual 4-Input AND',
      minutes: 15,
      difficulty: '基础',
      template: 'lab01-and',
      taskId: 'lab01-and',
      brief: '4 输入 AND 的 C/D 接高，A/B 同时为 1 时 LED 才亮。',
      objective: '验证 AND 的“全 1 才 1”，并掌握 74HC08 与 74HC00 的引脚对应关系。',
      parts: ['ic74hc08', 'slide-switch', 'slide-switch', 'resistor', 'led', 'power-supply'],
      background: [
        '74HC08 是双 4 输入 AND 门。AND 的输出只有在所有输入都为 1 时才为 1。逻辑式：Y = A · B · C · D。',
        '实验只使用 A、B；把 1C、1D 接 Vcc 后，Y = A · B · 1 · 1 = A · B，于是得到 2 输入 AND 的效果。',
        '74HC08 和 74HC00 的引脚排列几乎相同：门 1 输入 1/2/4/5，输出 6；门 2 输入 13/12/10/9，输出 8。'
      ],
      steps: [
        { title: '芯片供电', body: '第 14 脚 V+、第 7 脚 GND，芯片跨槽放置。' },
        { title: '固定多余输入', body: '第 4 脚 1C、第 5 脚 1D 接 V+。这是 4 输入芯片做 2 输入实验的关键。' },
        { title: '接 A/B 与输出', body: '开关 A、B 接第 1、2 脚；第 6 脚 1Y 经 1kΩ 接 LED。' },
        { title: '验证全表', body: '运行仿真，依次试 00、01、10、11，自己观察 LED 并填写四行结果。' }
      ],
      wiring: [
        { from: '第 14 脚 / 第 7 脚', to: 'V+ / GND', why: '供电' },
        { from: '第 4 脚 1C + 第 5 脚 1D', to: 'V+', why: '让 AND 只受 A/B 控制' },
        { from: '开关 A/B', to: '第 1 脚 / 第 2 脚', why: '两个输入' },
        { from: '第 6 脚 1Y', to: '1kΩ → LED', why: '输出指示' }
      ],
      truth: {
        title: '74HC08 实验真值表',
        headers: ['A', 'B', 'Y = A·B'],
        inputs: 2,
        hint: 'AND 要求所有输入都为 1；只要有一个 0，输出就是 0。',
        rows: [['0', '0', '0'], ['0', '1', '0'], ['1', '0', '0'], ['1', '1', '1']],
        note: '先自己填四行，再点检查；提示会解释 AND 的规则。'
      },
      pitfalls: [
        'C/D 接 GND：Y 永远为 0，看起来像芯片坏了。',
        'C/D 悬空：CMOS 输入不稳定，输出可能乱跳。',
        '把输出 1Y（6 脚）误接成 3 脚：3 脚是 NC，不是输出。'
      ],
      checkpoints: ['C/D 都接高', '输出取自第 6 脚', '四种输入组合都观察', '自己填写并检查真值表'],
      submit: '记录四行输出，并截取 A=B=1 时的电路图。'
    },
    {
      id: 'lab01-xor',
      track: 'lab01',
      number: '05',
      title: '74HC86 · XOR',
      en: 'Quad 2-Input XOR',
      minutes: 12,
      difficulty: '基础',
      template: 'lab01-xor',
      taskId: 'lab01-xor',
      brief: '两个输入不同时输出 1；它是半加器“求和”的关键。',
      objective: '验证 XOR 真值表，理解“不同为 1”的含义，为 Lab 02 的半加器做准备。',
      parts: ['ic74hc86', 'slide-switch', 'slide-switch', 'resistor', 'led', 'power-supply'],
      background: [
        'XOR（异或）的输出在 A 与 B 不同时为 1，相同时为 0。逻辑式：Y = A ⊕ B = A·B̄ + Ā·B。',
        '74HC86 内含 4 个 2 输入 XOR 门。本实验使用门 1：第 1、2 脚输入，第 3 脚输出。',
        '把两个 1 位二进制数相加时，Sum 正好等于 A ⊕ B；Carry 则等于 A · B。Lab 02 会把这两个门组合起来。'
      ],
      steps: [
        { title: '供电', body: '74HC86 第 14 脚 V+、第 7 脚 GND。' },
        { title: '接输入', body: 'A、B 两个开关分别接第 1、2 脚。' },
        { title: '接输出', body: '第 3 脚经 1kΩ 接 LED，LED 阴极回 GND。' },
        { title: '验证不同为 1', body: '运行仿真，测试 00、01、10、11 四种组合，把每次 LED 的亮灭填进真值表。' }
      ],
      wiring: [
        { from: '第 14 / 7 脚', to: 'V+ / GND', why: '供电' },
        { from: '开关 A/B', to: '第 1 / 2 脚', why: '两个输入' },
        { from: '第 3 脚 1Y', to: '1kΩ → LED', why: '输出指示' }
      ],
      truth: {
        title: '74HC86 实验真值表',
        headers: ['A', 'B', 'Y = A ⊕ B'],
        inputs: 2,
        hint: 'XOR 看“不同”：两个输入不一样时输出 1，一样时输出 0。',
        rows: [['0', '0', '0'], ['0', '1', '1'], ['1', '0', '1'], ['1', '1', '0']],
        note: '先自己写完四行，再点检查。'
      },
      pitfalls: [
        '把 XOR 当成 OR：11 时两种门的输出不同。',
        '输入悬空：输出不确定，必须由开关接固定电平。',
        '输出直接接 V+：会与芯片输出冲突。'
      ],
      checkpoints: ['14/7 脚供电正确', '输出取自第 3 脚', '四种输入组合都观察', '四行结果自己填写并检查'],
      submit: '记录四行输出，并保留 01 输入时的电路截图。'
    },
    {
      id: 'lab01-or',
      track: 'lab01',
      number: '06',
      title: '74HC32 · OR',
      en: 'Quad 2-Input OR',
      minutes: 12,
      difficulty: '基础',
      template: 'lab01-or',
      taskId: 'lab01-or',
      brief: '只要 A 或 B 有一个为 1，输出就为 1。',
      objective: '完成 Lab 01 最后一个门电路，验证 OR 真值表并总结五种门的区别。',
      parts: ['ic74hc32', 'slide-switch', 'slide-switch', 'resistor', 'led', 'power-supply'],
      background: [
        'OR（或）门只要有一个输入为 1，输出就为 1。逻辑式：Y = A + B。',
        '74HC32 内含 4 个 2 输入 OR 门。门 1 的第 1、2 脚是输入，第 3 脚是输出。',
        'OR 常用于“任一条件成立就触发”，例如两个传感器任意一个报警。'
      ],
      steps: [
        { title: '供电', body: '第 14 脚 V+、第 7 脚 GND。' },
        { title: '接输入输出', body: 'A/B 接第 1、2 脚；第 3 脚经 1kΩ 接 LED。' },
        { title: '验证真值表', body: '运行仿真，依次试四种输入组合，自己记录输出，再与关卡页的检查结果对照。' },
        { title: '总结', body: '把五片芯片的真值表放在一起比较：NOT、AND、NAND、OR、XOR 的输出分别何时为 1？' }
      ],
      wiring: [
        { from: '第 14 / 7 脚', to: 'V+ / GND', why: '供电' },
        { from: '开关 A/B', to: '第 1 / 2 脚', why: '两个输入' },
        { from: '第 3 脚 1Y', to: '1kΩ → LED', why: '输出指示' }
      ],
      truth: {
        title: '74HC32 实验真值表',
        headers: ['A', 'B', 'Y = A + B'],
        inputs: 2,
        hint: 'OR 看“至少一个 1”：A 或 B 任意一个为 1，输出就是 1。',
        rows: [['0', '0', '0'], ['0', '1', '1'], ['1', '0', '1'], ['1', '1', '1']],
        note: '先自己观察四行，再用检查功能确认。'
      },
      pitfalls: [
        '把 OR 与 XOR 混淆：11 时两个门的输出不同。',
        '把输出脚接到输入：会造成驱动冲突。',
        'LED 不亮就认定芯片坏：先检查电阻、极性和电源。'
      ],
      checkpoints: ['输出取自第 3 脚', '四种输入组合都观察', '自己填写并检查真值表', '五张真值表都记录完整'],
      submit: '提交五片 IC 的完整真值表，以及每片电路的 Tinkercad 截图。'
    },
    {
      id: 'lab01-final',
      track: 'lab01',
      number: '07',
      title: 'Lab 01 终验：从零搭建五门验证台',
      en: 'Final Challenge · Build the Five-Gate Bench',
      minutes: 35,
      difficulty: '终验',
      template: 'lab01-final',
      taskId: 'lab01-final',
      final: true,
      brief: '空白面包板，没有零件。自己摆放五片 IC、输入开关、五组输出和电源。',
      objective: '不依赖现成电路，从空画布摆放 Lab 01 的五片芯片，完成一个能同时验证五种逻辑门的终验电路。',
      parts: ['ic74hc00', 'ic74hc04', 'ic74hc08', 'ic74hc86', 'ic74hc32', 'slide-switch', 'slide-switch', 'resistor', 'resistor', 'resistor', 'resistor', 'resistor', 'led', 'led', 'led', 'led', 'led', 'power-supply'],
      background: [
        '终验的画布是空的：没有芯片，没有开关，也没有导线。你需要自己从元件库把零件摆到面包板上。',
        '这次要摆齐 Lab 01 的五片芯片：74HC00、74HC04、74HC08、74HC86、74HC32，并为每一片准备输出指示。输入可以用两个开关共享。'
      ],
      steps: [
        { title: '选齐五片芯片', body: '从元件库放置 74HC00、74HC04、74HC08、74HC86、74HC32，注意每片都跨中央凹槽。' },
        { title: '准备输入与输出', body: '放置两个滑动开关；为每片芯片准备 1kΩ 电阻和 LED，共五组输出。' },
        { title: '逐片接电源', body: '五片芯片都要接 Vcc 和 GND。先把电源网络搭好，再开始接信号，避免接完才发现某片没电。' },
        { title: '逐片完成信号', body: '从第一片开始，把开关接到输入、输出经电阻接 LED；每完成一片就先验证，再继续下一片。' },
        { title: '整体验证', body: '运行仿真，逐片检查输出，把五张真值表填完。终验不要求一次把所有输入同时接对，但每片最终都要能工作。' }
      ],
      wiring: [],
      pitfalls: [
        '画布是空的，忘记从元件库添加电源或某一片芯片。',
        '五片芯片数量多，容易漏掉其中一片的电源或输出。',
        '把 74HC00/08 的输出脚记错：门 1 的输出都是第 3 脚。'
      ],
      checkpoints: ['五片 Lab 01 芯片都已放置', '五片芯片都已通电', '五组输出都已接好', '运行验证并填完五张真值表'],
      submit: '提交五门验证台的完整电路图、五张真值表和最终截图。这就是 Lab 01 要求的完整结果。'
    },
    {
      id: 'lab01-hw', track: 'lab01', number: 'HW', title: 'Lab 01 作业：用 NAND 搭基本门',
      en: 'Homework · NAND-only Gates', minutes: 30, difficulty: '作业',
      template: 'lab01-hw', taskId: 'lab01-hw', homework: true,
      brief: '只用 74HC00 的 NAND 门，搭出 NOT 和 AND，提交电路与验证记录。',
      objective: '把 Lab 01 学的 NAND 门变成“万能门”：用 NAND 搭 NOT，再用 NAND 搭 AND。',
      parts: [],
      plain: '这是一道开放作业：画布是空的，没有标准接线图。你只需要用 74HC00 里面的 NAND 门，自己搭出 NOT 和 AND。',
      assignment: '用 74HC00 的 NAND 门实现：① NOT 门；② AND 门。要求画出电路图，写出每个门的输入输出关系，并截图验证。提示：两个 NAND 可以组成一个 AND；把 NAND 的两个输入接在一起就是 NOT。',
      background: [
        'NAND 是“万能门”：NOT、AND、OR 都可以只用 NAND 搭出来。',
        '本作业只用已经学过的 74HC00；题目允许用 74HC85/74HC283 时，先做“计算机组成”里的对应芯片关。'
      ],
      steps: [
        { title: '摆放零件', body: '从元件库放置 74HC00、电源、两个开关、两个 1kΩ 和两个 LED。', why: 'NAND 芯片必须先有电，开关给输入，灯显示输出。' },
        { title: '用 NAND 搭 NOT', body: '把 NAND 的两个输入接在一起，接到一个开关；输出接电阻和 LED。', why: '两个输入相同，NAND 就变成“输入取反”。' },
        { title: '用 NAND 搭 AND', body: '用两个 NAND：第一个 NAND 的输出再反一次，得到 AND。', why: 'NAND 后面再接一个 NOT，就把“反对”变回“同意”。' },
        { title: '运行并提交', body: '运行仿真，切换输入确认两个门都对，再点“提交作业”。', why: '作业不仅要接出来，还要能说明和验证它真的工作。' }
      ],
      wiring: [],
      pitfalls: ['把 NAND 的输出直接当 AND 用，忘记再取反。', '两个 NAND 的输入没有接对。', '只接一个 LED，无法同时验证 NOT 和 AND。'],
      checkpoints: ['74HC00 已供电', 'NOT 和 AND 都有输出指示', '两个门的真值都验证过', '点击了提交作业'],
      submit: '提交 NAND 搭 NOT/AND 的电路图、真值表和运行截图。'
    },
    {
      id: 'lab02-half',
      track: 'lab02',
      number: '01',
      title: '半加器 Half Adder',
      en: 'XOR + AND',
      minutes: 18,
      difficulty: '进阶',
      template: 'lab02-half',
      taskId: 'lab02-half',
      brief: 'A 与 B 相加：XOR 得到 Sum，AND 得到 Carry。',
      objective: '用一片 74HC86 和一片 74HC08 构造半加器，理解 Sum 与 Carry 的布尔表达式。',
      parts: ['ic74hc86', 'ic74hc08', 'slide-switch', 'slide-switch', 'resistor', 'resistor', 'led', 'led', 'power-supply'],
      background: [
        '半加器把两个 1 位二进制数 A、B 相加，产生 Sum（和）与 Carry（进位）。',
        'Sum = A ⊕ B，Carry = A · B。当 A=B=1 时，1+1 写作二进制 10：Sum=0、Carry=1。',
        '本实验使用 74HC86 的门 1 做 XOR，74HC08 的门 1 做 AND。两个芯片的第 14 脚接 Vcc、第 7 脚接 GND。'
      ],
      steps: [
        { title: '放置两片芯片', body: '74HC86 与 74HC08 横跨面包板凹槽，分别负责 Sum 和 Carry。' },
        { title: '供电', body: '两片芯片的第 14 脚接 V+，第 7 脚接 GND。' },
        { title: '共享输入', body: '开关 A、B 同时接到 XOR 的第 1、2 脚和 AND 的第 1、2 脚。' },
        { title: '接两个输出', body: 'XOR 第 3 脚经 1kΩ 接绿色 LED（Sum）；AND 第 3 脚经 1kΩ 接黄色 LED（Carry）。' },
        { title: '验证四行', body: '运行仿真，逐行设置 A/B，先观察两个 LED，再把自己的结果填进半加器真值表。' }
      ],
      wiring: [
        { from: 'A/B 开关', to: '74HC86 第 1/2 脚', why: 'Sum 的 XOR 输入' },
        { from: 'A/B 开关', to: '74HC08 第 1/2 脚', why: 'Carry 的 AND 输入' },
        { from: '74HC86 第 3 脚', to: '1kΩ → 绿色 LED', why: 'Sum 输出' },
        { from: '74HC08 第 3 脚', to: '1kΩ → 黄色 LED', why: 'Carry 输出' },
        { from: '两片第 14 / 7 脚', to: 'V+ / GND', why: '供电' }
      ],
      truth: {
        title: '半加器真值表',
        headers: ['A', 'B', 'Sum', 'Carry'],
        inputs: 2,
        hint: 'Sum 用 XOR，Carry 用 AND。1 + 1 写成二进制是 10：Sum=0、Carry=1。',
        rows: [['0', '0', '0', '0'], ['0', '1', '1', '0'], ['1', '0', '1', '0'], ['1', '1', '0', '1']],
        note: '先自己填 Sum/Carry 两列，再点检查；提示会讲清进位规则。'
      },
      pitfalls: [
        '只接 XOR 忘记 AND：没有进位，不是完整半加器。',
        '两个芯片的输入没有并联：A/B 没有同时送到两个门。',
        '把 Sum 和 Carry 的 LED 接反：功能对但标注错。'
      ],
      checkpoints: ['两片芯片都供电', 'A/B 并联到两个门', '两个输出各有 1kΩ 限流', '四行结果自己填写并检查'],
      submit: '提交半加器真值表、电路图，以及 11 输入时的截图。'
    },
    {
      id: 'lab02-full',
      track: 'lab02',
      number: '02',
      title: '全加器 Full Adder',
      en: 'Two Half Adders + OR',
      minutes: 25,
      difficulty: '挑战',
      template: 'lab02-full',
      taskId: 'lab02-full',
      brief: 'A + B + Cin：两个半加器加一个 OR，得到 Sum 和 Cout。',
      objective: '把两个半加器级联，再用 OR 合并两个进位，完成 1 位全加器并验证 8 行真值表。',
      parts: ['ic74hc86', 'ic74hc08', 'ic74hc32', 'slide-switch', 'slide-switch', 'slide-switch', 'resistor', 'resistor', 'led', 'led', 'power-supply'],
      background: [
        '全加器有三个输入 A、B、Cin，输出 Sum 与 Cout。它把“低位送来的进位”也加进去，因此可以级联成多位加法器。',
        '第一级半加器：S1 = A ⊕ B，C1 = A · B。第二级半加器：Sum = S1 ⊕ Cin，C2 = S1 · Cin。最后 Cout = C1 + C2。',
        '一片 74HC86 内含两个 XOR，一片 74HC08 内含两个 AND，所以整个全加器只需要三片 IC：74HC86、74HC08、74HC32。实验清单里的 x2 数量是备用/扩展用量，本关用每片 IC 内的多个门完成。'
      ],
      steps: [
        { title: '先搭第一级半加器', body: 'A、B 接 74HC86 门 1 的第 1、2 脚，得到 S1（第 3 脚）；同时 A、B 接 74HC08 门 1 的第 1、2 脚，得到 C1（第 3 脚）。' },
        { title: '再搭第二级半加器', body: '把 S1 接到 74HC86 门 2 的第 4 脚和 74HC08 门 2 的第 4 脚；Cin 接第 5 脚。XOR 门 2 输出第 6 脚是 Sum，AND 门 2 输出第 6 脚是 C2。' },
        { title: '合并进位', body: 'C1 接 74HC32 的第 1 脚，C2 接第 2 脚；OR 输出第 3 脚就是 Cout。' },
        { title: '接输出 LED', body: 'Sum 和 Cout 各经过一个 1kΩ 电阻接 LED，LED 阴极回 GND。' },
        { title: '验证八行', body: '运行仿真，按 A/B/Cin 的八种组合逐行观察 Sum 与 Cout，并填写自己的全加器真值表。' }
      ],
      wiring: [
        { from: 'A、B', to: '74HC86 门 1（1、2）+ 74HC08 门 1（1、2）', why: '第一级半加器' },
        { from: 'S1 = 74HC86 第 3 脚', to: '74HC86 第 4 脚 + 74HC08 第 4 脚', why: '把第一级和送给第二级' },
        { from: 'Cin', to: '74HC86 第 5 脚 + 74HC08 第 5 脚', why: '加入低位进位' },
        { from: '74HC86 第 6 脚', to: '1kΩ → Sum LED', why: 'Sum 输出' },
        { from: 'C1（74HC08 第 3 脚）+ C2（第 6 脚）', to: '74HC32 第 1、2 脚', why: '两个进位相或' },
        { from: '74HC32 第 3 脚', to: '1kΩ → Cout LED', why: 'Cout 输出' },
        { from: '三片第 14 / 7 脚', to: 'V+ / GND', why: '供电' }
      ],
      truth: {
        title: '全加器真值表',
        headers: ['A', 'B', 'Cin', 'Sum', 'Cout'],
        inputs: 3,
        hint: '先算第一级半加器 S1=A⊕B、C1=A·B，再做 S1⊕Cin 和 S1·Cin，最后把两个进位 OR 起来。',
        rows: [
          ['0', '0', '0', '0', '0'],
          ['0', '0', '1', '1', '0'],
          ['0', '1', '0', '1', '0'],
          ['0', '1', '1', '0', '1'],
          ['1', '0', '0', '1', '0'],
          ['1', '0', '1', '0', '1'],
          ['1', '1', '0', '0', '1'],
          ['1', '1', '1', '1', '1']
        ],
        note: '先自己填完八行，再点检查。提示会告诉你两级半加器的结构。'
      },
      pitfalls: [
        '把 S1 只接到 XOR 门 2，忘记接到 AND 门 2：Sum 可能对，但 Cout 错。',
        '把两个进位直接接在一起：会短路，必须经过 OR。',
        '三片芯片没有全部供电：其中一级输出无效。'
      ],
      checkpoints: ['三片 IC 都接 V+/GND', 'S1 同时进入第二级 XOR 和 AND', 'C1/C2 经 OR 合并', '八行结果自己填写并检查'],
      submit: '提交全加器真值表、完整电路图，以及 111 输入时的截图。'
    },
    {
      id: 'lab02-final',
      track: 'lab02',
      number: '03',
      title: 'Lab 02 终验：从零搭建全加器',
      en: 'Final Challenge · Full Adder from Scratch',
      minutes: 35,
      difficulty: '终验',
      template: 'lab02-final',
      taskId: 'lab02-final',
      final: true,
      brief: '空白面包板，没有零件。自己摆放三片 IC、三个开关和两个输出，完成全加器。',
      objective: '不依赖预置电路，从空画布完成 Lab 02 的最终交付：一个能验证八行真值表的全加器。',
      parts: ['ic74hc86', 'ic74hc08', 'ic74hc32', 'slide-switch', 'slide-switch', 'slide-switch', 'resistor', 'resistor', 'led', 'led', 'power-supply'],
      background: [
        '这是整个 Lab 练习的最后一关：画布上没有零件，也没有任何导线。你需要从元件库自己摆出三片 IC、三个输入开关、两个 1kΩ 电阻、两个 LED 和电源。',
        '全加器由两个半加器和一个 OR 组成。第一级算 A⊕B 和 A·B，第二级再把第一级的 S1 与 Cin 相加，最后把两个进位合并。',
        '终验不提供完整接线表。你应该利用前面半加器关卡的接线经验，自己规划 S1、C1、C2 的走向。卡住时先回看 Lab 02 半加器关卡的教程。'
      ],
      steps: [
        { title: '摆放全部零件', body: '从元件库添加：74HC86、74HC08、74HC32 各一片，三个滑动开关，两个 1kΩ，两个 LED，一个 5V 电源。' },
        { title: '先保证三片芯片供电', body: '三片 IC 都需要 Vcc 和 GND。先把电源接好，再开始接信号，避免中途发现芯片没电。' },
        { title: '搭第一级半加器', body: '先只用 A、B 做出第一级的和 S1 与进位 C1，接两个临时输出或 LED 验证这一级是否正确。' },
        { title: '搭第二级并合并进位', body: '把 S1 和 Cin 送入第二级，得到 Sum 和 C2；再把 C1、C2 送进 OR 得到 Cout。' },
        { title: '验证八行', body: '运行仿真，逐行设置 A/B/Cin，自己填写全加器真值表，并完成 Lab 02 的最终截图。' }
      ],
      wiring: [],
      truth: {
        title: '全加器终验真值表',
        headers: ['A', 'B', 'Cin', 'Sum', 'Cout'],
        inputs: 3,
        hint: '终验不直接给答案。先把全加器拆成两个半加器，再处理两个进位的合并。',
        rows: [
          ['0', '0', '0', '0', '0'],
          ['0', '0', '1', '1', '0'],
          ['0', '1', '0', '1', '0'],
          ['0', '1', '1', '0', '1'],
          ['1', '0', '0', '1', '0'],
          ['1', '0', '1', '0', '1'],
          ['1', '1', '0', '0', '1'],
          ['1', '1', '1', '1', '1']
        ],
        note: '先自己填完八行，再点检查；系统只提示错行。'
      },
      pitfalls: [
        '忘记给其中一片 IC 供电，导致某一级完全无输出。',
        '把 S1 只送入第二级 XOR，忘记送入第二级 AND，Cout 会出错。',
        '两个进位没有经过 OR 就直接相连，造成输出冲突。',
        '没有从元件库添加足够的输入开关或输出 LED。'
      ],
      checkpoints: ['三片 IC 都已放置并通电', '三个输入开关都接好', 'Sum 与 Cout 各有独立输出', '八行真值表自己填写并检查'],
      submit: '提交完整全加器电路图、八行真值表和最终截图。这一关的电路就是 Lab 02 的最终交付。'
    },
    {
      id: 'lab02-hw', track: 'lab02', number: 'HW', title: 'Lab 02 作业：2 位比较器',
      en: 'Homework · 2-Bit Comparator', minutes: 35, difficulty: '作业',
      template: 'lab02-hw', taskId: 'lab02-hw', homework: true,
      brief: '用 Lab 02 学过的门电路，设计一个 2 位比较器，输出 A>B、A=B、A<B。',
      objective: '把组合逻辑设计流程走完整：列真值表、化简、用 74HC86/08/32 搭出 2 位比较器并提交。',
      parts: [],
      plain: '这是一道开放作业：画布是空的，没有标准接线图。你要自己设计一个 2 位比较器，比较 A1A0 和 B1B0。',
      assignment: '用 74HC86、74HC08、74HC32（和必要的 NOT）设计 2 位比较器：输入 A1A0、B1B0，输出 A>B、A=B、A<B。要求列真值表、写表达式、搭电路并截图验证。若作业允许使用 74HC85，先做“计算机组成 · 4 位比较器”关。',
      background: [
        '比较两个 2 位数要先比最高位：高位大就大；高位相等再比低位。',
        '74HC85 是现成的 4 位比较器；用门电路搭 2 位比较器可以练习“比较 + 使能”的组合逻辑。'
      ],
      steps: [
        { title: '列真值表', body: '先写出 A1A0 与 B1B0 的 16 种组合，以及三种输出，再尝试化简。', why: '先想清楚再接线，比接错后拆线快。' },
        { title: '摆放门芯片', body: '从元件库放置 74HC86、74HC08、74HC32、电源、开关和 LED。', why: '这些门在 Lab 01/02 都已经学过。' },
        { title: '按表达式接线', body: '先比较高位，再处理高位相等时的低位比较；三个输出分别接 LED。', why: '比较器的核心是“高位优先，高位相等才看低位”。' },
        { title: '运行并提交', body: '运行仿真，验证 3<5、5=5、9>4 等组合，再点“提交作业”。', why: '作业要能复现结果，不能只画图。' }
      ],
      wiring: [],
      pitfalls: ['只比较低位，忘记高位优先。', '三个输出没有互斥。', '没有使用已经学过的门，或芯片没供电。'],
      checkpoints: ['完成 16 行真值表', '三个输出都接好', '至少验证三组输入', '点击了提交作业'],
      submit: '提交 2 位比较器的真值表、化简过程、电路图和测试截图。'
    },
    {
      id: 'co-adder', track: 'co', number: '01', title: '4 位加法器', en: '4-Bit Adder',
      minutes: 20, difficulty: '组合逻辑',
      template: 'co-adder', taskId: 'co-adder',
      brief: '用 74HC283 把两个 4 位二进制数相加，观察 Sum 和 C4。',
      objective: '理解 ALU 的算术核心：A/B 是加数，S 是和，C4 是向高位的进位。',
      parts: ['power-supply', 'slide-switch', 'slide-switch', 'slide-switch', 'slide-switch', 'slide-switch', 'slide-switch', 'slide-switch', 'slide-switch', 'ic74hc283', 'resistor', 'resistor', 'resistor', 'resistor', 'resistor', 'led', 'led', 'led', 'led', 'led'],
      plain: '把两个 4 位数相加，就像竖式加法：从最低位开始，有进位就送给下一位。74HC283 已经把这 4 位加法器装在一片芯片里。',
      background: ['A0–A3 和 B0–B3 是两个加数，C0 是低位送来的进位，S0–S3 是和，C4 是加完以后向高位的进位。', '如果 C4=1，说明结果超过 15，需要再用一片 283 处理更高位。'],
      steps: [
        { title: '给芯片供电', body: '74HC283 的 VCC 是第 16 脚，GND 是第 8 脚。', why: '芯片没电，所有输出都没有意义。' },
        { title: '接两个加数', body: 'A0–A3、B0–B3 各接一个开关；C0 接 GND。', why: '每个开关给出一位 0/1；C0 接 0 表示没有更低的进位。' },
        { title: '接输出并验证', body: 'S0–S3、C4 接电阻和 LED，试 3+5、7+8、15+15。', why: '从简单到进位，才能确认每一位和 C4 都正确。' }
      ],
      wiring: [
        { from: '电源 V+', to: '74HC283 第 16 脚', why: 'VCC' },
        { from: '74HC283 第 8 脚', to: '电源 GND', why: 'GND' },
        { from: '开关公共端', to: 'A0–A3、B0–B3', why: '8 位输入' }
      ],
      pitfalls: ['A/B 位序接反，和会变成另一个数。', 'C0 悬空，最低位的和不确定。', 'C4 忘记接 LED，看不到溢出。'],
      checkpoints: ['16/8 脚通电', '8 个开关都接到对应输入', 'C0 接 GND', '至少验证 3+5 和 15+15'],
      submit: '截图 Sum/C4 的结果，并写出 3+5 和 15+15 的二进制计算过程。'
    },
    {
      id: 'co-decoder', track: 'co', number: '02', title: '3-8 译码器', en: '3-to-8 Decoder',
      minutes: 20, difficulty: '控制逻辑',
      template: 'co-decoder', taskId: 'co-decoder',
      brief: '用 74HC138 把 3 位地址变成 8 根片选线。',
      objective: '理解地址译码：一个地址只选中一个设备，输出低有效。',
      parts: ['power-supply', 'slide-switch', 'slide-switch', 'slide-switch', 'ic74hc138', 'resistor', 'resistor', 'resistor', 'resistor', 'resistor', 'resistor', 'resistor', 'resistor', 'led', 'led', 'led', 'led', 'led', 'led', 'led', 'led'],
      plain: '3 位地址就像门牌号：000 选 0 号，111 选 7 号。74HC138 把门牌号翻译成“哪一根线变低”。',
      background: ['A/B/C 是 3 位地址，Y0–Y7 是 8 根输出。被选中的那根输出为 0，其余为 1。', 'G1 接高、G2A/G2B 接低时芯片才工作，这叫使能。'],
      steps: [
        { title: '接电源和使能', body: 'VCC 第 16 脚、GND 第 8 脚；G1 接高，G2A、G2B 接低。', why: '使能不对，8 根输出会全部保持高。' },
        { title: '接地址', body: 'A、B、C 分别接三个开关，从 000 试到 111。', why: '三位二进制正好有 8 种组合。' },
        { title: '接输出', body: 'Y0–Y7 各接一个 LED，观察每次只有一根变低。', why: '低有效输出用 LED 接法要正确，才能看出被选中的那一路。' }
      ],
      wiring: [
        { from: '电源 V+', to: '第 16 脚', why: 'VCC' },
        { from: '第 8 脚', to: '电源 GND', why: 'GND' },
        { from: 'G1', to: 'V+', why: '高有效使能' },
        { from: 'G2A / G2B', to: 'GND', why: '低有效使能' }
      ],
      pitfalls: ['把 G2A/G2B 接高，芯片一直不工作。', '把 Y 输出当成高有效。', 'A/B/C 位序接反。'],
      checkpoints: ['使能端正确', '8 根输出都能被选中一次', '每次只有一根为低'],
      submit: '截图 000、011、111 三个地址下的输出，并说明哪根线被选中。'
    },
    {
      id: 'co-dff', track: 'co', number: '03', title: 'D 触发器', en: 'D Flip-Flop',
      minutes: 20, difficulty: '时序逻辑',
      template: 'co-dff', taskId: 'co-dff',
      brief: '用 74HC74 在时钟上升沿记住一位 D。',
      objective: '理解“状态”和“时钟边沿”：寄存器、计数器都从这里开始。',
      parts: ['power-supply', 'slide-switch', 'slide-switch', 'ic74hc74', 'resistor', 'resistor', 'led', 'led'],
      plain: 'D 触发器像一个只在时钟“咔哒”一下时才拍照的小盒子：上升沿那一刻 D 是多少，Q 就记住多少。',
      background: ['74HC74 有两组独立的 D 触发器。CLR、PRE 是异步端，平时都接高。', 'CLK 从 0 变 1 时采样 D；之后 D 再变，Q 也不变。'],
      steps: [
        { title: '接电源和异步端', body: 'VCC 第 14 脚、GND 第 7 脚；CLR、PRE 接高。', why: '异步端拉低会强制 Q=0 或 1，正常实验要先放开。' },
        { title: '接 D 和 CLK', body: 'D 接一个开关，CLK 接另一个开关。', why: '先让 D 稳定，再给上升沿，才能看清“记住”的效果。' },
        { title: '接 Q 并验证', body: 'Q 接电阻和 LED；试 D=1 时给上升沿，再改 D 看 Q 是否保持。', why: '只有上升沿才更新，这正是触发器和锁存器的区别。' }
      ],
      wiring: [
        { from: '第 14 脚', to: 'V+', why: 'VCC' },
        { from: '第 7 脚', to: 'GND', why: 'GND' },
        { from: 'CLR / PRE', to: 'V+', why: '平时不强制置位/清零' }
      ],
      pitfalls: ['CLR/PRE 悬空或接低，Q 被强制。', '把 D 当成了直接输出。', '没有给上升沿就期待 Q 变化。'],
      checkpoints: ['CLR/PRE 接高', 'D、CLK 都能控制', '上升沿后 Q 记录 D', 'D 再变 Q 保持'],
      submit: '画一个时钟波形，标出上升沿和对应的 Q，并截图验证。'
    },
    {
      id: 'co-nand', track: 'co', number: '04', title: 'NAND 基本门', en: 'NAND Gate',
      minutes: 12, difficulty: '基础门',
      template: 'co-nand', taskId: 'co-nand',
      brief: '用 74HC00 验证“两个都为 1 才输出 0”。',
      objective: '认识 NAND 是万能门：NOT、AND、OR 和 SR 锁存器都能用它搭。',
      parts: ['power-supply', 'slide-switch', 'slide-switch', 'ic74hc00', 'resistor', 'led'],
      plain: 'NAND 就是“与门后面再加一个反相”：两个都同意时它反而输出 0，其余时候输出 1。',
      background: ['NAND 真值表只有 11 输出 0，其余 00、01、10 都输出 1。', '把两个输入接在一起，NAND 就变成 NOT。'],
      steps: [
        { title: '给芯片供电', body: '74HC00 的 VCC 是第 14 脚，GND 是第 7 脚。', why: '芯片没电就没有输出。' },
        { title: '接两个输入', body: '1A、1B 各接一个开关。', why: '两个开关给四种输入组合。' },
        { title: '接输出并验证', body: '1Y 接电阻和 LED，试 00、01、10、11。', why: '确认只有 11 时灯灭。' }
      ],
      wiring: [
        { from: '第 14 脚', to: 'V+', why: 'VCC' },
        { from: '第 7 脚', to: 'GND', why: 'GND' },
        { from: '1Y', to: '电阻', why: '输出' }
      ],
      pitfalls: ['把 NAND 当成 AND，忘记输出取反。', '输入悬空。', 'LED 方向接反。'],
      checkpoints: ['14/7 脚通电', '两个输入都能切换', '11 时输出 0'],
      submit: '截图 NAND 四种组合，并写出它的真值表。'
    },
    {
      id: 'co-mux', track: 'co', number: '05', title: '2 选 1 选择器', en: '2-to-1 Multiplexer',
      minutes: 15, difficulty: '数据通路',
      template: 'co-mux', taskId: 'co-mux',
      brief: '用 74HC157 在 A/B 两条数据线中选一条。',
      objective: '理解数据选择器：S 是选择信号，输出跟随被选中的那一路。',
      parts: ['power-supply', 'slide-switch', 'slide-switch', 'slide-switch', 'ic74hc157', 'resistor', 'led'],
      plain: '2 选 1 就像岔路口：S=0 走 A 这条路，S=1 走 B 这条路。',
      background: ['74HC157 有 4 路选择器；这一关只用第 1 路：1A、1B 输入，1Y 输出。', 'E̅ 是低有效使能，接低才工作。'],
      steps: [
        { title: '接电源和使能', body: 'VCC 第 16 脚、GND 第 8 脚，E̅ 接 GND。', why: '使能端为高时输出会被关掉。' },
        { title: '接两路数据', body: '1A 接一个开关，1B 接另一个开关。', why: '两条路要有不同的 0/1 才能看出选择效果。' },
        { title: '接选择端和输出', body: 'S 接第三个开关，1Y 接电阻和 LED。', why: '切换 S，输出应在 A/B 之间切换。' }
      ],
      wiring: [
        { from: '第 16 脚', to: 'V+', why: 'VCC' },
        { from: '第 8 脚', to: 'GND', why: 'GND' },
        { from: 'E̅（15）', to: 'GND', why: '低有效使能' }
      ],
      pitfalls: ['E̅ 悬空。', '把 1A/1B 接反。', 'S 没有接固定电平。'],
      checkpoints: ['E̅ 接低', 'S=0 输出 A', 'S=1 输出 B'],
      submit: '截图 S=0 和 S=1 两种状态，说明输出分别来自哪一路。'
    },
    {
      id: 'co-compare', track: 'co', number: '06', title: '4 位比较器', en: '4-Bit Comparator',
      minutes: 20, difficulty: 'ALU 标志',
      template: 'co-compare', taskId: 'co-compare',
      brief: '用 74HC85 判断两个 4 位数的大小。',
      objective: '理解比较器如何产生 A>B、A=B、A<B 三个互斥结果。',
      parts: ['power-supply', 'slide-switch', 'slide-switch', 'slide-switch', 'slide-switch', 'slide-switch', 'slide-switch', 'slide-switch', 'slide-switch', 'ic74hc85', 'resistor', 'resistor', 'resistor', 'led', 'led', 'led'],
      plain: '比较器就是同时问三个问题：A 更大、一样大、还是更小？三根输出线只有一根会亮。',
      background: ['A0–A3、B0–B3 是两个 4 位数，最高位权重最大。', '级联输入用于多片扩展；单独使用时接 A<B=0、A=B=1、A>B=0。'],
      steps: [
        { title: '接电源和级联输入', body: 'VCC 第 16 脚、GND 第 8 脚；2 接 0、3 接 1、4 接 0。', why: '级联输入不能悬空，否则比较结果不确定。' },
        { title: '接两个数', body: 'A0–A3、B0–B3 各接开关。', why: '8 个开关给出两个 4 位数。' },
        { title: '接三个结果', body: '5、6、7 脚分别接 LED。', why: '观察三根线是否互斥。' }
      ],
      wiring: [
        { from: '第 16 脚', to: 'V+', why: 'VCC' },
        { from: '第 8 脚', to: 'GND', why: 'GND' },
        { from: '第 3 脚', to: 'V+', why: 'A=B 级联接高' },
        { from: '第 2、4 脚', to: 'GND', why: 'A<B、A>B 级联接低' }
      ],
      pitfalls: ['级联输入悬空。', 'A/B 位序接反。', '三个输出同时亮说明输出冲突。'],
      checkpoints: ['级联输入固定', 'A/B 都能设置', '三种结果互斥'],
      submit: '截图 3<5、5=5、9>4 三种情况，并说明哪根输出为高。'
    }
  ];

  /* 关卡正文的大白话版本。保留原来的技术数据，但页面上优先显示这些解释。 */
  const EASY = {
    'lab01-led': {
      plain: '这一关只做一件小事：让电从电源的红色正极出发，经过一个电阻和一只小灯，再回到黑色负极。灯亮了，就说明你搭对了。',
      brief: '从电源、电阻和小灯开始，搭出第一个不会烧坏的小回路。',
      objective: '认识电源的正极和负极，知道小灯有方向、电阻能限制电流，并亲手接亮第一只灯。',
      background: [
        '把电想成水：电源红色 V+ 是高处的水，黑色 GND 是低处；水从高处流向低处，形成电流。只接一头、没有回到负极，电路就不通。',
        '小灯（LED）像一扇只能单向开的门：长脚（阳极）接正极，短脚（阴极）接负极。接反了它通常不亮，但一般不会马上坏。',
        '电阻像一根窄水管，把水流限制住。实验用 1kΩ，不让太多电流冲进小灯；没有它，灯可能被烧坏。',
        '课程里用 1000Ω 电阻；四色环读法是棕-黑-红-金，对应 1kΩ。'
      ],
      steps: [
        { title: '先认两个端子', body: '电源上的红色 V+ 是正极，黑色 GND 是负极。它们不能直接用一根线连起来，否则就是短路。' },
        { title: '插好电阻', body: '把 1kΩ 电阻的两只脚插在面包板不同列。同一列的几个孔内部是连在一起的，插同一列等于把电阻两根脚短接。' },
        { title: '插好小灯', body: '小灯长脚（阳极）朝向电阻，短脚（阴极）朝向负极。两根脚一定要插在不同列。' },
        { title: '连成一条路', body: '用红色线从电源 V+ 接到电阻一端，再用线把电阻另一端接小灯长脚，最后把小灯短脚接回 GND。' },
        { title: '运行看看', body: '点“开始模拟”。灯亮说明有电流；再回到关卡页，把观察结果写进实验记录。' }
      ],
      pitfalls: [
        '把 V+ 和 GND 直接用线连起来：会短路，不是“灯不亮”这么简单。',
        '小灯长短脚接反：电流过不去，灯不亮。',
        '电阻两根脚插在同一列：等于没接电阻，小灯可能过流。'
      ],
      checkpoints: ['红色 V+ 和黑色 GND 没有直接短接', '电阻的两只脚在不同列', '小灯长脚朝向电源方向', '运行后小灯点亮'],
      submit: '截一张灯亮的图，并写下“电流从哪里出发、经过什么、回到哪里”。'
    },
    'lab01-nand': {
      title: '74HC00 · NAND',
      en: 'Quad 2-Input NAND',
      parts: ['ic74hc00', 'slide-switch', 'slide-switch', 'resistor', 'led', 'power-supply'],
      plain: '把 74HC00 芯片当成一个“做判断的小盒子”：给它接电，用两个开关当问题，用一只小灯看答案。只有两个开关都是 1 时，它才给出 0。',
      brief: '给 74HC00 接电，用两个开关提问，用一只灯看它怎么回答。',
      objective: '学会给芯片接电、把开关接到输入、把输出接到灯，并自己填出 NAND 的输入输出表。',
      background: [
        '74HC00 里面装了四个“两个都同意就反对”的小裁判，叫 NAND 门。NAND 的意思是：先看是不是都同意，再把结果反过来。',
        '这次只用门 1：第 1 脚是 1A，第 2 脚是 1B，第 3 脚是 1Y。没有多余输入要处理。',
        '芯片有方向：缺口朝上，左下角是第 1 脚，逆时针数到右上角第 14 脚。第 14 脚接正极，第 7 脚接负极，这是给它供电。'
      ],
      steps: [
        { title: '放好芯片', body: '把 74HC00 跨在面包板中间的沟上，缺口朝上，左右两排脚分别插在沟两边，不能把左右脚连在一起。' },
        { title: '先喂电', body: '第 14 脚接红色 V+，第 7 脚接黑色 GND。先接电，再碰信号，芯片才有“力气”工作。' },
        { title: '接两个输入', body: '两个滑动开关分别接第 1 脚（1A）、第 2 脚（1B），开关另一端分别提供 1 和 0。' },
        { title: '接输出灯', body: '第 3 脚（1Y）经 1kΩ 电阻接小灯长脚，小灯短脚回 GND。' },
        { title: '四种都试', body: '运行后依次让 A/B 为 00、01、10、11，每次看灯亮还是灭，填进关卡页的输入输出表，再点检查。' }
      ],
      pitfalls: [
        '把 NAND 当成 AND，忘记输出取反。',
        '芯片方向放反：第 14 脚可能落到 GND，芯片会坏。',
        '小灯接反：输出明明有电，灯也不亮。'
      ],
      checkpoints: ['第 14 脚接 V+，第 7 脚接 GND', '两个开关接第 1、2 脚', '输出取自第 3 脚', '四种组合都观察并记录'],
      submit: '把四行观察结果填进报告，并截一张 A、B 都为 1 时的电路图。'
    },
    'lab01-not': {
      plain: '74HC04 是一个“唱反调”的芯片：你说有电，它说没电；你说没电，它说有电。这一关就是亲自验证它会不会反着来。',
      brief: '给 74HC04 一个输入，看它是不是总说反话。',
      objective: '用一只开关和一只灯，验证 NOT 门“输入反过来就是输出”。',
      background: [
        'NOT 门只有一个输入和一个输出，规则很简单：输入 1，输出 0；输入 0，输出 1。它就像一个只会说反话的人。',
        '74HC04 里有 6 个这样的反相器。这次只用第一个：第 1 脚进，第 2 脚出。',
        '别忘供电：第 14 脚接 V+，第 7 脚接 GND。芯片没电，输出就没有意义。'
      ],
      steps: [
        { title: '芯片放正', body: '缺口朝上跨在中间沟上，第 14 脚接 V+，第 7 脚接 GND。' },
        { title: '接输入', body: '滑动开关的中间脚接第 1 脚；开关两端分别接 V+ 和 GND，这样拨动时能给出 1 或 0。' },
        { title: '接输出', body: '第 2 脚经 1kΩ 电阻接小灯长脚，小灯短脚接 GND。' },
        { title: '试两种情况', body: '运行后把开关拨到一边，看灯；再拨到另一边，看灯。把两次结果填入两行表。' },
        { title: '自己总结', body: '用一句话说出输入和输出的关系，不要直接看提示。' }
      ],
      pitfalls: [
        '芯片没接第 7 脚：没有“地”，输出无效。',
        '输出直接接 V+ 或 GND：会短路，芯片可能坏。',
        '开关两端没接固定电平：输入在“飘”，结果不稳定。'
      ],
      checkpoints: ['第 14 脚接 V+，第 7 脚接 GND', '开关接第 1 脚', '输出经电阻接灯', '两种情况都观察并记录'],
      submit: '截两张图：输入 0 时和输入 1 时的灯状态，并各写一行结果。'
    },
    'lab01-and': {
      title: '74HC08 · AND',
      en: 'Quad 2-Input AND',
      parts: ['ic74hc08', 'slide-switch', 'slide-switch', 'resistor', 'led', 'power-supply'],
      plain: '74HC08 是一个“大家都同意才通过”的芯片：两个开关都拨到 1，它才给 1；只要有一个是 0，它就给 0。',
      brief: '两个开关都同意，灯才亮；有一个不同意，灯就灭。',
      objective: '给 74HC08 接电和输入，验证“只有两个都为 1 才输出 1”。',
      background: [
        'AND 门像一扇需要两把钥匙同时转的门：A、B 两个输入都为 1，输出才是 1；否则就是 0。',
        '74HC08 是 2 输入 AND。这次只用门 1：第 1 脚 1A、第 2 脚 1B，第 3 脚 1Y。',
        '供电还是老规矩：第 14 脚 V+，第 7 脚 GND。'
      ],
      steps: [
        { title: '放芯片', body: '74HC08 跨沟放好，缺口朝上，第 14 脚接 V+、第 7 脚接 GND。' },
        { title: '接两个开关', body: '两个滑动开关分别接第 1、2 脚，作为 A、B。' },
        { title: '接输出灯', body: '第 3 脚经 1kΩ 接小灯，灯的另一头回 GND。' },
        { title: '试四种组合', body: '运行后依次试 00、01、10、11，把灯的状态填表，再点“检查我的真值表”。' }
      ],
      pitfalls: [
        '把第 6 脚当输出：第 6 脚是门 2 的输出，不是 1Y。',
        '输入悬空：芯片会乱猜。',
        '小灯接反：输出为 1 时灯也不亮。'
      ],
      checkpoints: ['第 14 脚 V+、第 7 脚 GND', '输出从第 3 脚取', '两个开关接第 1、2 脚', '四种组合都观察并记录'],
      submit: '把四行结果填进报告，并截一张 A、B 都为 1 时的电路图。'
    },
    'lab01-xor': {
      plain: '74HC86 是一个“两个不一样才通过”的芯片：两个开关一个 0 一个 1，它给 1；两个一样，它给 0。',
      brief: '两个输入不一样时灯亮，一样时灯灭。',
      objective: '验证 XOR 的“不同才为 1”，并把它和 OR 区分开。',
      background: [
        'XOR 读作“异或”，规则像两个人意见不同才举手：A、B 不同时输出 1，相同时输出 0。',
        '74HC86 里有 4 个 XOR 门。这次用第一个：第 1、2 脚是输入，第 3 脚是输出。',
        '以后做加法器时，XOR 就负责算“个位”，所以这一关要特别熟。'
      ],
      steps: [
        { title: '供电', body: '第 14 脚接 V+，第 7 脚接 GND，芯片跨沟放正。' },
        { title: '接输入', body: '两个滑动开关分别接第 1、2 脚。' },
        { title: '接输出', body: '第 3 脚经 1kΩ 接小灯，小灯短脚回 GND。' },
        { title: '四种组合都试', body: '运行后试 00、01、10、11，把灯的状态填表。' },
        { title: '和 OR 比一比', body: '同样两个 1，XOR 和 OR 的答案可能不一样。想清楚差在哪里。' }
      ],
      pitfalls: [
        '把 XOR 当成 OR：两个 1 时它们的结果不同。',
        '输入没接固定电平：结果会乱跳。',
        '输出直接接电源：会短路。'
      ],
      checkpoints: ['14、7 脚供电正确', '输出从第 3 脚取', '四种组合都试过', '自己填表并检查'],
      submit: '记录四行结果，保留一张两个输入不同时的电路图。'
    },
    'lab01-or': {
      plain: '74HC32 是一个“只要有人同意就通过”的芯片：两个开关里只要有一个是 1，它就给 1；两个都是 0，它才给 0。',
      brief: '只要有一个开关是 1，灯就亮。',
      objective: '验证 OR 的“有一个 1 就输出 1”，并总结它和 XOR 的区别。',
      background: [
        'OR 门像“至少一个人同意就通过”：A 或 B 有一个为 1，输出就是 1；只有两个都是 0，输出才是 0。',
        '74HC32 里有 4 个 OR 门。这次用第一个：第 1、2 脚输入，第 3 脚输出。',
        '供电仍是第 14 脚 V+、第 7 脚 GND。'
      ],
      steps: [
        { title: '放好芯片', body: '第 14 脚 V+、第 7 脚 GND，缺口朝上跨沟。' },
        { title: '接开关', body: '两个开关分别接第 1、2 脚，作为 A、B。' },
        { title: '接灯', body: '第 3 脚经 1kΩ 接小灯，另一头回 GND。' },
        { title: '试四种组合', body: '运行后依次试 00、01、10、11，看灯并填表。' },
        { title: '做个小结', body: '用自己的话说：OR 和 XOR 看到“两个 1”时分别会怎么回答？' }
      ],
      pitfalls: [
        '把 OR 和 XOR 混在一起：两个 1 时答案不同。',
        '输入悬空：芯片会乱猜。',
        '灯不亮先别怪芯片：检查电阻、方向和电源。'
      ],
      checkpoints: ['第 14、7 脚供电', '输出从第 3 脚取', '四种组合都观察', '五张表都自己填写'],
      submit: '提交五片芯片的完整记录，以及每片电路的截图。'
    },
    'lab01-final': {
      plain: '最后一关没有现成电路。你要自己在空面包板上摆五片芯片、两个开关、五组电阻和小灯，然后一组一组接线验证。这是 Lab 01 的“从头再来”挑战。',
      brief: '空画布，没有零件。自己摆出五片芯片，完成 Lab 01 的五种门验证。',
      objective: '不看现成接法，自己摆放五种芯片并完成供电、输入、输出和验证。',
      background: [
        '终验关的画布是空的：没有芯片，没有开关，也没有导线。你要从右侧元件库自己把零件拖出来。',
        '需要准备：74HC00、74HC04、74HC08、74HC86、74HC32 各一片；两个滑动开关；五组 1kΩ 和小灯；一个 5V 电源。'
      ],
      steps: [
        { title: '先摆零件', body: '从元件库拖出五片芯片、两个开关、五个电阻、五只小灯和一个电源。芯片都要跨中间沟。' },
        { title: '先接电', body: '每片芯片都要接 V+ 和 GND。可以先接一片试一片，也可以先把五片的电源都接好。' },
        { title: '给输入', body: '用两个开关给芯片输入。选 74HC04 时只需要一个输入，其他门用两个。' },
        { title: '接输出', body: '每片芯片的输出都经自己的 1kΩ 接自己的小灯，避免互相影响。' },
        { title: '逐片验证', body: '运行后逐片切换输入，看灯，再把结果填入对应的表。五片都能工作才算完成。' }
      ],
      pitfalls: [
        '只摆芯片忘记电源或小灯。',
        '五片芯片中漏掉某一片的 V+ 或 GND。',
        '把不同芯片的输出直接接在一起，造成冲突。'
      ],
      checkpoints: ['五片芯片都摆好并跨沟', '每片芯片都通电', '每组输出都有独立电阻和小灯', '五片都能运行并记录'],
      submit: '提交五门验证台的完整电路图、五组观察记录和最终截图。'
    },
    'lab02-half': {
      plain: '两个一位数相加，结果可能是一位或两位。只算“个位”的叫 Sum，进到下一位的叫 Carry。这一关用两个小芯片把这件事做出来。',
      brief: '用“不同才通过”的芯片算个位，用“都同意才通过”的芯片算进位。',
      objective: '用 XOR 和 AND 搭出半加器，验证两个一位数相加的四种情况。',
      background: [
        '先看十进制：1+1=2。写成二进制就是 10，个位是 0，进位是 1。半加器就是把 A、B 相加，给出“个位”和“进位”。',
        'XOR 负责个位：两个输入不同时给 1，相同时给 0。AND 负责进位：只有两个都是 1 才给 1。',
        '这次用两片芯片：74HC86（XOR）和 74HC08（AND）。它们的第 14 脚接 V+，第 7 脚接 GND。'
      ],
      steps: [
        { title: '放两片芯片', body: '74HC86 和 74HC08 跨沟放好，缺口朝上。' },
        { title: '分别供电', body: '两片的第 14 脚都接 V+，第 7 脚都接 GND。' },
        { title: '把 A、B 分给两边', body: '两个开关既要接 XOR 的输入，也要接 AND 的输入，让两片看到同样的 A、B。' },
        { title: '接两个灯', body: 'XOR 的输出接一个灯（个位），AND 的输出接另一个灯（进位），每个灯都要串 1kΩ。' },
        { title: '四种都试', body: '运行后试 00、01、10、11，分别记录两个灯，填进关卡页的表。' }
      ],
      pitfalls: [
        '只接 XOR 忘了 AND：有个位，没有进位。',
        '两片芯片的输入没有并在一起：它们看到的 A、B 不一样。',
        '两个灯接反：结果对，但记录会写错名字。'
      ],
      checkpoints: ['两片芯片都供电', 'A、B 同时送到两片', '两个输出各有自己的电阻和灯', '四行结果都记录并检查'],
      submit: '提交半加器的电路图、四行记录，以及两个输入都为 1 时的截图。'
    },
    'lab02-full': {
      plain: '全加器要加三个数：A、B 和低位送来的进位。做法是先把 A、B 相加，再把结果和第三个数相加，最后把两次进位合并。',
      brief: '先做两个半加器，再把两次进位合并，得到“和”和“进位”。',
      objective: '用两片 XOR、两片 AND 和一片 OR 搭出全加器，验证三个一位数相加。',
      background: [
        '全加器有三个输入：A、B 和低位进位 Cin；两个输出：个位 Sum 和进位 Cout。',
        '第一级半加器算 A⊕B 和 A·B；第二级把第一级的“和”再和 Cin 相加；最后把两个进位用 OR 合并。',
        '这次只需要三片芯片：74HC86 里有两个 XOR，74HC08 里有两个 AND，74HC32 里用一个 OR。'
      ],
      steps: [
        { title: '先接第一级', body: 'A、B 同时接到第一片 XOR 和第一片 AND，得到第一级的“和”和“进位”。' },
        { title: '再接第二级', body: '把第一级的“和”接到第二片 XOR 和 AND 的一个输入，把 Cin 接到另一个输入。' },
        { title: '合并进位', body: '第一级的进位和第二级的进位，不能直接接在一起，要经过 OR 门合并成最终进位。' },
        { title: '接两个灯', body: '第二片 XOR 的输出是 Sum，OR 的输出是 Cout；两个输出各自串 1kΩ 接灯。' },
        { title: '八行都试', body: '运行后试 A/B/Cin 的八种组合，填全加器表，并点检查。' }
      ],
      pitfalls: [
        '第一级的“和”只送到第二片 XOR，忘了送 AND：Sum 可能对，Cout 会错。',
        '两个进位直接接在一起：输出会打架，必须经过 OR。',
        '三片芯片漏供电：哪一片没电，哪一级就不工作。'
      ],
      checkpoints: ['三片芯片都供电', '第一级的“和”同时送到第二级 XOR 和 AND', '两个进位经过 OR', '八行都记录并检查'],
      submit: '提交全加器电路图、八行记录，以及三个输入都为 1 时的截图。'
    },
    'lab02-final': {
      plain: '最后一关没有零件。你要自己在空面包板上摆三片芯片、三个开关、两组电阻和小灯，独立搭出 Lab 02 的完整全加器。',
      brief: '空画布，没有零件。自己摆零件，独立搭出三输入的全加器。',
      objective: '不看现成电路，从空白面包板完成 Lab 02 的最终交付：能验证八种输入的全加器。',
      background: [
        '终验没有预置零件，也没有现成接线。你需要三片芯片：74HC86、74HC08、74HC32，以及三个开关、两个 1kΩ、两个小灯和电源。',
        '先把三个开关当作 A、B、Cin。用第一片 XOR 和 AND 做第一级，再把第一级的“和”与 Cin 做第二级，最后用 OR 合并两个进位。',
        '这一关不会给完整接线表。先回顾半加器关卡的思路，自己决定每根线怎么走。'
      ],
      steps: [
        { title: '先摆全部零件', body: '从元件库拖出三片芯片、三个开关、两个 1kΩ、两个小灯和电源。芯片跨沟放正。' },
        { title: '先把三片喂饱', body: '每片芯片都要接 V+ 和 GND；先接电，再开始接信号。' },
        { title: '搭第一级', body: '让 A、B 先经过第一片 XOR 和 AND，得到第一级的“和”和“进位”。' },
        { title: '搭第二级并合并进位', body: '把第一级的“和”与 Cin 送入第二级，得到 Sum；两个进位经过 OR 得到 Cout。' },
        { title: '八行都验证', body: '运行后试八种 A/B/Cin 组合，自己填表并检查，完成最终截图。' }
      ],
      pitfalls: [
        '漏摆某片芯片或某个开关。',
        '三片芯片没有全部供电。',
        '把两个进位直接接在一起，没有经过 OR。'
      ],
      checkpoints: ['三片芯片都摆好并通电', '三个开关都接好', 'Sum 和 Cout 各有独立输出', '八行都记录并检查'],
      submit: '提交完整电路图、八行记录和最终截图，作为 Lab 02 的最终交付。'
    }
  };

  const TRUTH_EASY = {
    'lab01-nand': { headers: ['A（1=有电）', 'B（1=有电）', '输出（1=灯亮）'], hint: 'NAND 就是“先全部同意，再反过来”。只有两个输入都是 1 时，输出才是 0；其他情况输出 1。', note: '先自己填四行，再点检查；检查只会告诉你哪几行不对。' },
    'lab01-not': { headers: ['输入（1=有电）', '输出（1=灯亮）'], hint: 'NOT 只会唱反调：输入 1 输出 0，输入 0 输出 1。', note: '两行都自己观察、自己填。' },
    'lab01-and': { headers: ['A（1=有电）', 'B（1=有电）', '输出（1=灯亮）'], hint: 'AND 要求两个都同意：只有 A、B 都是 1，输出才是 1。', note: '先填四行，再点检查。' },
    'lab01-xor': { headers: ['A（1=有电）', 'B（1=有电）', '输出（1=灯亮）'], hint: 'XOR 看“不同”：A、B 不一样时输出 1，一样时输出 0。', note: '先自己填四行，再点检查。' },
    'lab01-or': { headers: ['A（1=有电）', 'B（1=有电）', '输出（1=灯亮）'], hint: 'OR 看“至少一个 1”：A 或 B 有一个是 1，输出就是 1。', note: '先自己填四行，再点检查。' },
    'lab02-half': { headers: ['A', 'B', '和（个位）', '进位'], hint: '个位用“不同才通过”，进位用“都同意才通过”。1+1 的答案是 10：个位 0、进位 1。', note: '先自己填四行，再点检查。' },
    'lab02-full': { headers: ['A', 'B', '低位有进位吗', '个位结果', '进位给下一位'], hint: '先把 A、B 当半加器相加，再把结果和第三个数（低位进位）相加，最后把两个进位合并。', note: '先自己填八行，再点检查；不会直接显示答案。' }
  };

  LEVELS.forEach(function (level) {
    const easy = EASY[level.id];
    if (easy) {
      Object.keys(easy).forEach(function (key) { level[key] = easy[key]; });
    }
    if (level.truth && TRUTH_EASY[level.id]) {
      Object.keys(TRUTH_EASY[level.id]).forEach(function (key) {
        level.truth[key] = TRUTH_EASY[level.id][key];
      });
    }
  });

  const STEP_WHY = {
    'lab01-led': [
      '先分清正负极，才知道电流往哪走，也能避免把电源直接短路。',
      '电阻把电流限制在安全范围，不然小灯可能被烧坏。',
      '小灯只允许电流单向通过，所以长短脚不能随便插。',
      '电必须从正极出发、回到负极，走成一个完整的圈，灯才会亮。',
      '运行一次，才能把“接线图”变成看得见的亮/灭结果。'
    ],
    'lab01-nand': [
      '跨过中间沟，左右两排脚才不会在面包板内部被连在一起。',
      '芯片要先有电，才有力气做判断；14 脚和 7 脚就是它的电源入口和回路。',
      '空着的输入会让芯片“猜”，所以 A、B 都要接到明确的开关电平。',
      '开关负责给问题，灯负责把答案显示出来；输出必须经过电阻保护灯。',
      '四种输入都试过，才能确认它在所有情况下都答对，而不是碰巧亮一次。'
    ],
    'lab01-not': [
      '芯片要先接电，否则输出没有意义。',
      '开关给一个干净的 0 或 1，输入才不会“飘”。',
      '灯把看不见的输出变成看得见的亮/灭。',
      '只试一种输入不够，反相关系要两种都试。',
      '自己总结，才能记住它为什么叫“非门”。'
    ],
    'lab01-and': [
      '先接电，芯片才会工作。',
      '两个开关就是两个“同意/不同意”的条件，接到 1A、1B 才有明确输入。',
      '灯把“两个都同意”的结果显示出来。',
      '四种组合都试，才能看出它是不是真的“全 1 才 1”。'
    ],
    'lab01-xor': [
      '先供电，芯片才有输出。',
      '两个开关给两个输入，才能比较它们一样还是不一样。',
      '灯把“一样/不一样”变成看得见的结果。',
      '四种组合都试，才能确认“不同才亮”。',
      '和 OR 对比，能避免把两种门记混。'
    ],
    'lab01-or': [
      '先供电，芯片才工作。',
      '两个开关分别代表两个条件。',
      '灯显示“至少一个条件成立”的结果。',
      '四种组合都试，才能确认只有两个 0 时才不亮。',
      '总结 OR 和 XOR 的差别，后面做加法器才不会用错门。'
    ],
    'lab02-half': [
      '两片芯片都要供电，少一片就少一半功能。',
      'A、B 要同时送到两片芯片，它们才能算同一组数。',
      'XOR 算个位，AND 算进位；分开用两个灯，才看得清。',
      '四种输入都试，才能覆盖两个一位数相加的全部情况。',
      '先记录个位和进位，再看它们合起来是不是正确的加法结果。'
    ],
    'lab02-full': [
      '三片芯片都要供电，任何一级没电都会让结果错。',
      '第一级先把 A、B 相加，得到中间的和与进位。',
      '第二级把“中间的和”再和低位进位相加，得到最终个位。',
      '两个进位不能直接接在一起，要用 OR 合并，避免输出打架。',
      '八种输入全部试过，才能确认三个一位数相加都正确。'
    ],
    'lab01-final': [
      '五片芯片各有各的功能，不能只做其中一片。',
      '每片芯片都要先接电，否则输出不会工作。',
      '用两个开关给输入，才能比较不同 0/1 组合。',
      '每片输出用自己的电阻和灯，避免互相影响。',
      '逐片验证，确认五片都能独立工作，而不是只有一片亮。'
    ],
    'lab02-final': [
      '先把所有零件摆齐，避免接了一半才发现少东西。',
      '三片芯片都先接电，后面信号才有意义。',
      '第一级先做两个数的半加，得到中间和与进位。',
      '第二级把中间和与低位进位相加，再用 OR 合并进位。',
      '八组输入全部验证，才能证明这个全加器真的能做加法。'
    ]
  };

  LEVELS.forEach(function (level) {
    const whys = STEP_WHY[level.id];
    if (!whys) return;
    level.steps.forEach(function (step, i) { step.why = whys[i] || ''; });
  });

  function getTrack(id) { return TRACKS.find((t) => t.id === id) || null; }
  function getLevel(id) { return LEVELS.find((l) => l.id === id) || null; }
  function levelsOf(trackId) { return LEVELS.filter((l) => l.track === trackId); }
  function nextLevel(id) {
    const i = LEVELS.findIndex((l) => l.id === id);
    return i >= 0 ? (LEVELS[i + 1] || null) : null;
  }

  const STORAGE_KEY = 'bbl.labs.v4';
  function readProgress() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {}; } catch (e) { return {}; }
  }
  function writeProgress(data) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
  }
  const LabProgress = {
    isComplete(id) { return !!readProgress()[id]; },
    complete(id) {
      if (!getLevel(id)) return;
      const data = readProgress();
      if (!data[id]) { data[id] = Date.now(); writeProgress(data); }
    },
    reset(id) {
      const data = readProgress();
      if (id) delete data[id]; else Object.keys(data).forEach((k) => delete data[k]);
      writeProgress(data);
    },
    count(trackId) {
      const list = trackId ? levelsOf(trackId) : LEVELS;
      const data = readProgress();
      return list.filter((l) => data[l.id]).length;
    },
    total(trackId) { return (trackId ? levelsOf(trackId) : LEVELS).length; },
    all() { return readProgress(); }
  };

  BBL.LABS = { tracks: TRACKS, levels: LEVELS, getTrack, getLevel, levelsOf, nextLevel, LabProgress };
})(window.BBL);
