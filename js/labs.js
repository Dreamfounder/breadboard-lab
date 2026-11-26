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
      intro: '从电源、面包板和 LED 开始，再逐一验证 74HC20、74HC04、74HC21、74HC86、74HC32 的逻辑功能，完成实验报告里的真值表。每一关的电路会先接好作为参考；最后在空白画布上完成终验。',
      goals: ['认识 Vcc / GND 与逻辑电平', '会看 DIP-14 芯片引脚编号', '用 1kΩ 电阻保护 LED', '独立验证 5 种逻辑门', '从空白画布完成一门终验']
    },
    {
      id: 'lab02',
      label: 'Lab 02',
      title: 'Combinational Circuit Design',
      cn: '组合电路设计',
      course: 'WIX1003 Computer Systems & Organization',
      source: 'Lab 02: Combinational Circuit Design',
      color: 'green',
      intro: '把 XOR、AND、OR 组合成半加器与全加器，理解 Sum / Carry 的来处，并验证完整的真值表。先看参考电路，最后在空白画布上独立搭建全加器。',
      goals: ['用 XOR + AND 构造半加器', '用两个半加器 + OR 构造全加器', '理解进位链 Carry', '记录并提交真值表', '从空白画布搭建全加器']
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
      title: '74HC20 · NAND',
      en: 'Dual 4-Input NAND',
      minutes: 15,
      difficulty: '基础',
      template: 'lab01-nand',
      taskId: 'lab01-nand',
      brief: '4 输入 NAND 的 C/D 接高，当作 2 输入 NAND 验证真值表。',
      objective: '看懂 74HC20 的 14 脚排列，给芯片供电，把 4 输入 NAND 变成 2 输入 NAND，并填写输出列。',
      parts: ['ic74hc20', 'slide-switch', 'slide-switch', 'resistor', 'led', 'power-supply'],
      background: [
        '74HC20 内含两个互相独立的 4 输入 NAND 门。NAND 的意思是“先 AND，再 NOT”：只有所有输入都为 1，输出才为 0；其余情况输出 1。',
        '本实验只使用 A、B 两个输入。为了让另外两个输入不影响结果，必须把 1C、1D 接到 Vcc（逻辑 1）。这样 1Y = NOT(A · B · 1 · 1) = NOT(A · B)。',
        'DIP-14 芯片从缺口和圆点开始，逆时针编号：左下角是 1，右下角是 7，右上角是 14。第 14 脚接 Vcc，第 7 脚接 GND，这是所有 74HC 芯片的供电方式。',
        '实验台用滑动开关代替反复插拔跳线：开关一边接 Vcc、一边接 GND，公共端就是逻辑输入。切换开关比拔线更适合反复验证真值表。'
      ],
      steps: [
        { title: '芯片跨槽', body: '把 74HC20 跨在面包板中央凹槽上，让左侧 1–7 脚和右侧 8–14 脚分别落在不同列，避免左右两排短路。' },
        { title: '先接电源', body: '第 14 脚接 V+, 第 7 脚接 GND。上电前再检查一遍，电源绝不能反接。' },
        { title: '把 C/D 接高', body: '用红色跳线把第 4 脚（1C）和第 5 脚（1D）接到 Vcc。若它们悬空，CMOS 输入会不稳定。' },
        { title: '接输入与输出', body: '两个滑动开关分别接第 1 脚（1A）和第 2 脚（1B）。第 6 脚（1Y）经 1kΩ 电阻接 LED 阳极，LED 阴极接 GND。' },
        { title: '验证真值表', body: '运行仿真，依次切换 A/B 的四种组合。先观察 LED，再把结果填进关卡页的真值表，最后用“检查我的真值表”确认。' }
      ],
      wiring: [
        { from: '74HC20 第 14 脚', to: 'V+', why: '芯片供电' },
        { from: '74HC20 第 7 脚', to: 'GND', why: '芯片接地' },
        { from: '第 4 脚 1C + 第 5 脚 1D', to: 'V+', why: '未使用的输入固定为 1' },
        { from: '开关 A → 第 1 脚 1A', to: '开关 B → 第 2 脚 1B', why: '接入两个实验输入' },
        { from: '第 6 脚 1Y', to: '1kΩ → LED 阳极', why: '观察 NAND 输出' },
        { from: 'LED 阴极', to: 'GND', why: '构成完整输出回路' }
      ],
      truth: {
        title: '74HC20 实验真值表（1C = 1D = 1）',
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
      submit: '把 74HC20 的四行输出填入实验报告，并截取 11 输入时的电路图。'
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
      title: '74HC21 · AND',
      en: 'Dual 4-Input AND',
      minutes: 15,
      difficulty: '基础',
      template: 'lab01-and',
      taskId: 'lab01-and',
      brief: '4 输入 AND 的 C/D 接高，A/B 同时为 1 时 LED 才亮。',
      objective: '验证 AND 的“全 1 才 1”，并掌握 74HC21 与 74HC20 的引脚对应关系。',
      parts: ['ic74hc21', 'slide-switch', 'slide-switch', 'resistor', 'led', 'power-supply'],
      background: [
        '74HC21 是双 4 输入 AND 门。AND 的输出只有在所有输入都为 1 时才为 1。逻辑式：Y = A · B · C · D。',
        '实验只使用 A、B；把 1C、1D 接 Vcc 后，Y = A · B · 1 · 1 = A · B，于是得到 2 输入 AND 的效果。',
        '74HC21 和 74HC20 的引脚排列几乎相同：门 1 输入 1/2/4/5，输出 6；门 2 输入 13/12/10/9，输出 8。'
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
        title: '74HC21 实验真值表（1C = 1D = 1）',
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
      parts: ['ic74hc20', 'ic74hc04', 'ic74hc21', 'ic74hc86', 'ic74hc32', 'slide-switch', 'slide-switch', 'resistor', 'resistor', 'resistor', 'resistor', 'resistor', 'led', 'led', 'led', 'led', 'led', 'power-supply'],
      background: [
        '终验的画布是空的：没有芯片，没有开关，也没有导线。你需要自己从元件库把零件摆到面包板上。',
        '这次要摆齐 Lab 01 的五片芯片：74HC20、74HC04、74HC21、74HC86、74HC32，并为每一片准备输出指示。输入可以用两个开关共享，也可以按自己的方案接线。',
        '终验不提供完整接线表。你要把前面五关学到的流程组合起来：认引脚、供电、接输入、接输出，再逐片验证。'
      ],
      steps: [
        { title: '选齐五片芯片', body: '从元件库放置 74HC20、74HC04、74HC21、74HC86、74HC32，注意每片都跨中央凹槽。' },
        { title: '准备输入与输出', body: '放置两个滑动开关；为每片芯片准备 1kΩ 电阻和 LED，共五组输出。' },
        { title: '逐片接电源', body: '五片芯片都要接 Vcc 和 GND。先把电源网络搭好，再开始接信号，避免接完才发现某片没电。' },
        { title: '逐片完成信号', body: '从第一片开始，把开关接到输入、输出经电阻接 LED；每完成一片就先验证，再继续下一片。' },
        { title: '整体验证', body: '运行仿真，逐片检查输出，把五张真值表填完。终验不要求一次把所有输入同时接对，但每片最终都要能工作。' }
      ],
      wiring: [],
      pitfalls: [
        '画布是空的，忘记从元件库添加电源或某一片芯片。',
        '五片芯片数量多，容易漏掉其中一片的电源或输出。',
        '没有处理 74HC20/74HC21 的未使用输入。'
      ],
      checkpoints: ['五片 Lab 01 芯片都已放置', '五片芯片都已通电', '五组输出都已接好', '运行验证并填完五张真值表'],
      submit: '提交五门验证台的完整电路图、五张真值表和最终截图。这就是 Lab 01 要求的完整结果。'
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
    }
  ];

  function getTrack(id) { return TRACKS.find((t) => t.id === id) || null; }
  function getLevel(id) { return LEVELS.find((l) => l.id === id) || null; }
  function levelsOf(trackId) { return LEVELS.filter((l) => l.track === trackId); }

  const STORAGE_KEY = 'bbl.labs.v3';
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

  BBL.LABS = { tracks: TRACKS, levels: LEVELS, getTrack, getLevel, levelsOf, LabProgress };
})(window.BBL);
