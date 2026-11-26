/* ============================================================
   Breadboard Lab · Arduino code lab
   A deliberately small, safe Arduino-C subset for teaching:
   setup/loop, pinMode, digitalWrite, analogWrite, delay,
   digitalRead, analogRead, if/else, variables and Serial.
   ============================================================ */
(function () {
  'use strict';
  const root = typeof window !== 'undefined' ? window : globalThis;
  const BBL = (root.BBL = root.BBL || {});

  const TYPES = new Set(['int', 'long', 'float', 'double', 'bool', 'boolean', 'byte', 'char', 'unsigned']);
  const CONSTS = {
    HIGH: 1, LOW: 0, OUTPUT: 1, INPUT: 0, INPUT_PULLUP: 2,
    LED_BUILTIN: 13, A0: 14, A1: 15, A2: 16, A3: 17, true: 1, false: 0
  };

  /* ------------------------------------------------------------------
     Tokenizer
     ------------------------------------------------------------------ */
  function tokenize(src) {
    const tokens = [];
    let i = 0, line = 1;
    function push(type, value) { tokens.push({ type, value, line }); }
    while (i < src.length) {
      const c = src[i];
      if (c === '\n') { line++; i++; continue; }
      if (/\s/.test(c)) { i++; continue; }
      if (c === '/' && src[i + 1] === '/') { while (i < src.length && src[i] !== '\n') i++; continue; }
      if (c === '/' && src[i + 1] === '*') {
        i += 2;
        while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) { if (src[i] === '\n') line++; i++; }
        i += 2; continue;
      }
      if (c === '#') { while (i < src.length && src[i] !== '\n') i++; continue; }
      if (c === '"' || c === "'") {
        const quote = c; i++;
        let s = '';
        while (i < src.length && src[i] !== quote) {
          if (src[i] === '\\') {
            const n = src[i + 1];
            s += n === 'n' ? '\n' : n === 't' ? '\t' : n;
            i += 2;
          } else { s += src[i++]; }
        }
        if (src[i] !== quote) throw new Error('第 ' + line + ' 行：字符串缺少结束引号');
        i++;
        push('string', s);
        continue;
      }
      if (/[0-9]/.test(c)) {
        let s = '';
        while (i < src.length && /[0-9.]/.test(src[i])) s += src[i++];
        push('number', Number(s));
        continue;
      }
      if (/[A-Za-z_]/.test(c)) {
        let s = '';
        while (i < src.length && /[A-Za-z0-9_]/.test(src[i])) s += src[i++];
        push('identifier', s);
        continue;
      }
      const three = src.slice(i, i + 3);
      const two = src.slice(i, i + 2);
      if (three === '...') throw new Error('第 ' + line + ' 行：不支持 ...');
      if (['==', '!=', '<=', '>=', '&&', '||', '+=', '-=', '*=', '/='].includes(two)) {
        push('op', two); i += 2; continue;
      }
      if ('{}()[];,+-*/%<>=!.'.includes(c)) {
        push('op', c); i++; continue;
      }
      throw new Error('第 ' + line + ' 行：无法识别的字符 “' + c + '”');
    }
    return tokens;
  }

  /* ------------------------------------------------------------------
     Parser
     ------------------------------------------------------------------ */
  class Parser {
    constructor(tokens) { this.tokens = tokens; this.pos = 0; }
    peek(offset) { return this.tokens[this.pos + (offset || 0)]; }
    next() { return this.tokens[this.pos++]; }
    is(value) { const t = this.peek(); return !!t && (t.value === value || t.type === value); }
    match(value) { if (this.is(value)) { this.pos++; return true; } return false; }
    expect(value) {
      const t = this.next();
      if (!t) throw new Error('代码意外结束，缺少 “' + value + '”');
      if (t.value !== value && t.type !== value) throw new Error('第 ' + t.line + ' 行：期望 “' + value + '”，得到 “' + t.value + '”');
      return t;
    }
    identifier() {
      const t = this.next();
      if (!t || t.type !== 'identifier') throw new Error((t ? '第 ' + t.line + ' 行：' : '') + '这里需要一个名称');
      return t.value;
    }
    parseProgram() {
      const functions = {};
      const globals = [];
      while (this.pos < this.tokens.length) {
        if (this.is('void')) {
          this.next();
          const name = this.identifier();
          this.expect('(');
          while (!this.is(')')) this.next();
          this.expect(')');
          this.expect('{');
          const body = this.parseBlockBody();
          functions[name] = body;
        } else if (TYPES.has(this.peek() && this.peek().value)) {
          globals.push(this.parseDeclaration());
        } else {
          // ignore stray top-level tokens (e.g. prototypes)
          this.next();
        }
      }
      if (!functions.setup && !functions.loop) {
        throw new Error('没有找到 void setup() 或 void loop()。请把代码放进这两个函数中。');
      }
      return { setup: functions.setup || [], loop: functions.loop || [], globals: globals };
    }
    parseBlockBody() {
      const body = [];
      while (!this.is('}')) {
        if (this.pos >= this.tokens.length) throw new Error('代码缺少结束的 }');
        body.push(this.parseStatement());
      }
      this.expect('}');
      return body;
    }
    parseStatement() {
      if (this.match('{')) return { type: 'block', body: this.parseBlockBody() };
      if (this.match(';')) return { type: 'empty' };
      if (this.match('if')) {
        this.expect('(');
        const test = this.parseExpression();
        this.expect(')');
        const consequent = this.parseStatement();
        let alternate = null;
        if (this.match('else')) alternate = this.parseStatement();
        return { type: 'if', test, consequent, alternate };
      }
      if (this.is('for') || this.is('while') || this.is('do')) {
        const t = this.peek();
        throw new Error('第 ' + t.line + ' 行：当前教学版代码编辑器暂不支持 ' + t.value + ' 循环。请使用 loop() 配合 delay()。');
      }
      if (this.is('return')) {
        this.next();
        if (!this.is(';')) this.parseExpression();
        this.expect(';');
        return { type: 'empty' };
      }
      if (TYPES.has(this.peek() && this.peek().value)) return this.parseDeclaration();
      if (this.peek() && this.peek().type === 'identifier' && this.peek(1) && this.peek(1).value === '=') {
        const name = this.identifier();
        this.expect('=');
        const value = this.parseExpression();
        this.expect(';');
        return { type: 'assign', name, value };
      }
      const expr = this.parseExpression();
      this.expect(';');
      return { type: 'expr', expr };
    }
    parseDeclaration() {
      this.next(); // type
      const name = this.identifier();
      let value = { type: 'num', value: 0 };
      if (this.match('=')) value = this.parseExpression();
      this.expect(';');
      return { type: 'decl', name, value };
    }
    parseExpression() { return this.parseBinary(0); }
    precedence(op) {
      return ({ '||': 1, '&&': 2, '==': 3, '!=': 3, '<': 4, '<=': 4, '>': 4, '>=': 4, '+': 5, '-': 5, '*': 6, '/': 6, '%': 6 })[op] || 0;
    }
    parseBinary(minPrec) {
      let left = this.parseUnary();
      while (true) {
        const t = this.peek();
        if (!t || t.type !== 'op') break;
        const prec = this.precedence(t.value);
        if (!prec || prec < minPrec) break;
        const op = t.value;
        this.next();
        const right = this.parseBinary(prec + 1);
        left = { type: 'binary', op, left, right };
      }
      return left;
    }
    parseUnary() {
      if (this.match('!')) return { type: 'unary', op: '!', value: this.parseUnary() };
      if (this.match('-')) return { type: 'unary', op: '-', value: this.parseUnary() };
      if (this.match('+')) return this.parseUnary();
      return this.parsePrimary();
    }
    parsePrimary() {
      const t = this.next();
      if (!t) throw new Error('表达式未完成');
      if (t.type === 'number') return { type: 'num', value: t.value };
      if (t.type === 'string') return { type: 'str', value: t.value };
      if (t.value === '(') {
        const expr = this.parseExpression();
        this.expect(')');
        return expr;
      }
      if (t.type === 'identifier') {
        let name = t.value;
        // Serial.println(...) / Serial.begin(...)
        if (name === 'Serial' && this.match('.') ) {
          const method = this.identifier();
          name = 'Serial.' + method;
        }
        if (this.is('(')) {
          this.next();
          const args = [];
          while (!this.is(')')) {
            args.push(this.parseExpression());
            if (!this.match(',')) break;
          }
          this.expect(')');
          return { type: 'call', name, args };
        }
        return { type: 'var', name };
      }
      throw new Error('第 ' + t.line + ' 行：无法解析 “' + t.value + '”');
    }
  }

  function parseSketch(code) {
    const parser = new Parser(tokenize(String(code || '')));
    return parser.parseProgram();
  }

  /* ------------------------------------------------------------------
     Pin helpers & runtime
     ------------------------------------------------------------------ */
  const PIN_ALIASES = {
    13: 'd13', 9: 'd9', 2: 'd2', 14: 'a0', 15: 'a1', 16: 'a2', 17: 'a3'
  };
  const PIN_LABELS = { d13: 'D13', d9: 'D9', d2: 'D2', a0: 'A0', a1: 'A1', a2: 'A2', a3: 'A3' };

  function normalizePin(value) {
    if (typeof value === 'string') {
      const k = value.toLowerCase();
      if (PIN_LABELS[k]) return k;
      if (/^a[0-3]$/.test(k)) return k;
      if (/^d?\d+$/.test(k)) return PIN_ALIASES[Number(k.replace('d', ''))] || null;
      return null;
    }
    return PIN_ALIASES[Number(value)] || null;
  }

  function pinLabel(pin) { return PIN_LABELS[pin] || pin.toUpperCase(); }

  function evaluate(node, vars, runner) {
    switch (node.type) {
      case 'num': return node.value;
      case 'str': return node.value;
      case 'var':
        if (Object.prototype.hasOwnProperty.call(vars, node.name)) return vars[node.name];
        if (Object.prototype.hasOwnProperty.call(CONSTS, node.name)) return CONSTS[node.name];
        throw new Error('变量 “' + node.name + '” 还没有定义');
      case 'unary':
        if (node.op === '!') return evaluate(node.value, vars, runner) ? 0 : 1;
        if (node.op === '-') return -evaluate(node.value, vars, runner);
        return evaluate(node.value, vars, runner);
      case 'call':
        return runner.call(node);
      case 'binary': {
        const o = node.op;
        if (o === '&&') return evaluate(node.left, vars, runner) && evaluate(node.right, vars, runner) ? 1 : 0;
        if (o === '||') return evaluate(node.left, vars, runner) || evaluate(node.right, vars, runner) ? 1 : 0;
        const a = evaluate(node.left, vars, runner), b = evaluate(node.right, vars, runner);
        switch (o) {
          case '+': return a + b;
          case '-': return a - b;
          case '*': return a * b;
          case '/': return b === 0 ? 0 : a / b;
          case '%': return b === 0 ? 0 : a % b;
          case '==': return a === b ? 1 : 0;
          case '!=': return a !== b ? 1 : 0;
          case '<': return a < b ? 1 : 0;
          case '<=': return a <= b ? 1 : 0;
          case '>': return a > b ? 1 : 0;
          case '>=': return a >= b ? 1 : 0;
          default: throw new Error('不支持的运算符 ' + o);
        }
      }
      default: throw new Error('无法计算的表达式');
    }
  }

  class Runner {
    constructor(code, host) {
      this.code = code;
      this.host = host || {};
      this.running = false;
      this.vars = {};
      this.sleepers = [];
      this.startTime = 0;
      this.ast = null;
    }
    async start() {
      if (this.running) return;
      try {
        this.ast = parseSketch(this.code);
      } catch (err) {
        this.host.onError && this.host.onError(err.message);
        return false;
      }
      this.running = true;
      this.vars = {};
      this.startTime = Date.now();
      try {
        for (const g of this.ast.globals) await this.execute(g);
        await this.executeBlock(this.ast.setup);
        let guard = 0;
        while (this.running) {
          await this.executeBlock(this.ast.loop);
          guard++;
          if (guard > 100000) throw new Error('loop() 执行次数过多，请检查是否忘记延时。');
          await this.sleep(16);
        }
      } catch (err) {
        if (this.running) {
          this.running = false;
          this.releaseSleepers();
          this.host.onError && this.host.onError(err.message);
        }
      }
      return true;
    }
    async executeBlock(nodes) {
      for (const node of nodes) {
        if (!this.running) return;
        await this.execute(node);
      }
    }
    async execute(node) {
      if (!this.running) return;
      switch (node.type) {
        case 'empty': return;
        case 'block': return this.executeBlock(node.body);
        case 'decl':
          this.vars[node.name] = this.evalExpr(node.value);
          return;
        case 'assign':
          this.vars[node.name] = this.evalExpr(node.value);
          return;
        case 'if': {
          const ok = this.evalExpr(node.test);
          if (ok) return this.execute(node.consequent);
          if (node.alternate) return this.execute(node.alternate);
          return;
        }
        case 'expr':
          if (node.expr.type === 'call' && node.expr.name === 'delay') {
            const arg = node.expr.args[0] ? this.evalExpr(node.expr.args[0]) : 0;
            await this.sleep(Math.max(0, Math.min(10000, Number(arg) || 0)));
            return;
          }
          this.call(node.expr);
          return;
        default: return;
      }
    }
    evalExpr(node) { return evaluate(node, this.vars, this); }
    call(node) {
      if (!node || node.type !== 'call') return this.evalExpr(node);
      const args = node.args.map((a) => this.evalExpr(a));
      const name = node.name;
      if (name === 'pinMode') {
        const pin = normalizePin(args[0]);
        if (!pin) throw new Error('不支持的引脚。代码实验支持 D2、D9、D13、A0。');
        const mode = args[1] === 2 ? 'INPUT_PULLUP' : args[1] === 1 ? 'OUTPUT' : 'INPUT';
        this.host.onPinMode && this.host.onPinMode(pin, mode);
        return 0;
      }
      if (name === 'digitalWrite') {
        const pin = normalizePin(args[0]);
        if (!pin) throw new Error('不支持的引脚。代码实验支持 D2、D9、D13、A0。');
        this.host.onDigitalWrite && this.host.onDigitalWrite(pin, args[1] ? 1 : 0);
        return 0;
      }
      if (name === 'analogWrite') {
        const pin = normalizePin(args[0]);
        if (!pin) throw new Error('不支持的模拟输出引脚。');
        const value = Math.max(0, Math.min(255, Math.round(Number(args[1]) || 0)));
        this.host.onAnalogWrite && this.host.onAnalogWrite(pin, value);
        return 0;
      }
      if (name === 'digitalRead') {
        const pin = normalizePin(args[0]);
        if (!pin) throw new Error('不支持的数字输入引脚。');
        return this.host.onDigitalRead ? this.host.onDigitalRead(pin) : 0;
      }
      if (name === 'analogRead') {
        const pin = normalizePin(args[0]);
        if (!pin) throw new Error('不支持的模拟输入引脚。');
        return this.host.onAnalogRead ? this.host.onAnalogRead(pin) : 0;
      }
      if (name === 'millis') return Date.now() - this.startTime;
      if (name === 'Serial.begin') return 0;
      if (name === 'Serial.println' || name === 'Serial.print') {
        const text = args.length ? String(args[0]) : '';
        this.host.onSerial && this.host.onSerial(text + (name === 'Serial.println' ? '\n' : ''));
        return 0;
      }
      if (name === 'delay') throw new Error('delay() 只能单独作为一行语句使用。');
      if (name === 'map') {
        const [v, a, b, c, d] = args;
        if (b === a) return c;
        return Math.round((v - a) * (d - c) / (b - a) + c);
      }
      if (name === 'constrain') return Math.max(args[1], Math.min(args[2], args[0]));
      if (name === 'abs') return Math.abs(args[0]);
      throw new Error('暂不支持函数 “' + name + '”');
    }
    sleep(ms) {
      if (!this.running) return Promise.resolve();
      return new Promise((resolve) => {
        const timer = setTimeout(() => {
          this.sleepers = this.sleepers.filter((s) => s.timer !== timer);
          resolve();
        }, Math.max(0, ms));
        this.sleepers.push({ timer, resolve });
      });
    }
    releaseSleepers() {
      this.sleepers.forEach((s) => { clearTimeout(s.timer); s.resolve(); });
      this.sleepers = [];
    }
    stop() {
      this.running = false;
      this.releaseSleepers();
    }
  }

  /* ------------------------------------------------------------------
     Example programs
     ------------------------------------------------------------------ */
  const EXAMPLES = [
    {
      id: 'blink',
      name: '闪烁 LED',
      badge: '入门',
      description: '让 D13 上的 LED 每 0.5 秒亮灭一次。',
      code: `// 闪烁 LED · D13
void setup() {
  pinMode(13, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
  delay(500);
  digitalWrite(13, LOW);
  delay(500);
}`,
      blocks: [
        { kind: 'event', text: '当 Arduino 启动' },
        { icon: 'setup', text: '设置 D13 为输出' },
        { kind: 'event', text: '重复执行' },
        { icon: 'high', text: 'D13 输出高电平' },
        { icon: 'wait', text: '等待 0.5 秒' },
        { icon: 'low', text: 'D13 输出低电平' },
        { icon: 'wait', text: '等待 0.5 秒' }
      ]
    },
    {
      id: 'button',
      name: '按钮控制',
      badge: '输入',
      description: '读取 D2 按钮，按下时点亮 D13 的 LED。',
      code: `// 按钮控制 LED
// 按钮接在 D2 与 GND 之间

void setup() {
  pinMode(2, INPUT_PULLUP);
  pinMode(13, OUTPUT);
}

void loop() {
  if (digitalRead(2) == LOW) {
    digitalWrite(13, HIGH);
  } else {
    digitalWrite(13, LOW);
  }
  delay(50);
}`,
      blocks: [
        { kind: 'event', text: '当 Arduino 启动' },
        { text: 'D2 开启内部上拉，D13 设为输出' },
        { kind: 'event', text: '重复执行' },
        { icon: 'if', text: '如果 D2 为低电平（按钮按下）' },
        { icon: 'high', text: 'D13 输出高电平' },
        { icon: 'else', text: '否则' },
        { icon: 'low', text: 'D13 输出低电平' },
        { icon: 'wait', text: '等待 0.05 秒' }
      ]
    },
    {
      id: 'dimmer',
      name: '旋钮调光',
      badge: '模拟',
      description: '读取 A0 电位器，用 PWM 控制 D9 上的 LED 亮度。',
      code: `// 电位器调光 · A0 -> D9
int value = 0;

void setup() {
  pinMode(9, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  value = analogRead(A0);
  analogWrite(9, value / 4);
  Serial.println(value);
  delay(120);
}`,
      blocks: [
        { kind: 'event', text: '当 Arduino 启动' },
        { text: 'D9 设为输出，串口 9600' },
        { kind: 'event', text: '重复执行' },
        { icon: 'read', text: '读取 A0 → value' },
        { icon: 'pwm', text: 'D9 输出 value / 4' },
        { icon: 'serial', text: '串口打印 value' },
        { icon: 'wait', text: '等待 0.12 秒' }
      ]
    },
    {
      id: 'breathing',
      name: '呼吸灯',
      badge: 'PWM',
      description: '让 D9 上的 LED 亮度缓慢上升，再从头开始。',
      code: `// 呼吸灯 · D9 PWM
int brightness = 0;

void setup() {
  pinMode(9, OUTPUT);
}

void loop() {
  analogWrite(9, brightness);
  brightness = brightness + 5;
  if (brightness > 255) {
    brightness = 0;
  }
  delay(30);
}`,
      blocks: [
        { kind: 'event', text: '当 Arduino 启动' },
        { text: 'D9 设为输出，brightness = 0' },
        { kind: 'event', text: '重复执行' },
        { icon: 'pwm', text: 'D9 输出 brightness 亮度' },
        { text: 'brightness = brightness + 5' },
        { icon: 'if', text: '如果 brightness > 255 → 归零' },
        { icon: 'wait', text: '等待 0.03 秒' }
      ]
    },
    {
      id: 'serial',
      name: '串口问候',
      badge: '串口',
      description: '每秒钟通过串口打印一行问候语。',
      code: `// 串口问候
void setup() {
  Serial.begin(9600);
}

void loop() {
  Serial.println("Hello, Breadboard Lab!");
  delay(1000);
}`,
      blocks: [
        { kind: 'event', text: '当 Arduino 启动' },
        { text: '打开串口 9600' },
        { kind: 'event', text: '重复执行' },
        { icon: 'serial', text: '打印 “Hello, Breadboard Lab!”' },
        { icon: 'wait', text: '等待 1 秒' }
      ]
    }
  ];

  BBL.Code = {
    EXAMPLES,
    parseSketch,
    Runner,
    normalizePin,
    pinLabel,
    PIN_ALIASES,
    PIN_LABELS
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = BBL;
})();
