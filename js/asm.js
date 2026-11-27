/* ============================================================
   8051 assembly lab
   A deliberately small, safe subset of the 8051 instruction set:
   MOV, ADD/ADDC, INC/DEC, CLR/SETB/CPL, jumps, DJNZ, calls,
   MOVX, P1 output and P2/P3 input.  It is a teaching simulator,
   not a cycle-accurate 8051 replacement.
   ============================================================ */
(function () {
  'use strict';
  const root = typeof window !== 'undefined' ? window : globalThis;
  const BBL = (root.BBL = root.BBL || {});

  const SFR = { P0: 0x80, P1: 0x90, P2: 0xA0, P3: 0xB0, PSW: 0xD0, A: 0xE0, B: 0xF0, DPL: 0x82, DPH: 0x83 };
  const REG = { R0: 0, R1: 1, R2: 2, R3: 3, R4: 4, R5: 5, R6: 6, R7: 7 };

  function cleanLine(line) {
    return String(line).replace(/;.*$/, '').trim();
  }

  function splitOps(text) {
    if (!text) return [];
    const out = [];
    let cur = '', depth = 0;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (c === '(') depth++;
      if (c === ')') depth--;
      if (c === ',' && depth === 0) { out.push(cur.trim()); cur = ''; }
      else cur += c;
    }
    if (cur.trim()) out.push(cur.trim());
    return out;
  }

  function parseNumber(text) {
    let s = String(text).trim().replace(/^#/, '').toUpperCase();
    if (s === '$') return null;
    if (/^0X[0-9A-F]+$/.test(s)) return parseInt(s.slice(2), 16);
    if (/^[0-9A-F]+H$/.test(s)) return parseInt(s.slice(0, -1), 16);
    if (/^[0-9]+$/.test(s)) return parseInt(s, 10);
    return null;
  }

  function parseBit(text) {
    const s = String(text).trim().toUpperCase();
    if (s === 'C' || s === 'CY') return 0xD7;
    const m = s.match(/^P([0-3])\.([0-7])$/);
    if (m) return SFR['P' + m[1]] + Number(m[2]);
    const n = parseNumber(s);
    return n == null ? null : n & 0xFF;
  }

  function isReg(s) { return /^R[0-7]$/i.test(String(s).trim()); }
  function isIndirect(s) { return /^@R[01]$/i.test(String(s).trim()); }

  class AsmError extends Error {
    constructor(line, message) { super('第 ' + line + ' 行：' + message); this.line = line; }
  }

  class Program {
    constructor(source) {
      this.source = String(source || '');
      this.lines = [];
      this.labels = {};
      this.parse();
    }
    parse() {
      const raw = this.source.split(/\r?\n/);
      raw.forEach((rawLine, i) => {
        let line = cleanLine(rawLine);
        if (!line) return;
        const labelMatch = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*:\s*(.*)$/);
        if (labelMatch) {
          this.labels[labelMatch[1].toUpperCase()] = this.lines.length;
          line = labelMatch[2].trim();
          if (!line) return;
        }
        const parts = line.split(/\s+/);
        const mnemonic = parts.shift().toUpperCase();
        if (mnemonic === 'ORG' || mnemonic === 'EQU') return;
        this.lines.push({ line: i + 1, mnemonic, operand: parts.join(' ').trim(), raw: rawLine });
      });
    }
    resolve(label) {
      const key = String(label || '').trim().toUpperCase();
      if (key === '$') return this.lines.length;
      if (!(key in this.labels)) throw new Error('找不到标号 ' + label);
      return this.labels[key];
    }
  }

  class Simulator {
    constructor(source, options) {
      this.program = new Program(source);
      this.options = options || {};
      this.reset();
    }
    reset() {
      this.A = 0; this.B = 0;
      this.R = [0, 0, 0, 0, 0, 0, 0, 0];
      this.DPTR = 0;
      this.PC = 0;
      this.SP = 7;
      this.ram = new Array(256).fill(0);
      this.xdata = Object.create(null);
      this.stack = [];
      this.C = 0; this.AC = 0; this.OV = 0;
      this.ports = [0xFF, 0x00, 0xFF, 0xFF];
      this.p2 = 0xFF; this.p3 = 0xFF;
      this.p1History = [];
      this.cycles = 0;
      this.halted = false;
      this.error = null;
    }
    readDirect(addr) {
      addr = Number(addr) & 0xFF;
      if (addr === SFR.A) return this.A;
      if (addr === SFR.B) return this.B;
      if (addr === SFR.P0) return this.ports[0];
      if (addr === SFR.P1) return this.ports[1];
      if (addr === SFR.P2) return this.p2;
      if (addr === SFR.P3) return this.p3;
      if (addr === SFR.PSW) return (this.C << 7);
      if (addr === SFR.DPL) return this.DPTR & 0xFF;
      if (addr === SFR.DPH) return (this.DPTR >> 8) & 0xFF;
      if (addr >= 0 && addr < 8) return this.R[addr];
      return this.ram[addr] & 0xFF;
    }
    writeDirect(addr, value) {
      addr = Number(addr) & 0xFF; value = Number(value) & 0xFF;
      if (addr === SFR.A) { this.A = value; return; }
      if (addr === SFR.B) { this.B = value; return; }
      if (addr === SFR.P0) { this.ports[0] = value; return; }
      if (addr === SFR.P1) { this.ports[1] = value; this.p1History.push(value); return; }
      if (addr === SFR.P2) { this.p2 = value; return; }
      if (addr === SFR.P3) { this.ports[3] = value; return; }
      if (addr === SFR.DPL) { this.DPTR = (this.DPTR & 0xFF00) | value; return; }
      if (addr === SFR.DPH) { this.DPTR = (this.DPTR & 0x00FF) | (value << 8); return; }
      if (addr >= 0 && addr < 8) { this.R[addr] = value; return; }
      this.ram[addr] = value;
    }
    readBit(bit) {
      bit = Number(bit) & 0xFF;
      if (bit === 0xD7) return this.C;
      if (bit >= 0x80) {
        const port = bit & 0xF8, n = bit & 7;
        if (port === SFR.P0) return (this.ports[0] >> n) & 1;
        if (port === SFR.P1) return (this.ports[1] >> n) & 1;
        if (port === SFR.P2) return (this.p2 >> n) & 1;
        if (port === SFR.P3) return (this.p3 >> n) & 1;
        return 0;
      }
      return (this.ram[bit >> 3] >> (bit & 7)) & 1;
    }
    writeBit(bit, value) {
      bit = Number(bit) & 0xFF;
      if (bit === 0xD7) { this.C = value ? 1 : 0; return; }
      if (bit >= 0x80) {
        const port = bit & 0xF8, n = bit & 7, idx = port === SFR.P0 ? 0 : port === SFR.P2 ? 2 : port === SFR.P3 ? 3 : -1;
        if (idx >= 0) {
          const cur = idx === 2 ? this.p2 : this.ports[idx];
          const next = value ? (cur | (1 << n)) : (cur & ~(1 << n));
          if (idx === 2) this.p2 = next; else this.ports[idx] = next;
        }
        return;
      }
      const byte = bit >> 3, n = bit & 7;
      if (value) this.ram[byte] |= (1 << n); else this.ram[byte] &= ~(1 << n);
    }
    setP2(value) { this.p2 = Number(value) & 0xFF; }
    setP3(value) { this.p3 = Number(value) & 0xFF; }
    operandValue(op) {
      const s = String(op).trim();
      if (s.startsWith('#')) {
        const n = parseNumber(s);
        if (n == null) throw new Error('无法解析立即数 ' + op);
        return n & 0xFF;
      }
      if (isReg(s)) return this.R[REG[s.toUpperCase()]];
      if (isIndirect(s)) return this.readDirect(this.R[Number(s[2])]);
      const direct = this.directAddress(s);
      if (direct != null) return this.readDirect(direct);
      const n = parseNumber(s);
      if (n != null) return this.readDirect(n);
      throw new Error('无法读取操作数 ' + op);
    }
    directAddress(text) {
      const s = String(text).trim().toUpperCase();
      if (s === 'A') return SFR.A;
      if (s === 'B') return SFR.B;
      if (s === 'P0') return SFR.P0;
      if (s === 'P1') return SFR.P1;
      if (s === 'P2') return SFR.P2;
      if (s === 'P3') return SFR.P3;
      if (s === 'PSW') return SFR.PSW;
      if (s === 'DPL') return SFR.DPL;
      if (s === 'DPH') return SFR.DPH;
      if (isReg(s)) return REG[s];
      const n = parseNumber(s);
      return n == null ? null : n & 0xFF;
    }
    setDestination(dest, value) {
      const s = String(dest).trim().toUpperCase();
      value = Number(value) & 0xFF;
      if (s === 'A') { this.A = value; return; }
      if (s === 'DPTR') { this.DPTR = value; return; }
      if (isReg(s)) { this.R[REG[s]] = value; return; }
      if (isIndirect(s)) { this.writeDirect(this.R[Number(s[2])], value); return; }
      const addr = this.directAddress(s);
      if (addr != null) { this.writeDirect(addr, value); return; }
      throw new Error('无法写入 ' + dest);
    }
    push(value) {
      this.stack.push(value & 0xFF);
      this.SP = (this.SP + 1) & 0xFF;
    }
    pop() {
      const v = this.stack.length ? this.stack.pop() : 0;
      this.SP = (this.SP - 1) & 0xFF;
      return v;
    }
    step() {
      if (this.halted) return false;
      if (this.PC < 0 || this.PC >= this.program.lines.length) { this.halted = true; return false; }
      const line = this.program.lines[this.PC++];
      this.cycles++;
      const op = line.operand;
      const ops = splitOps(op);
      try {
        switch (line.mnemonic) {
          case 'NOP': break;
          case 'END': this.halted = true; break;
          case 'MOV': {
            if (ops.length !== 2) throw new Error('MOV 需要两个操作数');
            const dest = ops[0], src = ops[1];
            if (dest.toUpperCase() === 'DPTR') {
              const n = parseNumber(src);
              if (n == null) throw new Error('DPTR 需要 #16 位立即数');
              this.DPTR = n & 0xFFFF; break;
            }
            let value;
            if (src.startsWith('#')) {
              const n = parseNumber(src);
              if (n == null) throw new Error('无法解析立即数 ' + src);
              value = n & 0xFF;
            } else {
              value = this.operandValue(src);
            }
            this.setDestination(dest, value);
            break;
          }
          case 'MOVX': {
            if (ops.length !== 2) throw new Error('MOVX 需要两个操作数');
            if (ops[0].toUpperCase() === '@DPTR' && ops[1].toUpperCase() === 'A') {
              this.xdata[this.DPTR] = this.A;
            } else if (ops[0].toUpperCase() === 'A' && ops[1].toUpperCase() === '@DPTR') {
              this.A = this.xdata[this.DPTR] || 0;
            } else throw new Error('只支持 MOVX @DPTR,A / MOVX A,@DPTR');
            break;
          }
          case 'ADD': case 'ADDC': {
            if (ops[0].toUpperCase() !== 'A') throw new Error(line.mnemonic + ' 的目标必须是 A');
            const b = this.operandValue(ops[1]);
            const cin = line.mnemonic === 'ADDC' ? this.C : 0;
            const sum = this.A + b + cin;
            this.AC = ((this.A & 0x0F) + (b & 0x0F) + cin) > 0x0F ? 1 : 0;
            this.OV = ((~(this.A ^ b) & (this.A ^ sum)) & 0x80) ? 1 : 0;
            this.C = sum > 0xFF ? 1 : 0;
            this.A = sum & 0xFF; break;
          }
          case 'SUBB': {
            if (ops[0].toUpperCase() !== 'A') throw new Error('SUBB 的目标必须是 A');
            const b = this.operandValue(ops[1]);
            const diff = this.A - b - this.C;
            this.C = diff < 0 ? 1 : 0;
            this.OV = ((this.A ^ b) & (this.A ^ diff) & 0x80) ? 1 : 0;
            this.A = diff & 0xFF; break;
          }
          case 'ANL': case 'ORL': case 'XRL': {
            if (ops[0].toUpperCase() !== 'A') throw new Error(line.mnemonic + ' 的目标必须是 A');
            const b = this.operandValue(ops[1]);
            this.A = line.mnemonic === 'ANL' ? (this.A & b) : line.mnemonic === 'ORL' ? (this.A | b) : (this.A ^ b);
            break;
          }
          case 'INC': case 'DEC': {
            const dest = ops[0], s = dest.toUpperCase();
            const delta = line.mnemonic === 'INC' ? 1 : -1;
            if (s === 'DPTR') { this.DPTR = (this.DPTR + delta) & 0xFFFF; break; }
            if (s === 'A') { this.A = (this.A + delta) & 0xFF; break; }
            if (isReg(s)) { this.R[REG[s]] = (this.R[REG[s]] + delta) & 0xFF; break; }
            if (isIndirect(s)) { const a = this.R[Number(s[2])]; this.writeDirect(a, this.readDirect(a) + delta); break; }
            const addr = this.directAddress(s);
            if (addr == null) throw new Error('无法递增/递减 ' + dest);
            this.writeDirect(addr, this.readDirect(addr) + delta); break;
          }
          case 'CLR': {
            const s = ops[0].toUpperCase();
            if (s === 'A') { this.A = 0; break; }
            const bit = parseBit(ops[0]);
            if (bit == null) throw new Error('CLR 需要 A、C 或位地址');
            this.writeBit(bit, 0); break;
          }
          case 'SETB': {
            const bit = parseBit(ops[0]);
            if (bit == null) throw new Error('SETB 需要 C 或位地址');
            this.writeBit(bit, 1); break;
          }
          case 'CPL': {
            const s = ops[0].toUpperCase();
            if (s === 'A') { this.A ^= 0xFF; break; }
            const bit = parseBit(ops[0]);
            if (bit == null) throw new Error('CPL 需要 A、C 或位地址');
            this.writeBit(bit, this.readBit(bit) ? 0 : 1); break;
          }
          case 'RL': this.A = ((this.A << 1) | (this.A >> 7)) & 0xFF; break;
          case 'RR': this.A = ((this.A >> 1) | (this.A << 7)) & 0xFF; break;
          case 'RLC': { const c = this.C; this.C = (this.A >> 7) & 1; this.A = ((this.A << 1) | c) & 0xFF; break; }
          case 'RRC': { const c = this.C; this.C = this.A & 1; this.A = ((this.A >> 1) | (c << 7)) & 0xFF; break; }
          case 'JZ': if (this.A === 0) this.PC = this.program.resolve(ops[0]); break;
          case 'JNZ': if (this.A !== 0) this.PC = this.program.resolve(ops[0]); break;
          case 'JC': if (this.C) this.PC = this.program.resolve(ops[0]); break;
          case 'JNC': if (!this.C) this.PC = this.program.resolve(ops[0]); break;
          case 'JB': if (this.readBit(parseBit(ops[0])) === 1) this.PC = this.program.resolve(ops[1]); break;
          case 'JNB': if (this.readBit(parseBit(ops[0])) === 0) this.PC = this.program.resolve(ops[1]); break;
          case 'DJNZ': {
            const r = String(ops[0]).trim().toUpperCase();
            if (!isReg(r)) throw new Error('DJNZ 需要 Rn');
            this.R[REG[r]] = (this.R[REG[r]] - 1) & 0xFF;
            if (this.R[REG[r]] !== 0) this.PC = this.program.resolve(ops[1]);
            break;
          }
          case 'AJMP': case 'LJMP': case 'SJMP': this.PC = this.program.resolve(ops[0]); break;
          case 'ACALL': case 'LCALL': {
            const target = this.program.resolve(ops[0]);
            this.push((this.PC >> 8) & 0xFF); this.push(this.PC & 0xFF);
            this.PC = target; break;
          }
          case 'RET': case 'RETI': {
            const lo = this.pop(), hi = this.pop(); this.PC = ((hi << 8) | lo); break;
          }
          case 'PUSH': this.push(this.operandValue(ops[0])); break;
          case 'POP': this.setDestination(ops[0], this.pop()); break;
          case 'MUL': {
            if (String(ops[0]).toUpperCase() !== 'AB') throw new Error('MUL 只支持 AB');
            const p = this.A * this.B; this.A = p & 0xFF; this.B = (p >> 8) & 0xFF; this.C = 0; break;
          }
          case 'DIV': {
            if (String(ops[0]).toUpperCase() !== 'AB') throw new Error('DIV 只支持 AB');
            if (this.B === 0) { this.OV = 1; break; }
            const rem = this.A % this.B;
            this.A = Math.floor(this.A / this.B);
            this.B = rem;
            this.OV = 0; break;
          }
          default: throw new Error('不支持的指令 ' + line.mnemonic);
        }
      } catch (err) {
        this.error = { line: line.line, message: err.message };
        this.halted = true;
        return false;
      }
      return true;
    }
    run(maxSteps) {
      const cap = Math.max(1, Math.min(Number(maxSteps) || 200000, 5000000));
      let n = 0;
      while (!this.halted && n < cap) { this.step(); n++; }
      this.stepsRun = (this.stepsRun || 0) + n;
      return { steps: n, done: this.halted, error: this.error };
    }
  }

  const ASM_LABS = {
    mcu04: {
      title: 'Lab 04 · 8051 微控制器与汇编',
      subtitle: 'Introduction to Microcontrollers · 16 位加法',
      task: '把 D925h 与 5A12h 相加，结果 13337h 存到外部数据存储器 2000h、2001h、2002h。',
      initialCode: `; WIX1003 Lab 04 · 16-bit addition
; Number1 = D925h, Number2 = 5A12h
        ORG   0000H
        LJMP  MAIN

        ORG   0100H
MAIN:   MOV   R0, #25H
        MOV   R1, #0D9H
        MOV   R2, #12H
        MOV   R3, #5AH
        MOV   R4, #00H

        MOV   A, R0
        ADD   A, R2
        MOV   DPTR, #2000H
        MOVX  @DPTR, A

        MOV   A, R1
        ADDC  A, R3
        JNC   SKIP
        INC   R4
SKIP:   INC   DPTR
        MOVX  @DPTR, A
        INC   DPTR
        MOV   A, R4
        MOVX  @DPTR, A

        END`,
      check(sim) {
        const sum1 = sim.xdata[0x2000] || 0;
        const sum2 = sim.xdata[0x2001] || 0;
        const carry = sim.xdata[0x2002] || 0;
        const ok = sum1 === 0x37 && sum2 === 0x33 && carry === 0x01;
        return {
          ok,
          detail: '2000h=' + hex(sum1) + '  2001h=' + hex(sum2) + '  2002h=' + hex(carry) +
            '（期望 37、33、01；合起来是 13337h）'
        };
      }
    },
    mcu05: {
      title: 'Lab 05 · 认识 8051 内部结构',
      subtitle: 'Architecture, SFR and binary count',
      task: '写一段程序，让 P1 从 00h 开始递增到 FFh，再回到 00h 循环；至少观察到 16 个连续值。',
      initialCode: `; WIX1003 Lab 05 · binary count on P1
        ORG   0000H
        LJMP  MAIN

        ORG   0100H
MAIN:   MOV   A, #00H
        MOV   P1, A

START:  INC   A
        MOV   P1, A
        SJMP  START

        END`,
      check(sim) {
        const seen = sim.p1History;
        const values = new Set(seen);
        let consecutive = 0;
        for (let v = 0; v < 16; v++) if (values.has(v)) consecutive++;
        return {
          ok: consecutive >= 16,
          detail: 'P1 已输出 ' + values.size + ' 个不同值，其中 00h–0Fh 连续值 ' + consecutive + '/16；' +
            '完整提交需要覆盖 00h–FFh。'
        };
      }
    },
    mcu06: {
      title: 'Lab 06 · 8051 基本 I/O',
      subtitle: 'DIP switch, buttons and 4-bit counter',
      task: '用 P2.4 按钮启动/停止一个 4 位二进制加法计数器，计数值从 P1 的低 4 位 LED 显示。',
      initialCode: `; WIX1003 Lab 06 · 4-bit up counter
; P2.4 = run/stop switch (1 = run, 0 = stop)
        ORG   0000H
        LJMP  MAIN

        ORG   0100H
MAIN:   MOV   A, #00H
        MOV   P1, A

WAIT:   JNB   P2.4, WAIT       ; switch low = stop, wait for high
        MOV   A, #00H
        MOV   P1, A

LOOP:   JNB   P2.4, STOP       ; switch low = stop
        INC   A
        ANL   A, #0FH
        MOV   P1, A
        ACALL DELAY
        SJMP  LOOP

STOP:   SJMP  WAIT

DELAY:  MOV   R1, #0FFH
D1:     MOV   R2, #0FFH
D2:     DJNZ  R2, D2
        DJNZ  R1, D1
        RET

        END`,
      check(sim, code) {
        const values = new Set(sim.p1History);
        const usesButton = /P2\.[45]/i.test(code);
        return {
          ok: usesButton && values.size >= 4,
          detail: 'P1 已输出 ' + values.size + ' 个不同值；按钮检测：' + (usesButton ? '有' : '没有') +
            '。要求用 P2.4/P2.5 控制启动/停止，并显示 4 位计数。'
        };
      }
    }
  };

  function hex(n) {
    return '0x' + (Number(n) & 0xFF).toString(16).toUpperCase().padStart(2, '0');
  }

  BBL.Asm = { Simulator, Program, ASM_LABS, hex };
})(window);
