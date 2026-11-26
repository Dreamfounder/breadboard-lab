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

  /* 关卡正文的大白话版本。保留原来的技术数据，但页面上优先显示这些解释。 */
  const EASY = {
    'lab01-led': {
      plain: '这一关只做一件小事：让电从电源的红色正极出发，经过一个电阻和一只小灯，再回到黑色负极。灯亮了，就说明你搭对了。',
      brief: '从电源、电阻和小灯开始，搭出第一个不会烧坏的小回路。',
      objective: '认识电源的正极和负极，知道小灯有方向、电阻能限制电流，并亲手接亮第一只灯。',
      background: [
        '把电想成水：电源红色 V+ 是高处的水，黑色 GND 是低处；水从高处流向低处，形成电流。只接一头、没有回到负极，电路就不通。',
        '小灯（LED）像一扇只能单向开的门：长脚（阳极）接正极，短脚（阴极）接负极。接反了它通常不亮，但一般不会马上坏。',
        '电阻像一根窄水管，把水流限制住。实验用 1kΩ，不让太多电流冲进小灯；没有它，灯可能被烧坏。'
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
      plain: '把 74HC20 芯片当成一个“做判断的小盒子”：给它接电，用两个开关当问题，用一只小灯看答案。它会根据两个开关的 0/1 给出 1 或 0。',
      brief: '给 74HC20 接电，用两个开关提问，用一只灯看它怎么回答。',
      objective: '学会给芯片接电、把开关接到输入、把输出接到灯，并自己填出 NAND 的输入输出表。',
      background: [
        '74HC20 里面装了两个“四个都同意才反对”的小裁判，叫 NAND 门。NAND 的意思是：先看是不是全都同意，再把结果反过来。',
        '这次只接两个输入 A、B。芯片另外两个输入 C、D 也必须接到“有电/1”，不能空着；空着的输入会让芯片乱猜。',
        '芯片有方向：缺口朝上，左下角是第 1 脚，逆时针数到右上角第 14 脚。第 14 脚接正极，第 7 脚接负极，这是给它供电。'
      ],
      steps: [
        { title: '放好芯片', body: '把 74HC20 跨在面包板中间的沟上，缺口朝上，左右两排脚分别插在沟两边，不能把左右脚连在一起。' },
        { title: '先喂电', body: '第 14 脚接红色 V+，第 7 脚接黑色 GND。先接电，再碰信号，芯片才有“力气”工作。' },
        { title: '处理空脚', body: '第 4 脚和第 5 脚这次不用，但不能悬空。想一想：要让它们“不捣乱”，应该接 1 还是 0？' },
        { title: '接输入和灯', body: '两个滑动开关分别接第 1、2 脚，作为 A、B。第 6 脚是输出，经 1kΩ 电阻接小灯长脚，小灯短脚回 GND。' },
        { title: '四种都试', body: '运行后依次让 A/B 为 00、01、10、11，每次看灯亮还是灭，填进关卡页的输入输出表，再点检查。' }
      ],
      pitfalls: [
        '第 4、5 脚空着：芯片会乱猜，结果不稳定。',
        '芯片方向放反：第 14 脚可能落到 GND，芯片会坏。',
        '小灯接反：输出明明有电，灯也不亮。'
      ],
      checkpoints: ['第 14 脚接 V+，第 7 脚接 GND', '第 4、5 脚接固定电平', '两个开关接第 1、2 脚', '四种组合都观察并记录'],
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
      plain: '74HC21 是一个“大家都同意才通过”的芯片：两个开关都拨到 1，它才给 1；只要有一个是 0，它就给 0。',
      brief: '两个开关都同意，灯才亮；有一个不同意，灯就灭。',
      objective: '给 74HC21 接电和输入，验证“只有全 1 才输出 1”。',
      background: [
        'AND 门像一扇需要两把钥匙同时转的门：A、B 两个输入都为 1，输出才是 1；否则就是 0。',
        '74HC21 是 4 输入 AND。这次只接 A、B，另外两个输入 C、D 要接固定 1，否则芯片会乱猜。',
        '供电还是老规矩：第 14 脚 V+，第 7 脚 GND。输出在第 6 脚。'
      ],
      steps: [
        { title: '放芯片', body: '74HC21 跨沟放好，缺口朝上，第 14 脚接 V+、第 7 脚接 GND。' },
        { title: '固定多余输入', body: '第 4、5 脚这次不用，但要接一个固定电平。想一想接 0 还是 1，输出才会只受 A、B 控制。' },
        { title: '接两个开关', body: '两个滑动开关分别接第 1、2 脚，作为 A、B。' },
        { title: '接输出灯', body: '第 6 脚经 1kΩ 接小灯，灯的另一头回 GND。' },
        { title: '试四种组合', body: '运行后依次试 00、01、10、11，把灯的状态填表，再点“检查我的真值表”。' }
      ],
      pitfalls: [
        '第 4、5 脚接 0：输出会一直是 0，看起来像坏了。',
        '第 4、5 脚不接：芯片会乱猜。',
        '把第 3 脚当输出：它是空脚，不是输出。'
      ],
      checkpoints: ['第 14 脚 V+、第 7 脚 GND', '第 4、5 脚接固定电平', '输出从第 6 脚取', '四种组合都观察并记录'],
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
        '需要准备：74HC20、74HC04、74HC21、74HC86、74HC32 各一片；两个滑动开关；五组 1kΩ 和小灯；一个 5V 电源。',
        '接法和前五关一样，只是这次没有现成线路。先给每片芯片接电，再一组一组接输入和输出。'
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
